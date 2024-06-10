// UserContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [email, setEmail] = useState(() => {
    // Initialize username from localStorage or default to an empty string
    return localStorage.getItem("email") || "";
  });

  const setUser = (newEmail) => {
    setEmail(newEmail);
    // Save the username to localStorage
    localStorage.setItem("email", newEmail);
  };

  // Cleanup localStorage on component unmount
  useEffect(() => {
    return () => {
      localStorage.removeItem("email");
    };
  }, []);

  return (
    <UserContext.Provider value={{ email, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
