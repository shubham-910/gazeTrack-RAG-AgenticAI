import React, { useState } from "react";
import Webcam from "react-webcam";
import WebgazerComponent from "./WebgazerComponent"; // Import the Webgazer component

const MediaAccess = () => {
  const [size, setSize] = useState(300); // Default size in pixels

  return (
    <div
      className="fixed bottom-0 right-5"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* <Webcam width={size} height={size} id="webcam" className="w-full h-full object-cover" /> */}
      
      {/* Add the Webgazer component */}
      {/* <WebgazerComponent /> */}

    </div>
  );
};

export default MediaAccess;
