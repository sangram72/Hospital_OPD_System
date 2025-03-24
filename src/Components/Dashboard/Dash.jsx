import React, { useState, useEffect } from 'react';
import { db } from '../../Firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Navbar from '../Navbar/Navbar';
import "./Dash.css";
import loadinggif from "../../assets/loading.gif";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Dash() {
  const [patient, setPatient] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientFound, setPatientFound] = useState(false);
  const [vitals, setVitals] = useState({
    height: "",
    weight: "",
    spo2: "",
    pulse: "",
    bp: ""
  });

  const handleSearchChange = (e) => {
    setSearchId(e.target.value);
  };

  const handleSearch = async () => {
    if (!searchId.trim()) {
      toast.error("Please enter a Patient ID!");
      return;
    }

    setLoading(true);

    try {
      const formattedId = `PAT-${searchId.trim()}`;
      const patientRef = doc(db, "patients", formattedId);
      const patientSnap = await getDoc(patientRef);

      if (patientSnap.exists()) {
        const patientData = patientSnap.data();
        setPatient({ id: formattedId, ...patientData });
        setPatientFound(true);

        setVitals(patientData.vitals || {
          height: "",
          weight: "",
          spo2: "",
          pulse: "",
          bp: ""
        });

        toast.success("Patient data loaded successfully!");
      } else {
        setPatient(null);
        setPatientFound(false);
        toast.error("Patient not found!");
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
      toast.error("Failed to retrieve patient data.");
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const handleVitalsChange = (e) => {
    setVitals({ ...vitals, [e.target.name]: e.target.value });
  };

  const handleSaveVitals = async () => {
    if (!patient) return;

    const { spo2, pulse, bp } = vitals;

    if (!spo2.trim() || !pulse.trim() || !bp.trim()) {
      toast.error("SpO2, Pulse, and BP cannot be empty!");
      return;
    }

    setLoading(true);

    try {
      const patientRef = doc(db, 'patients', patient.id);
      const patientSnap = await getDoc(patientRef);
      if (!patientSnap.exists()) {
        toast.error("Patient data not found!");
        setLoading(false);
        return;
      }

      const patientData = patientSnap.data();
      const updatedVitals = { ...patientData.vitals, ...vitals };

      await updateDoc(patientRef, { vitals: updatedVitals });

      setVitals(updatedVitals);
      toast.success("Vitals saved successfully!");
      setVitals({
        height: "",
        weight: "",
        spo2: "",
        pulse: "",
        bp: ""
      });
    } catch (error) {
      console.error("Error updating vitals:", error);
      toast.error("Failed to save vitals!");
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const handleGoBack = () => {
   
    setPatientFound(false);
    setPatient(null);
    setSearchId('');
  
   
  };

  

  const handleSave = () => {
    if (!patient || !patient.id) {
      toast.error("No patient selected!");
      return;
    }


    localStorage.setItem("patientData", JSON.stringify({ id: patient.id}));
  setVitals({
    height: "",
    weight: "",
    spo2: "",
    pulse: "",
    bp: ""
  });
  setTimeout(() => {
    setPatientFound(false)
  }, 1000);
  setSearchId("")

     toast.success("Patient selected successfully!");
  };
  

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={1000} closeButton={false} />

      <div className="dash-container">
        {loading && (
          <div className="loading-overlay">
            <img src={loadinggif} alt="Loading..." className="loading-image" />
          </div>
        )}

        {patientFound ? (
          <>
            <h2>Patient Details</h2>
            <div className="patient-card">
              <div className="patient-info">
                <p><strong>ID:</strong> {patient.id.replace("PAT-", "")}</p>
                <p><strong>Name:</strong> {patient.name}</p>
                <p><strong>Age:</strong> {patient.age}</p>
                <p><strong>Gender:</strong> {patient.gender}</p>
                <p><strong>Phone:</strong> {patient.phone}</p>
              </div>
              <button className="save-vitals-btn" onClick={handleSave}>
                Select this Patient
                </button>
            </div>

            <div className="vitals-section">
              <h2>Vitals</h2>
              <div className="vitals-form">
                <label>Height (cm): <input type="number" name="height" value={vitals.height} onChange={handleVitalsChange} /></label>
                <label>Weight (kg): <input type="number" name="weight" value={vitals.weight} onChange={handleVitalsChange} /></label>
                <label>SpO2 (%): <input type="number" name="spo2" value={vitals.spo2} onChange={handleVitalsChange} /></label>
                <label>Pulse (bpm): <input type="number" name="pulse" value={vitals.pulse} onChange={handleVitalsChange} /></label>
                <label>BP (mmHg): <input type="text" name="bp" value={vitals.bp} onChange={handleVitalsChange} /></label>
              </div>
              <div className="buttons-container">
                <button className="save-vitals-btn" onClick={handleSaveVitals}>
                  Save Vitals
                </button>
                <button className="go-back-btn" onClick={handleGoBack}>
                  Go Back
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="title">Search Patient</h2>
            <div className="search-container">
              <input
                className="input-field"
                placeholder="Enter Patient ID"
                value={searchId}
                onChange={handleSearchChange}
              />
              <button onClick={handleSearch}>Search</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Dash;
