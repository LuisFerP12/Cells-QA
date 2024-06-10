// components/TestCircularProgressbar.jsx porq no jala alavberga
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const TestCircularProgressbar = () => {
  const percentage = 90;

  return (
    <div className="w-[100px] h-[100px] m-auto mt-10">
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
  );
};

export default TestCircularProgressbar;
