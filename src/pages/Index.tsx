
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Clock, Target, Key, TrendingUp, LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    const userActivated = localStorage.getItem('userActivated') === 'true';
    
    if (currentUser) {
      setUser(JSON.parse(currentUser));
      setIsActivated(userActivated);
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userActivated');
    navigate('/auth');
    toast({
      title: "Logged out successfully",
      description: "See you soon!",
    });
  };

  const handleFeatureAccess = (feature, path) => {
    if (feature === 'course') {
      // Course is accessible but may show ads for non-activated users
      navigate(path);
    } else if (!isActivated) {
      toast({
        title: "Activation Required",
        description: "Please activate your app to access this feature",
        variant: "destructive",
      });
    } else {
      navigate(path);
    }
  };

  if (!user) return null;

  const features = [
    {
      title: "Past Questions",
      icon: BookOpen,
      description: "Practice with previous exam questions",
      path: "/past-questions",
      color: "from-blue-500 to-blue-600",
      restricted: true
    },
    {
      title: "Courses",
      icon: Clock,
      description: "Study comprehensive course materials",
      path: "/courses",
      color: "from-green-500 to-green-600",
      restricted: false
    },
    {
      title: "Exam Mode",
      icon: Target,
      description: "Take timed practice exams",
      path: "/exam-mode",
      color: "from-purple-500 to-purple-600",
      restricted: true
    },
    {
      title: "Past Scores",
      icon: TrendingUp,
      description: "View your performance history",
      path: "/past-scores",
      color: "from-orange-500 to-orange-600",
      restricted: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 shadow-lg">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold">Aceprep</h1>
            <p className="text-blue-100">Welcome, {user.fullName}</p>
          </div>
          <div className="flex items-center gap-4">
            {user.username === 'adminbarry' && (
              <Button 
                variant="outline" 
                className="text-blue-600 border-white hover:bg-white"
                onClick={() => navigate('/admin')}
              >
                <User className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            <Button 
              variant="outline" 
              className="text-blue-600 border-white hover:bg-white"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Activation Status */}
        {!isActivated && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-amber-800">App Not Activated</p>
                    <p className="text-sm text-amber-600">Activate to unlock all features and remove ads</p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/activate')}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Activate Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105"
              onClick={() => handleFeatureAccess(feature.title.toLowerCase().replace(' ', '-'), feature.path)}
            >
              <CardContent className="p-6">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                {feature.restricted && !isActivated && (
                  <div className="flex items-center gap-2 text-amber-600">
                    <Key className="w-4 h-4" />
                    <span className="text-sm">Requires activation</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">150+</div>
              <div className="text-sm text-gray-600">Past Questions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">25+</div>
              <div className="text-sm text-gray-600">Courses</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">500+</div>
              <div className="text-sm text-gray-600">Students</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">95%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
