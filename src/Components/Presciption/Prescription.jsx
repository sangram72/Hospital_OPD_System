import React, { useState, useEffect, useRef } from "react";
import { db } from "../../Firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { jsPDF } from "jspdf";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Prescription.css";
import logo from "../../assets/logo.png";

import Navbar from "../Navbar/Navbar";

function Prescription() {

  const [patientId, setPatientId] = useState(null);
  const [Issave,Setissave]=useState(false)
    const [patientData, setPatientData] = useState({ name: "", age: "" });
  const [formData, setFormData] = useState({
    findings: "",
    medicines: "",
    report: "",
    reviewDate: "",
    signature: "",
  });

  const [vitals, setVitals] = useState({
    height: "",
    weight: "",
    spo2: "",
    pulse: "",
    bp: "",
  });

  const prescriptionRef = useRef();

  useEffect(() => {
    const storedPatient = localStorage.getItem("patientData");
    if (storedPatient) {
      const parsedPatient = JSON.parse(storedPatient);
      if (parsedPatient?.id) {
        setPatientId(parsedPatient.id);
        setPatientData({ name: parsedPatient.name, age: parsedPatient.age });
      } else {
        toast.error("Invalid patient data!");
      }
    } else {
      toast.error("No patient data found!");
    }
  }, []);

  useEffect(() => {
    const fetchVitals = async () => {
      if (!patientId) return;

      try {
        const patientRef = doc(db, "patients", patientId);
        const patientSnap = await getDoc(patientRef);

        if (patientSnap.exists()) {
          const data = patientSnap.data();
          if (data.vitals) {
            setVitals(data.vitals);
          } else {
            toast.warn("No vitals data available.");
          }
        } else {
          toast.error("Patient data not found!");
        }
      } catch (error) {
        console.error("Error fetching vitals:", error);
        toast.error("Error fetching vitals!");
      }
    };

    fetchVitals();
  }, [patientId]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save prescription to Firestore
  const savePrescription = async () => {
    if (!patientId) {
      toast.error("Invalid patient ID!");
      return;
    }

    try {
      const patientRef = doc(db, "patients", patientId);
      const newPrescription = {
        ...formData,
        vitals,
        date: new Date().toLocaleDateString(),
      };

      await updateDoc(patientRef, {
        prescriptions: arrayUnion(newPrescription),
        vitals: null,
      });
Setissave(true)
      toast.success("Prescription saved successfully!");

    } catch (error) {
      console.error("Error saving prescription:", error);
      toast.error("Error saving prescription!");
    }
  };

  // Generate PDF
  const generatePDF = () => {
    const pdf = new jsPDF();
    pdf.setFont("helvetica");

    pdf.addImage(logo, "PNG", 80, 5, 50, 20);
    pdf.setFontSize(14).setTextColor("#0047AB").text("Sangram's Hospital", 105, 30, { align: "center" });
    pdf.setFontSize(10).setTextColor("black").text("Kolkata,India", 105, 37, { align: "center" });
    pdf.text("Email: sangramnandi99@gmail.com | Phone: +919875369598", 105, 42, { align: "center" });

    pdf.setFontSize(12).setTextColor("#FF5733").text(`Patient Name: ${patientData.name}`, 10, 55);
    pdf.text(`Age: ${patientData.age}`, 160, 55);
    pdf.text(`Patient ID: ${patientId}`, 10, 61);

    pdf.setFontSize(12).setTextColor("#009688").text("Vitals:", 10, 73);
    pdf.setFontSize(10).setTextColor("black");
    pdf.text(`Height: ${vitals.height} cm`, 10, 80);
    pdf.text(`Weight: ${vitals.weight} kg`, 60, 80);
    pdf.text(`SpO2: ${vitals.spo2} %`, 110, 80);
    pdf.text(`Pulse: ${vitals.pulse} bpm`, 160, 80);
    pdf.text(`BP: ${vitals.bp} mmHg`, 10, 87);

    pdf.setFontSize(12).setTextColor("#E91E63").text("Findings:", 10, 100);
    pdf.setFontSize(10).setTextColor("black").text(formData.findings, 10, 105, { maxWidth: 190 });

    pdf.setFontSize(12).setTextColor("#3F51B5").text("Medicines:", 10, 135);
    pdf.setFontSize(10).setTextColor("black").text(formData.medicines, 10, 140, { maxWidth: 190 });

    pdf.setFontSize(12).setTextColor("#4CAF50").text("Reports to be Done:", 10, 170);
    pdf.setFontSize(10).setTextColor("black").text(formData.report, 10, 175 , { maxWidth: 190 });

    pdf.text(`Next Review Date: ${formData.reviewDate}`, 10, 205);
    pdf.setFontSize(12).setTextColor("#795548").text("Doctor's Signature:", 140, 230);
    pdf.text(formData.signature, 140, 235);

    pdf.save(`Prescription_${patientId}.pdf`);
  };

  return (

    <>
    <Navbar/>
    <div className="prescription-container">
      <h2 className="title">Doctor's Prescription</h2>
      <ToastContainer position="top-center" autoClose={3000} closeButton={false} />

      <div className="prescription-card" ref={prescriptionRef}>
        <div className="form-group">
          <label>Findings:</label>
          <textarea name="findings" value={formData.findings} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Vitals:</label>
          <ul>
            <li>Height: {vitals.height} cm</li>
            <li>Weight: {vitals.weight} kg</li>
            <li>SpO2: {vitals.spo2} %</li>
            <li>Pulse: {vitals.pulse} bpm</li>
            <li>BP: {vitals.bp} mmHg</li>
          </ul>
        </div>

        <div className="form-group">
          <label>Medicines:</label>
          <textarea name="medicines" value={formData.medicines} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Reports to be done:</label>
          <textarea name="report" value={formData.report} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Next Review Date:</label>
          <input type="date" name="reviewDate" value={formData.reviewDate} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Doctor's Signature:</label>
          <input type="text" name="signature" value={formData.signature} onChange={handleChange} />
        </div>
      </div>

      <div className="button-group">
        <button className="save-btn" onClick={savePrescription}>
          Save Prescription
        </button>
        <button disable={Issave} className="generate-btn" onClick={generatePDF}>
          Generate PDF
        </button>
      </div>
    </div>
    </>
  );
}

export default Prescription;
