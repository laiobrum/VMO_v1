import { doc, setDoc } from "firebase/firestore"
import { db } from "../firebase/config"

export const useSaveUserAlterations = ({ bookRef, userId, leiId}) => {
    const save = async () => {
        if(!bookRef?.current || !userId || !leiId) return

        const html = bookRef.current.innerHTML
        const ref = doc(db, "anotacoesUsuario", `${userId}_${leiId}`)
        await setDoc(ref, {
            userId,
            leiId,
            textoEditado: html,
            atualizadoEm: new Date()
        })
    }

    return save
}