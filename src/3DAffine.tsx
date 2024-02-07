import { useState, useRef } from "react";
import {  useOpenCv } from 'opencv-react'

function ThreeDAffine() {
  const { loaded, cv } = useOpenCv()
  const [imageData, setImageData] = useState("");

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

  const transform = () => {
    // input image
    const im = cv.imread('image')
    const dst = new cv.Mat()
    const width = im.rows
    const height = im.cols
    // output image size
    const dsize = new cv.Size(width, height)
    const resizedMat = new cv.Mat()
    const fPoints = [
      [388.5, 124],
      [387, 479],
      [571.99, 460],
      [564.49, 231.5],
    ]
    const tPoints = [
      [469, 355],
      [469.58, 397.86],
      [492, 399.65],
      [491.57, 359.48],
    ]
    // const fPoints = [837, 497, 1719, 1087, 1755, 2173, 835, 2269]
    // const tPoints = [1275, 1695, 1364, 1710, 1369, 1878, 1276, 1869]
    console.log('im', im.rows, im.cols)
    const sourceMatric = cv.matFromArray(4, 1, cv.CV_32FC2, fPoints.flat())
    const destinationMatric = cv.matFromArray(4, 1, cv.CV_32FC2, tPoints.flat())

    // rows,cols,type,array
    const perspectiveMatrix = cv.getPerspectiveTransform(sourceMatric, destinationMatric)
    cv.warpPerspective(
      im,
      dst,
      perspectiveMatrix,
      dsize,
      cv.INTER_LINEAR,
      cv.BORDER_CONSTANT,
      new cv.Scalar()
    )
    // const ratio = calculateRatio(im.rows, im.cols, tPoints, perspectiveMatrix)
    // console.log('ratio', ratio)
    // console.log('M', Array.from(M.data64F))
    const newImageSize = new cv.Size(width, height)
    cv.resize(dst, resizedMat, newImageSize, 0, 0, cv.INTER_AREA)
    cv.imshow('outputCanvas', resizedMat)


    // im.delete()
    // M.delete()
    // srcTri.delete()
    // dstTri.delete()
    // hideImage()
    console.log('Done!')
  }

  function calculateRatio(inputPoints, perspectiveMatrix, destinationData) {
    const dst = new cv.Mat();
    const src = cv.matFromArray(4, 1, cv.CV_32FC2, inputPoints);

    perspectiveTransform(src, dst, perspectiveMatrix);

    const pointsCalculated = Array.from(dst.data32F);

    const correctWidth = destinationData.windowWidth;
    const correctHeight = destinationData.windowHeight;
    // Assuming pointsCalculated is a flat array [x1, y1, x2, y2, ...]
    const x1 = pointsCalculated[6];
    const y1 = pointsCalculated[7];
    const x2 = pointsCalculated[4];
    const y2 = pointsCalculated[5];
    const x3 = pointsCalculated[2];
    const y3 = pointsCalculated[3];
    const x4 = pointsCalculated[0];
    const y4 = pointsCalculated[1];

    const pointsWidth = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const pointsHeight = Math.sqrt((x3 - x2) ** 2 + (y3 - y2) ** 2);

    const calculatedRatio =
      (pointsHeight / pointsWidth) * (correctWidth / correctHeight);
    return calculatedRatio;
  }

  function perspectiveTransform(inputPoints, output, perspectiveMatrix) {
    return cv.perspectiveTransform(inputPoints, output, perspectiveMatrix);
  }


  if(!cv) {
    <p>loading...</p>
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
            />
            <canvas id="outputCanvas"></canvas>
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


export default ThreeDAffine;
