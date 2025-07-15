import { Link, NavLink } from "react-router-dom"
import { useFetchDocuments } from "../hooks/useFetchDocuments"

const Home = () => {  
  const { documents: leis, loading } = useFetchDocuments('leis') 

  return (
    <div>
        <h1>Home</h1>
        <h2>Acesso rápido</h2>

        <ul>
          {loading && <li>Carregando...</li>}
            {leis.map((lei) => (
                <li key={lei.id}>
                    <NavLink to={`/leis/${lei.id}`}>{lei.aTitle}</NavLink>
                </li>
            ))}
        </ul>

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