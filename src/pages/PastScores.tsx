
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Clock, Target, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const PastScores = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0
  });

  useEffect(() => {
    if (user) {
      loadScores();
    }
  }, [user]);

  const loadScores = async () => {
    if (!user) return;

    const { data: scoresData } = await supabase
      .from('user_scores')
      .select(`
        *,
        question_categories(name),
        courses(title)
      `)
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    if (scoresData) {
      setScores(scoresData);

      // Calculate stats
      if (scoresData.length > 0) {
        const totalScore = scoresData.reduce((sum, score) => sum + score.percentage, 0);
        const bestScore = Math.max(...scoresData.map(score => score.percentage));
        const totalTime = scoresData.reduce((sum, score) => sum + (score.time_spent || 0), 0);

        setStats({
          totalQuizzes: scoresData.length,
          averageScore: Math.round(totalScore / scoresData.length),
          bestScore: bestScore,
          totalTimeSpent: Math.round(totalTime / 60) // Convert to minutes
        });
      }
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-blue-600 bg-blue-100';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (type: string) => {
    switch (type) {
      case 'exam': return Target;
      case 'practice': return BookOpen;
      case 'quiz': return Clock;
      default: return BookOpen;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Past Scores</h1>
          <p className="text-gray-600">Track your learning progress</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalQuizzes}</div>
              <div className="text-sm text-gray-600">Total Quizzes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.averageScore}%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.bestScore}%</div>
              <div className="text-sm text-gray-600">Best Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.totalTimeSpent}m</div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </CardContent>
          </Card>
        </div>

        {/* Scores List */}
        <div className="space-y-4">
          {scores.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Scores Yet</h3>
                <p className="text-gray-600 mb-4">Take some quizzes or exams to see your performance here.</p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => navigate('/past-questions')}>
                    Try Past Questions
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/exam-mode')}>
                    Take an Exam
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            scores.map((score: any, index) => {
              const ScoreIcon = getScoreIcon(score.quiz_type);
              const title = score.question_categories?.name || score.courses?.title || 'Quiz';
              
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <ScoreIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{title}</h3>
                          <p className="text-sm text-gray-600">
                            {score.score}/{score.total_questions} correct
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(score.completed_at).toLocaleDateString()} at {new Date(score.completed_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`text-lg font-bold ${getScoreColor(score.percentage)}`}>
                          {Math.round(score.percentage)}%
                        </Badge>
                        {score.time_spent && (
                          <p className="text-sm text-gray-500 mt-1">
                            {Math.round(score.time_spent / 60)}m {score.time_spent % 60}s
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PastScores;
