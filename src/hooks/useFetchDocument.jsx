//FAZ O FETCH DO DOCUMENTO, COM BASE NO ID PASSADO PELA URL

import { useEffect, useState } from "react"
import { db } from "../firebase/config"
import { doc, getDoc } from "firebase/firestore"

export const useFetchDocument = (docCollection, docId) => {
    const [document, setDocument] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let isCancelled = false //Tratamento de memory leak
        const loadData = async () => {
            setLoading(true)
            setError(null)
            try {
                const ref = doc(db, docCollection, docId)
                const snap = await getDoc(ref)
                if(snap.exists() && !isCancelled) {
                    setDocument({id: snap.id, ...snap.data() })
                } else if (!isCancelled) {
                    setError('Documento não encontrado')
                }
            } catch (error) {
                if (!isCancelled) setError(error.message)
            } finally {
                if(!isCancelled) setLoading(false)
            }
        }
        loadData()

        return () => { isCancelled = true }
    }, [docCollection, docId])

    return { document, loading, error }
}