import React, { useState } from "react";
import "../Verification/Verification.css";
import axios from "axios";
import Modal from "../Modal/Modal";
import { useNavigate } from "react-router-dom";
import Loading from "../../Loading/Loading"; // Import the Loading component
import { BACKEND_URL } from "../Constants/Constants";

function Password() {
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false); // Set initial loading state to false

  const handleInputChange = (e) => {
    setEmailInput(e.target.value);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const generateOTP = async () => {
    setLoading(true); // Set loading state to true

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
      // Navigate after OTP is successfully generated
      navigate("/verificationForgotPassword", {
        state: { email: emailInput, otp: otp },
      });
      setLoading(false); // Set loading state to false after navigation
    } catch (err) {
      console.log(err.message);
      setLoading(false); // Set loading state to false on error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state to true

    const email = emailInput; // Assuming emailInput is fetched from state or props

    try {
      // Check if the email field is not empty before validating it
      if (email.trim() !== "") {
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (isValidEmail) {
          // Fetch user data asynchronously
          const response = await axios.post(
            // "http://localhost:5500/User-Data/data",
            `${BACKEND_URL}/User-Data/data`,
            {
              email: email,
            }
          );
          console.log(response.data);

          // Proceed with generating OTP after successful data fetch
          await generateOTP();
        } else {
          setModalMessage("Enter a valid email to proceed!!");
          setShowModal(true);
          setLoading(false); // Set loading state to false if email is invalid
        }
      } else {
        setModalMessage("Enter an email address to proceed!!");
        setShowModal(true);
        setLoading(false); // Set loading state to false if email is empty
      }
    } catch (error) {
      // Handle errors from axios.post operation
      console.error("Error fetching user data:", error.message);
      setModalMessage("Error Verifying User");
      setShowModal(true);
      setLoading(false); // Set loading state to false on error
    }
  };

  return (
    <div>
      {loading && <Loading />} {/* Render Loading component when loading */}
      {!loading && (
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
              />
              <br />
              <button type="submit">Verify</button>
            </form>
          </div>
        </div>
      )}
      <Modal
        show={showModal}
        message={modalMessage}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default Password;
