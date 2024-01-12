// @ts-ignore
import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  removeElements,
  Node,
  Edge,
  OnLoadParams,
  ReactFlowProps
} from "react-flow-renderer";

import Sidebar from "./Sidebar";
import clientData from "./clientData.json";
import { ReactFlowInstance, ReactFlowProvider } from "reactflow";
import { addnodeData, getAllnodeData } from "./IndexDBUtil";

const initialElements = [
  {
    id: "1",
    type: "input",
    data: { label: "input node" },
    sourcePosition: "right",
    targetPosition: "left",
    position: { x: 250, y: 5 }
  }
];

interface ValueChainComponent {
  cost: number;
  label: string;
  childOf: string | null;
  currency: string;
  emission: string;
}

interface ValueChain {
  [key: string]: ValueChainComponent;
}

const generateNodesFromValueChain = (valueChain: ValueChain): Node[] => {
  const elements: any[] = [];
  const valueChainSize = Object.keys(valueChain).length;
  const firstNodeXPosition = window.innerWidth / valueChainSize;
  const firstNodeYPosition = window.innerHeight / valueChainSize;
  let positionIncrementCount = 1;

  for (const valueChainItem in valueChain) {
    if (Object.hasOwnProperty.call(valueChain, valueChainItem)) {
      const element = valueChain[valueChainItem];
      const position = {
        x: firstNodeXPosition * positionIncrementCount,
        y: firstNodeYPosition * positionIncrementCount
      };
      positionIncrementCount++;

      elements.push({
        id: valueChainItem,
        type: element.childOf ? "default" : "output",
        data: { label: element.label },
        position,
        sourcePosition: element.childOf ? undefined : "right", // Adjusted this line
        targetPosition: "left"
      });
    }
  }

  return elements;
};

const generateEdgesFromValueChain = (valueChain: ValueChain): Edge[] => {
  const elements: Edge[] = [];
  for (const valueChainItem in valueChain) {
    if (Object.hasOwnProperty.call(valueChain, valueChainItem)) {
      const element = valueChain[valueChainItem];
      if (element.childOf) {
        elements.push({
          id: `edge-${valueChainItem}-${element.childOf}`,
          source: valueChainItem,
          target: element.childOf,
          type: "smoothstep"
        });
      }
    }
  }

  return elements;
};

const DnDFlow = () => {
  const [paneMoveable, setPaneMoveable] = useState(false);
  const [panOnScroll, setPanOnScroll] = useState(true);
  const reactFlowWrapper = useRef<any>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null | any>(null);
  const [elements, setElements] = useState<any>(initialElements);
console.log("============THIS IS THE ELEMENTS=============",elements)
const buttonStyle:any = {
  padding: '10px 20px',
  fontSize: '16px',
  fontWeight: 'bold',
  textAlign: 'center',
  textDecoration: 'none',
  cursor: 'pointer',
  border: '2px solid #3498db',
  color: '#3498db',
  backgroundColor: '#fff',
  borderRadius: '5px',
  transition: 'background-color 0.3s, color 0.3s',
};

useEffect(() => {
  getAllData();
}, []);

const getAllData = async () => {
  try {
    const data = await getAllnodeData();
    setElements(data);
  } catch (error) {
    console.error(error);
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const resultKeys: number[] = await addnodeData(elements);
    console.log("Successfully added user data with keys:", resultKeys);
  } catch (error) {
    console.error("Error adding user data:", error);
  }
};

  const onLoad: any = (_reactFlowInstance: ReactFlowInstance) => {
    setReactFlowInstance(_reactFlowInstance);

    // Set Nodes
    setElements((es :any) =>
      es.concat(generateNodesFromValueChain(clientData.valueChain))
    );
    // Set Edges
    setElements((es:any) =>
      es.concat(generateEdgesFromValueChain(clientData.valueChain))
    );
  };

  const onConnect: ReactFlowProps['onConnect'] = (params) => setElements((els:any) => addEdge(params, els));
  
  const onElementsRemove: ReactFlowProps['onElementsRemove'] = (elementsToRemove) =>
    setElements((els:any) => removeElements(elementsToRemove, els));

  const onNodeDoubleClick: ReactFlowProps['onNodeDoubleClick'] = (event, node) => {
    // node.data.label = "This is it";
    console.log("THIS IS MY NODE",node);
  };

  const onDragOver: ReactFlowProps['onDragOver'] = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };


const onDrop: ReactFlowProps['onDrop'] = useCallback((event:any)=>{
  event.preventDefault();
  
  const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
  const type = event.dataTransfer.getData("application/reactflow");

  // Adjust position calculation based on the drag event
  // const position = reactFlowInstance.project({
  //   x: event.clientX - reactFlowBounds.left - reactFlowInstance.translateX,
  //   y: event.clientY - reactFlowBounds.top - reactFlowInstance.translateY,
  // });
  const position = reactFlowInstance.project({
    x: event.clientX,
    y: event.clientY,
  });

  const newNode = {
    id: getId(),
    type,
    position,
    sourcePosition: "right",
    targetPosition: "left",
    data: { label: `${type} node` },
  };

  setElements((es: any) => es.concat(newNode));
},[reactFlowInstance])


  // const onDrop: ReactFlowProps['onDrop'] = (event) => {
  //   event.preventDefault();
  
  //   const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
  //   const type = event.dataTransfer.getData("application/reactflow");
  
  //   // Adjust position calculation based on the drag event
  //   // const position = reactFlowInstance.project({
  //   //   x: event.clientX - reactFlowBounds.left - reactFlowInstance.translateX,
  //   //   y: event.clientY - reactFlowBounds.top - reactFlowInstance.translateY,
  //   // });
  //   const position = reactFlowInstance.project({
  //     x: event.clientX,
  //     y: event.clientY,
  //   });
  
  //   const newNode = {
  //     id: getId(),
  //     type,
  //     position,
  //     sourcePosition: "right",
  //     targetPosition: "left",
  //     data: { label: `${type} node` },
  //   };
  
  //   setElements((es: any) => es.concat(newNode));
  // };
  const getId = () => `dndnode_${id++}`;
  let id = 0;

  return (
    <div className="dndflow">
      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            elements={elements}
            onConnect={onConnect}
            onElementsRemove={onElementsRemove}
            onLoad={onLoad}
            onDrop={onDrop}
            onDragOver={onDragOver}
            paneMoveable={paneMoveable}
            panOnScroll={panOnScroll}
            snapToGrid={true}
            onNodeDoubleClick={onNodeDoubleClick}
          >
            <Controls />
            <Background variant={"lines" as any} />
          </ReactFlow>
        </div>
        <Sidebar />
        <button style={buttonStyle} onClick={handleSubmit}>
      Save State Locally
    </button>
      </ReactFlowProvider>
    </div>
  );
};

export default DnDFlow;
