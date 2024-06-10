import axios from "axios";
import React, { useEffect, useState } from "react";

const Selector = ({ onInstructionsChange, onUrlChange, tesId }) => {
  const [instructions, setInstructions] = useState([]);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [error2, setError2] = useState("");
  const [overall, setOverall] = useState("NP");
  const [showModal, setShowModal] = useState(false);
  const [suggestedFallback, setSuggestedFallback] = useState(null);
  const [pendingFallbacks, setPendingFallbacks] = useState([]);
  const [currentFallbackIndex, setCurrentFallbackIndex] = useState(0);

  const [testId, setTestId] = useState(null);

  useEffect(() => {
    setTestId(tesId);
  }, [tesId]);

  useEffect(() => {
    if (testId) {
      const fetchInstructions = async () => {
        try {
          const response = await axios.get(
            `http://localhost:3005/api/tests/get-all-tests/${testId}`
          );
          setInstructions(
            response.data.map((inst) => ({
              ...inst,
              status:
                inst.instructionStatus === true
                  ? "Passed"
                  : inst.instructionStatus === false
                  ? "Failed"
                  : "NP",
              isNew: false,
            }))
          );
        } catch (error) {
          console.error("Error fetching instructions:", error);
          setError("Failed to fetch instructions.");
        }
      };

      fetchInstructions();
    }
  }, [testId]);

  const addInstruction = () => {
    setInstructions([
      ...instructions,
      {
        textInput: "",
        searchKey: "",
        searchBy: "",
        action: "",
        status: "NP",
        isNew: true,
      },
    ]);
    setOverall("NP");
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    onUrlChange(e.target.value);
    setOverall("NP");
  };

  const handleTextChange = (index, e) => {
    const newInstructions = [...instructions];
    newInstructions[index].textInput = e.target.value;
    setInstructions(newInstructions);
    setOverall("NP");
  };

  const handleSearchKeyChange = (index, e) => {
    const newInstructions = [...instructions];
    newInstructions[index].searchKey = e.target.value;
    setInstructions(newInstructions);
    setOverall("NP");
  };

  const handleSearchByChange = (index, e) => {
    const newInstructions = [...instructions];
    newInstructions[index].searchBy = e.target.value;
    setInstructions(newInstructions);
    setOverall("NP");
  };

  const handleActionChange = (index, e) => {
    const newInstructions = [...instructions];
    const selectedAction = e.target.value;
    setOverall("NP");

    if (selectedAction === "click") {
      newInstructions[index].action = selectedAction;
      newInstructions[index].textInput = "";
      newInstructions[index].searchKey = "";
      newInstructions[index].searchBy = "";
    } else if (selectedAction !== "") {
      newInstructions[index].action = selectedAction;
    } else {
      newInstructions[index].action = "";
      newInstructions[index].textInput = "";
      newInstructions[index].searchKey = "";
      newInstructions[index].searchBy = "";
    }

    setInstructions(newInstructions);
  };

  const removeInstruction = (index) => {
    const newInstructions = [...instructions];
    newInstructions.splice(index, 1);
    setInstructions(newInstructions);
    setOverall("NP");
  };

  const handleFallbackConfirmation = async (confirm, type) => {
    var newSearchBy;
    var newSearchKey;
    if (confirm) {
      const updatedInstructions = instructions.map((instruction, index) => {
        if (index === pendingFallbacks[currentFallbackIndex].instructionIndex) {
          if (type === "id") {
            newSearchBy = "id";
            newSearchKey = pendingFallbacks[currentFallbackIndex].fallback.id;
          } else if (type === "name") {
            newSearchBy = "name";
            newSearchKey = pendingFallbacks[currentFallbackIndex].fallback.name;
          } else if (type === "css") {
            newSearchBy = "css";
            newSearchKey =
              pendingFallbacks[currentFallbackIndex].fallback.className;
          }

          return {
            ...instruction,
            searchBy: newSearchBy,
            searchKey: newSearchKey,
          };
        }
        return instruction;
      });

      setInstructions(updatedInstructions);
    }

    if (currentFallbackIndex + 1 < pendingFallbacks.length) {
      setCurrentFallbackIndex(currentFallbackIndex + 1);
    } else {
      setShowModal(false);
      setPendingFallbacks([]);
      setCurrentFallbackIndex(0);
    }
  };

  const handleInstructionsAndTest = async () => {
    if (url === "") {
      setError2("Por favor ingrese la URL.");
      return;
    }

    if (!/^https?:\/\//i.test(url)) {
      setError2("La URL debe comenzar con http:// o https://");
      return;
    }

    setError2("");

    if (instructions.length === 0) {
      setError("No hay instrucciones");
      return;
    }

    for (let i = 0; i < instructions.length; i++) {
      const instruction = instructions[i];
      if (
        instruction.action === "click" &&
        (instruction.searchKey === "" || instruction.searchBy === "")
      ) {
        setError(
          `Por favor llene todos los campos para la instrucción ${i + 1}.`
        );
        return;
      } else if (
        (instruction.action === "sendKeys" ||
          instruction.action === "" ||
          instruction.action === "getText") &&
        (instruction.searchKey === "" ||
          instruction.searchBy === "" ||
          instruction.textInput === "")
      ) {
        setError(
          `Por favor llene todos los campos para la instrucción ${i + 1}.`
        );
        return;
      }
    }

    setError("");

    console.log("Instrucciones Antes de cualquier cosa:", instructions);

    try {
      const response = await axios.post(
        "http://localhost:3005/api/tests/run-test",
        {
          testId,
          instructions: instructions,
          url,
        }
      );

      console.log("Test results:", response.data);

      const results = response.data.results;
      const updatedInstructions = [...instructions];
      const fallbacks = [];

      results.forEach((result, index) => {
        if (result.status === "Fallback") {
          fallbacks.push({
            instructionIndex: index,
            fallback: result.fallback,
          });
          updatedInstructions[index].status = "Failed";
        } else {
          updatedInstructions[index].status = result.status;
        }
      });

      setInstructions(updatedInstructions);

      if (fallbacks.length > 0) {
        setPendingFallbacks(fallbacks);
        setCurrentFallbackIndex(0);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error al ejecutar la prueba:", error);
      if (error.response && error.response.data) {
        setError(`Error: ${error.response.data.error}`);
      } else {
        setError("Error al ejecutar la prueba.");
      }
    }

    try {
      const newInstructions = instructions.filter((inst) => inst.isNew);
      const postInstructions = [...newInstructions];
      const noNewInstructions = [...instructions];
      // Recorre postInstructions y actualiza el status
      for (let i = 0; i < postInstructions.length; i++) {
        if (postInstructions[i].status === "Failed") {
          postInstructions[i].status = false;
        } else if (postInstructions[i].status === "Passed") {
          postInstructions[i].status = true;
        }
      }

      for (let i = 0; i < noNewInstructions.length; i++) {
        noNewInstructions[i].isNew = false;
      }

      const response2 = await axios.post(
        "http://localhost:3005/api/tests/save-test",
        {
          testId,
          instructions: postInstructions,
        }
      );
      const results = response2.data.results;
      console.log(results);
      console.log("Instrucciones no nuevas");
      setInstructions(noNewInstructions);
    } catch (error) {
      console.error("Error al ejecutar la prueba:", error);
      if (error.response && error.response.data) {
        setError(`Error: ${error.response.data.error}`);
      } else {
        setError("Error al ejecutar la prueba.");
      }
    }
  };

  return (
    <div>
      <div>
        <div className="flex justify-start items-center py-5 mr-24">
          <label htmlFor="urlInput" className="mr-3">
            URL:
          </label>
          <input
            type="text"
            id="urlInput"
            value={url}
            onChange={handleUrlChange}
            placeholder="Ingrese la URL"
            className={url === "" && error2 != "" ? "input-error" : "input"}
          />
        </div>
        {error2 && (
          <p className="absolute -mt-4 ml-16 " style={{ color: "red" }}>
            {error2}
          </p>
        )}
      </div>

      <div className="flex justify-between">
        <h2 className="my-5">Instructions:</h2>
        <div className="flex items-center mr-10">
          <button className="py-2 px-4 rounded-md font-bold border-none mr-5 bg-white hover:bg-slate-50 flex">
            <svg
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2"
            >
              <path
                d="M8.49959 10.4168L7.82195 11.0945L8.49959 11.7721L9.17723 11.0945L8.49959 10.4168ZM9.45792 1.79183C9.45792 1.26256 9.02888 0.833496 8.49959 0.833496C7.9703 0.833496 7.54125 1.26255 7.54125 1.79183H9.45792ZM3.03027 6.30281L7.82195 11.0945L9.17723 9.73919L4.38557 4.94752L3.03027 6.30281ZM9.17723 11.0945L13.9689 6.30281L12.6136 4.94752L7.82195 9.73919L9.17723 11.0945ZM9.45792 10.4168V1.79183H7.54125V10.4168H9.45792Z"
                fill="#232360"
              />
              <path
                d="M1.79199 12.3335V13.2918C1.79199 14.3504 2.65011 15.2085 3.70866 15.2085H13.292C14.3506 15.2085 15.2087 14.3504 15.2087 13.2918V12.3335"
                stroke="#232360"
                stroke-width="2"
              />
            </svg>
            Import
          </button>
          <button className="py-2 px-4 rounded-md font-bold bg-white hover:bg-slate-50  flex">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2"
            >
              <path
                d="M12 14V10H14V14C14 15.1046 13.1046 16 12 16H2C0.89543 16 0 15.1046 0 14V4C0 2.89543 0.89543 2 2 2H4V4H2V14H12ZM11.2857 5.5H9.71429C8.92857 5.5 7.35714 5.5 5 7.85714C5 4.71429 7.35714 2.35714 9.71429 2.35714H11.2857V0L16 3.92857L11.2857 7.85714V5.5Z"
                fill="#232360"
              />
            </svg>
            Export
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="bg-white rounded-md mx-10 w-[1300px]">
          <div className="flex mx-5 my-4">
            <h3>No.</h3>
            <div className="flex ml-[30px]">
              <h3 className="w-[240px] bg-white">Action</h3>
              <h3 className="w-[240px] ml-2 bg-white">Search By</h3>
              <h3 className="w-[240px] ml-2 bg-white">Search Key</h3>
              <h3 className="w-[240px] ml-2 bg-white">Input</h3>
            </div>
            <div className="flex ml-6">
              <h3 className="w-[105px] bg-white">Status</h3>
              <h3 className="w-[105px] bg-white">Delete</h3>
            </div>
          </div>
          {instructions.map((instruction, index) => (
            <div key={index} className="justify-between w-[1300px] my-5">
              <div className="flex justify-center">
                <div className="flex items-center w-full">
                  <h3 className="font-bold w-5 mx-5 ml-6">{index + 1}</h3>

                  <div className="px-3">
                    <select
                      value={instruction.action}
                      onChange={(e) => handleActionChange(index, e)}
                      className={
                        instruction.action === "" && error != ""
                          ? "input-error"
                          : "input"
                      }
                    >
                      <option value="" className="font-medium">
                        Select an action
                      </option>
                      <option value="sendKeys" className="font-medium">
                        Fill field
                      </option>
                      <option value="click" className="font-medium">
                        Click
                      </option>
                      <option value="getText" className="font-medium">
                        Compare Text
                      </option>
                    </select>
                  </div>
                  <div
                    className="px-3"
                    style={{
                      display: instruction.action === "" ? "none" : "block",
                    }}
                  >
                    <select
                      value={instruction.searchBy}
                      onChange={(e) => handleSearchByChange(index, e)}
                      className={
                        instruction.searchBy === "" &&
                        error != "" &&
                        instruction.action != ""
                          ? "input-error"
                          : "input"
                      }
                    >
                      <option value="" className="font-medium">
                        Select an option
                      </option>
                      <option value="css" className="font-medium">
                        css
                      </option>
                      <option value="id" className="font-medium">
                        id
                      </option>
                      <option value="name" className="font-medium">
                        name
                      </option>
                    </select>
                  </div>

                  <div
                    className="px-3"
                    style={{
                      display: instruction.action === "" ? "none" : "block",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Enter search key"
                      value={instruction.searchKey}
                      onChange={(e) => handleSearchKeyChange(index, e)}
                      className={
                        instruction.searchKey === "" &&
                        error != "" &&
                        instruction.action != ""
                          ? "input-error"
                          : "input"
                      }
                    />
                  </div>
                  <div
                    className="px-3"
                    style={{
                      display:
                        instruction.action === "click" ||
                        instruction.action === ""
                          ? "none"
                          : "block",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Enter input"
                      value={instruction.textInput}
                      onChange={(e) => handleTextChange(index, e)}
                      className={
                        instruction.textInput === "" &&
                        error != "" &&
                        (instruction.action == "sendKeys" ||
                          instruction.action == "getText")
                          ? "input-error"
                          : "input "
                      }
                    />
                  </div>
                </div>
                <div className="mx-5 flex items-center">
                  <div
                    className="px-2 text-center bg-green-500 rounded-md text-[#FFFFFF] w-20 h-10 py-2"
                    style={{
                      display:
                        instruction.status === "Passed" ||
                        instruction.status === true
                          ? "block"
                          : "none",
                    }}
                  >
                    <i className="bi bi-check text-bold text-3xl relative bottom-1"></i>
                  </div>
                  <div
                    className="px-2 text-center bg-red-600 rounded-md  text-[#FFFFFF] w-20 h-10 py-2"
                    style={{
                      display:
                        instruction.status === "Failed" ||
                        instruction.status === false
                          ? "block"
                          : "none",
                    }}
                  >
                    <i className="bi bi-x text-bold text-3xl relative bottom-1 stroke-2"></i>
                  </div>
                  <div
                    className="px-2 text-center bg-gray-500 rounded-md  text-[#FFFFFF] w-20 py-2"
                    style={{
                      display: instruction.status === "NP" ? "block" : "none",
                    }}
                  >
                    NP
                  </div>
                </div>
                <div className="flex items-center justify-center mr-10 ml-2">
                  <button
                    onClick={() => removeInstruction(index)}
                    className=" w-[75px] text-gray-400 text-2xl first:hover:text-red-700"
                  >
                    <i className="bi bi-trash3-fill "></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <br />
      {error && (
        <p className="absolute -mt-5 ml-10" style={{ color: "red" }}>
          {error}
        </p>
      )}
      <div className="flex w-full mt-4">
        <div>
          <button onClick={addInstruction} className="button mr-5">
            Add
          </button>
          <button
            onClick={handleInstructionsAndTest}
            className="button-send mx-5"
          >
            Send
          </button>
        </div>
        <div className="flex justify-end w-8/12 items-center ">
          <h3>Overall</h3>
          <div className="ml-5 flex items-center mr-10">
            <div
              className="px-2 text-center bg-green-500 rounded-md text-[#FFFFFF] w-20 h-10 py-2 mr-2"
              style={{
                display: overall === "Passed" ? "block" : "none",
              }}
            >
              <i className="bi bi-check text-bold text-3xl relative bottom-1"></i>
            </div>
            <div
              className="px-2 text-center bg-red-600 rounded-md  text-[#FFFFFF] w-20 py-2 h-10"
              style={{
                display: overall === "Failed" ? "block" : "none",
              }}
            >
              <i className="bi bi-x text-bold text-3xl relative bottom-1"></i>
            </div>
            <div
              className="px-2 text-center bg-gray-500 rounded-md  text-[#FFFFFF] w-20 py-2"
              style={{
                display: overall === "NP" ? "block" : "none",
              }}
            >
              NP
            </div>
          </div>
        </div>
      </div>

      {showModal && pendingFallbacks.length > 0 && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded shadow">
            <p>
              No se pudo encontrar un componente con el selector proporcionado.
              El match más parecido es:
            </p>
            <pre>
              {JSON.stringify(
                pendingFallbacks[currentFallbackIndex].fallback,
                null,
                2
              )}
            </pre>
            <p>Sustituir con: </p>
            <div className="mt-4">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded mr-4"
                onClick={() => handleFallbackConfirmation(true, "id")}
              >
                Id
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded mr-4"
                onClick={() => handleFallbackConfirmation(true, "name")}
              >
                Name
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded mr-4"
                onClick={() => handleFallbackConfirmation(true, "css")}
              >
                ClassName
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded"
                onClick={() => handleFallbackConfirmation(false)}
              >
                Regresar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Selector;
