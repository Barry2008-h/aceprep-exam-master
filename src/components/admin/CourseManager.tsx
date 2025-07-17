import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, BookOpen, Edit, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CourseManager = () => {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    subject_id: '',
    title: '',
    description: '',
    content: '',
    chapter_number: 1
  });

  // AI Generation states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSubject, setAiSubject] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load subjects
    const { data: subjectsData } = await supabase
      .from('subjects')
      .select('*')
      .order('name');
    if (subjectsData) setSubjects(subjectsData);

    // Load courses
    const { data: coursesData } = await supabase
      .from('courses')
      .select('*, subjects(name)')
      .order('created_at', { ascending: false });
    if (coursesData) setCourses(coursesData);
  };

  const handleAddCourse = async () => {
    if (!newCourse.subject_id || !newCourse.title || !newCourse.content) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('courses')
      .insert([newCourse]);

    if (error) {
      toast({
        title: "Error adding course",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Course added successfully",
        description: "The course has been added to the database",
      });
      setNewCourse({
        subject_id: '',
        title: '',
        description: '',
        content: '',
        chapter_number: 1
      });
      setIsAddingCourse(false);
      loadData();
    }
  };

  const generateCourseWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please provide a prompt for AI generation",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`https://mbzmjevvegalxehuscam.functions.supabase.co/functions/v1/generate-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'course',
          prompt: aiPrompt,
          subject: aiSubject
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate course');
      }

      const courseData = result.data;
      
      // Pre-fill the form with AI-generated content
      setNewCourse({
        ...newCourse,
        title: courseData.title || 'AI Generated Course',
        description: courseData.description || '',
        content: courseData.content || ''
      });

      toast({
        title: "Success",
        description: "Course content generated with AI! Review and save when ready.",
      });
      
      setAiPrompt('');
      setIsAddingCourse(true); // Show the form so user can review
    } catch (error) {
      console.error('Error generating course:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate course with AI",
        variant: "destructive",
      });
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Course Management</h2>
        <Button onClick={() => setIsAddingCourse(!isAddingCourse)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      {/* AI Course Generator - Always visible */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Course Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="aiCoursePrompt">Course Topic/Prompt</Label>
            <Textarea
              id="aiCoursePrompt"
              placeholder="e.g., Create a comprehensive course on calculus fundamentals for university students..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="aiCourseSubject">Subject Area</Label>
            <Input
              id="aiCourseSubject"
              placeholder="e.g., Mathematics, English, Science"
              value={aiSubject}
              onChange={(e) => setAiSubject(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={generateCourseWithAI} 
            disabled={isGenerating || !aiPrompt.trim()}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Course with AI'}
          </Button>
        </CardContent>
      </Card>

      {/* Manual Course Form - Only when adding */}
      {isAddingCourse && (
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Subject</Label>
              <Select value={newCourse.subject_id} onValueChange={(value) => setNewCourse({...newCourse, subject_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject: any) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Course Title</Label>
                <Input
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  placeholder="Course title"
                />
              </div>
              <div>
                <Label>Chapter Number</Label>
                <Input
                  type="number"
                  value={newCourse.chapter_number}
                  onChange={(e) => setNewCourse({...newCourse, chapter_number: parseInt(e.target.value) || 1})}
                  placeholder="1"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={newCourse.description}
                onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                placeholder="Course description"
              />
            </div>

            <div>
              <Label>Content</Label>
              <Textarea
                rows={6}
                value={newCourse.content}
                onChange={(e) => setNewCourse({...newCourse, content: e.target.value})}
                placeholder="Course content and materials"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddCourse}>Add Course</Button>
              <Button variant="outline" onClick={() => setIsAddingCourse(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Existing Courses ({courses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {courses.map((course: any) => (
              <div key={course.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4" />
                      <h3 className="font-semibold">{course.title}</h3>
                      <span className="text-sm text-muted-foreground">
                        (Chapter {course.chapter_number})
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Subject: {course.subjects?.name}
                    </p>
                    {course.description && (
                      <p className="text-sm mb-2">{course.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Content: {course.content.substring(0, 100)}...
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Course Summary by Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {subjects.map((subject: any) => {
              const subjectCourses = courses.filter((course: any) => course.subject_id === subject.id);
              return (
                <div key={subject.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">{subject.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{subject.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span>Total Courses: {subjectCourses.length}</span>
                    <span>Total Chapters: {subjectCourses.reduce((sum: number, course: any) => sum + (course.chapter_number || 0), 0)}</span>
                  </div>
                  {subjectCourses.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium">Recent Courses:</p>
                      <div className="text-xs text-muted-foreground">
                        {subjectCourses.slice(0, 3).map((course: any) => course.title).join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseManager;