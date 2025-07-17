import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const QuestionManager = () => {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    explanation: '',
    category_id: '',
    course_id: '',
    difficulty_level: 'medium',
    exam_mode_enabled: true
  });

  // AI Generation states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSubject, setAiSubject] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('medium');
  const [aiCount, setAiCount] = useState(5);
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

    // Load categories
    const { data: categoriesData } = await supabase
      .from('question_categories')
      .select('*')
      .order('name');
    if (categoriesData) setCategories(categoriesData);

    // Load questions
    const { data: questionsData } = await supabase
      .from('questions')
      .select('*, question_categories(name), courses(title)')
      .order('created_at', { ascending: false });
    if (questionsData) setQuestions(questionsData);
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.question_text || !newQuestion.option_a || !newQuestion.option_b || 
        !newQuestion.option_c || !newQuestion.option_d) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('questions')
      .insert([newQuestion]);

    if (error) {
      toast({
        title: "Error adding question",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Question added successfully",
        description: "The question has been added to the database",
      });
      setNewQuestion({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        explanation: '',
        category_id: '',
        course_id: '',
        difficulty_level: 'medium',
        exam_mode_enabled: true
      });
      setIsAddingQuestion(false);
      loadData();
    }
  };

  const toggleExamMode = async (questionId: string, enabled: boolean) => {
    const { error } = await supabase
      .from('questions')
      .update({ exam_mode_enabled: enabled })
      .eq('id', questionId);

    if (error) {
      toast({
        title: "Error updating question",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Question updated",
        description: `Question ${enabled ? 'enabled' : 'disabled'} for exam mode`,
      });
      loadData();
    }
  };

  const generateQuestionsWithAI = async () => {
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
          type: 'questions',
          prompt: aiPrompt,
          subject: aiSubject,
          difficulty: aiDifficulty,
          count: aiCount
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate questions');
      }

      // Insert generated questions into database
      const questionsToInsert = Array.isArray(result.data) ? result.data : [result.data];
      
      for (const q of questionsToInsert) {
        if (q.question_text && q.option_a && q.option_b && q.option_c && q.option_d) {
          await supabase.from('questions').insert({
            question_text: q.question_text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            correct_answer: q.correct_answer || 'A',
            explanation: q.explanation || '',
            difficulty_level: q.difficulty_level || aiDifficulty,
            category_id: newQuestion.category_id || null,
            exam_mode_enabled: true
          });
        }
      }

      toast({
        title: "Success",
        description: `Generated and saved ${questionsToInsert.length} questions using AI`,
      });
      
      loadData();
      setAiPrompt('');
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate questions with AI",
        variant: "destructive",
      });
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Question Management</h2>
        <Button onClick={() => setIsAddingQuestion(!isAddingQuestion)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      {/* AI Question Generator - Always visible */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              AI Question Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="aiPrompt">Prompt for AI</Label>
              <Textarea
                id="aiPrompt"
                placeholder="e.g., Generate questions about Nigerian history focusing on independence..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="aiSubject">Subject</Label>
                <Input
                  id="aiSubject"
                  placeholder="e.g., Mathematics"
                  value={aiSubject}
                  onChange={(e) => setAiSubject(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="aiCount">Number of Questions</Label>
                <Select value={aiCount.toString()} onValueChange={(value) => setAiCount(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Questions</SelectItem>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                    <SelectItem value="15">15 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="aiDifficulty">Difficulty Level</Label>
              <Select value={aiDifficulty} onValueChange={setAiDifficulty}>
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
            
            <Button 
              onClick={generateQuestionsWithAI} 
              disabled={isGenerating || !aiPrompt.trim()}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate Questions with AI'}
            </Button>
          </CardContent>
        </Card>

        {/* Manual Question Form - Only when adding */}
        {isAddingQuestion && (
          <Card>
            <CardHeader>
              <CardTitle>Manual Question Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Question Text</Label>
                <Textarea
                  value={newQuestion.question_text}
                  onChange={(e) => setNewQuestion({...newQuestion, question_text: e.target.value})}
                  placeholder="Enter the question"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Option A</Label>
                  <Input
                    value={newQuestion.option_a}
                    onChange={(e) => setNewQuestion({...newQuestion, option_a: e.target.value})}
                    placeholder="Option A"
                  />
                </div>
                <div>
                  <Label>Option B</Label>
                  <Input
                    value={newQuestion.option_b}
                    onChange={(e) => setNewQuestion({...newQuestion, option_b: e.target.value})}
                    placeholder="Option B"
                  />
                </div>
                <div>
                  <Label>Option C</Label>
                  <Input
                    value={newQuestion.option_c}
                    onChange={(e) => setNewQuestion({...newQuestion, option_c: e.target.value})}
                    placeholder="Option C"
                  />
                </div>
                <div>
                  <Label>Option D</Label>
                  <Input
                    value={newQuestion.option_d}
                    onChange={(e) => setNewQuestion({...newQuestion, option_d: e.target.value})}
                    placeholder="Option D"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Correct Answer</Label>
                  <Select value={newQuestion.correct_answer} onValueChange={(value) => setNewQuestion({...newQuestion, correct_answer: value})}>
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
                  <Label>Category</Label>
                  <Select value={newQuestion.category_id} onValueChange={(value) => setNewQuestion({...newQuestion, category_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <Select value={newQuestion.difficulty_level} onValueChange={(value) => setNewQuestion({...newQuestion, difficulty_level: value})}>
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
                <Label>Explanation (Optional)</Label>
                <Textarea
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
                  placeholder="Explain the correct answer"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={newQuestion.exam_mode_enabled}
                  onCheckedChange={(checked) => setNewQuestion({...newQuestion, exam_mode_enabled: checked})}
                />
                <Label>Enable for Exam Mode</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddQuestion}>Add Question</Button>
                <Button variant="outline" onClick={() => setIsAddingQuestion(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Questions ({questions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {questions.map((question: any) => (
              <div key={question.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{question.question_text}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <span>A: {question.option_a}</span>
                      <span>B: {question.option_b}</span>
                      <span>C: {question.option_c}</span>
                      <span>D: {question.option_d}</span>
                    </div>
                    <p className="text-sm text-green-600 mt-2">
                      Correct: {question.correct_answer}
                    </p>
                    {question.question_categories && (
                      <p className="text-sm text-muted-foreground">
                        Category: {question.question_categories.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={question.exam_mode_enabled}
                      onCheckedChange={(checked) => toggleExamMode(question.id, checked)}
                    />
                    <span className="text-sm">Exam Mode</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionManager;