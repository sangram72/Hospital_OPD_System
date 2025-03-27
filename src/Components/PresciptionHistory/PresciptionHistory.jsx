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

  const generatePDF = (prescription) => {
    const pdf = new jsPDF();
    pdf.setFont("helvetica");

    pdf.addImage(logo, "PNG", 80, 5, 50, 20);
    pdf.setFontSize(14).setTextColor("#0047AB").text("Sangram's Hospital", 105, 30, { align: "center" });
    pdf.setFontSize(10).setTextColor("black").text("Kolkata , India", 105, 37, { align: "center" });
    pdf.text("Email: sangramnandi99@gmail.com | Phone: +919875369598", 105, 42, { align: "center" });

    pdf.setFontSize(12).setTextColor("#FF5733").text(`Patient Name: ${patientData.name}`, 10, 55);
    pdf.text(`Age: ${patientData.age}`, 160, 55);
    pdf.text(`Patient ID: ${patientId}`, 10, 61);

    pdf.setFontSize(12).setTextColor("#009688").text("Vitals:", 10, 73);
    pdf.setFontSize(10).setTextColor("black");
    pdf.text(`Height: ${prescription.vitals?.height || "N/A"} cm`, 10, 80);
    pdf.text(`Weight: ${prescription.vitals?.weight || "N/A"} kg`, 60, 80);
    pdf.text(`SpO2: ${prescription.vitals?.spo2 || "N/A"} %`, 110, 80);
    pdf.text(`Pulse: ${prescription.vitals?.pulse || "N/A"} bpm`, 160, 80);
    pdf.text(`BP: ${prescription.vitals?.bp || "N/A"} mmHg`, 10, 87);

    pdf.setFontSize(12).setTextColor("#E91E63").text("Findings:", 10, 100);
    pdf.setFontSize(10).setTextColor("black").text(prescription.findings || "N/A", 10, 105, { maxWidth: 190 });

    pdf.setFontSize(12).setTextColor("#3F51B5").text("Medicines:", 10, 135);
    pdf.setFontSize(10).setTextColor("black").text(prescription.medicines || "N/A", 10, 140, { maxWidth: 190 });

    pdf.setFontSize(12).setTextColor("#4CAF50").text("Reports to be Done:", 10, 170);
    pdf.setFontSize(10).setTextColor("black").text(prescription.report || "N/A", 10, 175 , { maxWidth: 190 });

    pdf.text(`Next Review Date: ${prescription.reviewDate || "N/A"}`, 10, 205);
    pdf.setFontSize(12).setTextColor("#795548").text("Doctor's Signature:", 140, 230);
    pdf.text(prescription.signature || "N/A", 140, 235);

    pdf.save(`Prescription_${patientId}.pdf`);
  };

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
