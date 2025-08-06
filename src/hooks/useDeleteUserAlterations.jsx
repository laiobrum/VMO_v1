import { collection, deleteDoc, doc, getDocs } from "firebase/firestore"
import { db } from "../firebase/config"
import { useState, useEffect } from "react"

export const useDeleteUserAlterations = ({ userId, leiId }) => {
  const [disps, setDisps] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const fetchDisps = async () => {
      if (!userId || !leiId) return
      try {
        const dispsRef = collection(db, "users", userId, "alteracoesUsuario", leiId, "disps")
        const snapshot = await getDocs(dispsRef)
        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setDisps(lista)
      } catch (e) {
        setErro(e.message)
      } finally {
        setCarregando(false)
      }
    }

    fetchDisps()
  }, [userId, leiId])

  const deletarSelecionados = async (idsParaExcluir) => {
    if (!userId || !leiId || !Array.isArray(idsParaExcluir)) return

    try {
      await Promise.all(
        idsParaExcluir.map(id => {
          const ref = doc(db, "users", userId, "alteracoesUsuario", leiId, "disps", id)
          return deleteDoc(ref)
        })
      )
      setDisps(disps => disps.filter(d => !idsParaExcluir.includes(d.id)))
    } catch (error) {
      console.error("Erro ao excluir alterações:", error)
      setErro("Erro ao excluir alterações")
    }
  }

  return { disps, carregando, erro, deletarSelecionados }
}
