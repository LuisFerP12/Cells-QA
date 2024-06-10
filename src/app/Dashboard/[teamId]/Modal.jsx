// Modal.jsx
import axios from "axios";
import React, { useState } from "react";

function Modal({ onClose, refreshDirectories, teamId }) {
  const [directoryName, setDirectoryName] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const handleOutsideClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3005/api/projects/addDirectory",
        {
          directoryName,
          descripcion,
          teamId: teamId,
        }
      );
      if (response.status === 201) {
        refreshDirectories();
        onClose();
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert("Ya existe un equipo directorio con ese nombre.");
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
        className="bg-white p-4 rounded-lg shadow-xl flex flex-col items-center px-14 py-8"
        style={{ minWidth: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-bold text-2xl pb-5" style={{ color: "#24374B" }}>
          Nuevo Proyecto
        </p>

        <div className="w-full flex flex-col mb-2 ">
          <label
            className="text-sm pb-2 self-start font-normal "
            style={{ color: "#24374B" }}
          >
            Nombre de Proyecto
          </label>
          <input
            type="text"
            value={directoryName}
            onChange={(e) => setDirectoryName(e.target.value)}
            className="border rounded p-2 w-full "
          />
        </div>
        <div className="w-full flex flex-col mb-4">
          <label
            className="text-sm pb-2 self-start font-normal"
            style={{ color: "#24374B" }}
          >
            Descripcion (Opcional)
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="border rounded p-2 w-full"
            rows="5" // Establece el número inicial de líneas
            style={{ minHeight: "100px" }} // Utiliza minHeight para una altura mínima, pero permite que crezca
          ></textarea>
        </div>

        <button
          className="bg-[#6CA6B2] text-white p-2 rounded-lg mt-6 px-10"
          onClick={handleSubmit}
        >
          Crear Directorio
        </button>
      </div>
    </div>
  );
}

export default Modal;
