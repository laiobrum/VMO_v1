import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase/config"

export const useMergedLaw = ({ userId, leiId }) => {
  const [mergedDisps, setMergedDisps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const originalRef = collection(db, "leis", leiId, "disps")
        const alteredRef = collection(db, "users", userId, "alteracoesUsuario", leiId, "disps")

        const [originalSnap, alteredSnap] = await Promise.all([
          getDocs(originalRef),
          getDocs(alteredRef)
        ])

        //Mapeamento do texto de lei original
        const originalMap = {}
        originalSnap.forEach(doc => {
          const data = doc.data()
          originalMap[doc.id] = { id: doc.id, html: data.html, ordem: data.ordem }
        })

        //Mapeamento das alterações presentes no BD
        alteredSnap.forEach(doc => {
          const data = doc.data()
          //Se houver uma alteração para um id existente, ela substitui o html, mas mantém a ordem original.
          if (originalMap[doc.id]) {
            originalMap[doc.id] = {
              id: doc.id,
              html: data.html, //ALTERADO - troca o html, se tiver dentro do DB de alterados
              ordem: originalMap[doc.id].ordem  // mantém a ordem do original
            }
          } else {
            // caso raro: Se a alteração não tiver correspondente no original, é adicionada com ordem = 99999 (vai pro final).
            originalMap[doc.id] = {
              id: doc.id,
              html: data.html,
              ordem: 99999 // joga pro final, mas você pode escolher outro critério
            }
          }
        })

        //Converte o originalMap em array, ordena pela ordem e armazena em mergedDisps.
        const merged = Object.values(originalMap).sort((a, b) => a.ordem - b.ordem)
        setMergedDisps(merged)
      } catch (err) {
        console.error("Erro ao mesclar dispositivos:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (userId && leiId) fetchData()
  }, [userId, leiId])

  return { mergedDisps, loading, error }
}
