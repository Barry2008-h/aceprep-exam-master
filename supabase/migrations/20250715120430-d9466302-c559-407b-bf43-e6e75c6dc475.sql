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

-- Add exam_mode_enabled column to questions if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'exam_mode_enabled'
  ) THEN
    ALTER TABLE public.questions ADD COLUMN exam_mode_enabled BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Add chapter_id to questions if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'chapter_id'
  ) THEN
    ALTER TABLE public.questions ADD COLUMN chapter_id UUID;
  END IF;
END $$;