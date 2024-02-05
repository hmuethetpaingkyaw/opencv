import React, { useState, useRef } from "react";
import { useOpenCv } from 'opencv-react';
import * as d3 from "d3";

function PerspectiveTransformation() {
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

  const onMouseDown = (e) => {
    setDrawing(true);
    const [x, y] = d3.pointer(e);
    setPoints((prevPoints) => [...prevPoints, { x, y }]);
  };

  const onMouseMove = (e) => {
    if (!drawing) return;
    const [x, y] = d3.pointer(e);
    setPoints((prevPoints) => [...prevPoints, { x, y }]);
    updateSelectionLine();
  };

  const onMouseUp = () => {
    setDrawing(false);
    updateSelectionLine();
  };

  const updateSelectionLine = () => {
    const svg = d3.select(svgRef.current);
    svg.select("line").remove();

    if (points.length > 1) {
        console.log(svg)
      svg
        .append("line")
        .attr("x1", points[points.length - 2].x)
        .attr("y1", points[points.length - 2].y)
        .attr("x2", points[points.length - 1].x)
        .attr("y2", points[points.length - 1].y)
        .attr("stroke", "red");
    }
  };

  const transformImage = () => {
    if (points.length !== 4) {
      console.error("Please select four points to define the rectangle.");
      return;
    }

    const imageElement = document.getElementById("image");
    const im = cv.imread(imageElement);

    // Convert selected points to OpenCV format
    const fromPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
      points[0].x, points[0].y,
      points[1].x, points[1].y,
      points[2].x, points[2].y,
      points[3].x, points[3].y,
    ]);

    // Define the target rectangle (a rectangle with correct orientation)
    const toPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
      0, 0,
      im.cols, 0,
      im.cols, im.rows,
      0, im.rows,
    ]);

    // Calculate the perspective transform matrix
    const M = cv.getPerspectiveTransform(fromPts, toPts);

    // Apply the perspective transformation
    const transformedIm = new cv.Mat();
    cv.warpPerspective(im, transformedIm, M, new cv.Size(im.cols, im.rows));

    // Display the transformed image
    cv.imshow(imageRef.current, transformedIm);

    // Clean up
    im.delete();
    fromPts.delete();
    toPts.delete();
    M.delete();
    transformedIm.delete();
  };

  if (!cv) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div id="app" className="p-3" ref={appRef}>
        <h1 className="font-bold">D3 + OpenCV Perspective Transformation</h1>
        <hr className="my-3" />
        <div>
          <input type="file" accept="image/*" onChange={onFileChange} />
          <div
            className="pt-3"
            style={{ display: imageData ? "block" : "none" }}
          >
            <img
              id="image"
              className="float-left"
              src={imageData}
              alt="Selected"
              ref={imageRef}
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
              onMouseDown={onMouseDown}
              onMouseUp={onMouseUp}
              onMouseMove={onMouseMove}
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
              onClick={transformImage}
            >
              Transform Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerspectiveTransformation;
