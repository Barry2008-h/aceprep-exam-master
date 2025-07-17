import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { type, prompt, subject, difficulty, count } = await req.json()
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not set')
    }

    let systemPrompt = ''
    
    if (type === 'questions') {
      systemPrompt = `Generate ${count || 5} multiple choice questions for ${subject || 'general knowledge'} at ${difficulty || 'medium'} difficulty level. 

      Format each question EXACTLY like this JSON structure:
      {
        "question_text": "The question text here",
        "option_a": "First option",
        "option_b": "Second option", 
        "option_c": "Third option",
        "option_d": "Fourth option",
        "correct_answer": "A", 
        "explanation": "Brief explanation of the correct answer",
        "difficulty_level": "${difficulty || 'medium'}"
      }
      
      Return ONLY a JSON array of question objects. No additional text or formatting.
      Make questions educational and accurate for ${subject || 'general studies'}.
      
      Additional context: ${prompt || 'Generate comprehensive questions'}`
    } else if (type === 'course') {
      systemPrompt = `Create educational course content for ${subject || 'general studies'}.
      
      Format the response as JSON:
      {
        "title": "Course title",
        "description": "Brief course description",
        "content": "Detailed course content in markdown format"
      }
      
      Make the content comprehensive and educational for ${difficulty || 'medium'} level.
      Topic: ${prompt || 'Create general course content'}`
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    const generatedText = data.candidates[0].content.parts[0].text

    // Clean up the response and parse JSON
    const cleanText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    let parsedContent
    try {
      parsedContent = JSON.parse(cleanText)
    } catch (parseError) {
      // If parsing fails, return raw text
      parsedContent = { content: generatedText, raw: true }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: parsedContent,
        type: type 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in generate-content function:', error)
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