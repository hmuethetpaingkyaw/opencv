import { useState, useRef, useEffect } from "react";
import { useOpenCv } from "opencv-react";

function Testing() {
  const { loaded, cv } = useOpenCv();
  const [imageData, setImageData] = useState("");
  const [points, setPoints] = useState([]);
  const [dstpoints, setdstPoints] = useState([]);

  console.log(points, dstpoints);

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
    console.log(norm);
    return norm;
  };

  const transform = () => {
    //const imageElement = imageRef.current;

    const imageElement = document.getElementById("image");
    const im = cv.imread(imageElement);

    const fPoints = points;

    //       height
    // :
    // 767
    // width
    // :
    // 574
    const point1 = fPoints[0][0];
    const point2 = fPoints[0][1];
    const dst_origin = [point1, point2];
    const dst_width = calculateNorm(fPoints[1] , fPoints[0]);
    const dst_height = calculateNorm(fPoints[3] , fPoints[0]);
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
    const dst = new cv.Mat();
    const dsize = new cv.Size(im.width, im.height);

    // rows,cols,type,array
    const perspectiveMatrix = cv.getPerspectiveTransform(
      sourceMatric,
      destinationMatric
    );
    cv.warpPerspective(im, dst, perspectiveMatrix, dsize);

    cv.imshow("outputCanvas", dst);
    dst.delete();
    im.delete();
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
                setPoints([...points, [x, y]]);
              }}
            />

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
