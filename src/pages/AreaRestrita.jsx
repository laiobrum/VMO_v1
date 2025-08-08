import { NavLink } from "react-router-dom"

const AreaRestrita = () => {
  return (
    <div className="area-restrita">
        <h2>Administração de conteúdo</h2>

        <div className="card-container">

          <NavLink className="card" to="/insertlaws">
            <h3>Incluir leis</h3>
            <p>Cadastrar novas leis e dispositivos na base.</p>
          </NavLink>

          <NavLink className="card" to="/consulta-base-dados">
            <h3>Consulta na base de dados</h3>
            <p>Pesquisar e visualizar leis cadastradas.</p>
          </NavLink>

          <NavLink className="card" to="/excluir-alteracoes-user">
            <h3>Excluir alterações</h3>
            <p>Remover edições feitas por usuários.</p>
          </NavLink>

          <NavLink className="card" to="/editar-lei-admin">
            <h3>Alterar texto da lei</h3>
            <p>Revogações, alterações e inclusões de texto legal.</p>
          </NavLink>

        </div>

    </div>
  )
}

export default AreaRestrita