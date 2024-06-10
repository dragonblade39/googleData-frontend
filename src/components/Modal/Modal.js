import React from "react";
import "./Modal.css";

function Modal({ show, message, onClose }) {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{message}</h2>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default Modal;
