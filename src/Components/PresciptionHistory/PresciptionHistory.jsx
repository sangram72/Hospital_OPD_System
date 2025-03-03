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
  const [vitals, setVitals] = useState({});

  useEffect(() => {
    const storedPatient = localStorage.getItem("patientData");
    if (storedPatient) {
      const parsedPatient = JSON.parse(storedPatient);
      if (parsedPatient?.id) {
        setPatientId(parsedPatient.id);
        setPatientData(parsedPatient);
        setVitals(parsedPatient.vitals || {});
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
            const sortedPrescriptions = data.prescriptions.sort(
              (a, b) => new Date(b.date) - new Date(a.date)
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
  }, [patientId]);

  const generatePDF = (prescription) => {
    const pdf = new jsPDF();
    pdf.setFont("helvetica");

    // Hospital Logo & Header
    pdf.addImage(logo, "PNG", 80, 5, 50, 20);
    pdf.setFontSize(14).setTextColor("#0047AB").setFont("helvetica", "bold")
      .text("Sangram's Hospital", 105, 30, { align: "center" });
    pdf.setFontSize(10).setTextColor("black")
      .text("15 No Nalta Sarada Sarani", 105, 37, { align: "center" })
      .text("Email: sangramnandi99@gmail.com | Phone: +919875369598", 105, 42, { align: "center" });

    // Patient Info
    pdf.setFontSize(12).setTextColor("#FF5733").setFont("helvetica", "bold")
      .text(`Patient Name: ${patientData.name}`, 10, 55);
    pdf.setFontSize(12).setTextColor("black").setFont("helvetica", "normal")
      .text(`Age: ${patientData.age}`, 160, 55)
      .text(`Patient ID: ${patientId}`, 10, 61);

    // Vitals
    pdf.setFontSize(12).setTextColor("#009688").setFont("helvetica", "bold")
      .text("Vitals:", 10, 73);
    pdf.setFontSize(10).setTextColor("black").setFont("helvetica", "normal");
    pdf.text(`Height: ${prescription.vitals.height} cm`, 10, 80);
    pdf.text(`Weight: ${prescription.vitals.weight} kg`, 60, 80);
    pdf.text(`SpO2: ${prescription.vitals.spo2} %`, 110, 80);
    pdf.text(`Pulse: ${prescription.vitals.pulse} bpm`, 160, 80);
    pdf.text(`BP: ${prescription.vitals.bp} mmHg`, 10, 87);

    // Findings
    pdf.setFontSize(12).setTextColor("#E91E63").setFont("helvetica", "bold")
      .text("Findings:", 10, 100);
    pdf.setFontSize(10).setTextColor("black").setFont("helvetica", "normal")
      .text(prescription.findings, 10, 105, { maxWidth: 190 });

    // Medicines
    pdf.setFontSize(12).setTextColor("#3F51B5").setFont("helvetica", "bold")
      .text("Medicines:", 10, 135);
    pdf.setFontSize(10).setTextColor("black").setFont("helvetica", "normal")
      .text(prescription.medicines, 10, 140, { maxWidth: 190 });

    // Reports
    pdf.setFontSize(12).setTextColor("#4CAF50").setFont("helvetica", "bold")
      .text("Reports to be Done:", 10, 170);
    pdf.setFontSize(10).setTextColor("black").setFont("helvetica", "normal")
      .text(prescription.report, 10, 175, { maxWidth: 190 });

    // Review Date & Signature
    pdf.setFontSize(10).setTextColor("black").text(`Next Review Date: ${prescription.reviewDate}`, 10, 205);
    pdf.setFontSize(12).setTextColor("#795548").setFont("helvetica", "bold")
      .text("Doctor's Signature:", 140, 230);
    pdf.setFontSize(10).setTextColor("black").setFont("helvetica", "normal")
      .text(prescription.signature, 140, 235);

    // Save PDF
    pdf.save(`Prescription_${patientId}_${prescription.date}.pdf`);
  };

  return (
    <>
      <Navbar />
      <div className="prescription-history-container">
        <h2 className="title">Prescription History</h2>
        <ToastContainer position="top-center" autoClose={3000} closeButton={false} />
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
