import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      throw new Error('No file provided')
    }

    // Upload PDF to storage
    const fileName = `${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('pdfs')
      .upload(fileName, file)

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Extract text from PDF using a simple approach
    // Note: For production, you'd want to use a proper PDF parsing library
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Convert to string (basic approach - for simple PDFs)
    let extractedText = ''
    try {
      const decoder = new TextDecoder('utf-8')
      const text = decoder.decode(uint8Array)
      
      // Basic PDF text extraction - find text between stream objects
      const textMatches = text.match(/stream\s*(.*?)\s*endstream/gs)
      if (textMatches) {
        for (const match of textMatches) {
          const content = match.replace(/stream\s*|\s*endstream/g, '')
          // Extract readable text (very basic approach)
          const readableText = content.replace(/[^\x20-\x7E\s]/g, ' ').trim()
          if (readableText.length > 10) {
            extractedText += readableText + ' '
          }
        }
      }
      
      // Fallback: try to extract any readable text
      if (!extractedText.trim()) {
        extractedText = text.replace(/[^\x20-\x7E\s]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 5000) // Limit text length
      }
    } catch (error) {
      console.error('Text extraction error:', error)
      extractedText = 'Unable to extract text from PDF. Please ensure the PDF contains searchable text.'
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        fileName: uploadData.path,
        extractedText: extractedText.trim() || 'No readable text found in PDF',
        message: 'PDF uploaded and processed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in process-pdf function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})