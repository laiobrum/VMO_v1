import { Link, NavLink } from "react-router-dom"
import { useFetchDocuments } from "../hooks/useFetchDocuments"
import TiptapEditor from "../components/TiptapEditor"
import Testes from "../components/Testes"
import { useAuthValue } from "../context/AuthContext"

const Home = () => {  
  const { documents: leis, loading } = useFetchDocuments('leis') 
  const { user } = useAuthValue()

  return (
    <div>
        <h1>Home</h1>
        <h2>Acesso rápido</h2>

        <div className="leisContainer">
          {loading && <li>Carregando...</li>}
            {leis.map((lei) => (
                <p key={lei.id}>
                    <NavLink to={`/leis/${lei.apelido}`}>{lei.aTitle}</NavLink>
                </p>
            ))}
        </div>

        <h3>Constituição Federal</h3>
        <h3>Código Civil</h3>
        <h3>Código Penal</h3>
        <h3>Código de Processo Civil</h3>
        <br />
        <Link to="/leis"><h3>Todas as leis</h3></Link>

        <br /> 
        <br />


    </div>
  )
}

export default Home