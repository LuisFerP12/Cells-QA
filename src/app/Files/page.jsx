//page.jsx
"use client";
// UploadFile.js
import Head from 'next/head';
import styles from './files.css';
import resetStyles from './resetStyle.css';
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
    const [results, setResults] = useState([]);
    const teamId = "1";
    const directoryFather = "36";
    const fetchData = async () => {
        try {
            const response = await axios.get(`http://localhost:3005/api/files/dson/${teamId}/${directoryFather}`);
            setResults(response.data); 
        } catch (error) {
            setError(error.message);
            console.error("Error fetching data: ", error);
        }
    };
    useEffect(() => {
      fetchData();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };
    return (

        
        <>
            <Head>
                <title>Upload File</title>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" type="text/css" href="../css/files.css" />
                <link rel="stylesheet" type="text/css" href="../css/resetStyle.css" />
            </Head>
            <header className="cells">
                <h1>header</h1>
            </header>
            <div className="backG">
                <div className="snd-header">
                    <h1>Identificador_cambios_python</h1>
                    <div className="snd-header-right">
                        <button className="newFile">+ Add New File</button>
                        <button className="newFolder">+ Add New Folder</button> 
                    </div>   
                </div>
                <div className="d-box">
                    <div className="files">
                        <h1>Recent Files</h1>
                        <div className="table">
                            <div className="column name">
                                <div className="header-t">Name<div className="arrow" onClick={() => changeArrow(this)}></div></div>
                                {results.map((result, index) =>  {
                                    if (result.type === 'directory') {
                                        return (
                                        <div className="row" key={index}>
                                            <div className="proj-folder"></div>
                                            {result.directoryName}
                                        </div>
                                        );
                                    }
                                    else{
                                        return (
                                        <div className="row" key={index}>
                                            <div className="projects"></div>
                                            {result.fileName}.{result.fileType}
                                        </div>
                                        );
                                    }
                                })}
                                
                            </div>
                            <div className="column size">
                                <div className="header-t">Size<div className="arrow" onClick={() => changeArrow(this)}></div></div>
                                {results.map((result, index) =>  (
                                    <div key={index} className="row">{result.fileSize} mb</div>
                                ))}
                               
                            </div>
                            <div className="column created">
                                <div className="header-t">Uploaded<div className="arrow" onClick={() => changeArrow(this)}></div></div>
                                {results.map((result, index) =>  (
                                    <div key={index} className="row">{formatDate(result.dateCreated)} </div>
                                ))}
                               
                                
                            </div>
                            <div className="column desc">
                                <div className="header-t">Description</div>
                                {results.map((result, index) =>  (
                                    <div key={index} className="row">{result.descripcion} </div>
                                ))}
                            </div>
                        </div>                
                    </div>
                    <div className="folders">
                        <div className="mini-fol">
                            <div className="mini-fol-l">
                                
                                <img src="/img/Path.png" height="auto" width="38px" />
                                <p>Public</p>
                            </div>
                            <div className="mini-fol-r">
                                <div className="folsection">
                                    <p>Componente.css</p>
                                </div>
                                <div className="folsection">
                                    <p>Navbar.html</p>
                                </div>
                                <div className="folsection">
                                    <p>Layout.html</p>
                                </div>
                                <div className="folsection">
                                    <p>Layout.html</p>
                                </div>
                                <div className="folsection">
                                    <p>Layout.html</p>
                                </div>
                                <div className="folsection">
                                    <p>Layout.html</p>
                                </div>
                                <div className="folsection">
                                    <p>Layout.html</p>
                                </div>
                            </div>
                        </div>
                        <div className="mini-fol">
                            <div className="mini-fol-l">
                                <img src="/img/Path.png" height="auto" width="38px" />
                                <p>Root</p>
                            </div>
                            <div className="mini-fol-r">
                                <div className="folsection">
                                    <p>Nose.ns</p>
                                </div>
                                <div className="folsection">
                                    <p>Prueba.xd</p>
                                </div>
                            </div>
                        </div>
                        <div className="mini-fol">
                            <div className="mini-fol-l">
                                <img src="/img/Path.png" height="auto" width="38px" />
                                <p>Root</p>
                            </div>
                            <div className="mini-fol-r">
                                <div className="folsection">
                                    <p>Nose.ns</p>
                                </div>
                                <div className="folsection">
                                    <p>Prueba.xd</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        </>
    );
}
