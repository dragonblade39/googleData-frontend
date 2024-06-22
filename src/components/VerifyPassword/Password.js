import React, { useState, useEffect } from "react";
import "../Verification/Verification.css";
import axios from "axios";
import Modal from "../Modal/Modal";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../Constants/Constants";

function Password() {
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setEmailInput(e.target.value);
  };

  useEffect(() => {
    const handleTouchStart = (event) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

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

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const generateOTP = async () => {
    setLoading(true);

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let otp = "";
    for (let i = 0; i < 6; i++) {
      otp += chars[Math.floor(Math.random() * chars.length)];
    }
    //const url = "http://localhost:5500/User-Data/otp";
    const url = `${BACKEND_URL}/User-Data/otp`;
    const botp = { otp: otp, email: emailInput };

    try {
      await axios.post(url, botp);
      navigate("/verificationForgotPassword", {
        state: { email: emailInput, otp: otp },
      });
      setLoading(false);
    } catch (err) {
      console.log(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const email = emailInput;

    try {
      if (email.trim() !== "") {
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (isValidEmail) {
          const response = await axios.post(
            // "http://localhost:5500/User-Data/data",
            `${BACKEND_URL}/User-Data/data`,
            {
              email: email,
            }
          );
          console.log(response.data);

          await generateOTP();
        } else {
          setModalMessage("Enter a valid email to proceed!!");
          setShowModal(true);
          setLoading(false);
        }
      } else {
        setModalMessage("Enter an email address to proceed!!");
        setShowModal(true);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      setModalMessage("Error Verifying User");
      setShowModal(true);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="Verificationcontainer" id="Verificationcontainer">
        <div className="Verificationform-container Verificationflibber-form">
          <form onSubmit={handleSubmit}>
            <h2>Forgot Password</h2>
            <p style={{ color: "red", fontSize: "15px" }}>
              Enter your registered mail
            </p>
            <input
              type="email"
              placeholder="Enter Email"
              name="otp"
              value={emailInput}
              onChange={handleInputChange}
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

export default Password;
