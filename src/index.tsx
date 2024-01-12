import { StrictMode } from "react";
import ReactDOM from "react-dom";

import ProviderFlow from "./App";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <ProviderFlow />
  </StrictMode>,
  rootElement
);
