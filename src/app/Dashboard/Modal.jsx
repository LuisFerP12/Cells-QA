// Modal.jsx
import axios from "axios";
import React, { useState } from "react";

function Modal({ onClose, refreshTeams, userId }) {
  const [teamName, setTeamName] = useState("");

  const handleOutsideClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3005/api/teams/createTeam",
        {
          teamName,
          userId: userId,
        }
      );
      if (response.status === 201) {
        refreshTeams(); // Actualiza la lista de equipos
        onClose(); // Cierra el modal
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert("Ya existe un equipo con ese nombre.");
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
        {" "}
        {/* Añadido flex flex-col items-center */}
        <p className="font-bold text-xl pb-5" style={{ color: "#24374B" }}>
          Nuevo Equipo
        </p>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="input !w-80 mb-3"
          placeholder="Nombre de Equipo"
        />
        <button className="button !bg-[#6CA6B2]" onClick={handleSubmit}>
          Crear Equipo
        </button>
      </div>
    </div>
  );
}

export default Modal;
