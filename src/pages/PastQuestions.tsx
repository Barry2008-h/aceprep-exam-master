
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, BookOpen, Play } from 'lucide-react';

const PastQuestions = () => {
  const navigate = useNavigate();
  const [pastQuestions, setPastQuestions] = useState([]);

  useEffect(() => {
    const questionsData = JSON.parse(localStorage.getItem('pastQuestions') || '[]');
    setPastQuestions(questionsData);
  }, []);

  const startQuiz = (questionSet) => {
    localStorage.setItem('currentQuiz', JSON.stringify(questionSet));
    navigate('/quiz');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Past Questions</h1>
          <p className="text-gray-600">Practice with previous exam questions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pastQuestions.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Past Questions Available</h3>
                <p className="text-gray-600">Past questions will appear here once added by the administrator.</p>
              </CardContent>
            </Card>
          ) : (
            pastQuestions.map((questionSet) => (
              <Card key={questionSet.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {questionSet.category}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{questionSet.year}</Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {questionSet.duration} min
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        {questionSet.questions?.length || 0} Questions
                      </p>
                    </div>
                    <Button onClick={() => startQuiz(questionSet)}>
                      <Play className="w-4 h-4 mr-2" />
                      Start Quiz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PastQuestions;
