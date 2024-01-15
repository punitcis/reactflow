import React, { useEffect, useState } from "react";

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
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOffline(!navigator.onLine);
      setIsVisible(true);

      // Hide the tag after 3 seconds when the user comes back online
      if (navigator.onLine) {
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }
    };

    const hideOfflineTag = () => {
      // Hide the tag after 3 seconds when the user is offline
      if (!navigator.onLine) {
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', hideOfflineTag);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', hideOfflineTag);
    };
  }, []);
console.log("WHATS WROMG!!!!" , isOffline)
  return (
    <div className="dndflow-wrapper">
      <div style={{ backgroundColor: 'red', color: 'white', padding: '10px', textAlign: 'center' }}>
    
          <div style={{ backgroundColor: 'red', color: 'white', padding: '10px', textAlign: 'center' }}>
            {isOffline ? 'You are currently offline.' : 'You are online.'}
          </div>
      
      </div>
      <DnDFlow />
    </div>
  );
};

export default App;
