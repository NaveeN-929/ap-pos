import { openDB } from "idb";

const dbPromise = openDB("pos-db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("sales")) {
      db.createObjectStore("sales", { keyPath: "id", autoIncrement: true });
    }
  },
});

export const addSale = async (sale) => {
  const db = await dbPromise;
  await db.add("sales", sale);
};

export const getSales = async () => {
  const db = await dbPromise;
  return db.getAll("sales");
};
