import React from "react";
import ReactDOM from "react-dom/client";
import popupCss from "./popup.css";
import { PopupApp } from "./PopupApp";

const style = document.createElement("style");
style.textContent = popupCss;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PopupApp />
  </React.StrictMode>
);
