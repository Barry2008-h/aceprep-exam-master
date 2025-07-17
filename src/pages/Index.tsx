
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, BookOpen, Target, TrendingUp, LogOut, User, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading, signOut, isActivated } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out successfully",
      description: "See you next time!",
    });
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isActivated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <GraduationCap className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            <CardTitle>Account Activation Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Your account needs to be activated before you can access the study materials.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/activate')} className="w-full">
                Activate Account
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const phoneNumber = "2348145932595";
                  const message = encodeURIComponent(`Hello! I need help with my AcePrep account activation. My username is: ${profile?.username}`);
                  window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
                }}
                className="w-full border-green-600 text-green-600 hover:bg-green-50"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp: +234 814 593 2595
              </Button>
              <Button variant="outline" onClick={handleSignOut} className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Aceprep</h1>
              <p className="text-gray-600">Welcome back, {profile?.full_name}!</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {profile?.username === 'adminbarry' && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 border-orange-600 text-orange-600 hover:bg-orange-50"
              >
                <User className="w-4 h-4" />
                Admin Panel
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Profile
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/courses')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Study Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Access comprehensive study materials and practice questions for your exams.</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/past-questions')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Past Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Practice with real past questions from DELSU, JAMB, WAEC and other exams.</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/exam-mode')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-red-600" />
                Exam Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Take timed practice exams to simulate real exam conditions.</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/past-scores')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Performance Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">View your past scores and track your progress over time.</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">-</div>
                  <div className="text-sm text-gray-600">Tests Taken</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">-</div>
                  <div className="text-sm text-gray-600">Avg Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">-</div>
                  <div className="text-sm text-gray-600">Study Hours</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">-</div>
                  <div className="text-sm text-gray-600">Rank</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
