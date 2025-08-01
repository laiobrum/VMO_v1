import React, { useState } from "react";
import { useBuscarTextoNosDisps } from "../hooks/useBuscarTextoNosDisps";

const BuscarDispositivosPorTexto = () => {
  const [leiId, setLeiId] = useState("");
  const [termo, setTermo] = useState("");
  const [consultar, setConsultar] = useState(false);

  // Só faz consulta se consultar=true, leiId e termo preenchidos
  const { resultados, loading } = useBuscarTextoNosDisps(
    consultar && leiId ? leiId.trim() : "",
    consultar && termo ? termo : ""
  );

  function handleSubmit(e) {
    e.preventDefault();
    setConsultar(true);
  }

  return (
    <div style={{maxWidth: 600, margin: "32px auto", padding: 24, border: "1px solid #ddd", borderRadius: 12}}>
      <h2>Buscar texto nos dispositivos da Lei</h2>
      <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", gap: 12}}>
        <label>
          ID da Lei (ex: L8072, D12338):
          <input
            value={leiId}
            onChange={e => { setLeiId(e.target.value); setConsultar(false); }}
            required
            placeholder="Digite o ID da lei"
            style={{width: "100%"}}
          />
        </label>
        <label>
          Texto a buscar:
          <input
            value={termo}
            onChange={e => { setTermo(e.target.value); setConsultar(false); }}
            required
            placeholder="Digite o texto a ser buscado"
            style={{width: "100%"}}
          />
        </label>
        <button type="submit" disabled={loading || !leiId || !termo}>Buscar</button>
      </form>

      {loading && <div style={{marginTop: 16}}>Carregando...</div>}

      {!loading && consultar && resultados.length > 0 && (
        <div style={{marginTop: 24}}>
          <h3>Resultados encontrados:</h3>
          <ul>
            {resultados.map(({ id, html }) => (
              <li key={id} style={{marginBottom: 18, padding: 8, background: "#f9f9f9", borderRadius: 6}}>
                <b>ID do dispositivo:</b> {id}
                <div style={{marginTop: 6}} dangerouslySetInnerHTML={{ __html: html }} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && consultar && resultados.length === 0 && (
        <div style={{marginTop: 24, color: "gray"}}>Nenhum dispositivo encontrado contendo o texto informado.</div>
      )}
    </div>
  );
};

export default BuscarDispositivosPorTexto;
