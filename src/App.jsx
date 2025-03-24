import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Reg from "./Components/Registration/Reg";
import Login from "./Components/Login/Login";
import Dash from "./Components/Dashboard/Dash";
import Prescription from "./Components/Presciption/Prescription";
import PrescriptionHistory from "./Components/PresciptionHistory/PresciptionHistory";
import { AuthProvider, useAuth } from "./AuthContext"; 

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
