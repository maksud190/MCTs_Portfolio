import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Upload from "./pages/Upload";
import ProjectDetails from "./pages/ProjectDetail";
import EditProject from "./pages/EditProject";
import Settings from "./pages/Settings";
import Profiles from "./pages/Profiles";
import ImageConverter from "./pages/ImageConverter";
import Messages from "./pages/Messages"; // 🔥 NEW
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from 'sonner';
import TeacherAnnouncements from "./pages/TeacherAnnouncements";
import Forum from "./pages/Forum";
import AskQuestion from "./pages/AskQuestion";
import QuestionDetail from "./pages/QuestionDetail";
import MyQuestions from "./pages/MyQuestions";
import ProjectModal from "./components/ProjectModal";



// ✅ Admin imports
import { AdminProvider } from './context/AdminContext';
import AdminRoute from './components/AdminRoute';
import AdminLogin from './admin/pages/AdminLogin';
import AdminLayout from './admin/layouts/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import UsersManagement from './admin/pages/UsersManagement';
import ProjectsManagement from './admin/pages/ProjectsManagement';
import CommentsModeration from './admin/pages/CommentsModeration';
import Categories from './admin/pages/Categories';
import Announcements from './admin/pages/Announcements';
import Analytics from './admin/pages/Analytics';
import SiteSettings from './admin/pages/SiteSettings';
import ForumModeration from "./admin/pages/ForumModeration";
import TestimonialManagement from "./admin/pages/TestimonialManagement";


function App() {
  return (
    <AdminProvider>
      <div className="min-h-screen transition-colors duration-300">
        <Routes>
          {/* ========================================
              PUBLIC ROUTES (with Navbar & Footer)
          ======================================== */}
          <Route path="/*" element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profiles" element={<Profiles />} />

                
                <Route path="/profile/:username" element={<Profile />} />

                <Route path="/project/:projectId" element={<ProjectDetails />} />
                <Route path="/imageConverter" element={<ImageConverter />} />
                <Route path="/teacherAnnouncements" element={<TeacherAnnouncements />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/forum/ask" element={<AskQuestion />} />
                <Route path="/forum/questions/:questionId" element={<QuestionDetail />} />
                <Route path="/forum/my-questions" element={<MyQuestions />} />




                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/upload"
                  element={
                    <ProtectedRoute>
                      <Upload />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit-project/:projectId"
                  element={
                    <ProtectedRoute>
                      <EditProject />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/:username/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                {/* 🔥 NEW: Messages Route */}
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <ProjectModal />
              <Footer />
            </>
          } />

          {/* ========================================
              ADMIN ROUTES (no Navbar/Footer)
          ======================================== */}
          
          {/* Admin Login (public) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Admin Panel (protected) */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="projects" element={<ProjectsManagement />} />
            <Route path="comments" element={<CommentsModeration />} />
            <Route path="categories" element={<Categories />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<SiteSettings />} />
            <Route path="forum" element={<ForumModeration />} /> {/* 🔥 NEW */}
            <Route path="testimonials" element={<TestimonialManagement />} />
          </Route>
        </Routes>
        
        <Toaster position="top-right" richColors />
      </div>
    </AdminProvider>
  );
}

export default App;