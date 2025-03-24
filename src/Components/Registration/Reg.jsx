import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../Firebase'; 
import { collection, doc, setDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Reg.css";
import Navbar from '../Navbar/Navbar';

function Reg() {
  const [details, setDetails] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
  });
  const [patientId, setPatientId] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  function handleChange(e) {
    const { name, value } = e.target;
    setDetails({ ...details, [name]: value });
  }

  async function register() {
    const { name, age, gender, phone } = details;
  
    if (!name.trim() || !age.trim() || !gender.trim() || !phone.trim()) {
      toast.error('Please fill up all the fields!');
      return;
    }
  
    if (!/^\d{10}$/.test(phone)) {
      toast.error('Phone number must be exactly 10 digits!');
      return;
    }
  
    try {
      const timestamp = Date.now().toString();
      const generatedId = `PAT-${timestamp}`;
      const patientRef = doc(collection(db, 'patients'), generatedId);
  
      await setDoc(patientRef, {
        id: generatedId,
        name,
        age,
        gender,
        phone,
      });

      // Extract only the numeric part of the ID
      const displayId = timestamp;

      localStorage.setItem("patientData", JSON.stringify({ id: generatedId, name, age, gender, phone }));

      toast.success('Registration Successful!');
      setDetails({ name: '', age: '', gender: '', phone: '' });
      setPatientId(displayId);
    } catch (error) {
      toast.error('Error saving data! Try again.');
      console.error(error);
    }
  }

  function copyToClipboard() {
    if (patientId) {
      navigator.clipboard.writeText(patientId);
      toast.success('Patient ID copied!');
    }
  }

  return (
    <><Navbar /><div className="container">

      <h2>Patient Registration</h2>
      <input
        className="input-field"
        name="name"
        placeholder="Enter Your Full Name"
        value={details.name}
        onChange={handleChange} />
      <input
        className="input-field"
        type="number"
        name="age"
        placeholder="Enter your age"
        value={details.age}
        onChange={handleChange} />
      <div className="radio-group">
        <label>Male</label>
        <input
          name="gender"
          type="radio"
          value="Male"
          checked={details.gender === 'Male'}
          onChange={handleChange} />
        <label>Female</label>
        <input
          name="gender"
          type="radio"
          value="Female"
          checked={details.gender === 'Female'}
          onChange={handleChange} />
      </div>
      <input
        className="input-field"
        type="number"
        name="phone"
        placeholder="Enter Your Phone Number"
        value={details.phone}
        onChange={handleChange} />

      {/* Register Button */}
      <button onClick={register}>Register</button>

      {/* Copy ID Button - Only shows after registration */}
      {patientId && (
        <div className="copy-id-container">
          <p>Generated ID: <strong>{patientId}</strong></p>
          <button onClick={copyToClipboard}>Copy ID</button>
        </div>
      )}

      {/* Login Button */}


      <ToastContainer position="top-center" autoClose={3000} closeButton={false} />
    </div></>
  );
}

export default Reg;
