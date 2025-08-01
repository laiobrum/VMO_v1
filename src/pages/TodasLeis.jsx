import { NavLink } from 'react-router-dom'
import { useFetchDocuments } from '../hooks/useFetchDocuments'

const TodasLeis = () => {
    const { documents: leis, loading, error } = useFetchDocuments('leis')


  return (
    <div>
        <h1>Todas as leis</h1>
        <div className='fixedToolbar'>
            {loading && <p>Carregando...</p>}
            {error && <p>Ocorreu algum erro</p>}
        </div>

        <div className="leisContainer">
            {leis.map((lei) => (
                <p key={lei.id}>
                    <NavLink to={`/leis/${lei.apelido}`}>{lei.aTitle}</NavLink>
                </p>
            ))}
        </div>
    </div>
  )
}

export default TodasLeis