import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SigninAndSignupPage from "./components/SigninAndSignupPage/SigninAndSignupPage";
import Verification from "./components/Verification/Verification";
import VerifyPassword from "./components/VerifyPassword/VerifyPassword";
import { UserProvider } from "./UserContext";
import Home from "./components/Home/Home";
import Password from "./components/VerifyPassword/Password";
import NewPassword from "./components/VerifyPassword/NewPassword";

function App() {
  return (
    <div>
      <Router>
        <UserProvider>
          <Routes>
            <Route path="/" element={<SigninAndSignupPage />} />
            <Route path="/verification" element={<Verification />} />
            <Route
              path="/verificationForgotPassword"
              element={<VerifyPassword />}
            />
            <Route path="/home" element={<Home />} />
            <Route path="/newpassword" element={<NewPassword />} />
            <Route path="/password" element={<Password />} />
            <Route path="*" element={<SigninAndSignupPage />} />
          </Routes>
        </UserProvider>
      </Router>
    </div>
  );
}

export default App;
