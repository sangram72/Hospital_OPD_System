import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../../AuthContext"; 
import './Login.css';
import loadingGif from '../../assets/loading.gif'; 

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password!");
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const token = await user.getIdToken(); 

      login(token, { email: user.email, uid: user.uid });

      toast.success("Login successful!");
      setTimeout(() => navigate("/Dash", { replace: true }), 500);
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error("Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {loading && (
        <div className="loading-overlay">
          <img src={loadingGif} alt="Loading..." className="loading-image" />
        </div>
      )}

      <h2>Login</h2>
      <div className="input-wrapper">
        <input
          className="input-field"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="input-wrapper">
        <input
          className="input-field"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Loading..." : "Login"}
      </button>

      <ToastContainer position="top-center" autoClose={3000} closeButton={false} />
    </div>
  );
}

export default Login;
