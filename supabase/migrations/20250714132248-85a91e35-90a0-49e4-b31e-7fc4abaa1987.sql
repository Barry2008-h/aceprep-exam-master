-- Update subjects with the requested course names
UPDATE public.subjects SET 
  name = 'Mathematics',
  description = 'Mathematical concepts and problem solving',
  icon = 'Calculator',
  color = 'blue'
WHERE name = 'Mathematics';

UPDATE public.subjects SET 
  name = 'English Language',
  description = 'Grammar, comprehension and writing skills',
  icon = 'BookOpen',
  color = 'green'
WHERE name = 'English Language';

-- Add the new subjects if they don't exist
INSERT INTO public.subjects (name, description, icon, color) 
SELECT * FROM (
  VALUES 
    ('Verbal Reasoning', 'Logical reasoning and verbal comprehension', 'Brain', 'purple'),
    ('Quantitative Reasoning', 'Mathematical reasoning and problem solving', 'Calculator', 'orange'),
    ('Current Affairs', 'Recent events and general knowledge', 'Newspaper', 'teal')
) AS new_subjects(name, description, icon, color)
WHERE NOT EXISTS (
  SELECT 1 FROM public.subjects WHERE subjects.name = new_subjects.name
);

-- Add chapters table for better organization
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, chapter_number)
);

-- Enable RLS on chapters
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chapters
CREATE POLICY "Anyone can view chapters" ON public.chapters
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage chapters" ON public.chapters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND username = 'adminbarry'
    )
  );

-- Add exam_mode_enabled column to questions
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS exam_mode_enabled BOOLEAN DEFAULT true;

-- Add chapter_id to questions
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL;