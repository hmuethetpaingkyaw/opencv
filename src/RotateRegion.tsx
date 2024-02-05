import React, { useState, useRef } from "react";
import { useOpenCv } from "opencv-react";

function RotateRegion() {
  const { loaded, cv } = useOpenCv();

  const [imageData, setImageData] = useState("");
  const appRef = useRef(null);
  const imageRef = useRef(null);
  const angleRef = useRef(null);

  const onFileChange = (e) => {
    const files = e.target.files;

    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageData(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ...

  const rotateRegion = () => {
    const imageElement = document.getElementById("image");
    const im = cv.imread(imageElement);

    // Define the center and angle of rotation
    const centerX = im.cols / 2;
    const centerY = im.rows / 2;
    const angle = parseFloat(angleRef.current.value);

    // Define the rectangular region to be rotated
    const x = 100; // Example, adjust as needed
    const y = 100; // Example, adjust as needed
    const width = 200; // Example, adjust as needed
    const height = 150; // Example, adjust as needed

    // Get the rotation matrix
    const M = cv.getRotationMatrix2D(new cv.Point(centerX, centerY), angle, 1);

    // Extract the region of interest (ROI)
    const roi = im.roi(new cv.Rect(x, y, width, height));

    // Apply the affine transformation to the region
    const rotatedRegion = new cv.Mat();
    cv.warpAffine(
      roi,
      rotatedRegion,
      M,
      roi.size(),
      cv.INTER_LINEAR,
      cv.BORDER_CONSTANT,
      new cv.Scalar()
    );

    // Replace the original region with the rotated one
    rotatedRegion.copyTo(im.roi(new cv.Rect(x, y, width, height)));

    // Display the result
    cv.imshow("outputCanvas", im);

    // Clean up
    im.delete();
    roi.delete();
    rotatedRegion.delete();
  };

  return (
    <div>
      <div id="app" className="p-3" ref={appRef}>
        <h1 className="font-bold">Rotate Region of Image</h1>
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
            />
            <canvas id="outputCanvas"></canvas>

            <div className="pt-3">
              <label htmlFor="angle">Rotation Angle:</label>
              <input
                type="number"
                id="angle"
                ref={angleRef}
                defaultValue="45"
                step="1"
              />
              <button
                type="button"
                className="bg-indigo-500 text-indigo-50 p-2 rounded mb-3"
                onClick={rotateRegion}
              >
                Rotate Region
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RotateRegion;
