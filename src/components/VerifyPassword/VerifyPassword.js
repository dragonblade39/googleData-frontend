import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Modal from "../Modal/Modal";
import { useNavigate } from "react-router-dom";
import Loading from "../../Loading/Loading"; // Import the Loading component
import { BACKEND_URL } from "../Constants/Constants";

function VerifyPassword() {
  const location = useLocation();
  const [otpInput, setOtpInput] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [Otp, setOtp] = useState(location.state ? location.state.otp : null);
  const [loading, setLoading] = useState(false); // Initial loading state to false
  const navigate = useNavigate();

  const email = location.state ? location.state.email : null;

  useEffect(() => {
    if (!email) {
      navigate("/");
    }
  }, [email, navigate]);

  useEffect(() => {
    setOtp(location.state ? location.state.otp : null);
  }, [location.state]);

  const handleInputChange = (e) => {
    setOtpInput(e.target.value);
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
    const botp = { otp: otp, email: email };

    try {
      await axios.post(url, botp);
      setOtp(otp);
      setLoading(false); // Set loading state to false
      setShowModal(true);
      setVerificationResult("OTP Sent Successfully!!");
    } catch (err) {
      console.log(err.message);
      setLoading(false); // Set loading state to false
      setVerificationResult("Failed to send OTP. Please try again.");
      setShowModal(true);
    }
  };

  const resend = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state to true
    await generateOTP();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        //"http://localhost:5500/User-Data/data",
        `${BACKEND_URL}/User-Data/data`,
        {
          email: email,
        }
      );
      console.log("User data:", response.data);
      try {
        const isOtpValid = otpInput === Otp;
        console.log("Entered OTP:", otpInput);
        console.log("Stored OTP:", Otp);
        console.log("OTP match:", isOtpValid);
        if (isOtpValid) {
          const updateResponse = await axios.post(
            // "http://localhost:5500/User-Data/update",
            `${BACKEND_URL}/User-Data/update`,
            {
              email: email,
            }
          );
          console.log(updateResponse.data.message);
          navigate("/newpassword", {
            state: { email: email },
          });
        } else {
          setVerificationResult("Invalid OTP");
          setShowModal(true);
        }
      } catch (updateError) {
        console.error("Error updating user verification status:", updateError);
        setVerificationResult("Error Verifying User");
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      {loading && <Loading />}
      {!loading && (
        <div className="Verificationcontainer" id="Verificationcontainer">
          <div className="Verificationform-container Verificationflibber-form">
            <form onSubmit={handleSubmit}>
              <h1>Verify OTP</h1>
              <p style={{ color: "red", fontSize: "15px" }}>
                Enter OTP sent to your mail
              </p>
              <input
                type="text"
                placeholder="Enter OTP"
                name="otp"
                value={otpInput}
                onChange={handleInputChange}
              />
              <button type="submit">Verify</button>
              <br />
              <div style={{ paddingLeft: "12px", zIndex: "100" }}>
                Didn't receive an OTP?
                <b
                  style={{ paddingLeft: "60px", cursor: "pointer" }}
                  onClick={resend}
                >
                  Resend
                </b>
              </div>
            </form>
          </div>
        </div>
      )}
      <Modal
        show={showModal}
        message={verificationResult}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default VerifyPassword;
