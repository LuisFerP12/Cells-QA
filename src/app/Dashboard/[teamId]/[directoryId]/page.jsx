"use client";

import DownloadButton from "@/components/DownloadComponent";
import Modal from "@/components/ModalTest";
import Sidebar from "@/components/Sidebar";
import TestComponent from "@/components/TestComponent";
import TestItem from "@/components/TestItem";
import axios from "axios";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

const Tests = ({ params }) => {
  const [testItems, setTestItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchTestMetrics = async () => {
      try {
        const response = await axios.get(
          `/api/tests/test-metrics/${params.directoryId}`
        );
        setTestItems(response.data);
        console.log("Test metrics fetched:", response.data);
      } catch (error) {
        console.error("Error fetching test metrics:", error);
      }
    };

    fetchTestMetrics();
  }, []);

  const handleCreateTest = async (title) => {
    console.log(
      "Creating test.. pene,",
      title,
      session.user.id,
      params.directoryId
    );
    try {
      const directoryId = parseInt(params.directoryId, 10);
      console.log(
        "Creating test..,",
        title,
        session.user.id,
        params.directoryId
      );
      const response = await axios.post("/api/tests/createTest", {
        userId: session.user.id,
        directoryId: directoryId,
        title,
      });
      console.log("Test created:");
      console.log(response);
      setTestItems([...testItems, response.data]);
    } catch (error) {
      console.error("Error creating test:", error);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (testItems.length === 0) {
    return (
      <div>
        <Sidebar page="Test" />
        <h1 className="ml-40 pt-10">Loading...</h1>
        <button
          className="ml-40 button flex !bg-green-500 hover:!bg-green-600"
          onClick={openModal}
        >
          <i className="bi bi-folder text-white mr-2"></i>
          <p>New Test</p>
        </button>
        {isModalOpen && (
          <Modal
            className="ml-40"
            onClose={closeModal}
            onCreate={handleCreateTest}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 flex justify-center">
      <Sidebar page="Test" />
      <div className="flex flex-col md:flex-row md:space-x-4 max-w-6xl w-full">
        <div className="flex-1 space-y-4">
          {testItems.map((item, index) => (
            <TestItem
              key={index}
              testId={item.testId}
              title={item.title}
              testCount={item.testCount}
              passPercentage={item.passPercentage}
            />
          ))}
          <DownloadButton directoryId={params.directoryId} />
          <button
            className="button flex !bg-green-500 hover:!bg-green-600"
            onClick={openModal}
          >
            <i className="bi bi-folder text-white mr-2"></i>
            <p>New Test</p>
          </button>
          {isModalOpen && (
            <Modal onClose={closeModal} onCreate={handleCreateTest} />
          )}
        </div>

        {/*componente de la drecha con progress bar pinches putos de cagada */}
        <div className="mt-4 md:mt-0 md:ml-2 lg:ml-4 flex justify-center md:justify-start">
          <TestComponent
            name={testItems[0].title}
            percentage={testItems[0].passPercentage}
            passedTests={testItems[0].passedTests}
            rejectedTests={testItems[0].rejectedTests}
            notExecutedTests={testItems[0].notExecutedTests}
          />
        </div>
      </div>
    </div>
  );
};

export default Tests;
