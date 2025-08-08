import { useEffect, useState } from "react"
import { useFetchDocuments } from "../hooks/useFetchDocuments"
import { useFetchOriginalLei } from "../hooks/useFetchOriginalLei"
import { useAtualizarLeiAdmin } from "../hooks/useAtualizarLeiAdmin"
import { useRef } from "react";

const EditarLeiAdmin = () => {
    const [leiSelecionada, setLeiSelecionada] = useState(null)
    const [disps, setDisps] = useState([])
    const [alteracoes, setAlteracoes] = useState({})
    const [novosDisps, setNovosDisps] = useState([])
    const [salvando, setSalvando] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const [confirmacaoFeito, setConfirmacaoFeito] = useState(false);
    const scrollRef = useRef(null);

    //Buscar leis disponíveis
    const {documents: leis, loading, error: errorLeis} = useFetchDocuments('leis')
    //Buscar dispositivos da lei selecionada
    const {fetchOriginal, loadingOriginal, error: errorTexto} = useFetchOriginalLei()
    //Hook de atualizar a lei
    const { atualizarLei } = useAtualizarLeiAdmin()

    // Atualiza campos de alteração/revogação
    const handleAlteracao = (id, campo, valor) => {
        setAlteracoes(prev => ({
        ...prev,
        [id]: {
            ...prev[id],
            [campo]: valor
        }
        }));
    };

    // Adicionar novo dispositivo
    const adicionarNovoDisp = () => {
        setNovosDisps(prev => [
        ...prev,
        {
            id: "",
            html: "",
            ordem: "",
            leiModificadora: "",
            tipo: "inclusao"
        }
        ]);
    };

    return (
        <div className="editar-lei-admin">
        <h2>Editor de Lei - Admin</h2>

        <label>Selecione a lei:  </label>
        <select onChange={async (e) => {
            const lei = leis.find(l => l.id === e.target.value);
            setLeiSelecionada(lei);
            setAlteracoes({});
            setNovosDisps([]);

            const dispsCarregados = await fetchOriginal(lei.id);
            setDisps(dispsCarregados);
        }}>
            <option value="">--</option>
            {leis.map(lei => (
                <option key={lei.id} value={lei.id}>{lei.aTitle} - {lei.numLeiC.toLowerCase() || lei.id}</option>
        ))}
        </select>

        {leiSelecionada && (
            <>
            <br /><br />
            <h2>Dispositivos da lei</h2>
            {disps.map((disp) => (
                <div key={disp.id} className="bigCardContainer">
                    <div className="bigCard">
                        <p><strong>ID:</strong> {disp.id}</p>
                        <p><strong>Ordem:</strong> {disp.ordem}</p>
                        <div dangerouslySetInnerHTML={{ __html: disp.html }} />

                        <label>
                            <input
                                type="checkbox"
                                checked={alteracoes[disp.id]?.tipo === "revogacao"}
                                onChange={(e) => {
                                    const tipo = e.target.checked ? "revogacao" : null;
                                    handleAlteracao(disp.id, "tipo", tipo);

                                    // Se "Revogar" for marcado, exibe o campo para a lei modificadora
                                    if (e.target.checked) {
                                        handleAlteracao(disp.id, "novoHtml", `<span class="leiRef2 aparecer">(Revogado pela ${alteracoes[disp.id]?.leiModificadora || "Informe a lei modificadora"})</span>`);
                                    } else {
                                        handleAlteracao(disp.id, "novoHtml", ""); // Limpar quando desmarcar
                                    }
                                }}
                            />
                            Revogar
                        </label>

                        {alteracoes[disp.id]?.tipo === "revogacao" && (
                            <div style={{ marginTop: "10px" }}>
                                <label>Lei modificadora:</label>
                                <input
                                    type="text"
                                    value={alteracoes[disp.id]?.leiModificadora || ""}
                                    onChange={(e) => handleAlteracao(disp.id, "leiModificadora", e.target.value)}
                                    placeholder="Lei nº xx.xxx de xxxx"
                                />
                            </div>
                        )}

                        <label style={{ marginLeft: "15px" }}>
                            <input
                                type="checkbox"
                                checked={alteracoes[disp.id]?.tipo === "alteracao"}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        handleAlteracao(disp.id, "tipo", "alteracao");
                                        handleAlteracao(disp.id, "novoHtml", disp.html); // pré-preenche
                                    } else {
                                        // Remove os campos se desmarcar
                                        setAlteracoes(prev => {
                                            const novo = { ...prev };
                                            delete novo[disp.id];
                                            return novo;
                                        });
                                    }
                                }}
                            />
                            Alterar
                        </label>
                    </div>

                    {alteracoes[disp.id]?.tipo === "alteracao" && (
                        <div className="bigCard redBg">
                            <label>Nova redação (HTML):</label>
                            <textarea
                                rows={4}
                                style={{ width: "100%" }}
                                value={alteracoes[disp.id]?.novoHtml || ""}
                                onChange={(e) => handleAlteracao(disp.id, "novoHtml", e.target.value)}
                            />
                            <label>Lei modificadora:</label>
                            <input
                                type="text"
                                value={alteracoes[disp.id]?.leiModificadora || ""}
                                onChange={(e) => handleAlteracao(disp.id, "leiModificadora", e.target.value)}
                            />
                        </div>
                    )}
                </div>
            ))}



            <h3>Inclusões</h3>
            {novosDisps.map((novo, idx) => (
                <div key={idx} style={{ border: "1px dashed #aaa", padding: "10px", marginBottom: "10px" }}>
                <label>ID:</label>
                <input
                    type="text"
                    value={novo.id}
                    onChange={(e) => {
                    const atualizado = [...novosDisps];
                    atualizado[idx].id = e.target.value;
                    setNovosDisps(atualizado);
                    }}
                />
                <label>Ordem:</label>
                <input
                    type="number"
                    value={novo.ordem}
                    onChange={(e) => {
                    const atualizado = [...novosDisps];
                    atualizado[idx].ordem = parseFloat(e.target.value);
                    setNovosDisps(atualizado);
                    }}
                />
                <label>HTML:</label>
                <textarea
                    rows={3}
                    value={novo.html}
                    onChange={(e) => {
                    const atualizado = [...novosDisps];
                    atualizado[idx].html = e.target.value;
                    setNovosDisps(atualizado);
                    }}
                />
                <label>Lei modificadora:</label>
                <input
                    type="text"
                    value={novo.leiModificadora}
                    onChange={(e) => {
                    const atualizado = [...novosDisps];
                    atualizado[idx].leiModificadora = e.target.value;
                    setNovosDisps(atualizado);
                    }}
                />
                </div>
            ))}

            <button className="btn2" onClick={adicionarNovoDisp}>+ Incluir novo dispositivo</button>

            <hr />
            <button className="btn2" onClick={() => console.log({ alteracoes, novosDisps })}>
                Visualizar alterações no console
            </button>
            <button
            className="btn1"
            disabled={salvando}
            onClick={async () => {
                setSalvando(true);
                const res = await atualizarLei({ leiId: leiSelecionada.id, alteracoes, inclusoes: novosDisps });
                setSalvando(false);

                if (res.success) {
                    setSucesso(true);

                    // Scroll até a mensagem de instruções
                    setTimeout(() => {
                        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
                else {
                alert("Erro: " + res.error);
                }
            }}
            >
            {salvando ? "Salvando..." : "Salvar alterações"}

            </button>
            {sucesso && (
            <div
                ref={scrollRef}
                className="info-pos-salvar"
                style={{
                background: "#eef",
                padding: "15px",
                marginTop: "20px",
                border: "1px solid #99c"
                }}
            >
                <h3>⚠ Atenção: ainda é necessário apagar as marcações de usuários</h3>
                <p>
                Como os dispositivos foram <strong>revogados</strong> ou
                <strong> alterados</strong>, é necessário apagar as marcações feitas pelos
                usuários nesses dispositivos antigos.
                </p>
                <p>
                Para isso, execute o script <code><strong>apagarMarcacoes.jsx</strong></code> com os parâmetros adequados:
                </p>
                <p>
                <b>1.</b> No terminal, vá para a pasta firebase: <code><strong className="blueTxt">cd vmo-v1/src/firebase</strong></code>
                </p>
                <p><b>2.</b> Execute o código abaixo no terminal:</p>

                <pre style={{ background: "#ddd", padding: "10px", whiteSpace: "pre-wrap" }}>
                    {`node apagarMarcacoes.js ${leiSelecionada.id} ${Object.keys(alteracoes).join(' ')}`}
                </pre>

                <p>
                <strong>
                    Somente após a execução do script, os dados de marcação dos usuários
                    serão limpos corretamente.
                </strong>
                </p>

                {!confirmacaoFeito ? (
                <button
                    className="btn1"
                    style={{ marginTop: "10px" }}
                    onClick={() => setConfirmacaoFeito(true)}
                >
                    Feito
                </button>
                ) : (
                <div style={{ marginTop: "10px" }}>
                    <p>✅ Agora você pode recarregar a página com segurança.</p>
                    <button
                    className="btn1"
                    onClick={() => {
                        // Limpa tudo só agora
                        setAlteracoes({});
                        setNovosDisps([]);
                        setLeiSelecionada(null);
                        setDisps([]);
                        setSucesso(false);
                        setConfirmacaoFeito(false);
                        window.location.reload();
                    }}
                    >
                    Recarregar página
                    </button>
                </div>
                )}
            </div>
            )}



            </>
            
        )}
        </div>
        
    );
}

export default EditarLeiAdmin