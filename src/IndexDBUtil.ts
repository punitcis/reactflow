const DB_NAME = "ReactIndexedDBExample";
const STORE_NAME = "nodeData";

const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1);

    request.onerror = (event) => {
      reject("Error opening database");
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
  });
};

const addnodeData = async (nodeData: any[]): Promise<number[]> => {
    const db = await openDatabase();
  
    return Promise.all(
      nodeData.map(async (userData) => {
        return new Promise<number>((resolve, reject) => {
          const transaction = db.transaction([STORE_NAME], "readwrite");
          const objectStore = transaction.objectStore(STORE_NAME);
  
          const request = objectStore.add(userData);
  
          request.onsuccess = (event) => {
            const resultKey: number = (event.target as IDBRequest<IDBValidKey>).result as number;
            resolve(resultKey);
          };
  
          request.onerror = (event) => {
            reject(`Error adding user data: ${(event.target as IDBRequest).error}`);
          };
        });
      })
    );
  };

const getAllnodeData = async (): Promise<any[]> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const objectStore = transaction.objectStore(STORE_NAME);

    const request = objectStore.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      reject(`Error getting user data: ${(event.target as IDBRequest).error}`);
    };
  });
};

export { addnodeData, getAllnodeData };
