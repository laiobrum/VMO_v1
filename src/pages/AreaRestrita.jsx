import { NavLink } from "react-router-dom"

const AreaRestrita = () => {
  return (
    <div>
        <h2>Administração de conteúdo</h2>
        <NavLink className='a1' to='/insertlaws'>Incluir leis</NavLink>
        <br />
        <NavLink className='a1' to='/conserto-base-dados'>Conserto na base de dados</NavLink>
    </div>
  )
}

export default AreaRestrita