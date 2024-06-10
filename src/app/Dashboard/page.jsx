// page.jsx
"use client";
import Header from "@/components/TopBar";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import "../Dashboard/modal.css";
import Modal from "./Modal";
import Modal2 from "./Modal2";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  // console.log(data);
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [isModalOpen3, setIsModalOpen3] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserTeams();
    }
  }, [status]);

  const fetchUserTeams = async () => {
    try {
      const userId = session?.user?.id;
      // console.log("Aqui Inicia");
      // console.log(session.user.email);
      // console.log(session.user.id);
      // console.log(session.user.username);
      // console.log("Termian");
      if (!userId) {
        return;
      }
      const response = await axios.get(
        `http://localhost:3005/api/teams/${userId}/teams`
      );
      console.log("Equipos del usuario  :", response.data.teams);
      setTeams(response.data.teams);
    } catch (error) {
      console.error("Error al obtener los equipos del usuario:", error);
    }
  };

  useEffect(() => {
    fetchUserTeams();
  }, []);

  const handlePrev = () => {
    setStartIndex(Math.max(0, startIndex - 5));
  };

  const handleNext = () => {
    setStartIndex(Math.min(teams.length - 1, startIndex + 5));
  };

  const openModal = (teamId) => {
    console.log("Opening modal for directory ID:", teamId);
    setSelectedTeamId(teamId);
    setIsModalOpen3(true);
  };

  const closeModal = () => {
    setIsModalOpen3(false);
  };

  const handleDelete = async () => {
    try {
      const userId = session?.user?.id;
      if (!userId) {
        return;
      }

      console.log("Deleting directory ID:", selectedTeamId);
      const url = `http://localhost:3005/api/teams/user-teams/${userId}/${selectedTeamId}`;
      await axios.delete(url);
      setTeams((teams) => teams.filter((t) => t.teamId !== selectedTeamId));
      closeModal();
    } catch (error) {
      console.error("Error deleting directory:", error);
    }
  };
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  if (status === "unauthenticated") {
    return router.push("/Login");
  }


  return (
    <main className="flex flex-col min-h-screen">
      <Header />
      {startIndex > 0 && (
        <button
          className="absolute left-10 top-[450px] z-10 "
          onClick={handlePrev}
        >
          <i className="bi bi-caret-left-fill "></i>
        </button>
      )}

      {startIndex + 5 < teams.length && (
        <button
          className="absolute right-10 top-[450px] z-10"
          onClick={handleNext}
        >
          <i className="bi bi-caret-right-fill"></i>
        </button>
      )}

      <div className="flex-grow p-10">
        <div className="flex justify-between items-center">
          <h2 className="mb-12 ml-16">Menu</h2>
          <button
            onClick={() => setIsModalOpen2(true)}
            className="button !flex !bg-green-500 items-center"
          >
            <img className="flex mr-2 w-4" src="/img/addIcon.svg" />
            <p>Join Team</p>
          </button>
        </div>

        <div className="relative flex items-center mb-4">
          <div className="grid grid-cols-3 gap-6 place-items-center w-full px-8">
            {teams.slice(startIndex, startIndex + 5).map((team, index) => (
              <div
                key={index}
                className="bg-white p-6 shadow-lg rounded-lg mb-8 flex flex-col justify-center items-center text-center"
                style={{ width: 363, height: 240 }}
              >
                <div className="table-r-r self-end ">
                  <i
                    className="bi bi-trash3-fill text-gray-300 text-xl hover:text-red-500 hover:cursor-pointer "
                    onClick={() => openModal(team.teamId)}
                  ></i>
                </div>
                <a href={`/Dashboard/${team.teamId}`}>
                  <div className=" flex justify-center">
                    <img
                      style={{ marginBottom: "10px" }}
                      src="/img/iconoTeam.svg"
                    />
                  </div>

                  <p className="font-bold text-xl">{team.teamName}</p>
                  <p className="text-sm text-gray-400">Codigo: {team.code}</p>
                </a>
              </div>
            ))}

            <div
              className="bg-white p-6 shadow-lg rounded-lg mb-8 flex justify-center items-center"
              style={{ width: 363, height: 240 }}
              onClick={() => setIsModalOpen(true)}
            >
              <img
                style={{ width: "25%", height: "auto" }}
                src="/img/plus.svg"
              />
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal
          onClose={() => setIsModalOpen(false)}
          refreshTeams={fetchUserTeams}
          userId={session.user.id}
        />
      )}
      {isModalOpen2 && (
        <Modal2
          onClose={() => setIsModalOpen2(false)}
          refreshTeams={fetchUserTeams}
          userId={session.user.id}
        />
      )}
      {isModalOpen3 && (
        <div className="modal">
          <div className="modal-content ">
            <h2 className="font-bold text-xl" style={{ color: "#24374B" }}>
              You want to delete this team?
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
    </main>
  );
}

/*
npm install --save @fortawesome/fontawesome-svg-core
npm install --save @fortawesome/free-solid-svg-icons
npm install --save @fortawesome/react-fontawesome
*/
