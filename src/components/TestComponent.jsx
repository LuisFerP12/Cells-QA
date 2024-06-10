"use client";

import React from 'react';
import Image from 'next/image';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const TestComponent = ({ name, percentage, passedTests = [], rejectedTests = [], notExecutedTests = [] }) => {
  const totalTests = passedTests.length + rejectedTests.length + notExecutedTests.length;
  const baseHeight = 292;
  const extraHeightPerTest = 20;
  const height = baseHeight + totalTests * extraHeightPerTest;

  return (
    <div className="w-[326px] flex-shrink-0 rounded-[16px] bg-white p-4 shadow-lg" style={{ minHeight: `${baseHeight}px`, height: `${height}px` }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="relative w-[39px] h-[39px] flex-shrink-0">
            <div className="absolute top-0 left-0 w-full h-full rounded-full bg-[#F3F4F8] flex items-center justify-center">
              <Image src="/img/document.svg" alt="Icon" width={16} height={16} />
            </div>
          </div>
          <div className="ml-2 text-[#8C97A8] font-medium text-[16px] leading-normal">
            {name}
          </div>
        </div>
        <div className="w-[90px] h-[90px]">
          <CircularProgressbar
            value={percentage}
            text={`${percentage}%`}
            styles={buildStyles({
              textColor: "#23235F",
              pathColor: "#00AB6B",
              trailColor: "#D6D6D6",
            })}
          />
        </div>
      </div>
      <div className="w-[288px] h-[1.058px] flex-shrink-0 bg-[#E8EDF1] mb-4"></div>
      <div className="flex justify-around items-center mb-4">
        <div className="w-[24px] h-[24px] flex-shrink-0">
          <Image src="/img/arrowleft.svg" alt="Arrow Left" width={24} height={24} />
        </div>
        <div className="flex justify-around w-full px-4">
          <div className="text-center">
            <div className="text-[#23235F] font-medium text-[14px] leading-normal">Passed</div>
            {passedTests.map((test, index) => (
              <div className="flex items-center mt-1" key={index}>
                <div className="w-[10px] h-[10px] bg-[#23CF49] mr-2"></div>
                <div className="text-[#23235F] font-medium text-[14px] leading-normal">{test}</div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <div className="text-[#23235F] font-medium text-[14px] leading-normal">Rejected</div>
            {rejectedTests.map((test, index) => (
              <div className="flex items-center mt-1" key={index}>
                <div className="w-[10px] h-[10px] bg-[#FF4D4F] mr-2"></div>
                <div className="text-[#23235F] font-medium text-[14px] leading-normal">{test}</div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <div className="text-[#23235F] font-medium text-[14px] leading-normal">No Execute</div>
            {notExecutedTests.map((test, index) => (
              <div className="flex items-center mt-1" key={index}>
                <div className="w-[10px] h-[10px] bg-[#A9A9A9] mr-2"></div>
                <div className="text-[#23235F] font-medium text-[14px] leading-normal">{test}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-[24px] h-[24px] flex-shrink-0">
          <Image src="/img/arrowright.svg" alt="Arrow Right" width={24} height={24} />
        </div>
      </div>
    </div>
  );
};

export default TestComponent;
