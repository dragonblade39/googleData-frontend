import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const location = useLocation();
  const email = location.state ? location.state.email : null;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    setLoading(true);
    navigate("/", { state: null });
    setLoading(false);
  };

  useEffect(() => {
    if (!email) {
      navigate("/");
    }
  }, [email, navigate]);

  return (
    <div>
      <h1>Welcome Home!</h1>
      <p>Email: {email}</p>
      <button className="logOutBtn" onClick={handleLogout} disabled={loading}>
        {loading ? "Loading . . ." : "Logout"}
      </button>
    </div>
  );
}

export default Home;
