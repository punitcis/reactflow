import React, { useState } from "react";

import DnDFlow from "./DnDFlow";

import "./style.css";

// const onElementClick = (event, element) => console.log("click", element);
// const onLoad = (reactFlowInstance) =>
// console.log("flow loaded:", reactFlowInstance);

const App = () => {
  // const [elements, setElements] = useState(initialElements);
  // const onConnect = (params) => setElements((els) => addEdge(params, els));
  // const onElementsRemove = (elementsToRemove) =>
  // setElements((els) => removeElements(elementsToRemove, els));

  return (
    <div className="dndflow-wrapper">
      <DnDFlow />
    </div>
  );
};

export default App;
