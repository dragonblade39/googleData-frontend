import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const location = useLocation();
  const email = location.state ? location.state.email : null;
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/", { state: null });
  };

  // Redirect to root route if email is null
  useEffect(() => {
    if (!email) {
      navigate("/");
    }
  }, [email, navigate]);

  return (
    <div>
      <h1>Welcome Home!</h1>
      <p>Email: {email}</p>
      <button className="logOutBtn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Home;
