
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  username TEXT UNIQUE NOT NULL,
  is_activated BOOLEAN DEFAULT FALSE,
  activation_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'BookOpen',
  color TEXT DEFAULT 'blue',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  chapter_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create question categories table
CREATE TABLE public.question_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  exam_type TEXT DEFAULT 'DELSU Post-UTME',
  year INTEGER,
  duration INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES public.question_categories(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user scores table
CREATE TABLE public.user_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.question_categories(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  time_spent INTEGER, -- in seconds
  quiz_type TEXT DEFAULT 'practice' CHECK (quiz_type IN ('practice', 'exam', 'course_quiz')),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activation keys table
CREATE TABLE public.activation_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key_code TEXT UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can create profile" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- RLS Policies for subjects (public read)
CREATE POLICY "Anyone can view subjects" ON public.subjects
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage subjects" ON public.subjects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND username = 'adminbarry'
    )
  );

-- RLS Policies for courses (public read)
CREATE POLICY "Anyone can view courses" ON public.courses
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage courses" ON public.courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND username = 'adminbarry'
    )
  );

-- RLS Policies for question categories (public read)
CREATE POLICY "Anyone can view question categories" ON public.question_categories
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage question categories" ON public.question_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND username = 'adminbarry'
    )
  );

-- RLS Policies for questions (public read)
CREATE POLICY "Anyone can view questions" ON public.questions
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage questions" ON public.questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND username = 'adminbarry'
    )
  );

-- RLS Policies for user scores
CREATE POLICY "Users can view own scores" ON public.user_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own scores" ON public.user_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all scores" ON public.user_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND username = 'adminbarry'
    )
  );

-- RLS Policies for activation keys
CREATE POLICY "Admin can manage activation keys" ON public.activation_keys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND username = 'adminbarry'
    )
  );

CREATE POLICY "Users can view unused keys for activation" ON public.activation_keys
  FOR SELECT USING (is_used = false);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
INSERT INTO public.subjects (name, description, icon, color) VALUES
  ('Mathematics', 'Mathematical concepts and problem solving', 'Calculator', 'blue'),
  ('English Language', 'Grammar, comprehension and writing skills', 'BookOpen', 'green'),
  ('Physics', 'Physical sciences and natural phenomena', 'Zap', 'purple'),
  ('Chemistry', 'Chemical reactions and molecular structures', 'FlaskConical', 'orange'),
  ('Biology', 'Life sciences and biological processes', 'Dna', 'teal'),
  ('Economics', 'Economic principles and market analysis', 'TrendingUp', 'indigo');

-- Insert sample question categories
INSERT INTO public.question_categories (name, description, exam_type, year, duration) VALUES
  ('DELSU Post-UTME 2023', 'Delta State University Post-UTME questions for 2023', 'DELSU Post-UTME', 2023, 60),
  ('DELSU Post-UTME 2022', 'Delta State University Post-UTME questions for 2022', 'DELSU Post-UTME', 2022, 60),
  ('JAMB UTME 2023', 'Joint Admissions and Matriculation Board UTME 2023', 'JAMB UTME', 2023, 45),
  ('JAMB UTME 2022', 'Joint Admissions and Matriculation Board UTME 2022', 'JAMB UTME', 2022, 45),
  ('WAEC 2023', 'West African Examinations Council 2023', 'WAEC', 2023, 40),
  ('WAEC 2022', 'West African Examinations Council 2022', 'WAEC', 2022, 40);
