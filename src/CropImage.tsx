import React, { useEffect, useState } from "react";
import "./App.css";

import { useOpenCv } from "opencv-react";

function CropImage() {
  const { loaded, cv: newCv } = useOpenCv();

  const [showCircle, setShowCircle] = useState(false);
  const [showCanvasCircle, setShowCanvasCircle] = useState(false);
  const [hideOriginalImage, setHideOriginalImage] = useState(true);
  const [circlePositions, setCirclePositions] = useState([]);
  const [imageData, setImageData] = useState("");

  const handleTransform = () => {
    if (newCv) {
      transformImage();
    }
  };
  const onFileChange = (e) => {
    const files = e.target.files;
    setCirclePositions([]);

    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageData(e.target.result);
        setHideOriginalImage(false);
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
    return norm;
  };

  const transformImage = () => {
    const imageElement = document.getElementById("image");
    const im = newCv.imread(imageElement);

    // use circles points on image instead of points
    let fPoints = circlePositions.slice(0, 4)?.map((obj) => [obj.x, obj.y]);
    fPoints = sortClockwise(fPoints);

    const copiedCirclePositions = circlePositions;
    const windowPoints = copiedCirclePositions
      .splice(0, 4)
      ?.map((obj) => [obj.x, obj.y]);

    const { matrix: perspectiveMatrix } = calculateMatrix(fPoints);

    const {
      ratio: calculatedRatio    } = calculateRatio(windowPoints, perspectiveMatrix);

    // console.log('ratio', calculatedRatio)

    const { matrix: recalculatedPerspectiveMatrix, destinationPoints } =
      calculateMatrix(fPoints, calculatedRatio);

    const dst = new newCv.Mat();
    const { width, height } = im.size();
    const dsize = new newCv.Size(width * 2.0, height * 2.0);
    newCv.warpPerspective(im, dst, recalculatedPerspectiveMatrix, dsize);
    handleCirclePositions(destinationPoints);

    setHideOriginalImage(true);
    newCv.imshow("outputCanvas", dst);
    dst.delete();
    im.delete();
  };

  const calculateMatrix = (fPoints, ratio = 1.0) => {
    const point1 = fPoints[0][0];
    const point2 = fPoints[0][1];
    const dstOrigin = [point1, point2];
    const dstWidth = calculateNorm(fPoints[1], fPoints[0]) * ratio;
    const dstHeight = calculateNorm(fPoints[3], fPoints[0]);
    const newWidth = point1 + dstWidth;
    const newHeight = point2 + dstHeight;

    const tPoints = [
      dstOrigin,
      [newWidth, point2],
      [point1, newHeight],
      [newWidth, newHeight],
    ];
    const sourceMatric = newCv.matFromArray(
      4,
      1,
      newCv.CV_32FC2,
      fPoints.flat()
    );
    const destinationMatric = newCv.matFromArray(
      4,
      1,
      newCv.CV_32FC2,
      tPoints.flat()
    );

    const perspectiveMatrix = newCv.getPerspectiveTransform(
      sourceMatric,
      destinationMatric
    );

    return { matrix: perspectiveMatrix, destinationPoints: tPoints };
  };

  const calculateRatio = (points, perspectiveMatrix) => {
    // const fromPoints = newCv.matFromArray(4, 1, newCv.CV_32FC2, points.flat());
    // const toPoints = newCv.matFromArray(4, 1, newCv.CV_32FC2, []);

    // newCv.perspectiveTransform(fromPoints, toPoints, perspectiveMatrix);
    // const pointsCalculated = toPoints.data32F;
    // const points1 = [pointsCalculated[0], pointsCalculated[1]];
    // const points2 = [pointsCalculated[2], pointsCalculated[3]];
    // const points3 = [pointsCalculated[4], pointsCalculated[5]];
    // const points4 = [pointsCalculated[6], pointsCalculated[7]];
    const points1 = points[0];
    const points2 = points[1];
    const points3 = points[2];

    const pointsWidth = calculateNorm(points2, points1);
    const pointsHeight = calculateNorm(points3, points1);

    

    const windowWidth = 100;
    const windowHeight = 130;

    const ratio = (pointsHeight / pointsWidth) * (windowWidth / windowHeight);

    return { ratio };
  };

  const handleCirclePositions = (points) => {
    const circlePositions = points.map((point) => {
      return { x: point[0], y: point[1] };
    });
    // console.log(circlePositions)

    setCirclePositions(circlePositions);
    setShowCanvasCircle(true);
  };

  const handleClick = (event) => {
    const newCirclePosition = {
      x: event.clientX - event.currentTarget.getBoundingClientRect().left - 2, // -2 is to manipulate border-radius 4
      y: event.clientY - event.currentTarget.getBoundingClientRect().top - 2, // -2 is to manipulate border-radius 4
    };

    setCirclePositions([...circlePositions, newCirclePosition]);

    setShowCircle(true);
  };
  function sortClockwise(points) {
    // 座標を時計回りにソートする
    points.sort((a, b) => {
      if (a[0] === b[0]) {
        return a[1] - b[1];
      }
      return a[0] - b[0];
    });

    // 原点からの角度に基づいてソート
    const center = calculateCenter(points);
    points.sort((a, b) => {
      const angleA = Math.atan2(a[1] - center[1], a[0] - center[0]);
      const angleB = Math.atan2(b[1] - center[1], b[0] - center[0]);
      return angleA - angleB;
    });

    //to have z drawing, need to swap the last two points
    return [points[0], points[1], points[3], points[2]];
  }

  function calculateCenter(points) {
    // 座標の中心を計算
    const centerX =
      (points[0][0] + points[1][0] + points[2][0] + points[3][0]) / 4;
    const centerY =
      (points[0][1] + points[1][1] + points[2][1] + points[3][1]) / 4;
    return [centerX, centerY];
  }

  return (
    <div className="flexCenter">
      <div className="CenterBox">
        {!loaded ? <h1>Loading...</h1> : null}

        <div
          my={4}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          style={{
            marginTop: "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <input type="file" accept="image/*" onChange={onFileChange} />
          <div>
            <button
              color="primary"
              onClick={handleTransform}
              disabled={circlePositions?.length < 4}
            >
              Apply
            </button>
          </div>
        </div>
        {imageData && !hideOriginalImage && (
          <div className="MainContainer">
            <div className="ImageContainer" onClick={handleClick}>
              <img id="image" src={imageData} />
              {showCircle &&
                circlePositions.map((position, index) => (
                  <div
                    className="Circle"
                    key={index}
                    style={{ left: position.x, top: position.y }}
                  />
                ))}
            </div>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <canvas id="outputCanvas" width="0" height="0"></canvas>
          {showCanvasCircle &&
            circlePositions.map((position, index) => (
              <div
                className="Circle"
                key={index}
                style={{ left: position.x, top: position.y }}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default CropImage;
