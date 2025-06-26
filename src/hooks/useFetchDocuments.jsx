
// export const useFetchDocuments = (docCollection) => {}

// useEffect(() => {
//         const fetchLeis = async () => {
//             const ref = collection(db, docCollection)
//             const snap = await getDocs(ref)
//             const lista = snap.docs.map(doc => ({
//                 id: doc.id,
//                 ...doc.data()
//             }))
//             setLeis(lista)
//         }
//         fetchLeis()
//     }, [])