import React, { useState, useEffect } from "react";
import "../Verification/Verification.css";
import axios from "axios";
import Modal from "../Modal/Modal";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { BACKEND_URL } from "../Constants/Constants";

function NewPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const email = location.state ? location.state.email : null;

  useEffect(() => {
    if (!email) {
      navigate("/");
    }
  }, [email, navigate]);

  useEffect(() => {
    // Prevent pinch zooming on mobile browsers
    const handleTouchStart = (event) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    // Prevent double tap zooming on mobile browsers
    let lastTouchEnd = 0;
    const handleTouchEnd = (event) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    document.addEventListener("touchend", handleTouchEnd, false);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state to true

    // Check if passwords match
    if (newPassword === confirmPassword) {
      const update = { email: email, password: newPassword };
      //const url = "http://localhost:5500/User-Data/updatePassword";
      const url = `${BACKEND_URL}/User-Data/updatePassword`;
      try {
        const response = await axios.post(url, update);
        if (response.status === 200) {
          setModalMessage("Password Updated");
          setShowModal(true);
          navigate("/home", { state: { email: email } });
        } else {
          setModalMessage("Error Updating Password");
          setShowModal(true);
        }
      } catch (error) {
        // Handle any errors
        console.error("Error updating password:", error);
        setModalMessage("Error updating password. Please try again later.");
        setShowModal(true);
      }
    } else {
      // Show error message if passwords don't match
      setModalMessage("Passwords do not match. Please try again.");
      setShowModal(true);
    }

    setLoading(false); // Set loading state to false
  };

  return (
    <div>
      <div className="Verificationcontainer" id="Verificationcontainer">
        <div
          className="Verificationform-container Verificationflibber-form"
          style={{ width: "310px" }}
        >
          <form onSubmit={handleSubmit}>
            <h2>Update Password</h2>
            <p style={{ color: "red", fontSize: "15px" }}>Enter New Password</p>
            <input
              type="password"
              placeholder="Enter New Password"
              name="newPassword"
              value={newPassword}
              onChange={handleNewPasswordChange}
              disabled={loading}
              style={{ cursor: loading ? "not-allowed" : "auto" }}
            />
            <input
              type="text"
              placeholder="Confirm New Password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              disabled={loading}
              style={{ cursor: loading ? "not-allowed" : "auto" }}
            />
            <br />
            <button type="submit" disabled={loading}>
              {loading ? "Loading . . ." : "Verify"}
            </button>
          </form>
        </div>
      </div>
      <Modal
        show={showModal}
        message={modalMessage}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default NewPassword;
