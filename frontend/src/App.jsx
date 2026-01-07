import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import FileView from "./pages/FileView";
import ChangeEmail from "./pages/ChangeEmail";
import UploadPage from "./pages/UploadPage";
import Profile from "./pages/Profile";
import "./styles.css";
import Home from "./pages/Home";
import Loader from "./components/Loader";
// function Home() {
//   return (
//     <div className="container">
//       <h1 className="title">Secure File System</h1>
//       <p className="muted">Use the navigation to login or register.</p>
//     </div>
//   );
// }

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      {/* <Loader /> */}
        <Navbar />
        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route path="/upload" element={<PrivateRoute><UploadPage /></PrivateRoute>} />
          <Route path="/change-email" element={<PrivateRoute><ChangeEmail /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

          <Route path="/download/:link" element={<FileView />} />

          <Route path="*" element={<div className="container">Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
