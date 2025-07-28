import React, { useState } from 'react'
import { db } from '../firebase/config'
import { collection, getDocs } from 'firebase/firestore'

export const useFetchOriginalLei = () => {
    const [error, setError] = useState(null)
    const [loadingOriginal, setLoadingOriginal] = useState(false)

    const fetchOriginal = async (leiId) => {
        if (!leiId) return []
        try {
            setLoadingOriginal(true)
            setError(null)
            const ref = collection(db, 'leis', leiId, 'disps')
            const snap = await getDocs(ref)

            const lei = snap.docs.map(doc => ({
                ordem: doc.data().ordem ?? 99999,
                id: doc.id,
                html: doc.data().html
            }))

            lei.sort((a, b) => a.ordem - b.ordem)
            
            return lei            

        } catch (error) {
            console.error(error)
            setError(error.message)
            return []
        } finally {
            setLoadingOriginal(false)
        }

    }


    return {fetchOriginal, loadingOriginal, error}

}
  


