import { useState, useRef, useEffect } from "react";
import { useOpenCv } from "opencv-react";

function Testing() {
  const { loaded, cv } = useOpenCv();
  const [imageData, setImageData] = useState("");
  const [points, setPoints] = useState([]);
  const [dstpoints, setdstPoints] = useState([]);
  const [windowPoints, setWindowPoints] = useState([]);

  console.log("point", points, "window", windowPoints);

  const appRef = useRef(null);
  const imageRef = useRef(null);

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

  const calculateNorm = (vector1, vector2) => {
    const difference = vector1.map((value, index) => value - vector2[index]);
    const squaredDifference = difference.map((value) => value * value);
    const sumSquaredDifference = squaredDifference.reduce(
      (acc, value) => acc + value,
      0
    );
    const norm = Math.sqrt(sumSquaredDifference);
    // console.log(norm);
    return norm;
  };

  const calculateMatrix = (fPoints, ratio = 1.0) => {
    const point1 = fPoints[0][0];
    const point2 = fPoints[0][1];
    const dst_origin = [point1, point2];
    const dst_width = calculateNorm(fPoints[1], fPoints[0]) * ratio;
    const dst_height = calculateNorm(fPoints[3], fPoints[0]);
    const newWidth = point1 + dst_width;
    const newHeight = point2 + dst_height;

    const tPoints = [
      dst_origin,
      [newWidth, point2],
      [point1, newHeight],
      [newWidth, newHeight],
    ];
    const sourceMatric = cv.matFromArray(4, 1, cv.CV_32FC2, fPoints.flat());
    const destinationMatric = cv.matFromArray(
      4,
      1,
      cv.CV_32FC2,
      tPoints.flat()
    );

    // rows,cols,type,array
    const perspectiveMatrix = cv.getPerspectiveTransform(
      sourceMatric,
      destinationMatric
    );

    return perspectiveMatrix;
  };

  const calculateRatio = (points, perspectiveMatrix) => {
    const windowMatric = cv.matFromArray(
      4,
      1,
      cv.CV_32FC2,
      points.flat()
    );
    const testMatric = cv.matFromArray(4, 1, cv.CV_32FC2, []);

    cv.perspectiveTransform(windowMatric, testMatric, perspectiveMatrix);
    console.log("test", testMatric.data32F);
    const points_calculated = testMatric.data32F;
    const points1 = [points_calculated[0], points_calculated[1]];
    const points2 = [points_calculated[2], points_calculated[3]];
    const points3 = [points_calculated[4], points_calculated[5]];
    const points4 = [points_calculated[6], points_calculated[7]];

    const points_width = calculateNorm(points2, points1);
    const points_height = calculateNorm(points3, points1);

    console.log("width", points_width, "height", points_height);
    const calculated_ratio = (points_height / points_width) * (100 / 130);

    return calculated_ratio;
  }

  const transform = () => {
    //const imageElement = imageRef.current;

    const imageElement = document.getElementById("image");
    const im = cv.imread(imageElement);

    const fPoints = points;
    const perspectiveMatrix = calculateMatrix(fPoints);
    const calculated_ratio = calculateRatio(windowPoints, perspectiveMatrix);
   
    console.log("ratio", calculated_ratio);

    const re_perspectiveMatrix = calculateMatrix(fPoints, 1.6);

    const dst = new cv.Mat();
    const {width, height } = im.size();
    const dsize = new cv.Size(width * 2.0 , height * 2.0);
    cv.warpPerspective(im, dst, re_perspectiveMatrix, dsize);

    cv.imshow("outputCanvas", dst);
    dst.delete();
    im.delete();
  };

  const handleDrawCircles = (points) => {
    const radius = 10;
    const imageElement = document.getElementById("image");
    const im = cv.imread(imageElement);
    const displayMat = im.clone();
    points.forEach((point) => {
      const x = point[0];
      const y = point[1];
      const center = new cv.Point(x, y);
      cv.circle(displayMat, center, radius, [255, 0, 0, 255], cv.FILLED, 5);
    });

    cv.imshow("outputCanvas", displayMat);

    im.delete();
    displayMat.delete();
  };

  if (!cv) {
    <p>loading...</p>;
  }

  return (
    <div>
      <div id="app" className="p-3" ref={appRef}>
        <h1 className="font-bold">
          ななめに写った文書をピッタリにするサンプル
        </h1>
        <hr className="my-3" />
        <div style={{ display: !cv ? "block" : "none" }}>
          opencvを準備中です...しばらくお待ちください。
        </div>

        <div style={{ display: cv ? "block" : "none" }}>
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
              onClick={(event) => {
                const x = event.clientX;
                const y = event.clientY;
                if (points.length === 4) {
                  setWindowPoints([...windowPoints, [x, y]]);
                } else {
                  setPoints([...points, [x, y]]);
                }
                handleDrawCircles([...points, ...windowPoints, [x, y]]);
              }}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              style={{
                width: "50px",
                height: "50px",
              }}
              onClick={() => {
                points.pop();
                setPoints(points);
                handleDrawCircles(points);
              }}
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
              />
            </svg>
            <canvas
              id="outputCanvas"
              onClick={(event) => {
                const x = event.clientX;
                const y = event.clientY;
                setdstPoints([...dstpoints, [x, y]]);
              }}
            ></canvas>
          </div>
          <div
            className="pt-3 clear-both"
            style={{ display: imageData ? "block" : "none" }}
          >
            <button
              type="button"
              className="bg-indigo-500 text-indigo-50 p-2 rounded mb-3"
              onClick={transform}
            >
              歪みを修正する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Testing;
