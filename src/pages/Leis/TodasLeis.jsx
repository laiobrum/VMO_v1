import { NavLink } from 'react-router-dom'
import { useFetchDocuments } from '../../hooks/useFetchDocuments'

const TodasLeis = () => {
    const { documents: leis, loading, error } = useFetchDocuments('leis')


  return (
    <div>
        <h1>Todas as leis</h1>
        <div className='fixedToolbar'>
            {loading && <p>Carregando...</p>}
            {error && <p>Ocorreu algum erro</p>}
        </div>

        <ul>
            {leis.map((lei) => (
                <li key={lei.id}>
                    <NavLink to={`/leis/${lei.id}`}>{lei.aTitle}</NavLink>
                </li>
            ))}
        </ul>
    </div>
  )
}

export default TodasLeis