import { doc, setDoc } from "firebase/firestore"
import { db } from "../firebase/config"
import { useState } from "react"

export const useSaveUserAlterations = ({ bookRef, userId, leiId }) => {
  const [salvando, setSalvando] = useState(null)
  
  const save = async () => {   
    try {
      setSalvando(true) 
      const paragraphs = Array.from(bookRef.current.querySelectorAll(".column > p, .column > div"))
      const html = paragraphs.map(p => p.outerHTML).join("\n")

      const ref = doc(db, "users", userId, "anotacoesUsuario", leiId)
      await setDoc(ref, {
        leiId,
        textoEditado: html,
        atualizadoEm: new Date()
      })
      setSalvando(false)
    } catch (error) {
      console.log(error.message)
    }
  }

  return {save, salvando}
}