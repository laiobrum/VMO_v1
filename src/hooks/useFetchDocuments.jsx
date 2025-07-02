//FAZ O FETCH DE TODOS OS DOCUMENTOS DE QUALQUER COLEÇÃO - BEM AMPLO

import { collection, getDocs } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../firebase/config"

//Pega QUALQUER COLEÇÃO. No momento eu só tenho "leis", mas posso usar o hook para outras também!
export const useFetchDocuments = (docCollection) => {
    const [documents, setDocuments] = useState([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let isCancelled = false //Tratamento de memory leak

        const loadData = async () => {
            setLoading(true)
            setError(null)
            try {
                const ref = collection(db, docCollection)
                const snap = await getDocs(ref)
                const lista = snap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                if (!isCancelled) setDocuments(lista)
            } catch (error) {
                if (!isCancelled) setError(error.message)
            } finally {
                if (!isCancelled) setLoading(false)
            }
        }
        loadData()
        
        return () => { isCancelled = true }
    }, [docCollection])

    return { documents, loading, error }

}