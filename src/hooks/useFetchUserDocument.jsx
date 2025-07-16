//FAZ O FETCH DA LEI CRIADA PELO USUÁRIO - CASO NÃO HAJA, FAZ O FETCH DA LEI ORIGINAL

import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../firebase/config"

export const useFetchUserDocument = ({ docCollection, userId, subCollection, leiId }) => {
    const [document, setDocument] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
    let isCancelled = false

        const loadData = async () => {
            setLoading(true)
            setError(null)

            try {
                // 1. Busca anotação do usuário (se houver)
                const anotRef = doc(db, docCollection, userId, subCollection, leiId)
                const anotSnap = await getDoc(anotRef)

                if(!isCancelled && anotSnap.exists()) {
                    const data = anotSnap.data()
                    if(data.textoEditado !== "") {
                        setDocument({ id: `${userId}_${leiId}`, textoRenderizado: data.textoEditado })
                        return
                    }
                }

                // 2. Busca lei original como <p> fragmentado
                const dispsRef = collection(db, 'leis', leiId, 'disps')
                const q = query(dispsRef, orderBy('ordem'))
                const dispsSnap = await getDocs(q)

                if(!isCancelled && !dispsSnap.empty) {
                    const html = dispsSnap.docs.map(doc => doc.data().html).join('\n')
                    setDocument({id: leiId, textoRenderizado: html})
                } else if (!isCancelled) {
                    setError("Documento não encontrado")
                }
            } catch (error) {
                if (!isCancelled) {
                    console.error("Erro ao carregar dados:", error)
                    setError(error.message)
                }
            } finally {
                if (!isCancelled) setLoading(false)
            }
        }

        if (userId && leiId) loadData()

        return () => {
            isCancelled = true
        }
    }, [docCollection, leiId, userId, subCollection])

    return { document, loading, error }
}

            // Se existe anotação na lei, pega aqui
            // const anotRef = doc(db, docCollection, userId, subCollection, leiId)
            // const anotSnap = await getDoc(anotRef)

            // if (!isCancelled && anotSnap.exists()) {
            //     const data = anotSnap.data()
            //     if (data.textoEditado !== "") {
            //         setDocument({
            //             id: `${userId}_${leiId}`,
            //             textoRenderizado: data.textoEditado
            //         })
            //         return
            //     }
            // }

//             // Se não existe anotação ou textoEditado é vazio, busca a lei original
//             const leiRef = doc(db, 'leis', leiId)
//             const leiSnap = await getDoc(leiRef)

//             if (!isCancelled && leiSnap.exists()) {
//                 setDocument({
//                     id: leiSnap.id,
//                     textoRenderizado: leiSnap.data().texto
//                 })
//             } else if (!isCancelled) {
//                 setError("Documento não encontrado.")
//             }
//                 } catch (error) {
//                     if (!isCancelled) {
//                         console.error("Erro ao carregar dados:", error)
//                         setError(error.message)
//                     }
//                 } finally {
//                     if (!isCancelled) setLoading(false)
//                 }
//             }

//             if (userId && leiId) loadData()

//             return () => {
//                 isCancelled = true
//             }
//         }, [docCollection, leiId, userId, subCollection])

//     return { document, loading, error }
// }