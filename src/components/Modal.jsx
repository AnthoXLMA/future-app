// src/components/Modal.jsx
import React from "react";
import "../visuels/Modal.css";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
        <button className="modal-close" onClick={onClose}>✖</button>
      </div>
    </div>
  );
};

export default Modal;
