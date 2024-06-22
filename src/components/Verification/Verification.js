import React, { useState, useEffect } from "react";
import "./Verification.css";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Modal from "../Modal/Modal";
import { useNavigate } from "react-router-dom";
import Loading from "../Loading/Loading"; // Import the Loading component
import { BACKEND_URL } from "../Constants/Constants";
function Verification() {
  const location = useLocation();
  const [otpInput, setOtpInput] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [Otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const email = location.state ? location.state.email : null;

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

  const generateOTP = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let otp = "";
    for (let i = 0; i < 6; i++) {
      otp += chars[Math.floor(Math.random() * chars.length)];
    }
    //const url = "http://localhost:5500/User-Data/otp";
    const url = `${BACKEND_URL}/User-Data/otp`;
    const botp = { otp: otp, email: email };
    axios
      .post(url, botp)
      .then((res) => {
        if (res.status === 200) {
          console.log(botp);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
    setOtp(otp);
  };

  const resend = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state to true
    generateOTP();
    setVerificationResult("OTP Resent Successfully!!");
    setShowModal(true);
    setLoading(false); // Set loading state to false
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state to true
    try {
      const response = await axios.post(
        // "http://localhost:5500/User-Data/data",
        `${BACKEND_URL}/User-Data/data`,
        {
          email: email,
        }
      );
      console.log("User data:", response.data);

      if (response.data.verified === false) {
        try {
          const isOtpValid = otpInput === Otp;
          console.log("Entered OTP:", otpInput);
          console.log("Stored OTP:", Otp);
          console.log("OTP match:", isOtpValid);
          if (isOtpValid) {
            const updateResponse = await axios.post(
              //"http://localhost:5500/User-Data/update",
              `${BACKEND_URL}/User-Data/update`,
              {
                email: email,
              }
            );
            console.log(updateResponse.data.message);
            setVerificationResult("OTP verified successfully.");
            setShowModal(true);
            navigate("/home", {
              state: { email: email },
            });
          } else {
            setVerificationResult("Invalid OTP");
            setShowModal(true);
          }
        } catch (updateError) {
          console.error(
            "Error updating user verification status:",
            updateError
          );
          setVerificationResult("Error Verifying User");
          setShowModal(true);
        }
      } else {
        setVerificationResult("User Already Verified!!");
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
    setLoading(false); // Set loading state to false
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      {loading && <Loading />} {/* Render Loading component when loading */}
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

export default Verification;
