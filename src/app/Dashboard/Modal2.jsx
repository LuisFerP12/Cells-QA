// Modal.jsx
import axios from "axios";
import React, { useState } from "react";

function Modal2({ onClose, refreshTeams, userId }) {
  const [code, setCode] = useState("");

  const handleOutsideClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3005/api/teams/addTeam",
        {
          code,
          userId: userId,
        }
      );
      if (response.status === 201) {
        alert("Se le ha agregado al equipo");
        refreshTeams();
        onClose();
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        alert("No existe ese codigo de equipo");
      } else if (error.response && error.response.status === 409) {
        alert("Este usuario ya es parte del equipo");
      } else {
        console.error("Error al crear el equipo:", error);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      onClick={handleOutsideClick}
    >
      <div
        className="bg-white p-4 rounded-lg shadow-xl flex flex-col items-center px-14 py-10"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-bold text-xl pb-5" style={{ color: "#24374B" }}>
          Ingresa el Codigo
        </p>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border rounded p-2 w-full mb-4 pr-20"
          placeholder="Codigo"
        />
        <button
          className="bg-[#6CA6B2] text-white p-2 rounded-lg mt-5 px-10"
          onClick={handleSubmit}
        >
          Agregar Equipo
        </button>
      </div>
    </div>
  );
}

export default Modal2;
