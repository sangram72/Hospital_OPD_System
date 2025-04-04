import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Reg from "./Components/Registration/Reg";
import Login from "./Components/Login/Login";
import Dash from "./Components/Dashboard/Dash";
import Prescription from "./Components/Presciption/Prescription";
import PrescriptionHistory from "./Components/PresciptionHistory/PresciptionHistory";
import { AuthProvider, useAuth } from "./AuthContext";
import { useEffect, useState } from "react";

// ✅ Only allow access to protected routes if logged in
function PrivateRoute({ element }) {
  const { isAuthenticated } = useAuth(); // Get authentication status from context
  return isAuthenticated ? element : <Navigate to="/" replace />;
}

// ✅ Redirect logged-in users from "/" to "/Dash"
function PublicRoute({ element }) {
  const { isAuthenticated } = useAuth(); // Get authentication status from context
  return isAuthenticated ? <Navigate to="/Dash" replace /> : element;
}

function App() {
  const [isAllowed, setIsAllowed] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Use the context hook here to get the authentication status
  const { isAuthenticated } = useAuth(); 

  useEffect(() => {
    const checkAccess = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const screenWidth = window.innerWidth;

      // ✅ OS Restriction (Only Windows & macOS)
      if (!(userAgent.includes("windows") || userAgent.includes("macintosh"))) {
        setIsAllowed(false);
        setErrorMessage("This application is only available on Windows and macOS.");
        return;
      }

      // ✅ Screen Size Restriction (Min: 1440px)
      if (screenWidth < 1440) {
        setIsAllowed(false);
        setErrorMessage("This application requires a screen width of at least 1440px.");
        return;
      }
    };

    checkAccess();

    const handleResize = () => {
      if (window.innerWidth < 1440) {
        setIsAllowed(false);
        setErrorMessage("Screen size too small. Resize your window to at least 1440px.");
      } else {
        setIsAllowed(true);
        setErrorMessage("");
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!isAllowed) {
    return (
      <div className="block-page">
        <h2>{errorMessage}</h2>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<PublicRoute element={<Login />} />} />
          
          {/* Private Routes */}
          <Route path="/Reg" element={<PrivateRoute element={<Reg />} />} />
          <Route path="/Dash" element={<PrivateRoute element={<Dash />} />} />
          <Route path="/prescription" element={<PrivateRoute element={<Prescription />} />} />
          <Route path="/PrescriptionHistory" element={<PrivateRoute element={<PrescriptionHistory />} />} />
          
          {/* Catch-all Route with logic for redirection */}
          <Route path="/*" element={isAuthenticated ? <Navigate to="/Dash" replace /> : <Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
