import { collection, doc, updateDoc } from "firebase/firestore"
import { useState } from "react"
import { db } from "../firebase/config"
import { useLeiIdAndSlug } from "./useLeiIdAndSlug"

export const useSaveDispositivo = (hoveredP) => {
  const [salvando, setSalvando] = useState(false)
  const {leiId} = useLeiIdAndSlug()

  const salvarDispositivo = async ({ correcao }) => {
    if(!leiId || !hoveredP.id) return
    try {
      setSalvando(true)
      const docRef = doc(db, 'leis', leiId, 'disps', hoveredP.id)
      await updateDoc(docRef, {
        html: correcao
      })
    } catch (error) {
      console.error("Erro ao salvar:", error)
    } finally {
      setSalvando(false)
    }
  }

  return { salvarDispositivo, salvando }
}