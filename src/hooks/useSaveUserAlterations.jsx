import { doc, setDoc } from "firebase/firestore"
import { useEffect, useRef } from "react"
import { db } from "../firebase/config"

export const useSaveUserAlterations = ({ bookRef, userId, leiId}) => {
    const intervalRef = useRef(null)

    useEffect(() => {
        if(!bookRef?.current || !userId || !leiId) return

        const save = async () => {
            const html = bookRef.current.innerHTML
            const ref = doc(db, "anotacoesUsuario", `${userId}_${leiId}`)
            await setDoc(ref, {
                userId,
                leiId,
                textoEditado: html,
                atualizadoEm: new Date()
            })
        }

        intervalRef.current = setInterval(save, 3000)

        return () => {
            clearInterval(intervalRef.current)
        }
    }, [bookRef, userId, leiId])
}