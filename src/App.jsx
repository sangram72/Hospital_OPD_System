import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Reg from "./Components/Registration/Reg";
import Login from "./Components/Login/Login";
import Dash from "./Components/Dashboard/Dash";
import Prescription from "./Components/Presciption/Prescription";
import PrescriptionHistory from "./Components/PresciptionHistory/PresciptionHistory";
import { AuthProvider, useAuth } from "./AuthContext";
import { useEffect, useState } from "react";
import "./App.css"

// ✅ Only allow access to protected routes if logged in
function PrivateRoute({ element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? element : <Navigate to="/" replace />;
}

// ✅ Redirect logged-in users from "/" to "/Dash"
function PublicRoute({ element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/Dash" replace /> : element;
}

function App() {
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("windows") || userAgent.includes("macintosh")) {
      setIsAllowed(true);
    }
  }, []);

  if (!isAllowed) {
    return (
      <div className="block-page">
        <h2>This application is only available on Windows and macOS.</h2>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PublicRoute element={<Login />} />} />
          <Route path="/Reg" element={<PrivateRoute element={<Reg />} />} />
          <Route path="/Dash" element={<PrivateRoute element={<Dash />} />} />
          <Route path="/prescription" element={<PrivateRoute element={<Prescription />} />} />
          <Route path="/PrescriptionHistory" element={<PrivateRoute element={<PrescriptionHistory />} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
