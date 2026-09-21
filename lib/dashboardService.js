import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "./firebase";

export async function getDashboardStats() {

  const today = new Date().toISOString().split("T")[0];

  const visitorQuery = query(
    collection(db, "VisitorPasses"),
    where("visitDate", "==", today)
  );

  const snapshot = await getDocs(visitorQuery);

  let total = 0;
  let inside = 0;
  let denied = 0;

  snapshot.forEach((doc) => {

    const data = doc.data();

    total++;

    if (data.used) inside++;

    if (data.status === "DENIED") denied++;

  });

  return {
    total,
    inside,
    denied,
  };
}