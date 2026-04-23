import "./App.css";

import { Route, Routes } from "react-router-dom";

import AppNavbar from "./components/common/Navbar.jsx";
import AIChatbot from "./components/common/AIChatbot.jsx";
import AboutPage from "./pages/About.jsx";
import CatalogPage from "./pages/Catalog.jsx";
import ContactPage from "./pages/Contact.jsx";
import CourseDetailsPage from "./pages/CourseDetails.jsx";
import DashboardPage from "./pages/Dashboard.jsx";
import ErrorPage from "./pages/Error.jsx";
import ForgotPasswordPage from "./pages/ForgotPassword.jsx";
import HomePage from "./pages/Home.jsx";
import LoginPage from "./pages/Login.jsx";
import SignupPage from "./pages/Signup.jsx";
import UpdatePasswordPage from "./pages/UpdatePassword.jsx";
import VerifyEmailPage from "./pages/VerifyEmail.jsx";
import ViewCoursePage from "./pages/ViewCourse.jsx";
import OpenRoute from "./components/core/Auth/OpenRoute.jsx";
import PrivateRoute from "./components/core/Auth/PrivateRoute.jsx";
import MyProfilePanel from "./components/core/Dashboard/MyProfile.jsx";
import SettingsPanel from "./components/core/Dashboard/Settings/index.jsx";
import CartPanel from "./components/core/Dashboard/Cart/index.jsx";
import EnrolledCoursesPanel from "./components/core/Dashboard/EnrolledCourses.jsx";
import AddCoursePanel from "./components/core/Dashboard/AddCourses/index.jsx";
import MyCoursesPanel from "./components/core/Dashboard/MyCourses.jsx";
import EditCoursePanel from "./components/core/Dashboard/EditCourse/index.jsx";
import InstructorOverviewPanel from "./components/core/Dashboard/InstructorDashboard/Instructor.jsx";
import StudentOverviewPanel from "./components/core/Dashboard/StudentOverview.jsx";
import VideoLessonPanel from "./components/core/ViewCourse/VideoDetails.jsx";
import { ACCOUNT_TYPE } from "./utils/constants.js";
import { useSelector } from "react-redux";

const App = () => {
  const currentUser = useSelector((state) => state.profile.user);

  return (
    <div className="min-h-screen w-screen bg-richblack-900 font-inter text-richblack-25">
      <AppNavbar />
      <AIChatbot />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog/:catalogName" element={<CatalogPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        <Route
          path="/signup"
          element={
            <OpenRoute>
              <SignupPage />
            </OpenRoute>
          }
        />

        <Route
          path="/login"
          element={
            <OpenRoute>
              <LoginPage />
            </OpenRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <OpenRoute>
              <ForgotPasswordPage />
            </OpenRoute>
          }
        />

        <Route
          path="/verify-email"
          element={
            <OpenRoute>
              <VerifyEmailPage />
            </OpenRoute>
          }
        />

        <Route
          path="/update-password/:id"
          element={
            <OpenRoute>
              <UpdatePasswordPage />
            </OpenRoute>
          }
        />

        <Route
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard/my-profile" element={<MyProfilePanel />} />
          <Route path="/dashboard/settings" element={<SettingsPanel />} />

          {currentUser?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route
                path="/dashboard/student"
                element={<StudentOverviewPanel />}
              />
              <Route path="/dashboard/cart" element={<CartPanel />} />
              <Route
                path="/dashboard/enrolled-courses"
                element={<EnrolledCoursesPanel />}
              />
            </>
          )}

          {currentUser?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
            <>
              <Route
                path="/dashboard/instructor"
                element={<InstructorOverviewPanel />}
              />
              <Route
                path="/dashboard/add-course"
                element={<AddCoursePanel />}
              />
              <Route
                path="/dashboard/my-courses"
                element={<MyCoursesPanel />}
              />
              <Route
                path="/dashboard/edit-course/:courseId"
                element={<EditCoursePanel />}
              />
            </>
          )}
        </Route>

        <Route
          element={
            <PrivateRoute>
              <ViewCoursePage />
            </PrivateRoute>
          }
        >
          {currentUser?.accountType === ACCOUNT_TYPE.STUDENT && (
            <Route
              path="/view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
              element={<VideoLessonPanel />}
            />
          )}
        </Route>

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </div>
  );
};

export default App;
