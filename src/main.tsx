import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { OpenCvProvider } from "opencv-react";
import PerspectiveTransform from "./PerspectiveTransform.tsx";
import ThreeDAffine from "./3DAffine.tsx";
import Testing from "./Testing.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <OpenCvProvider>
      <Testing />
    </OpenCvProvider>
  </React.StrictMode>
);
