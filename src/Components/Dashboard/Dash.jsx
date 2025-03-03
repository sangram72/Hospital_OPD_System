import React, { useState, useEffect } from 'react';
import { db } from '../../Firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Navbar from '../Navbar/Navbar';
import "./Dash.css";
import loadinggif from "../../assets/loading.gif";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

function Dash() {
  const [patient, setPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [vitals, setVitals] = useState({
    height: "",
    weight: "",
    spo2: "",
    pulse: "",
    bp: ""
  });

  useEffect(() => {
    setLoading(true);
    const storedPatient = localStorage.getItem('patientData');

    if (storedPatient) {
      setPatient(JSON.parse(storedPatient));
    }

    setLoading(false);
  }, []);

  const handleChange = (e) => {
    setPatient({ ...patient, [e.target.name]: e.target.value });
  };

  const handleVitalsChange = (e) => {
    setVitals({ ...vitals, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async () => {
    if (!patient) return;
  
    // Trim values to remove unnecessary spaces
    const { name, age, phone } = patient;
  
    if (!name.trim() || !age.trim() || !phone.trim()) {
      toast.error("Fields cannot be empty!");
      return;
    }
  
    // Validate phone number (exactly 10 digits)
    if (!/^\d{10}$/.test(phone)) {
      toast.error("Phone number must be exactly 10 digits!");
      return;
    }
  
    // Fetch the original data from localStorage to compare
    const storedPatient = JSON.parse(localStorage.getItem("patientData"));
  
    // Prevent updating if there are no changes
    if (
      storedPatient &&
      storedPatient.name === name &&
      storedPatient.age === age &&
      storedPatient.phone === phone
    ) {
      toast.info("No changes detected.");
      return;
    }
  
    setLoading(true);
    try {
      const patientRef = doc(db, "patients", patient.id);
      await updateDoc(patientRef, { name, age, phone });
  
      // ✅ Save updated patient data to localStorage
      localStorage.setItem("patientData", JSON.stringify({ ...patient }));
  
      setTimeout(() => {
        setIsEditing(false);
        setLoading(false);
        toast.success("Profile updated successfully!");
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile!");
      setLoading(false);
    }
  };
  
  
  

  const handleSaveVitals = async () => {
    if (!patient) return;
  
    // setLoading(true);
    try {
      const patientRef = doc(db, 'patients', patient.id);
      await updateDoc(patientRef, {
        vitals: vitals, 
      });
  
      setTimeout(() => { 
        // setLoading(false);
        toast.success("Vitals saved successfully!"  ); 
      }, 500);
      
    } catch (error) {
      console.error("Error updating vitals:", error);
      toast.error("Failed to save vitals!");
    } 
  };
  
  if (!patient) {
    return (
      <div className="loading-overlay">
        <img src={loadinggif} alt="Loading..." className="loading-image" />
      </div>
    );
  }

  return (
    <>
      <Navbar/>

      <ToastContainer position="top-right" autoClose={2000} closeButton={false}/> {/* ✅ Toast Container */}

      {loading && (
        <div className="loading-overlay">
          <img src={loadinggif} alt="Loading..." className="loading-image" />
        </div>
      )}

      <div className="dash-container">
        <h2 className="title">Patient Details</h2>

        <div className="patient-card">
          <div className="patient-info">
            <p><strong>ID:</strong> {patient.id.replace("PAT-", "")}</p>
            <p><strong>Name:</strong> 
              {isEditing ? (
                <input type="text" name="name" value={patient.name} onChange={handleChange} />
              ) : (
                patient.name
              )}
            </p>
            <p><strong>Age:</strong> 
              {isEditing ? (
                <input type="number" name="age" value={patient.age} onChange={handleChange} />
              ) : (
                patient.age
              )}
            </p>
            <p><strong>Gender:</strong> {patient.gender}</p>
            <p><strong>Phone:</strong> 
              {isEditing ? (
                <input type="number" name="phone" value={patient.phone} onChange={handleChange} />
              ) : (
                patient.phone
              )}
            </p>
          </div>
        </div>

        {isEditing ? (
          <div className="button-group">
            <button className="back-btn" onClick={() => setIsEditing(false)}>
              Back
            </button>
            <button className="save-btn" onClick={handleSaveChanges}>
              Save Changes
            </button>
          </div>
        ) : (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}

        {/* ✅ VITALS FORM SECTION */}
        <div className="vitals-section">
          <h2>Vitals</h2>
          <div className="vitals-form">
            <label>Height (cm): <input type="number" name="height" value={vitals.height} onChange={handleVitalsChange} /></label>
            <label>Weight (kg): <input type="number" name="weight" value={vitals.weight} onChange={handleVitalsChange} /></label>
            <label>SpO2 (%): <input type="number" name="spo2" value={vitals.spo2} onChange={handleVitalsChange} /></label>
            <label>Pulse (bpm): <input type="number" name="pulse" value={vitals.pulse} onChange={handleVitalsChange} /></label>
            <label>BP (mmHg): <input type="text" name="bp" value={vitals.bp} onChange={handleVitalsChange} /></label>
          </div>
          <button className="save-vitals-btn" onClick={handleSaveVitals}>
            Save Vitals
          </button>
        </div>
      </div>
    </>
  );
}

export default Dash;
