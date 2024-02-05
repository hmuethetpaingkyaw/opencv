import React, { useState, useRef } from "react";
import { useOpenCv } from "opencv-react";
import * as d3 from "d3";

function D3OpenCVSelection() {
  const { loaded, cv } = useOpenCv();

  const [imageData, setImageData] = useState("");
  const appRef = useRef(null);
  const imageRef = useRef(null);
  const svgRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState([]);

  const onFileChange = (e) => {
    const files = e.target.files;

    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageData(e.target.result);
        setPoints([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const onMouseDown = () => {
    setDrawing(true);
    setPoints([]);
  };

  const onMouseMove = (e) => {
    console.log(drawing);
    if (!drawing) return;
    const svg = d3.select(svgRef.current);
    const [x, y] = d3.pointer(e);
    setPoints((prevPoints) => [...prevPoints, { x, y }]);
    svg.select("line").remove();
    svg.append("line").attr("x1", x).attr("y1", y).attr("x2", x).attr("y2", y).attr("stroke", "red");
  };

  const onMouseUp = () => {
    //setDrawing(false);
  };

  const processImage = () => {
    const imageElement = document.getElementById("image");
    const im = cv.imread(imageElement);

    // Create a mask based on the drawn lines
    const mask = new cv.Mat(im.rows, im.cols, cv.CV_8UC1, [0, 0, 0, 0]);

    for (let i = 0; i < points.length - 1; i++) {
      const pt1 = new cv.Point(points[i].x, points[i].y);
      const pt2 = new cv.Point(points[i + 1].x, points[i + 1].y);
      cv.line(mask, pt1, pt2, new cv.Vec(255, 255, 255), 2);
    }

    // Apply the mask to the original image
    const result = new cv.Mat();
    cv.bitwise_and(im, im, result, mask);

    // Display the result
    cv.imshow(imageRef.current, result);

    im.delete();
    mask.delete();
    result.delete();
  };

  return (
    <div>
      <div id="app" className="p-3" ref={appRef}>
        <h1 className="font-bold">D3.js + OpenCV Image Selection</h1>
        <hr className="my-3" />
        <div style={{ display: "block" }}>
          <input type="file" accept="image/*" onChange={onFileChange} />
          <div
            className="pt-3"
            style={{ display: imageData ? "block" : "none" }}
          >
            <img
              id="image"
              className="float-left"
              src={imageData}
              ref={imageRef}
              alt="Selected"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
            />
            <svg
              id="svg-overlay"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                pointerEvents: "none",
              }}
              width="100%"
              height="100%"
              ref={svgRef}
            >
              <line x1="0" y1="0" x2="0" y2="0" stroke="red" />
            </svg>
          </div>
          <div
            className="pt-3 clear-both"
            style={{ display: imageData ? "block" : "none" }}
          >
            <button
              type="button"
              className="bg-indigo-500 text-indigo-50 p-2 rounded mb-3"
              onClick={processImage}
            >
              Apply Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default D3OpenCVSelection;
