// src/hooks/useLeiIdFromSlug.jsx
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../firebase/config"

export const useLeiIdAndSlug = () => {
  const { slug } = useParams()
  const [leiId, setLeiId] = useState(null)
  const [slugResolvido, setSlugResolvido] = useState(false)

  useEffect(() => {
    const fetchLeiIdFromSlug = async () => {
      try {
        const q = query(collection(db, "leis"), where("apelido", "==", slug));
        const snapshot = await getDocs(q);
        const docId = snapshot.docs[0]?.id;
        if (docId) {
          setLeiId(docId);
        } else {
          console.warn("Lei não encontrada com esse slug:", slug);
        }
      } catch (error) {
        console.error("Erro ao buscar lei pelo slug:", error);
      } finally {
        setSlugResolvido(true);
      }
    }

    fetchLeiIdFromSlug()
  }, [slug])

  return { leiId, slugResolvido }
}
