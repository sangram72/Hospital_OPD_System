import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Reg from "./Components/Registration/Reg";
import Login from "./Components/Login/Login";
import Dash from "./Components/Dashboard/Dash";
import Prescription from "./Components/Presciption/Prescription";
import PrescriptionHistory from "./Components/PresciptionHistory/PresciptionHistory";
import { AuthProvider, useAuth } from "./AuthContext";
import { useEffect, useState } from "react";

// ✅ Only allow access to protected routes if logged in
function PrivateRoute({ element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? element : <Navigate to="/" replace />;
}

// ✅ Redirect logged-in users from "/" to "/Dash"
function PublicRoute({ element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/Dash" replace /> : element;
}

function App() {
  const [isAllowed, setIsAllowed] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const { isAuthenticated } = useAuth(); // Get authentication status from context

  useEffect(() => {
    // let watchId;

    const checkAccess = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const screenWidth = window.innerWidth;

      // ✅ OS Restriction (Only Windows & macOS)
      if (!(userAgent.includes("windows") || userAgent.includes("macintosh"))) {
        setIsAllowed(false);
        setErrorMessage("This application is only available on Windows and macOS.");
        return;
      }

      // ✅ Screen Size Restriction (Min: 1440px)
      if (screenWidth < 1440) {
        setIsAllowed(false);
        setErrorMessage("This application requires a screen width of at least 1440px.");
        return;
      }

      // Commenting out the location restriction
      /*
      if (!navigator.geolocation) {
        setIsAllowed(false);
        setErrorMessage("Geolocation is not supported in this browser.");
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // ✅ Allowed Location (Modify these coordinates)
          const allowedLat = 22.9266651;
          const allowedLon = 88.4409650;
          const radius = 0.3; // 0.3 km = 300 meters

          const distance = getDistance(latitude, longitude, allowedLat, allowedLon);
          console.log(`User distance from allowed location: ${distance.toFixed(3)} km`);

          if (distance > radius) {
            setIsAllowed(false);
            setErrorMessage("Access is restricted to a specific location.");
          } else {
            setIsAllowed(true);
            setErrorMessage(""); // Clear error message
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsAllowed(false);
          setErrorMessage("Location access error.");
        },
        {
          enableHighAccuracy: true, // More precise tracking
          maximumAge: 10000, // Cache location for 10 sec
          timeout: 5000, // Timeout after 5 sec if no response
        }
      );
      */
    };

    checkAccess();

    // ✅ Listen for Screen Resize (Update restriction if size changes)
    const handleResize = () => {
      if (window.innerWidth < 1440) {
        setIsAllowed(false);
        setErrorMessage("Screen size too small. Resize your window to at least 1440px.");
      } else {
        setIsAllowed(true);
        setErrorMessage("");
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      // if (watchId) navigator.geolocation.clearWatch(watchId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /*
  // ✅ Function to Calculate Distance between Two Coordinates
  function getDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  */

  if (!isAllowed) {
    return (
      <div className="block-page">
        <h2>{errorMessage}</h2>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<PublicRoute element={<Login />} />} />
          
          {/* Private Routes */}
          <Route path="/Reg" element={<PrivateRoute element={<Reg />} />} />
          <Route path="/Dash" element={<PrivateRoute element={<Dash />} />} />
          <Route path="/prescription" element={<PrivateRoute element={<Prescription />} />} />
          <Route path="/PrescriptionHistory" element={<PrivateRoute element={<PrescriptionHistory />} />} />
          
          {/* Catch-all Route with logic for redirection */}
          <Route path="/*" element={isAuthenticated ? <Navigate to="/Dash" replace /> : <Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
