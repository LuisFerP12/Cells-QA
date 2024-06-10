import React from 'react';
import axios from 'axios';

const TestItem = ({ params, title, testCount, passPercentage, testId }) => {
  const getStatusColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleExport = async () => {
    try {
      console.log('Exporting test:', testId)
      const response = await axios.get(`/api/tests/individual-metrics/${testId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `test_${testId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting the test:', error);
    }
  };

  const teamId = params?.teamId ?? 'defaultTeamId'; // Fallback value
  const directoryId = params?.directoryId ?? 'defaultDirectoryId'; // Fallback value

  return (
    <div className="flex items-center justify-between mb-4 bg-white rounded-lg" style={{ width: '880px', height: '85px' }}>
      <div className="flex items-center" style={{ width: '178px', height: '85px', flexShrink: 0, backgroundColor: '#FBFAFF', borderRadius: '10px 0 0 10px', padding: '0 16px' }}>

        {/* aqui el href alvera */}
        <a href={`/Dashboard/${teamId}/${directoryId}/${testId}`}>
        <div className="flex items-center justify-center w-9 h-9 bg-blue-900 rounded-full hover:bg-blue-800">
          <img src="/img/play.svg" alt="Play" className="w-3 h-3 ml-0.5" />
        </div>
      </a>

        <p className="ml-2 text-sm font-medium text-black">Start Test</p>
      </div>

      <div className="flex items-center flex-grow ml-4" style={{ height: '100%' }}>
        <div>
          <p className="text-lg font-medium text-[#23235F]">{title}</p>
          <div className="flex items-center text-sm font-medium text-[#778399] ml-8">
            <img src="/img/tests.svg" alt="Tests Icon" className="w-4 h-4 ml-40" />
            <span className="ml-1">{testCount} Tests</span>
          </div>
        </div>
      </div>

      <div className="flex items-center" style={{ height: '100%', marginRight: '30px' }}>
        <div className="flex flex-col items-start mr-2">
          <p className="text-lg font-medium text-[#23235F]">{passPercentage}% Passed</p>
          <div className="relative w-40 h-1 bg-gray-200">
            <div className={`absolute left-0 top-0 h-1 ${getStatusColor(passPercentage)}`} style={{ width: `${passPercentage}%` }} />
          </div>
        </div>

        <div
          onClick={handleExport}
          className="flex items-center justify-between w-40 h-10 px-4 py-2 ml-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
          style={{ width: '100px', height: '39px', marginLeft: '50px' }}
        >
          <img src="/img/edit.svg" alt="Edit" className="w-4 h-4" />
          <p className="ml-2 text-sm font-medium text-[#4673B6]">Export</p>
        </div>
      </div>
    </div>
  );
};

export default TestItem;
