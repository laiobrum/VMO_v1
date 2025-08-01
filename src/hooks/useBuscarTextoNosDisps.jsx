import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

export function useBuscarTextoNosDisps(leiId, termoBusca) {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!leiId || !termoBusca) return;

    async function buscar() {
      setLoading(true);
      const refDisps = collection(db, `leis/${leiId}/disps`);
      const snapshot = await getDocs(refDisps);

      const encontrados = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.html && data.html.includes(termoBusca)) {
          encontrados.push({
            id: doc.id,
            html: data.html,
          });
        }
      });

      setResultados(encontrados);
      setLoading(false);
    }

    buscar();
  }, [leiId, termoBusca]);

  return { resultados, loading };
}
