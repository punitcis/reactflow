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


interface NodeInterface {
  id: string;
  type: string;
  data: {
    label: string;
  };
  sourcePosition: string;
  targetPosition: string;
  position: {
    x: number;
    y: number;
  };
}

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
  console.log("============THIS IS THE ELEMENTS=============", elements)
  const buttonStyle: any = {
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
    if (navigator.onLine) {
      fetchNodes()
    }
    else {
      getAllData();
    }



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
    const filteredelements = elements.filter((item:any) => !('source' in item && 'target' in item));
    const edges = elements
    .filter((item:any) => 'source' in item && 'target' in item) // Filter only edge objects
    .map((edge:any) => ({
        id: edge.id,
        sourceHandle: null,
        targetHandle:null,
        source: edge.source,
        target: edge.target,
        type: edge.type || 'default', // Set a default type if not provided
    }));

    if (navigator.onLine) {
      try {
        const response = await fetch('http://localhost:3001/api/nodes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ graphId: "65a135f8dacb82f0ab433f29", nodes: filteredelements , edges:edges }),
        });

        if (response.ok) {
          console.log('Node added successfully');
          alert("Successfully added to backend but we will added locally for backup")
          try {
            const resultKeys: number[] = await addnodeData(elements);
            console.log("Successfully added user data with keys:", resultKeys);
            alert("You are offline but don't worry we have saved your data locally")
          } catch (error) {
            console.error("Error adding user data:", error);
          }
        } else {
          console.error('Failed to add node:', response.statusText);
        }
      } catch (error: any) {
        console.error('Error adding node:', error.message);
      }
    }
    else {
      try {
        const resultKeys: number[] = await addnodeData(elements);
        console.log("Successfully added user data with keys:", resultKeys);
        alert("You are offline but don't worry we have saved your data locally")
      } catch (error) {
        console.error("Error adding user data:", error);
      }
    }

  };


  const fetchNodes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/nodes');
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      setElements(data);
    } catch (error) {
      console.error('Error fetching nodes:', error);
    }
  };

  const onLoad: any = (_reactFlowInstance: ReactFlowInstance) => {
    setReactFlowInstance(_reactFlowInstance);
  };

  // const onConnect: ReactFlowProps['onConnect'] = (params) => setElements((els:any) => addEdge(params, els));


  const onConnect: ReactFlowProps['onConnect'] = useCallback((params: any) => {
    setElements((els: any) => addEdge(params, els))
  }, [])

  const onElementsRemove: ReactFlowProps['onElementsRemove'] = (elementsToRemove) =>
    setElements((els: any) => removeElements(elementsToRemove, els));

  const onNodeDoubleClick: ReactFlowProps['onNodeDoubleClick'] = (event, node) => {
    // node.data.label = "This is it";
    console.log("THIS IS MY NODE", node);
  };

  // const onDragOver: ReactFlowProps['onDragOver'] = (event) => {
  //   event.preventDefault();
  //   event.dataTransfer.dropEffect = "move";
  // };

  const onDragOver: ReactFlowProps['onDragOver'] = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, [])





  const onDrop: ReactFlowProps['onDrop'] = useCallback((event: any) => {
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
  }, [reactFlowInstance])


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
            elements={elements.length>0?elements:[]}
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
