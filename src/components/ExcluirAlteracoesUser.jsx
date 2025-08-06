import { useState } from "react"
import { useDeleteUserAlterations } from "../hooks/useDeleteUserAlterations"

const ExcluirAlteracoesUser = () => {
  const [formUserId, setFormUserId] = useState("")
  const [formLeiId, setFormLeiId] = useState("")
  const [dadosConfirmados, setDadosConfirmados] = useState(false)

  const [userId, setUserId] = useState(null)
  const [leiId, setLeiId] = useState(null)

  const { disps, carregando, erro, deletarSelecionados } = useDeleteUserAlterations({ userId, leiId })
  const [selecionados, setSelecionados] = useState([])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formUserId || !formLeiId) return alert("Preencha os dois campos")
    setUserId(formUserId.trim())
    setLeiId(formLeiId.trim())
    setDadosConfirmados(true)
  }

  const toggleSelecionado = (id) => {
    setSelecionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const excluir = async () => {
    if (selecionados.length === 0) return
    const confirmacao = window.confirm("Tem certeza que deseja excluir os dispositivos selecionados?")
    if (confirmacao) {
      await deletarSelecionados(selecionados)
      setSelecionados([])
    }
  }

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "0 auto" }}>
      {!dadosConfirmados && (
        <form onSubmit={handleSubmit}>
          <h3>Informe os dados</h3>
          <div>
            <label>User ID:</label>
            <input
              type="text"
              value={formUserId}
              onChange={(e) => setFormUserId(e.target.value)}
              style={{ width: "100%", marginBottom: "1rem" }}
            />
          </div>
          <div>
            <label>Lei ID:</label>
            <input
              type="text"
              value={formLeiId}
              onChange={(e) => setFormLeiId(e.target.value)}
              style={{ width: "100%", marginBottom: "1rem" }}
            />
          </div>
          <button type="submit">Buscar alterações</button>
        </form>
      )}

      {dadosConfirmados && (
        <div>
          <h3>Alterações salvas para lei <code>{leiId}</code></h3>
          {carregando ? (
            <p>Carregando alterações...</p>
          ) : erro ? (
            <p style={{ color: "red" }}>Erro: {erro}</p>
          ) : disps.length === 0 ? (
            <p>Nenhuma alteração encontrada para esta lei.</p>
          ) : (
            <>
              <ul>
                {disps.map(d => (
                  <li key={d.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selecionados.includes(d.id)}
                        onChange={() => toggleSelecionado(d.id)}
                      />
                      {d.id}
                      <div dangerouslySetInnerHTML={{ __html: d.html }}/>
                    </label>
                    <br />
                  </li>
                  
                ))}
              </ul>
              <button onClick={excluir} disabled={selecionados.length === 0}>
                Excluir selecionados
              </button>
              <br /><br />
              <button onClick={() => setDadosConfirmados(false)}>← Alterar dados</button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default ExcluirAlteracoesUser
