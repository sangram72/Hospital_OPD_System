import React, { useEffect, useState } from 'react';
import { db } from '../../Firebase'; 
import { doc, getDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import './Login.css';
import loadingGif from '../../assets/loading.gif'; 

function Login() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const prefix = 'PAT-';

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (localStorage.getItem('token')) {
      navigate('/Dash', { replace: true });
    }

    // Disable back button
    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', () => {
      window.history.pushState(null, null, window.location.pathname);
    });

    return () => {
      window.removeEventListener('popstate', () => {});
    };
  }, [navigate]);

  async function fetchPatientDetails() {
    const patientId = prefix + search.trim();
    
    if (!search.trim()) {
      toast.error('Please enter a valid Patient ID');
      return;
    }

    setLoading(true);

    try {
      const patientRef = doc(db, 'patients', patientId);
      const patientSnap = await getDoc(patientRef);

      if (patientSnap.exists()) {
        const patientData = { id: patientId, ...patientSnap.data() };

        // Generate a simple token (e.g., patient ID + timestamp)
        const token = `${patientId}-${Date.now()}`;

        // Store the token in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('patientData', JSON.stringify(patientData));

        toast.success("Login successful!");
        setTimeout(() => navigate("/Dash", { replace: true }), 500);
      } else {
        toast.error('Patient ID not found!');
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
      toast.error("Failed to retrieve patient details");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      {loading && (
        <div className="loading-overlay">
          <img src={loadingGif} alt="Loading..." className="loading-image" />
        </div>
      )}

      <h2>Search Patient</h2>
      <div className="input-wrapper">
        <input
          className="input-field"
          placeholder="Enter Patient ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <button onClick={fetchPatientDetails} disabled={loading}>
        {loading ? "Loading..." : "See Details"}
      </button>

      {/* 🔙 Back to Registration Button */}
      <button className="back-button" onClick={() => navigate("/")}>
        Back to Registration
      </button>

      <ToastContainer position="top-center" autoClose={3000} closeButton={false} />
    </div>
  );
}

export default Login;
