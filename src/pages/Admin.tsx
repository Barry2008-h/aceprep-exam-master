
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Users, Key, BookOpen, Target, Plus } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [activationKeys, setActivationKeys] = useState([]);
  const [newKeyCount, setNewKeyCount] = useState(1);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.username !== 'adminbarry') {
      navigate('/');
      return;
    }

    // Load data
    setUsers(JSON.parse(localStorage.getItem('users') || '[]'));
    setActivationKeys(JSON.parse(localStorage.getItem('activationKeys') || '[]'));
  }, [navigate]);

  const generateActivationKeys = () => {
    const newKeys = [];
    for (let i = 0; i < newKeyCount; i++) {
      const key = 'ACEPREP-' + Math.random().toString(36).substr(2, 8).toUpperCase();
      newKeys.push(key);
    }
    
    const updatedKeys = [...activationKeys, ...newKeys];
    setActivationKeys(updatedKeys);
    localStorage.setItem('activationKeys', JSON.stringify(updatedKeys));
    
    toast({
      title: "Keys generated successfully",
      description: `Generated ${newKeyCount} new activation key(s)`,
    });
  };

  const initializeSampleData = () => {
    // Sample courses
    const sampleCourses = [
      {
        id: 1,
        title: "English Language",
        description: "Comprehensive English language preparation",
        chapters: [
          {
            id: 1,
            title: "Grammar Basics",
            content: "Understanding parts of speech, sentence structure, and basic grammar rules essential for Post-UTME success.",
            questions: [
              {
                id: 1,
                question: "Which of the following is a noun?",
                options: ["Run", "Beautiful", "Book", "Quickly"],
                correct: 2,
                explanation: "A noun is a word that names a person, place, thing, or idea. 'Book' is a thing."
              }
            ]
          }
        ]
      },
      {
        id: 2,
        title: "Mathematics",
        description: "Mathematical concepts and problem-solving",
        chapters: [
          {
            id: 1,
            title: "Algebra",
            content: "Basic algebraic operations, equations, and inequalities for exam preparation.",
            questions: [
              {
                id: 1,
                question: "Solve for x: 2x + 5 = 15",
                options: ["5", "10", "7.5", "2.5"],
                correct: 0,
                explanation: "2x + 5 = 15, so 2x = 10, therefore x = 5"
              }
            ]
          }
        ]
      }
    ];

    // Sample past questions
    const samplePastQuestions = [
      {
        id: 1,
        category: "DELSU Post-UTME",
        year: "2023",
        duration: 30,
        questions: [
          {
            id: 1,
            question: "The capital of Nigeria is?",
            options: ["Lagos", "Abuja", "Port Harcourt", "Kano"],
            correct: 1
          }
        ]
      }
    ];

    localStorage.setItem('courses', JSON.stringify(sampleCourses));
    localStorage.setItem('pastQuestions', JSON.stringify(samplePastQuestions));
    
    toast({
      title: "Sample data initialized",
      description: "Added sample courses and questions",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="keys">Activation Keys</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="setup">Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <p className="text-gray-500">No users registered yet</p>
                  ) : (
                    users.map(user => (
                      <div key={user.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Full Name</Label>
                            <p className="text-sm">{user.fullName}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Username</Label>
                            <p className="text-sm">{user.username}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Email</Label>
                            <p className="text-sm">{user.email}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Phone</Label>
                            <p className="text-sm">{user.phone}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keys">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Activation Keys
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Input 
                    type="number" 
                    min="1"
                    max="100"
                    value={newKeyCount}
                    onChange={(e) => setNewKeyCount(parseInt(e.target.value) || 1)}
                    className="w-32"
                  />
                  <Button onClick={generateActivationKeys}>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Keys
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium">Generated Keys ({activationKeys.length})</Label>
                  <div className="max-h-64 overflow-y-auto border rounded-lg p-4">
                    {activationKeys.length === 0 ? (
                      <p className="text-gray-500">No activation keys generated yet</p>
                    ) : (
                      <div className="grid gap-2">
                        {activationKeys.map((key, index) => (
                          <div key={index} className="font-mono text-sm bg-gray-100 p-2 rounded">
                            {key}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Course Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Manage courses, chapters, and practice questions</p>
                  <Button onClick={() => navigate('/admin/courses')}>
                    Manage Courses
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Past Questions Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Manage past questions by category and year</p>
                  <Button onClick={() => navigate('/admin/questions')}>
                    Manage Questions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle>Initial Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">Initialize the app with sample data for testing</p>
                  <Button onClick={initializeSampleData}>
                    Initialize Sample Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
