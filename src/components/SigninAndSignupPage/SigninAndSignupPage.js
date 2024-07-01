import React, { useState, useEffect } from "react";
import "./SigninAndSignupPage.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from "../Modal/Modal";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { BACKEND_URL } from "../Constants/Constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";

function SigninAndSignupPage() {
  const [isActive, setIsActive] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signUpForm, setSignUpForm] = useState({
    name: "",
    email: "",
    password: "",
    verified: false,
  });
  const [signInForm, setSignInForm] = useState({ email: "", password: "" });
  const [signUpErrors, setSignUpErrors] = useState({});
  const [signInErrors, setSignInErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();

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

  const handleToggleForm = () => {
    setShowSignUp(!showSignUp);
  };

  const handleRegisterClick = () => {
    setIsActive(false);
  };

  const handleLoginClick = () => {
    setIsActive(true);
  };

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpForm({ ...signUpForm, [name]: value });
    validateSignUpField(name, value);
  };

  const handleSignInChange = (e) => {
    const { name, value } = e.target;
    setSignInForm({ ...signInForm, [name]: value });
    validateSignInField(name, value);
  };

  const validateSignUpField = (name, value) => {
    let error = "";
    if (name === "name") {
      if (!/^[a-zA-Z ]+$/.test(value)) {
        error = "Name should only contain letters and spaces";
      }
    } else if (name === "email" && !/\S+@\S+\.\S+/.test(value)) {
      error = "Invalid email address";
    } else if (name === "password") {
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}/.test(value)) {
        error =
          "Password must contain at least 8 characters including one uppercase letter, one lowercase letter, one digit, and one special character";
      }
    }
    setSignUpErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const validateSignInField = (name, value) => {
    let error = "";
    if (name === "email" && !/\S+@\S+\.\S+/.test(value)) {
      error = "Invalid email address";
    } else if (name === "password" && value.length < 8) {
      error = "Password must be at least 8 characters long";
    }
    setSignInErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const isValid =
      Object.values(signUpErrors).every((error) => error === "") &&
      signUpForm.password;

    if (isValid) {
      const url = `${BACKEND_URL}/User-Data/create`;
      axios
        .post(url, signUpForm)
        .then((res) => {
          setLoading(false);
          if (res.status === 200) {
            setModalMessage(
              `Please verify your email address with OTP sent to your mail.`
            );
            setShowModal(true);
          }
        })
        .catch((err) => {
          setLoading(false);
          if (err.response && err.response.status === 400) {
            console.log("Error response from server:", err.response.data);
            setModalMessage(err.response.data);
            setShowModal(true);
          }
        });
    } else {
      setModalMessage("Please fill out all fields correctly.");
      setShowModal(true);
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/password");
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isValid = Object.values(signInErrors).every((error) => error === "");

    if (isValid) {
      try {
        const response = await axios.post(`${BACKEND_URL}/User-Data/login`, {
          email: signInForm.email,
          password: signInForm.password,
        });

        const response1 = await axios.post(`${BACKEND_URL}/User-Data/data`, {
          email: signInForm.email,
        });

        if (response.status === 200) {
          navigate("/home", {
            state: { email: signInForm.email },
          });
        } else if (response.status === 202) {
          setModalMessage("Account not verified!! Continue to verify");
          setShowModal(true);

          await axios.post(`${BACKEND_URL}/Otp-Data/otpstore`, {
            email: signInForm.email,
            name: response1.data.name,
          });

          setTimeout(() => {
            navigate("/verification", {
              state: { email: signInForm.email },
            });
          }, 1000);
        }
      } catch (error) {
        setModalMessage("Invalid Email or Password");
        setShowModal(true);
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setModalMessage("Enter All Fields to Log In");
      setShowModal(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 825 || window.innerHeight < 793);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);

    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { name, email } = decoded;
      const user = { name, email, password: "fromGoogleLogin", verified: true };

      const url = `${BACKEND_URL}/User-Data/create`;
      const createUserResponse = await axios.post(url, user);

      if (createUserResponse.status === 200) {
        console.log(decoded);
        navigate("/home", {
          state: { email: user.email },
        });
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        if (err.response.data === "Email already exists.") {
          setModalMessage("Email already exists. Please log in.");
          setShowModal(true);
        } else {
          console.log(err.response.data);
          setModalMessage(err.response.data);
          setShowModal(true);
        }
      } else {
        console.error("Error in handleGoogleSuccess:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccessLogin = async (credentialResponse) => {
    setLoading(true);
    const decoded = jwtDecode(credentialResponse.credential);
    const { name, email } = decoded;
    const email1 = decoded.email;
    console.log(`Google Login Success: Name - ${name}, Email - ${email}`);
    try {
      const response = await axios.post(`${BACKEND_URL}/User-Data/login`, {
        email: email1,
        password: "fromGoogleLogin",
      });

      if (response.status === 200) {
        navigate("/home", {
          state: { email: email1 },
        });
      }

      console.log("User data:", response.data);
    } catch (error) {
      setModalMessage("Email not registered SignUp first");
      setShowModal(true);
      console.error("Error:", error);
    }
    setLoading(false);
  };

  const buttonStyle = {
    zIndex: showSignUp ? -1000 : "auto",
  };

  return (
    <div>
      {isSmallScreen ? (
        <div style={{ zIndex: "100" }}>
          <div
            className={`container ${showSignUp ? "flibber" : "gibber"}`}
            id="container"
          >
            <div className="form-container flibber-form">
              <form onSubmit={handleSignUpSubmit}>
                <h1>Sign Up</h1>
                <br />
                <input
                  type="text"
                  placeholder="Name"
                  name="name"
                  value={signUpForm.name}
                  onChange={handleSignUpChange}
                  style={{
                    zIndex: "100",
                    cursor: loading ? "not-allowed" : "auto",
                  }}
                  disabled={loading}
                />
                {loading && (
                  <FontAwesomeIcon icon={faLock} className="input-icon" />
                )}
                {signUpErrors.name && <div className="error">Name Invalid</div>}

                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={signUpForm.email}
                  onChange={handleSignUpChange}
                  style={{
                    zIndex: "100",
                    cursor: loading ? "not-allowed" : "auto",
                  }}
                  disabled={loading}
                />
                {signUpErrors.email && (
                  <div className="error">{signUpErrors.email}</div>
                )}

                <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={signUpForm.password}
                  onChange={handleSignUpChange}
                  style={{
                    zIndex: "100",
                    cursor: loading ? "not-allowed" : "auto",
                  }}
                  disabled={loading}
                />
                {signUpErrors.password && (
                  <div className="error">Invalid Password</div>
                )}
                <button
                  type="submit"
                  style={{ zIndex: "100" }}
                  onClick={handleSignUpSubmit}
                  disabled={loading}
                >
                  {loading ? "Loading . . ." : "Sign Up"}
                </button>
                <br />
                <span>or use your email for registration</span>
                <div className="social-icons">
                  <div className="icon link" style={{ zIndex: "1000" }}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => {
                        console.log("Login Failed");
                      }}
                    />
                  </div>
                </div>

                <div style={{ paddingLeft: "12px", zIndex: "100" }}>
                  Already have an account?
                  <b style={{ paddingLeft: "65px" }} onClick={handleToggleForm}>
                    Sign in
                  </b>
                </div>
              </form>
            </div>
            <div className="form-container gibber-form" style={buttonStyle}>
              <form onSubmit={handleSignInSubmit}>
                <h1>Sign In</h1>
                <div className="social-icons">
                  <div className="icon link">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccessLogin}
                      onFailure={() => {
                        console.log("Login Failed");
                      }}
                    />
                  </div>
                </div>
                <span>or use your email password</span>
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={signInForm.email}
                  onChange={handleSignInChange}
                  disabled={loading}
                  style={{ cursor: loading ? "not-allowed" : "auto" }}
                />
                {signInErrors.email && (
                  <div className="error">{signInErrors.email}</div>
                )}

                <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={signInForm.password}
                  onChange={handleSignInChange}
                  disabled={loading}
                  style={{ cursor: loading ? "not-allowed" : "auto" }}
                />
                {signInErrors.password && (
                  <div className="error">Invalid Password</div>
                )}
                <br />
                <div
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                  onClick={handleForgotPassword}
                >
                  Forgot Your Password?
                </div>
                <button
                  type="submit"
                  style={{ zIndex: "100" }}
                  onClick={handleSignInSubmit}
                  disabled={loading}
                >
                  {loading ? "Loading . . ." : "Sign In"}
                </button>
                <br />
                <div style={{ paddingLeft: "15px" }}>
                  Don't have an account?
                  <b style={{ paddingLeft: "65px" }} onClick={handleToggleForm}>
                    Sign up
                  </b>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className={`container ${isActive ? "active" : ""}`} id="container">
          <div className="form-container sign-up">
            <form onSubmit={handleSignUpSubmit}>
              <h1>Sign Up</h1>
              <div className="social-icons">
                <div className="icon link">
                  <GoogleLogin
                    style={{ cursor: loading ? "not-allowed" : "auto" }}
                    disabled={loading}
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                      console.log("Login Failed");
                    }}
                  />
                </div>
              </div>
              <span>or use your email for registration</span>
              <input
                type="text"
                placeholder="Name"
                name="name"
                value={signUpForm.name}
                onChange={handleSignUpChange}
                disabled={loading}
                style={{ cursor: loading ? "not-allowed" : "auto" }}
              />
              {signUpErrors.name && (
                <div className="error">{signUpErrors.name}</div>
              )}

              <input
                type="email"
                placeholder="Email"
                name="email"
                value={signUpForm.email}
                onChange={handleSignUpChange}
                disabled={loading}
                style={{ cursor: loading ? "not-allowed" : "auto" }}
              />
              {signUpErrors.email && (
                <div className="error">{signUpErrors.email}</div>
              )}

              <input
                type="password"
                placeholder="Password"
                name="password"
                value={signUpForm.password}
                onChange={handleSignUpChange}
                disabled={loading}
                style={{ cursor: loading ? "not-allowed" : "auto" }}
              />
              {signUpErrors.password && (
                <div className="error">{signUpErrors.password}</div>
              )}
              <button
                type="submit"
                style={{ zIndex: "100" }}
                onClick={handleSignUpSubmit}
                disabled={loading}
              >
                {loading ? "Loading . . ." : "Sign Up"}
              </button>
            </form>
          </div>
          <div className="form-container sign-in">
            <form onSubmit={handleSignInSubmit}>
              <h1>Sign In</h1>
              <div className="social-icons">
                <div className="icon link">
                  <GoogleLogin
                    style={{ cursor: loading ? "not-allowed" : "auto" }}
                    disabled={loading}
                    onSuccess={handleGoogleSuccessLogin}
                    onError={() => {
                      console.log("Login Failed");
                    }}
                  />
                </div>
              </div>
              <span>or use your email password</span>
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={signInForm.email}
                onChange={handleSignInChange}
                disabled={loading}
                style={{ cursor: loading ? "not-allowed" : "auto" }}
              />
              {signInErrors.email && (
                <div className="error">{signInErrors.email}</div>
              )}

              <input
                type="password"
                placeholder="Password"
                name="password"
                value={signInForm.password}
                onChange={handleSignInChange}
                disabled={loading}
                style={{ cursor: loading ? "not-allowed" : "auto" }}
              />
              {signInErrors.password && (
                <div className="error">{signInErrors.password}</div>
              )}
              <br></br>
              <div
                style={{ textDecoration: "underline", cursor: "pointer" }}
                onClick={handleForgotPassword}
              >
                Forgot Your Password?
              </div>
              <button
                type="submit"
                style={{ zIndex: "100" }}
                onClick={handleSignInSubmit}
                disabled={loading}
              >
                {loading ? "Loading . . ." : "Sign In"}
              </button>
            </form>
          </div>
          <div className="toggle-container">
            <div className="toggle">
              <div
                className={`toggle-panel toggle-left ${
                  isActive ? "" : "active"
                }`}
              >
                <h1>Welcome Back!</h1>
                <p>Enter your personal details to use all site features</p>
                <div className="buttons-container">
                  <button
                    id="register"
                    onClick={handleRegisterClick}
                    style={{ cursor: loading ? "not-allowed" : "auto" }}
                    disabled={loading}
                  >
                    Sign In
                  </button>
                </div>
              </div>
              <div
                className={`toggle-panel toggle-right ${
                  isActive ? "active" : ""
                }`}
              >
                <h1>Hello, Friend!</h1>
                <p>
                  Register with your personal details to use all site features
                </p>
                <div className="buttons-container">
                  <button
                    id="login"
                    onClick={handleLoginClick}
                    style={{ cursor: loading ? "not-allowed" : "auto" }}
                    disabled={loading}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Modal
        show={showModal}
        message={modalMessage}
        onClose={() => {
          setShowModal(false);
          if (
            modalMessage ===
            "Please verify your email address with OTP sent to your mail."
          ) {
            navigate("/verification", {
              state: { email: signUpForm.email },
            });
          }
        }}
      />
    </div>
  );
}

export default SigninAndSignupPage;
