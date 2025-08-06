import { NavLink } from "react-router-dom"

const AreaRestrita = () => {
  return (
    <div>
        <h2>Administração de conteúdo</h2>
        <NavLink className='a1' to='/insertlaws'>Incluir leis</NavLink>
        <br />
        <NavLink className='a1' to='/consulta-base-dados'>Consulta na base de dados</NavLink>
        <br />
        <NavLink className='a1' to='/excluir-alteracoes-user'>Excluir alterações</NavLink>
    </div>
  )
}

export default AreaRestrita