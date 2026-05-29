import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import "./index.css";

const testStyle = document.createElement("style");
testStyle.innerHTML = `
  html, body, #root {
    background: red !important;
  }
`;
document.head.appendChild(testStyle);

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);