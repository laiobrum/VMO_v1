import { useAuthValue } from "../context/AuthContext"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "../firebase/config"
import { useEffect, useState } from "react"
import { NavLink } from "react-router-dom"

const LeisUsuario = () => {
  const { user } = useAuthValue()
  const [leisEditadas, setLeisEditadas] = useState([])
  const [loading, setLoading] = useState(true)

  //FALTA TRANSFORMAR ISSO NUM HOOK!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  useEffect(() => {
    const fetchLeisEditadas = async () => {
      if (!user) return

      try {
        const leisRef = collection(db, `users/${user.uid}/alteracoesUsuario`)
        const snapshot = await getDocs(leisRef)

        const ids = snapshot.docs.map(doc => doc.id)
        console.log(ids)

        const leis = await Promise.all(ids.map(async (leiId) => {
          const leiRef = doc(db, "leis", leiId)
          const leiSnap = await getDoc(leiRef)
          if (leiSnap.exists()) {
            const leiData = leiSnap.data()
            return {
              id: leiId,
              apelido: leiData.apelido || leiId,
              aTitle: leiData.aTitle || "Lei sem título"
            }
          }
          return null
        }))

        setLeisEditadas(leis.filter(Boolean)) // Remove nulls
      } catch (error) {
        console.error("Erro ao buscar leis editadas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeisEditadas()
  }, [user])

  return (
    <div>
      <h1>Minhas Leis Editadas</h1>

      {loading && <p>Carregando...</p>}

      {!loading && leisEditadas.length === 0 && <p>Você ainda não editou nenhuma lei.</p>}

      <div className="leisContainer">
        {leisEditadas.map((lei) => (
          <p key={lei.id}>
            <NavLink to={`/leis/${lei.apelido}`}>{lei.aTitle}</NavLink>
          </p>
        ))}
      </div>
    </div>
  )
}

export default LeisUsuario
