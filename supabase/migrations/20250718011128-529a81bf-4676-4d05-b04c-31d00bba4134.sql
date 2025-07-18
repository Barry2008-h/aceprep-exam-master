-- Create storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', false);

-- Create policies for PDF uploads
CREATE POLICY "Admin can upload PDFs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'pdfs' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.username = 'adminbarry'
  )
);

CREATE POLICY "Admin can view PDFs" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'pdfs' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.username = 'adminbarry'
  )
);

CREATE POLICY "Admin can delete PDFs" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'pdfs' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.username = 'adminbarry'
  )
);