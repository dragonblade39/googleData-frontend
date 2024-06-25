import React, { useState, useEffect } from "react";
import "./Verification.css";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Modal from "../Modal/Modal";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../Constants/Constants";

function Verification() {
  const location = useLocation();
  const [otpInput, setOtpInput] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [resendDisabled, setResendDisabled] = useState(true); // Initially true to start countdown
  const [resendCountdown, setResendCountdown] = useState(30);

  const email = location.state ? location.state.email : null;

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

  useEffect(() => {
    if (!email) {
      navigate("/");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const intervalId = setInterval(() => {
        setResendCountdown((prevCount) => prevCount - 1);
      }, 1000);

      return () => clearInterval(intervalId);
    } else {
      setResendDisabled(false);
    }
  }, [resendCountdown]);

  const handleInputChange = (e) => {
    setOtpInput(e.target.value);
  };

  const startResendCountdown = () => {
    setResendDisabled(true);
    setResendCountdown(30);
  };

  const resend = async (e) => {
    e.preventDefault();

    if (resendCountdown <= 0) {
      setLoading(true);

      try {
        const response = await axios.post(`${BACKEND_URL}/User-Data/data`, {
          email: email,
        });
        const response1 = await axios.post(`${BACKEND_URL}/Otp-Data/otpstore`, {
          email: response.data.email,
          name: response.data.name,
        });
        if (response1.status === 200) {
          setVerificationResult("OTP Resent Successfully!!");
          startResendCountdown();
        } else {
          setVerificationResult("Failed to resend OTP");
        }
      } catch (error) {
        setVerificationResult("Failed to resend OTP");
      } finally {
        setLoading(false);
        setShowModal(true);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/User-Data/data`, {
        email: email,
      });

      if (response.data.verified === false) {
        try {
          const updateResponse = await axios.post(
            `${BACKEND_URL}/User-Data/update`,
            { email: email, otp: otpInput }
          );
          if (response.status === 200) {
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
    setLoading(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div>
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
              disabled={loading}
              style={{ cursor: loading ? "not-allowed" : "auto" }}
            />
            <button
              type="submit"
              style={{ cursor: loading ? "not-allowed" : "pointer" }}
              disabled={loading}
            >
              {loading ? "Loading . . ." : "Verify"}
            </button>

            <br />
            <div style={{ paddingLeft: "12px", zIndex: "100" }}>
              Didn't receive an OTP?
              <div style={{ zIndex: "100" }}>
                {resendCountdown > 0 ? (
                  `Resend available in ${resendCountdown}`
                ) : (
                  <b
                    style={{
                      paddingLeft: "60px",
                      cursor: resendDisabled ? "not-allowed" : "pointer",
                    }}
                    onClick={resend}
                  >
                    Resend
                  </b>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
      <Modal
        show={showModal}
        message={verificationResult}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default Verification;
