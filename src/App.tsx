import { useState, useRef } from "react";
import {  useOpenCv } from 'opencv-react'

function OpenCVReact() {
  const { loaded, cv } = useOpenCv()
  const [imageData, setImageData] = useState("");

  const MIN_CONTOURS_SCALE = 20;
  const THRESHOLD = 170;

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
    //const imageElement = imageRef.current;

    const imageElement = document.getElementById("image");
      const im = cv.imread(imageElement);
      const pts = getContoursPoints(im);

      if (pts) {
        const transformedIm = getTransformedImage(im, pts);
        cv.imshow("outputCanvas", transformedIm);
        console.log("Done!");
      } else {
        console.log("Failed...");
      }

      im.delete();
    
  };

  const getContoursPoints = (im) => {
    const imRectArea = im.cols * im.rows;
    let im_gray = new cv.Mat();
    cv.cvtColor(im, im_gray, cv.COLOR_RGBA2GRAY);

    let threshold_im = new cv.Mat();
    cv.threshold(im_gray, threshold_im, THRESHOLD, 255, cv.THRESH_BINARY);

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(
      threshold_im,
      contours,
      hierarchy,
      cv.RETR_CCOMP,
      cv.CHAIN_APPROX_SIMPLE
    );
    hierarchy.delete();

    let pts = null;
    let maxCntArea = 0;

    for (let i = 0; i < contours.size(); ++i) {
      let cnt = contours.get(i);
      const cntArea = cv.contourArea(cnt);
      const maxRectScale = parseInt((cntArea / imRectArea) * 100);

      if (maxRectScale >= MIN_CONTOURS_SCALE) {
        if (cntArea > maxCntArea) {
          let approx = new cv.Mat();
          const epsilon = 0.02 * cv.arcLength(cnt, true);
          cv.approxPolyDP(cnt, approx, epsilon, true);

          if (approx.size().height === 4) {
            maxCntArea = cntArea;
            pts = approx;
          }
        }
      }
    }

    contours.delete();
    im_gray.delete();
    threshold_im.delete();
    pts.convertTo(pts, cv.CV_32FC2);

    return pts;
  };

  const getTransformedImage = (im, fromPts) => {
    let transformedIm = new cv.Mat();
    const rows = im.rows;
    const cols = im.cols;
    let dsize = new cv.Size(cols, rows);
    const toPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
      cols,
      0,
      0,
      0,
      0,
      rows,
      cols,
      rows,
    ]);
    const M = cv.getPerspectiveTransform(fromPts, toPts);
    cv.warpPerspective(im, transformedIm, M, dsize);

    fromPts.delete();
    toPts.delete();
    return transformedIm;
  };

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


export default OpenCVReact;
