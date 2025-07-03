//FAZ O FETCH DA LEI CRIADA PELO USUÁRIO - CASO NÃO HAJA, FAZ O FETCH DA LEI ORIGINAL

import { doc, getDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../firebase/config"

export const useFetchUserDocument = ({ docCollection, docId, userId }) => {
    const [document, setDocument] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let isCancelled = false

        const loadData = async () => {
            setLoading(true)
            setError(null)

            try {
                const anotRef = doc(db, "anotacoesUsuario", `${userId}_${docId}`)
                const anotSnap = await getDoc(anotRef)

                if(!isCancelled && anotSnap.exists()) {
                    setDocument({
                        id: `${userId}_${docId}`,
                        textoRenderizado: anotSnap.data().textoEditado
                    })
                } else {
                    const leiRef = doc(db, docCollection, docId)
                    const leiSnap = await getDoc(leiRef)
                    if (!isCancelled && leiSnap.exists()) {
                        console.log("campo texto:", leiSnap.data().texto)
                        setDocument({
                            id: leiSnap.id,
                            textoRenderizado: leiSnap.data().texto
                        })
                    } else if (!isCancelled) {
                        setError("Documento não encontrado.")
                    }
                }
                
            } catch (error) {
                if(!isCancelled) setError(error.message)
                
            } finally {
                if (!isCancelled) setLoading(false)
            }
        }

        if(userId && docId) loadData()

        return () => {
            isCancelled = true
        }
    }, [docCollection, docId, userId])

    return { document, loading, error }
}