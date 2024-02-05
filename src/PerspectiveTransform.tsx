import { useState, useRef } from "react";
import { useOpenCv } from "opencv-react";

function PerspectiveTransform() {
  const { loaded, cv } = useOpenCv();
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

  // const transform = () => {
  //   const imageElement = document.getElementById("image");
  //   const input_img = cv.imread(imageElement);

  //   const srcPts = [
  //     [1273, 1693],
  //     [1364, 1710],
  //     [1368, 1876],
  //     [1275, 1870],
  //   ];

  //   const dstPts = [
  //     [1200, 1600],
  //     [1500, 1600],
  //     [1500, 2100],
  //     [1200, 2100],
  //   ];

  //   const srcMat = cv.matFromArray(4, 1, cv.CV_32FC2, srcPts);
  //   const dstMat = cv.matFromArray(4, 1, cv.CV_32FC2, dstPts);

  //   const M = cv.getPerspectiveTransform(srcMat, dstMat);

  //   const dst_points_calculated = new cv.Mat();
  //   cv.perspectiveTransform(srcMat, dst_points_calculated, M);

  //   console.log(dst_points_calculated)

  //   const dst_size = new cv.Size(input_img.cols, input_img.rows);

  //   const transformedIm = new cv.Mat();
  //   cv.warpPerspective(input_img, transformedIm, M, dst_size);

  //   console.log(transformedIm, input_img)

  //   cv.imshow("outputCanvas", transformedIm);

  //   // Release Mats
  //   srcMat.delete();
  //   dstMat.delete();
  //   dst_points_calculated.delete();
  //   transformedIm.delete();
  //   input_img.delete();
  // };
  const transform = () => {
    //const imageElement = imageRef.current;

    const imageElement = document.getElementById("image");
    const im = cv.imread(imageElement);
    const p1 = [1273, 1693];
    const p2 = [1364, 1710];
    const p3 = [1368, 1876];
    const p4 = [1275, 1870];

    const srcPts = [p1, p2, p3, p4];
    const dstPts = [
      [1200, 1600],
      [1500, 1600],
      [1500, 2100],
      [1200, 2100],
    ];
    const srcMat = cv.matFromArray(4, 1, cv.CV_32FC2, srcPts);
    console.log("srcMat",srcMat);
    const dstMat = cv.matFromArray(4, 1, cv.CV_32FC2, dstPts);

    const M = cv.getPerspectiveTransform(srcMat, dstMat);
    const calculatedMat = srcMat.clone();
    cv.perspectiveTransform(srcMat, calculatedMat, M);
    console.log("calculatedMat",calculatedMat);

    const transformedIm = new cv.Mat();
    const dsize = new cv.Size(calculatedMat.cols, calculatedMat.rows);

    cv.warpPerspective(im, transformedIm, M, im.size());
    console.log("transformedIm",transformedIm);

        cv.imshow("outputCanvas", transformedIm);


    im.delete();
  };
  // const transform = () => {
  //   const imageElement = document.getElementById("image");
  //   const input_img = cv.imread(imageElement);
  //   // const p1 = [837, 497];
  //   // const p2 = [1719, 1087];
  //   // const p3 = [1755, 2173];
  //   // const p4 = [835, 2269];

  //   const p1 = [1273, 1693];
  //   const p2 = [1364, 1710];
  //   const p3 = [1368, 1876];
  //   const p4 = [1275, 1870];

  //   const srcPts = [p1, p2, p3, p4];
  //   const srcArray = srcPts.map((pt) => new Float32Array(pt));
  //   console.log("srcArray", srcArray);
  //   const flatSrcArray = srcArray.reduce(
  //     (acc, val) => acc.concat(Array.from(val)),
  //     []
  //   );
  //   const srcPoints = [new Float32Array(flatSrcArray)];
  //   console.log("srcPoints", srcPoints);

  //   const dstPts = [
  //     [1200, 1600],
  //     [1500, 1600],
  //     [1500, 2100],
  //     [1200, 2100],
  //   ];

  //   const dst_origin = [srcPoints[0][0] * 1.0, srcPoints[0][1] * 1.0];
  //   console.log("dst_origin", dst_origin);

  //   const dstArray = dstPts.map(
  //     (pt) =>
  //       new Float32Array([pt[0] + srcPoints[0][0], pt[1] + srcPoints[0][1]])
  //   );
  //   const flatDstArray = dstArray.reduce(
  //     (acc, val) => acc.concat(Array.from(val)),
  //     []
  //   );
  //   const dstPoints = [new Float32Array(flatDstArray)];

  //   // Convert the points to Mats
  //   const srcMat = cv.matFromArray(
  //     4,
  //     1,
  //     cv.CV_32FC2,
  //     srcArray
  //   );
  //   const dstMat = cv.matFromArray(
  //     4,
  //     1,
  //     cv.CV_32FC2,
  //     dstArray
  //   );

  //   // Calculate the perspective transform matrix
  //   const M = cv.getPerspectiveTransform(srcMat, dstMat);

  //   console.log("M", M);
  //   const dst_points_calculated = new cv.Mat();
  //   // const srcMat = cv.matFromArray(srcPoints.length, 2, cv.CV_32FC1, srcPoints);

  //   cv.perspectiveTransform(srcMat, dst_points_calculated, M);

  //   console.log("dst_points_calculated", dst_points_calculated)

  //   const dst_size = new cv.Size(input_img.cols, input_img.rows);

  //   console.log("dst_size", dst_size)

  //   const transformedIm = new cv.Mat();
  //   cv.warpPerspective(input_img, transformedIm, M, dst_size);

  //   console.log("transformedIm", transformedIm)
  //   console.log("input_image", input_img)

  //   cv.imshow("outputCanvas", transformedIm);
  //   console.log("Transformation Matrix:", M.data64F);

  //   // const wdwArray = [
  //   //   [1275, 1695],
  //   //   [1364, 1710],
  //   //   [1369, 1878],
  //   //   [1276, 1869],
  //   // ];
  //   // const destinationData = {
  //   //   windowWidth: 100,
  //   //   windowHeight: 130,
  //   // };

  //   // const wdwPts = [new Float32Array(wdwArray.flat())];
  //   // const calculated_matrix = calculateMatrix(srcPts);
  //   // console.log("calculated_matrix", calculated_matrix);
  //   // const calculated_ratio = calculateRatio(
  //   //   wdwPts,
  //   //   calculated_matrix,
  //   //   destinationData
  //   // );
  //   // console.log("calculated_ratio", calculated_ratio);

  //   // const re_calculated_matrix = calculateMatrix(srcPts, calculated_ratio);
  //   // const wdw_pts_calculated = calculateMatrix(wdwPts, re_calculated_matrix);
  //   // const output_image = warpPerspective(input_img, re_calculated_matrix);

  //  // cv.imshow("outputCanvas", output_image);

  //   input_img.delete();
  // };

  function calculateMatrix(srcPoints, wRatio = 1.0) {
    const dstOrigin = [srcPoints[0][0] * 1.0, srcPoints[0][1] * 1.0];
    const dstWidth = Math.floor(
      Math.sqrt(
        (srcPoints[1][0] - srcPoints[0][0]) ** 2 +
          (srcPoints[1][1] - srcPoints[0][1]) ** 2
      ) * wRatio
    );
    const dstHeight = Math.floor(
      Math.sqrt(
        (srcPoints[3][0] - srcPoints[0][0]) ** 2 +
          (srcPoints[3][1] - srcPoints[0][1]) ** 2
      )
    );

    const srcArray = srcPoints.map((pt) =>
      pt.map((coord) => parseFloat(coord))
    );
    const dstArray = [
      dstOrigin,
      [dstOrigin[0] + dstWidth, dstOrigin[1]],
      [dstOrigin[0] + dstWidth, dstOrigin[1] + dstHeight],
      [dstOrigin[0], dstOrigin[1] + dstHeight],
    ];

    const srcTri = cv.matFromArray(
      4,
      1,
      cv.CV_32FC2,
      new Float32Array(srcArray.flat())
    );
    const dstTri = cv.matFromArray(
      4,
      1,
      cv.CV_32FC2,
      new Float32Array(dstArray.flat())
    );

    return cv.getPerspectiveTransform(srcTri, dstTri);
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

  function refinePerspectiveTransform(inputPoints, output, perspectiveMatrix) {
    return perspectiveTransform(inputPoints, output, perspectiveMatrix);
  }

  function warpPerspective(sourceData, perspectiveMatrix) {
    const dstSize = [
      Math.round(sourceData.inputImage.shape[1] * 2.0),
      Math.round(sourceData.inputImage.shape[0] * 2.0),
    ];
    const output_image = cv.warpPerspective(
      sourceData.inputImage,
      perspectiveMatrix,
      dstSize
    );
    return output_image;
  }

  if (!cv) {
    <p>loading...</p>;
  }

  return (
    <div>
      <div id="app" className="p-3" ref={appRef}>
        <h1 className="font-bold">Perspective Transform</h1>

        {!cv ? (
          <h1>loading...</h1>
        ) : (
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
                style={{
                  background: "yellow",
                }}
                onClick={transform}
              >
                Transform
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PerspectiveTransform;
