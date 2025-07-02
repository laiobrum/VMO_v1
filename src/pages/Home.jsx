import { Link } from "react-router-dom"
import { useFetchDocuments } from "../hooks/useFetchDocuments"
import { useEffect } from "react"

const Home = () => {  

  return (
    <div>
        <h1>Home</h1>
        <h2>Acesso rápido</h2>

        <Link to='/leis/HJWkqTl8OkkUkCwWwYYO'><h3>Constituição Federal</h3></Link>
        <h3>Código Civil</h3>
        <h3>Código Penal</h3>
        <h3>Código de Processo Civil</h3>
        <br />
        <Link to="/leis"><h3>Todas as leis</h3></Link>
            
    </div>
  )
}

export default Home