import React from 'react';
import axios from 'axios';

const DownloadButton = ({ directoryId }) => {
  const handleDownload = async () => {
    try {
      const response = await axios.get(`/api/tests/export-metrics/${directoryId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'test_metrics.csv'); // or any other extension
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };

  return (
    <button onClick={handleDownload} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      Download All Tests
    </button>
  );
};

export default DownloadButton;
