import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";

export const useAdminAccess = (user) => {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    if (user === undefined) {
      setIsAdmin(null);
      return;
    }
    if (!user) {
      setIsAdmin(false);
      return;
    }

    const checkRole = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsAdmin(data.role?.toLowerCase() === "admin");
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Erro ao verificar role:", error);
        setIsAdmin(false);
      }
    };

    checkRole();
  }, [user]);

  return { isAdmin };
};