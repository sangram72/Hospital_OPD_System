import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Reg from "./Components/Registration/Reg";
import Login from "./Components/Login/Login";
import Dash from "./Components/Dashboard/Dash";
import Prescription from "./Components/Presciption/Prescription";
import PrescriptionHistory from "./Components/PresciptionHistory/PresciptionHistory";

// Function to check if user is authenticated
const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
};

// Protected Route Component
const ProtectedRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" replace />;
};

// Prevent logged-in users from accessing login/registration
const AuthRedirect = ({ element }) => {
  return isAuthenticated() ? <Navigate to="/Dash" replace /> : element;
};

function App() {
  return (
    <Router>
      <Routes>
 
        <Route path="/" element={<AuthRedirect element={<Reg />} />} />
        <Route path="/login" element={<AuthRedirect element={<Login />} />} />
        <Route path="/Dash" element={<ProtectedRoute element={<Dash />} />} />
        <Route path="/prescription" element={<ProtectedRoute element={<Prescription />} />} />
        <Route path="/PrescriptionHistory" element={<ProtectedRoute element={<PrescriptionHistory />} />} />
      </Routes>
    </Router>
  );
}

export default App;
