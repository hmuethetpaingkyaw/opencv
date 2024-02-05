import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { OpenCvProvider } from "opencv-react";
import D3OpenCVSelection from "./D3openCVSelection.tsx";
import RotateRegion from "./RotateRegion.tsx";
import PerspectiveTransformation from "./PerspectiveTransformation.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <OpenCvProvider>
      <App />
    </OpenCvProvider>
  </React.StrictMode>
);
