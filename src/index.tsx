import { StrictMode } from "react";
import ReactDOM from "react-dom";

import ProviderFlow from "./App";

// index.tsx
// index.js

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}

// Your React app initialization code here



const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <ProviderFlow />
  </StrictMode>,
  rootElement
);
