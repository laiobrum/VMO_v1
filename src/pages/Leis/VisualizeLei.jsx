import { doc, getDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { db } from "../../firebase/config"

const VisualizeLei = () => {
    const { leiId } = useParams()
    const [lei, setLei] = useState(null)

    useEffect(() => {
        const fetchLei = async () => {
            const ref = doc(db, 'leis', leiId)
            const snap = await getDoc(ref)
            if (snap.exists()) setLei(snap.data())
        }
        fetchLei()
    }, leiId)
    
    if (!lei) return <p>Carregando...</p>

    return (
        <div>
            <h2>{lei.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: lei.texto }}/>
        </div>
    )
}

export default VisualizeLei