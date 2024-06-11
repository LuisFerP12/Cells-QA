// components/Modal.jsx
import React, { useState } from "react";

function Modal({ onClose, onCreate }) {
  const [testName, setTestName] = useState("");

  const handleOutsideClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = () => {
    console.log("Submitting test name:", testName); // Debugging puto joto
    onCreate(testName);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 -top-10 z-10 bg-black bg-opacity-50 flex justify-center items-center"
      onClick={handleOutsideClick}
    >
      <div
        className="bg-white p-4 rounded-lg shadow-xl flex flex-col items-center px-14 py-10"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-bold text-xl pb-5" style={{ color: "#24374B" }}>
          New Test
        </p>
        <input
          type="text"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          className="input !w-80 mb-3"
          placeholder="Test Name"
        />
        <button className="button !bg-[#6CA6B2]" onClick={handleSubmit}>
          Create Test
        </button>
      </div>
    </div>
  );
}

export default Modal;
