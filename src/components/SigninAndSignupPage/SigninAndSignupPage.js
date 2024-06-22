import React, { useState, useEffect } from "react";
import "./SigninAndSignupPage.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from "../Modal/Modal"; // Import the modal component
import Loading from "../Loading/Loading";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { BACKEND_URL } from "../Constants/Constants";

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
  const [Otp, setOtp] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState(""); // Add state for modal message
  const navigate = useNavigate();

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

  const generateOTP = () => {
    setLoading(true);
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let otp = "";
    for (let i = 0; i < 6; i++) {
      otp += chars[Math.floor(Math.random() * chars.length)];
    }
    //const url = "http://localhost:5500/User-Data/otp";
    const url = `${BACKEND_URL}/User-Data/otp`;
    const botp = { otp: otp, email: signUpForm.email };
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
    setLoading(false);
  };

  const handleSignUpSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
    const isValid =
      Object.values(signUpErrors).every((error) => error === "") &&
      signUpForm.password;
    if (isValid) {
      console.log("Sign Up Form Data:", signUpForm);
      //const url = "http://localhost:5500/User-Data/create";
      const url = `${BACKEND_URL}/User-Data/create`;
      axios
        .post(url, signUpForm)
        .then((res) => {
          if (res.status === 200) {
            console.log(res.data);
            generateOTP(); // Generate OTP
            setModalMessage(
              `Please verify your email address with OTP sent to your mail.`
            );
            setShowModal(true); // Show the modal on success
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            console.log(err.response.data);
            setModalMessage(err.response.data); // Set error message
            setShowModal(true); // Show the modal on error
          }
        });
    } else {
      console.log("Form has errors. Cannot submit.");
      setModalMessage("Please fill out all fields correctly."); // Set error message
      setShowModal(true); // Show the modal if form is invalid
    }
    setLoading(false);
  };

  const handleForgotPassword = () => {
    navigate("/password");
  };

  const handleSignInSubmit = async (e) => {
    setLoading(true);
    // Mark the function as async
    e.preventDefault();
    const isValid = Object.values(signInErrors).every((error) => error === "");
    if (isValid) {
      console.log("Sign In Form Data:", signInForm);
      try {
        const response = await axios.post(
          //"http://localhost:5500/User-Data/login",
          `${BACKEND_URL}/User-Data/login`,
          {
            email: signInForm.email,
            password: signInForm.password,
          }
        );
        if (response.status === 200) {
          navigate("/home", {
            state: { email: signInForm.email }, // Use signInForm.email instead of email
          });
        }
        console.log("User data:", response.data);
      } catch (error) {
        setModalMessage("Invalid Email or Password");
        setShowModal(true);
        console.error("Error:", error);
      }
    } else {
      setModalMessage("Enter All Fields to Log In");
      setShowModal(true);
      console.log("Form has errors. Cannot submit.");
    }
    setLoading(false);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 825 || window.innerHeight < 793);
    };

    handleResize(); // Check initial screen size
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleGoogleSuccess = (credentialResponse) => {
    setLoading(true);
    const decoded = jwtDecode(credentialResponse.credential);
    const { name, email } = decoded;
    const user = { name, email, password: "fromGoogleLogin", verified: true };
    console.log(`Google Login Success: Name - ${name}, Email - ${email}`);
    const url = `${BACKEND_URL}/User-Data/create`;
    axios
      .post(url, user)
      .then((res) => {
        if (res.status === 200) {
          console.log(res.data);
        }
        navigate("/home", {
          state: { email: user.email },
        });
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          console.log(err.response.data);
          setModalMessage(err.response.data); // Set error message
          setShowModal(true); // Show the modal on error
        }
      });
    setLoading(false);
  };

  const handleGoogleSuccessLogin = (credentialResponse) => {
    setLoading(true);
    const decoded = jwtDecode(credentialResponse.credential);
    const { name, email } = decoded;
    const user = { name, email, password: "fromGoogleLogin", verified: true };
    console.log(`Google Login Success: Name - ${name}, Email - ${email}`);
    navigate("/home", {
      state: { email: user.email },
    });
    setLoading(false);
  };

  const buttonStyle = {
    zIndex: showSignUp ? -1000 : "auto",
  };

  return (
    <div>
      {loading && <Loading />}
      {!loading && (
        <>
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
                      style={{ zIndex: "100" }}
                    />
                    {signUpErrors.name && (
                      <div className="error">Name Invalid</div>
                    )}

                    <input
                      type="email"
                      placeholder="Email"
                      name="email"
                      value={signUpForm.email}
                      onChange={handleSignUpChange}
                      style={{ zIndex: "100" }}
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
                      style={{ zIndex: "100" }}
                    />
                    {signUpErrors.password && (
                      <div className="error">Invalid Password</div>
                    )}
                    <button type="submit" style={{ zIndex: "100" }}>
                      Sign Up
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
                      <b
                        style={{ paddingLeft: "65px" }}
                        onClick={handleToggleForm}
                      >
                        Sign in
                      </b>
                    </div>
                  </form>
                </div>
                <div
                  className="form-container gibber-form"
                  // style={{
                  //   opacity: showSignUp ? 0 : 1,
                  // }}
                  style={buttonStyle}
                >
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
                    <button type="submit" style={buttonStyle}>
                      Sign In
                    </button>
                    <br />
                    <div style={{ paddingLeft: "15px" }}>
                      Don't have an account?
                      <b
                        style={{ paddingLeft: "65px" }}
                        onClick={handleToggleForm}
                      >
                        Sign up
                      </b>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`container ${isActive ? "active" : ""}`}
              id="container"
            >
              <div className="form-container sign-up">
                <form onSubmit={handleSignUpSubmit}>
                  <h1>Sign Up</h1>
                  <div className="social-icons">
                    <div className="icon link">
                      <GoogleLogin
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
                  />
                  {signUpErrors.password && (
                    <div className="error">{signUpErrors.password}</div>
                  )}
                  <button type="submit">Sign Up</button>
                </form>
              </div>
              <div className="form-container sign-in">
                <form onSubmit={handleSignInSubmit}>
                  <h1>Sign In</h1>
                  <div className="social-icons">
                    <div className="icon link">
                      <GoogleLogin
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
                  <button type="submit">Sign In</button>
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
                      <button id="register" onClick={handleRegisterClick}>
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
                      Register with your personal details to use all site
                      features
                    </p>
                    <div className="buttons-container">
                      <button id="login" onClick={handleLoginClick}>
                        Sign Up
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <Modal
        show={showModal}
        message={modalMessage} // Use modal message state
        onClose={() => {
          setShowModal(false);
          if (
            modalMessage ===
            "Please verify your email address with OTP sent to your mail."
          ) {
            navigate("/verification", {
              state: { email: signUpForm.email, otp: Otp },
            });
          }
        }}
      />
    </div>
  );
}

export default SigninAndSignupPage;
