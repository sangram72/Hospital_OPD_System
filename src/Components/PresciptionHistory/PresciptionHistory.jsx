import React, { useState, useEffect } from "react";
import { db } from "../../Firebase";
import { doc, getDoc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import jsPDF from "jspdf";
import "react-toastify/dist/ReactToastify.css";

import logo from "../../assets/logo.png";
import Navbar from "../Navbar/Navbar";
import "./PresciptionHistory.css";

function PrescriptionHistory() {
  const [patientId, setPatientId] = useState(null);
  const [patientData, setPatientData] = useState({});
  const [prescriptions, setPrescriptions] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const storedPatient = localStorage.getItem("patientData");
    if (storedPatient) {
      const parsedPatient = JSON.parse(storedPatient);
      if (parsedPatient?.id) {
        setPatientId(parsedPatient.id);
        setPatientData(parsedPatient);
      } else {
        toast.error("Invalid patient data!");
      }
    } else {
      toast.error("No patient data found!");
    }
  }, []);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!patientId) return;
      try {
        const patientRef = doc(db, "patients", patientId);
        const patientSnap = await getDoc(patientRef);
        if (patientSnap.exists()) {
          const data = patientSnap.data();
          if (data.prescriptions) {
            const sortedPrescriptions = [...data.prescriptions].sort((a, b) =>
              sortOrder === "asc"
                ? new Date(a.date) - new Date(b.date)
                : new Date(b.date) - new Date(a.date)
            );
            setPrescriptions(sortedPrescriptions);
          } else {
            toast.warn("No prescription history available.");
          }
        } else {
          toast.error("Patient data not found!");
        }
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
        toast.error("Error fetching prescriptions!");
      }
    };
    fetchPrescriptions();
  }, [patientId, sortOrder]);

  return (
    <>
      <Navbar />
      <div className="prescription-history-container">
        <h2 className="title">Prescription History</h2>
        <ToastContainer position="top-center" autoClose={3000} closeButton={false} />
        
        <div className="sort-container">
          <label htmlFor="sortOrder">Sort by: </label>
          <select id="sortOrder" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="desc">New First</option>
            <option value="asc">Old First</option>
          </select>
        </div>
        
        <div className="history-grid">
          {prescriptions.length > 0 ? (
            prescriptions.map((prescription, index) => (
              <div key={index} className="history-item">
                <p><strong>Date:</strong> {prescription.date}</p>
                <p><strong>Review Date:</strong> {prescription.reviewDate}</p>
                <p><strong>Doctor's Signature:</strong> {prescription.signature}</p>
                <button className="download-btn" onClick={() => generatePDF(prescription)}>Download Prescription</button>
              </div>
            ))
          ) : (
            <p className="no-history">No prescription history available.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default PrescriptionHistory;
