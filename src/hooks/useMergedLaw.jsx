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
          originalMap[doc.id] = { id: doc.id, html: doc.data().html }
        })

        alteredSnap.forEach(doc => {
          originalMap[doc.id] = { id: doc.id, html: doc.data().html } // substitui o original
        })

        const merged = Object.values(originalMap).sort((a, b) => {
          const getOrder = id => parseInt(id.match(/\d+/)?.[0] || 0)
          return getOrder(a.id) - getOrder(b.id)
        })

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
