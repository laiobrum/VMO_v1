import { doc, setDoc } from "firebase/firestore"
import { db } from "../firebase/config"

export const useSaveUserAlterations = ({ bookRef, userId, leiId }) => {
    const save = async () => {
        try {
            const html = bookRef.current.innerHTML
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