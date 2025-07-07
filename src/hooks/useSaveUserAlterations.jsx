import { doc, setDoc } from "firebase/firestore"
import { db } from "../firebase/config"

export const useSaveUserAlterations = ({ bookRef, userId, leiId }) => {
  
  const save = async () => {    
    try {
      const paragraphs = Array.from(
        bookRef.current.querySelectorAll(".column > p, .column > div")
      )
      const html = paragraphs.map(p => p.outerHTML).join("\n")

      const ref = doc(db, "anotacoesUsuario", `${userId}_${leiId}`)
      await setDoc(ref, {
        userId,
        leiId,
        textoEditado: html,
        atualizadoEm: new Date()
      })

    } catch (error) {
      console.log(error.message)
    }
  }

  return save
}