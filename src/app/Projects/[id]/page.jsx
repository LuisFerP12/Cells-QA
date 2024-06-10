//page.jsx
"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import "./folView.css";

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    timeZone: "UTC",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

export default function Home() {
  const [directories, setDirectories] = useState([]);
  const [filteredDirectories, setFilteredDirectories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDirectoryId, setSelectedDirectoryId] = useState(null);
  const [isModalOpen2, setIsModalOpen2] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3005/api/projects/dfather/1"
      );
      setDirectories(response.data);
      setFilteredDirectories(response.data);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching data: ", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    try {
      console.log("Deleting directory ID:", selectedDirectoryId); // Debug: Ensure this is the correct ID
      const url = `http://localhost:3005/api/projects/deleteDirectory/${selectedDirectoryId}`;
      await axios.delete(url);
      setDirectories((directories) =>
        directories.filter((d) => d.directoryId !== selectedDirectoryId)
      );
      closeModal();
    } catch (error) {
      console.error("Error deleting directory:", error);
    }
  };

  const openModal = (directoryId) => {
    console.log("Opening modal for directory ID:", directoryId); // Debug: Check what you are actually getting here
    setSelectedDirectoryId(directoryId);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  useEffect(() => {
    const filtered = directories.filter((directory) =>
      directory.directoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDirectories(filtered);
  }, [searchTerm, directories]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <main className="min-h-screen p-20" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="backG">
        <h1>Projects</h1>
        <div className="row">
          <div className="search-container">
            <input
              type="text"
              className="input"
              id="searchInput"
              placeholder="Find a Project..."
              onInput={handleSearchChange}
            />
            <span className="icon" style={{ cursor: "pointer" }}>
              <i class="bi bi-search"></i>
            </span>
          </div>
          <button className="new-folder" onClick={() => setIsModalOpen2(true)}>
            <i className="bi bi-folder text-white"></i>
            <p>New</p>
          </button>
        </div>
        {filteredDirectories.map((directory, index) => (
          <React.Fragment key={index}>
            <div id={`folder-${index}`}></div>
            <div className="table-row">
              <div className="table-l">
                <h1 className="text-[#24374B]">{directory.directoryName}</h1>
                <div className="table-l-d">
                  <p>Create: {formatDate(directory.dateCreated)}</p>
                  <p>Modified: {directory.lastModified} </p>
                </div>
              </div>
              <div className="table-r">
                <div className="table-r-l">
                  <a className="button !bg-[#24374B]" href="/Pruebas">
                    Acceder
                  </a>
                  <p>Versions: {directory.versions || 0}</p>
                </div>
                <div className="table-r-r">
                  <i
                    className="bi bi-trash3-fill text-gray-400 text-2xl"
                    onClick={() => openModal(directory.directoryId)}
                  ></i>
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
      {modalIsOpen && (
        <div className="modal">
          <div className="modal-content ">
            <h2 className="font-bold text-xl" style={{ color: "#24374B" }}>
              You want to delete this directory?
            </h2>
            <div className="button-container">
              <button
                className="bg-[#E92525] text-white p-2 rounded-lg mt-5 px-10"
                onClick={handleDelete}
              >
                Delete
              </button>
              <button
                className="bg-[#768396] text-white p-2 rounded-lg mt-5 px-10"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isModalOpen2 && (
        <Modal
          onClose={() => setIsModalOpen2(false)}
          refreshDirectories={fetchData}
        />
      )}
    </main>
  );
}
