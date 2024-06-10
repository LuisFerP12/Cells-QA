//page.jsx
"use client";
import Selector from "@/components/Selector";
import Sidebar from "@/components/Sidebar";
import React, { useState } from "react";

export default function Home({ params }) {
  const [instructions, setInstructions] = useState([]);
  const [url, setUrl] = useState("");

  const handleInstructionsChange = (newInstructions) => {
    setInstructions(newInstructions);
  };

  const handleUrlChange = (newUrl) => {
    setUrl(newUrl);
  };

  return (
    <main className="min-h-screen p-20 ml-20">
      <Sidebar page="Test"></Sidebar>
      <h1 className="">Test</h1>
      <Selector
        onInstructionsChange={handleInstructionsChange}
        onUrlChange={handleUrlChange}
        tesId = { params.testId }
      />
    </main>
  );
}
