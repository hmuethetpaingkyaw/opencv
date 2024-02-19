import {  useState } from "react";
import "./App.css";

import { useOpenCv } from "opencv-react";

function CropImage() {
  const { loaded, cv: newCv } = useOpenCv();

  const [showCircle, setShowCircle] = useState(false);
  const [hideOriginalImage, setHideOriginalImage] = useState(true);
  const [circlePositions, setCirclePositions] = useState([]);
  const [imageData, setImageData] = useState("");

  const [transformImg, setTransformImg] = useState({
    points: null,
    size: null,
  });

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

  const transformImage = () => {
    const imageElement = document.getElementById("image");
    const im = newCv.imread(imageElement);

    // use circles points on image instead of points
    let fPoints = circlePositions.slice(0, 4)?.map((obj) => [obj.x, obj.y]);
    fPoints = sortClockwise(fPoints);

    const { matrix: perspectiveMatrix, destinationPoints: points } =
      calculateMatrix(fPoints);
    const dst = new newCv.Mat();
    const { width, height } = im.size();
    const dsize = new newCv.Size(920, height * 2.0);

    newCv.warpPerspective(im, dst, perspectiveMatrix, dsize);
    handleCirclePositions(points);
    setTransformImg({
      points,
      size: { width: 920, height: height * 2.0 },
    });

    setHideOriginalImage(true);

    drawCirclesOnCanvas(points?.map((point) => {
      return {x: point[0], y: point[1]}
    }), dst)

    dst.delete();
    im.delete();
  };
  const transformCanvas = () => {
    const imageElement = document.getElementById("outputCanvas");
    const im = newCv.imread(imageElement);

    const windowPoints = [
      circlePositions[4],
      circlePositions[5],
      circlePositions[6],
    ]?.map((obj) => [obj.x, obj.y]);

    const points = transformImg?.points;
    const dst = new newCv.Mat();
    const { width, height } = transformImg?.size;
    const dsize = new newCv.Size(width, height);

    const wallSizeRatio = calculateNorm(points[1], points[0]) / width;

    // console.log("wall size ratio" , wallSizeRatio);
    const ratio = calculateRatio(windowPoints, wallSizeRatio);

    // console.log('ratio', calculatedRatio)

    const { matrix: recalculatedPerspectiveMatrix, destinationPoints } =
      calculateMatrix(points, ratio);

    newCv.warpPerspective(im, dst, recalculatedPerspectiveMatrix, dsize);
    handleCirclePositions(destinationPoints);

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

  const calculateRatio = (points, wallSizeRatio) => {
    const points1 = points[0];
    const points2 = points[1];
    const points3 = points[2];

    const pointsWidth = calculateNorm(points2, points1);
    const pointsHeight = calculateNorm(points3, points1);

    console.log("window points", points);

    const { width, height } = calculateWidthAndHeight(points);
    console.log("Width:", width, pointsWidth);
    console.log("Height:", height, pointsHeight);

    const windowWidth = 100;
    const windowHeight = 130;

    const ratio = (pointsHeight / width) * (windowWidth / windowHeight);

    return ratio;
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

  function calculateWidthAndHeight([point1, point2, point3]) {
    const width = Math.sqrt(
      Math.pow(point2[0] - point1[0], 2) + Math.pow(point2[1] - point1[1], 2)
    );
    const height =
      Math.sqrt(
        Math.pow(point3[0] - (point1[0] + point2[0]) / 2, 2) +
          Math.pow(point3[1] - (point1[1] + point2[1]) / 2, 2)
      ) * 2;
    return { width, height };
  }

  const handleCirclePositions = (points) => {
    const circlePositions = points.map((point) => {
      return { x: point[0], y: point[1] };
    });
    // console.log(circlePositions)

    setCirclePositions(circlePositions);
  };

  const handleClick = (event) => {
    const newCirclePosition = {
      x: event.clientX - event.currentTarget.getBoundingClientRect().left - 2, // -2 is to manipulate border-radius 4
      y: event.clientY - event.currentTarget.getBoundingClientRect().top - 2, // -2 is to manipulate border-radius 4
    };

    setCirclePositions([...circlePositions, newCirclePosition]);

    setShowCircle(true);
  };
  const handleDrawCircleOnCanvas = (event) => {
    const newCirclePosition = {
      x: event.clientX - event.currentTarget.getBoundingClientRect().left - 2, // -2 is to manipulate border-radius 4
      y: event.clientY - event.currentTarget.getBoundingClientRect().top - 2, // -2 is to manipulate border-radius 4
    };

    const newCirclePositions = [...circlePositions, newCirclePosition];

    setCirclePositions(newCirclePositions);

    const imageElement = document.getElementById("outputCanvas");
    const im = newCv.imread(imageElement);
    const dst = im.clone();
    drawCirclesOnCanvas(newCirclePositions, dst)

    dst.delete()
  };

  const drawCirclesOnCanvas = (circlePoints, drawImg) => {
    const radius = 5;

    circlePoints.forEach(({ x, y }) => {
      const center = new newCv.Point(x, y);
      newCv.circle(drawImg, center, radius, [255, 0, 0, 255], newCv.FILLED, 5);
    });
    newCv.imshow("outputCanvas", drawImg);
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
              disabled={circlePositions?.length !== 4}
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

        {circlePositions?.length === 7 && (
          <button
            color="primary"
            onClick={transformCanvas}
            disabled={circlePositions?.length !== 7}
          >
            Apply
          </button>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "920px",
          }}
          onClick={handleDrawCircleOnCanvas}
        >
          <canvas id="outputCanvas" width="0" height="0"></canvas>
        </div>
      </div>
    </div>
  );
}

export default CropImage;
