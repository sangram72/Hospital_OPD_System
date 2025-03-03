import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ patientId }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  console.log("Navbar got ", patientId);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('patientData');
    navigate("/login", { replace: true });
  };

  const handlereg =()=>{
    localStorage.removeItem('token');
    localStorage.removeItem('patientData');
    navigate("/", { replace: true });
  }

  return (
    <nav className="navbar">
      <div className="logo">🏥 Sangram's Hospital</div>

      <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </div>

      <ul className={isOpen ? "nav-links open" : "nav-links"}>
        <li><Link to="/Dash" onClick={() => setIsOpen(false)}>Home</Link></li>
        <li><Link to="/PrescriptionHistory" onClick={() => setIsOpen(false)}>Patient History</Link></li>
        
        <li>
          <Link 
            to="/prescription"
            onClick={() => {
              setIsOpen(false);
              navigate("/prescription", { state: { id: patientId } });
            }}
          >
            Prescription
          </Link>
        </li>
        <li><Link to="/" onClick={() => {setIsOpen(false),handlereg()}}>Register New Patient</Link></li>
        <li className="logout">
          <Link to="/login" onClick={handleLogout}>Logout</Link>
        </li>

     
      </ul>
    </nav>
  );
}

export default Navbar;
