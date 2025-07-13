
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Play, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Courses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [isActivated, setIsActivated] = useState(false);
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    const coursesData = JSON.parse(localStorage.getItem('courses') || '[]');
    setCourses(coursesData);
    setIsActivated(localStorage.getItem('userActivated') === 'true');
  }, []);

  const handleChapterAccess = (chapter) => {
    if (!isActivated) {
      setShowAd(true);
      setTimeout(() => {
        setShowAd(false);
        setSelectedChapter(chapter);
      }, 3000); // Show ad for 3 seconds
    } else {
      setSelectedChapter(chapter);
    }
  };

  const startPractice = (questions) => {
    // Navigate to practice mode with questions
    localStorage.setItem('practiceQuestions', JSON.stringify(questions));
    navigate('/practice');
  };

  if (showAd) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Play className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Advertisement</h3>
            <p className="text-gray-600 mb-4">Please wait while we load your content...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Activate your app to remove ads</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedChapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => setSelectedChapter(null)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>{selectedChapter.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{selectedChapter.content}</p>
              </div>

              {selectedChapter.questions && selectedChapter.questions.length > 0 && (
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Practice Questions</h3>
                    <Badge variant="secondary">
                      {selectedChapter.questions.length} Questions
                    </Badge>
                  </div>
                  <Button onClick={() => startPractice(selectedChapter.questions)}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Practice
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => setSelectedCourse(null)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                {selectedCourse.title}
              </CardTitle>
              <p className="text-gray-600">{selectedCourse.description}</p>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Chapters</h3>
            {selectedCourse.chapters?.map((chapter, index) => (
              <Card key={chapter.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold mb-2">Chapter {index + 1}: {chapter.title}</h4>
                      <p className="text-gray-600 text-sm">{chapter.content.substring(0, 100)}...</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isActivated && <Lock className="w-4 h-4 text-amber-500" />}
                      <Button onClick={() => handleChapterAccess(chapter)}>
                        Read Chapter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Courses</h1>
          <p className="text-gray-600">Choose a course to start learning</p>
          {!isActivated && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm">
                📺 Free users will see ads before accessing course content. 
                <Button variant="link" className="p-0 h-auto text-amber-800" onClick={() => navigate('/activate')}>
                  Activate your app
                </Button> to remove ads.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Courses Available</h3>
                <p className="text-gray-600">Courses will appear here once added by the administrator.</p>
              </CardContent>
            </Card>
          ) : (
            courses.map((course) => (
              <Card key={course.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {course.title}
                  </CardTitle>
                  <p className="text-gray-600">{course.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {course.chapters?.length || 0} Chapters
                    </Badge>
                    <Button onClick={() => setSelectedCourse(course)}>
                      Start Course
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

export default Courses;
