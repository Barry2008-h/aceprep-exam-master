
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Activate from "./pages/Activate";
import Admin from "./pages/Admin";
import CourseManagement from "./pages/CourseManagement";
import Profile from "./pages/Profile";
import Courses from "./pages/Courses";
import PastQuestions from "./pages/PastQuestions";
import ExamMode from "./pages/ExamMode";
import PastScores from "./pages/PastScores";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/activate" element={<Activate />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/course-management" element={<CourseManagement />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/past-questions" element={<PastQuestions />} />
            <Route path="/exam-mode" element={<ExamMode />} />
            <Route path="/past-scores" element={<PastScores />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
