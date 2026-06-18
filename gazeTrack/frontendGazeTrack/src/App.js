import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import LandingPage from './pages/LandingPage';
import PermissionPage from './pages/PermissionPage';
import AboutUs from './pages/AboutUs';
import ForgetPassword from './pages/ForgetPassword';
import ResetPasswordComp from './components/ResetPasswordComp';
// import WebgazerComponent from './components/WebgazerComponent';
import CalPageMain from './pages/CalPageMain';
import CalibrationGrid from './components/CalibrationGrid';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Insight from './pages/Insight';
import AuthCheck from './pages/AuthCheck'; // Import the updated AuthCheck component
import { AuthProvider } from './context/AuthContext'; // Import the AuthProvider
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GadPage from './pages/GadPage';
import ProfilePage from './pages/ProfilePage';
import StimuliCategory from './pages/StimuliCategory';
import GazeTest from './components/GazeTest';
import GuidePage from './pages/GuidePage';
import ResultPage from './pages/ResultPage';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<HomePage />} />
          <Route path="/register" element={<HomePage />} />
          <Route path="/forgetpassword" element={<ForgetPassword />} />
          <Route path="/reset-password/:userId/:token" element={<ResetPasswordComp />} />

          {/* Protected Routes - Wrapped with AuthCheck */}
          <Route
            path="/home"
            element={
              <AuthCheck>
                <LandingPage />
              </AuthCheck>
            }
          />
          <Route
            path="/permission"
            element={
              <AuthCheck>
                <PermissionPage />
              </AuthCheck>
            }
          />
          <Route
            path="/about-us"
            element={
              <AuthCheck>
                <AboutUs />
              </AuthCheck>
            }
          />
          <Route
            path="/profile"
            element={
              <AuthCheck>
                <ProfilePage />
              </AuthCheck>
            }
          />
          <Route
            path="/category"
            element={
              <AuthCheck>
                <StimuliCategory />
              </AuthCheck>
            }
          />
          <Route
            path="/test"
            element={
              <AuthCheck>
                <GazeTest />
              </AuthCheck>
            }
          />
          <Route
            path="/calibration"
            element={
              <AuthCheck>
                <CalPageMain />
              </AuthCheck>
            }
          />
          <Route
            path="/calibrate"
            element={
              <AuthCheck>
                <CalibrationGrid />
              </AuthCheck>
            }
          />
          <Route
            path="/privacypolicy"
            element={
              <AuthCheck>
                <PrivacyPolicy />
              </AuthCheck>
            }
          />
          <Route
            path="/insights"
            element={
              <AuthCheck>
                <Insight />
              </AuthCheck>
            }
          />
          <Route
            path="/result"
            element={
              <AuthCheck>
                <ResultPage />
              </AuthCheck>
            }
          />
          <Route
            path="/gadpage"
            element={
              <AuthCheck>
                <GadPage />
              </AuthCheck>
            }
          />

          <Route
            path="/guide"
            element={
              <AuthCheck>
                <GuidePage />
              </AuthCheck>
            }
          />

          {/* Fallback to login if no match */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
