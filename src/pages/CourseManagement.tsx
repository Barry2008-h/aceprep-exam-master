import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, BookOpen, FileText, HelpCircle, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const CourseManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  // Form states
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    content: '',
    subject_id: ''
  });

  const [chapterForm, setChapterForm] = useState({
    title: '',
    description: '',
    chapter_number: 1,
    course_id: ''
  });

  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    explanation: '',
    difficulty_level: 'medium',
    category_id: '',
    course_id: '',
    chapter_id: '',
    exam_mode_enabled: true
  });

  useEffect(() => {
    if (profile?.username !== 'adminbarry') {
      navigate('/admin');
      return;
    }
    loadData();
  }, [profile, navigate]);

  const loadData = async () => {
    const [subjectsRes, coursesRes, chaptersRes, questionsRes, categoriesRes] = await Promise.all([
      supabase.from('subjects').select('*').order('name'),
      supabase.from('courses').select('*, subjects(name)').order('title'),
      supabase.from('chapters').select('*, courses(title)').order('chapter_number'),
      supabase.from('questions').select('*, question_categories(name), courses(title), chapters(title)').order('created_at', { ascending: false }),
      supabase.from('question_categories').select('*').order('name')
    ]);

    if (subjectsRes.data) setSubjects(subjectsRes.data);
    if (coursesRes.data) setCourses(coursesRes.data);
    if (chaptersRes.data) setChapters(chaptersRes.data);
    if (questionsRes.data) setQuestions(questionsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
  };

  const createCourse = async () => {
    if (!courseForm.title || !courseForm.content || !courseForm.subject_id) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('courses').insert([courseForm]);
    
    if (error) {
      toast({ title: "Error creating course", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Course created successfully" });
      setCourseForm({ title: '', description: '', content: '', subject_id: '' });
      loadData();
    }
  };

  const createChapter = async () => {
    if (!chapterForm.title || !chapterForm.course_id) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('chapters').insert([chapterForm]);
    
    if (error) {
      toast({ title: "Error creating chapter", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Chapter created successfully" });
      setChapterForm({ title: '', description: '', chapter_number: 1, course_id: '' });
      loadData();
    }
  };

  const createQuestion = async () => {
    if (!questionForm.question_text || !questionForm.option_a || !questionForm.option_b || 
        !questionForm.option_c || !questionForm.option_d) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('questions').insert([questionForm]);
    
    if (error) {
      toast({ title: "Error creating question", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Question created successfully" });
      setQuestionForm({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        explanation: '',
        difficulty_level: 'medium',
        category_id: '',
        course_id: '',
        chapter_id: '',
        exam_mode_enabled: true
      });
      loadData();
    }
  };

  const filteredCourses = selectedSubject 
    ? courses.filter(course => course.subject_id === selectedSubject)
    : courses;

  const filteredChapters = selectedCourse
    ? chapters.filter(chapter => chapter.course_id === selectedCourse)
    : chapters;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Course Management</h1>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="chapters">Chapters</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add New Course
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={courseForm.subject_id} onValueChange={(value) => setCourseForm({...courseForm, subject_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject: any) => (
                          <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      value={courseForm.title}
                      onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                      placeholder="Enter course title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                      placeholder="Enter course description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Course Content</Label>
                    <Textarea
                      value={courseForm.content}
                      onChange={(e) => setCourseForm({...courseForm, content: e.target.value})}
                      placeholder="Enter course content"
                      rows={4}
                    />
                  </div>
                  <Button onClick={createCourse} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Existing Courses ({courses.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {courses.map((course: any) => (
                      <div key={course.id} className="border rounded-lg p-3">
                        <h4 className="font-medium">{course.title}</h4>
                        <p className="text-sm text-gray-600">{course.subjects?.name}</p>
                        <p className="text-sm text-gray-500">{course.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chapters">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add New Chapter
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="course">Course</Label>
                    <Select value={chapterForm.course_id} onValueChange={(value) => setChapterForm({...chapterForm, course_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course: any) => (
                          <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="chapter_number">Chapter Number</Label>
                    <Input
                      type="number"
                      value={chapterForm.chapter_number}
                      onChange={(e) => setChapterForm({...chapterForm, chapter_number: parseInt(e.target.value)})}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Chapter Title</Label>
                    <Input
                      value={chapterForm.title}
                      onChange={(e) => setChapterForm({...chapterForm, title: e.target.value})}
                      placeholder="Enter chapter title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      value={chapterForm.description}
                      onChange={(e) => setChapterForm({...chapterForm, description: e.target.value})}
                      placeholder="Enter chapter description"
                      rows={3}
                    />
                  </div>
                  <Button onClick={createChapter} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Chapter
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Existing Chapters ({chapters.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {chapters.map((chapter: any) => (
                      <div key={chapter.id} className="border rounded-lg p-3">
                        <h4 className="font-medium">Chapter {chapter.chapter_number}: {chapter.title}</h4>
                        <p className="text-sm text-gray-600">{chapter.courses?.title}</p>
                        <p className="text-sm text-gray-500">{chapter.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="questions">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add New Question
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select value={questionForm.category_id} onValueChange={(value) => setQuestionForm({...questionForm, category_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category: any) => (
                            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Course</Label>
                      <Select value={questionForm.course_id} onValueChange={(value) => setQuestionForm({...questionForm, course_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course: any) => (
                            <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {questionForm.course_id && (
                    <div>
                      <Label>Chapter</Label>
                      <Select value={questionForm.chapter_id} onValueChange={(value) => setQuestionForm({...questionForm, chapter_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select chapter" />
                        </SelectTrigger>
                        <SelectContent>
                          {chapters.filter(ch => ch.course_id === questionForm.course_id).map((chapter: any) => (
                            <SelectItem key={chapter.id} value={chapter.id}>Chapter {chapter.chapter_number}: {chapter.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label>Question Text</Label>
                    <Textarea
                      value={questionForm.question_text}
                      onChange={(e) => setQuestionForm({...questionForm, question_text: e.target.value})}
                      placeholder="Enter the question"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Option A</Label>
                      <Input
                        value={questionForm.option_a}
                        onChange={(e) => setQuestionForm({...questionForm, option_a: e.target.value})}
                        placeholder="Option A"
                      />
                    </div>
                    <div>
                      <Label>Option B</Label>
                      <Input
                        value={questionForm.option_b}
                        onChange={(e) => setQuestionForm({...questionForm, option_b: e.target.value})}
                        placeholder="Option B"
                      />
                    </div>
                    <div>
                      <Label>Option C</Label>
                      <Input
                        value={questionForm.option_c}
                        onChange={(e) => setQuestionForm({...questionForm, option_c: e.target.value})}
                        placeholder="Option C"
                      />
                    </div>
                    <div>
                      <Label>Option D</Label>
                      <Input
                        value={questionForm.option_d}
                        onChange={(e) => setQuestionForm({...questionForm, option_d: e.target.value})}
                        placeholder="Option D"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Correct Answer</Label>
                      <Select value={questionForm.correct_answer} onValueChange={(value) => setQuestionForm({...questionForm, correct_answer: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Difficulty</Label>
                      <Select value={questionForm.difficulty_level} onValueChange={(value) => setQuestionForm({...questionForm, difficulty_level: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Explanation</Label>
                    <Textarea
                      value={questionForm.explanation}
                      onChange={(e) => setQuestionForm({...questionForm, explanation: e.target.value})}
                      placeholder="Explain the correct answer"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={questionForm.exam_mode_enabled}
                      onCheckedChange={(checked) => setQuestionForm({...questionForm, exam_mode_enabled: checked})}
                    />
                    <Label>Enable in Exam Mode</Label>
                  </div>

                  <Button onClick={createQuestion} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Question
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Recent Questions ({questions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {questions.slice(0, 10).map((question: any) => (
                      <div key={question.id} className="border rounded-lg p-3">
                        <p className="font-medium text-sm">{question.question_text.substring(0, 100)}...</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            {question.question_categories?.name} | {question.courses?.title}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            question.exam_mode_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {question.exam_mode_enabled ? 'Exam Mode' : 'Practice Only'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseManagement;