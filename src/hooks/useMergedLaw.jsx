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

        const originalMap = {}
        originalSnap.forEach(doc => {
          const data = doc.data()
          originalMap[doc.id] = { id: doc.id, html: data.html, ordem: data.ordem }
        })

        alteredSnap.forEach(doc => {
          const data = doc.data()
          if (originalMap[doc.id]) {
            originalMap[doc.id] = {
              id: doc.id,
              html: data.html,
              ordem: originalMap[doc.id].ordem  // mantém a ordem do original
            }
          } else {
            // caso raro: alteração do usuário sem documento original
            originalMap[doc.id] = {
              id: doc.id,
              html: data.html,
              ordem: 99999 // joga pro final, mas você pode escolher outro critério
            }
          }
        })

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
