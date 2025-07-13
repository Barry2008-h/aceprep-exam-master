
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, Clock, AlertCircle } from 'lucide-react';

const ExamMode = () => {
  const navigate = useNavigate();
  const [examCategories, setExamCategories] = useState([]);

  useEffect(() => {
    // Mock exam categories - would be managed by admin
    const mockCategories = [
      {
        id: 1,
        name: "DELSU Post-UTME",
        description: "50 questions covering all subjects",
        duration: 60,
        questionCount: 50
      },
      {
        id: 2,
        name: "JAMB UTME",
        description: "Mixed questions from all subjects",
        duration: 45,
        questionCount: 50
      },
      {
        id: 3,
        name: "WAEC Preparation",
        description: "Senior school certificate exam prep",
        duration: 40,
        questionCount: 50
      }
    ];
    setExamCategories(mockCategories);
  }, []);

  const startExam = (category) => {
    localStorage.setItem('currentExam', JSON.stringify(category));
    navigate('/exam');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Exam Mode</h1>
          <p className="text-gray-600">Take timed practice exams</p>
        </div>

        {/* Exam Rules */}
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-5 h-5" />
              Exam Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="text-amber-700">
            <ul className="space-y-2 text-sm">
              <li>• Each exam contains 50 questions</li>
              <li>• Time limit varies by exam type</li>
              <li>• You cannot pause or restart once begun</li>
              <li>• Results are saved to your Past Scores</li>
              <li>• Choose your answers carefully</li>
            </ul>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {examCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {category.name}
                </CardTitle>
                <p className="text-gray-600">{category.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {category.duration} minutes
                    </Badge>
                    <Badge variant="outline">
                      {category.questionCount} questions
                    </Badge>
                  </div>
                  <Button 
                    onClick={() => startExam(category)}
                    className="w-full"
                  >
                    Start {category.name} Exam
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamMode;
