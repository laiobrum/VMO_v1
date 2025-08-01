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
        const originalSnap = await getDocs(originalRef)

        // Mapeia os dispositivos originais
        const originalMap = {}
        originalSnap.forEach(doc => {
          const data = doc.data()
          originalMap[doc.id] = { id: doc.id, html: data.html, ordem: data.ordem }
        })

        // Se o usuário estiver logado, tenta buscar alterações
        if (userId) {
          const alteredRef = collection(db, "users", userId, "alteracoesUsuario", leiId, "disps")
          const alteredSnap = await getDocs(alteredRef)

          alteredSnap.forEach(doc => {
            const data = doc.data()
            const comentarioHTML = data.comentario ? data.comentario : ''
            const novoHtml = (data.html || "") + comentarioHTML

            if (originalMap[doc.id]) {
              originalMap[doc.id] = {
                id: doc.id,
                html: novoHtml,
                ordem: originalMap[doc.id].ordem
              }
            } else {
              originalMap[doc.id] = {
                id: doc.id,
                html: novoHtml,
                ordem: 99999
              }
            }
          })
        }

        const merged = Object.values(originalMap).sort((a, b) => a.ordem - b.ordem)
        setMergedDisps(merged)
      } catch (err) {
        console.error("Erro ao mesclar dispositivos:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (leiId) fetchData() // Agora roda mesmo sem userId
  }, [userId, leiId])

  return { mergedDisps, loading, error }
}
