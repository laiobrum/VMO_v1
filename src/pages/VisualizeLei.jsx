import { useEffect, useRef, useState } from "react"
import { NavLink, useParams } from "react-router-dom"
import './lei.css'
import ToolBar2 from "../components/ToolBar2"
import { useAuthValue } from "../context/AuthContext"
import ToolBar from "../components/ToolBar"
import { useFetchDocuments } from "../hooks/useFetchDocuments"
import { useMergedLaw } from "../hooks/useMergedLaw"
import BotaoComparar from "../components/BotaoComparar"
import { createRoot } from "react-dom/client"
import TiptapEditor from "../components/TiptapEditor"

const VisualizeLei = () => {
    const { leiId } = useParams()
    const {user} = useAuthValue()
    const bookRef = useRef(null)

    const [hoveredP, setHoveredP] = useState(null)
    const [editorBelowP, setEditorBelowP] = useState(null)
    const [activeEditorP, setActiveEditorP] = useState(null)
    const [isToolbarHovered, setIsToolbarHovered] = useState(false)
    const [modoOriginalAtivo, setModoOriginalAtivo] = useState(false)
    const [textoOriginal, setTextoOriginal] = useState([])
    
    //HOOKS:
    //Fetch dos dados - pega a lei alterada pelo usuário, se não tiver, pega a lei original - coloca no estado "Lei"
    const { mergedDisps, loading, error } = useMergedLaw({ userId: user?.uid, leiId })
    //Hook da lawSideBar - tem que atualizar, visto que mudou a estrutura de dados
    const {documents: leis} = useFetchDocuments('leis')

    useEffect(() => {
        const book = bookRef.current
        if (!book) return

        book.innerHTML = ''
        //Decide se pega o texto original ou o mergeDisps
        const base = textoOriginal.length > 0 ? textoOriginal : mergedDisps
        if (!base || base.length === 0) return

        // Cria os nós DOM dos parágrafos
        const nodes = base.map(d => {
            const div = document.createElement('div')
            div.innerHTML = d.html
            return div.firstChild
        }).filter(Boolean)

        const columnsPerPage = 3
        const maxLinesPerColumn = 30 //Limite de linhas por coluna
        let currentNodeIndex = 0

        function createPage() {
            const page = document.createElement('div')
            page.className = 'page'
            for(let i = 0; i < columnsPerPage; i++) {
                const column = document.createElement('div')
                column.className = 'column'
                page.appendChild(column)
            }
            book.appendChild(page)
            return page
        }

        function fillColumn(column, startIndex) {
            let index = startIndex
            while(index < nodes.length) {
                const node = nodes[index].cloneNode(true)
                column.appendChild(node)

                const totalHeight = column.clientHeight
                const computedLineHeight = parseFloat(getComputedStyle(column).lineHeight)
                const numberOfLines = Math.floor(totalHeight / computedLineHeight)

                if(numberOfLines >= maxLinesPerColumn) {
                    column.removeChild(node)//Remove o último que estourou
                    return index //Continua desse index na próxima coluna
                }
                index++
            }
            return index
        }

        function fillPages() {
            let botaoInserido = false

            while (currentNodeIndex < nodes.length) {
                const page = createPage()
                const columns = page.getElementsByClassName('column')

                for (let i = 0; i < columns.length && currentNodeIndex < nodes.length; i++) {
                    // Insere o BotaoComparar só na primeira coluna da primeira página
                    if (!botaoInserido && i === 0) {
                        const botaoContainer = document.createElement('div')
                        columns[i].appendChild(botaoContainer)

                        const root = createRoot(botaoContainer)
                        root.render(
                            <BotaoComparar
                                onClick={() => {
                                const link = document.querySelector('#p1 a')?.getAttribute('href')
                                if (link) {
                                    window.open(link, '_blank') // abre em nova aba
                                } else {
                                    alert("Link original não encontrado.")
                                }
                                }}
                            />
                        )
                        botaoInserido = true
                    }

                    currentNodeIndex = fillColumn(columns[i], currentNodeIndex)
                }
            }
        }
        
        function handleMouseOver(e) {
        const el = e.target
        // Ignora se estiver dentro de comentário
        if (el.closest('.cmt-user')) return
        // Ignora se estiver dentro do editor
        if (el.closest('.editor-holder')) return
        // Só aceita <p> diretamente
        if (el.tagName === 'P') {
            setHoveredP(el)
        }
        }

        function handleMouseLeave(e) {
            setTimeout(() => {
                const toolbarHovered = document.querySelector(".toolbar-floating")?.matches(":hover")
                const stillInsideBook = bookRef.current?.contains(document.activeElement)
                if (!toolbarHovered && !stillInsideBook && !activeEditorP) {
                    setHoveredP(null)
                }
            }, 200)
        }

        book.addEventListener('mouseover', handleMouseOver)
        book.addEventListener('mouseleave', handleMouseLeave)

        fillPages()

        return () => {
            book.removeEventListener('mouseover', handleMouseOver)
            book.removeEventListener('mouseleave', handleMouseLeave)
        }

    }, [mergedDisps, textoOriginal])//Não colocar isToolbarHovered, pq sempre quando hover, ele restarta o useEffect e tira as marcações! Nem o activeEditorP, pq ele estraga tudo!

    if (loading) return <p>Carregando...</p>
    if (error) return <p>Ocorreu algum erro</p>

    return (     
        <>
        <div className="law_container">
            {/* TOOLBAR e botão COMPARAR fixos */}
            <div className="toolContainer">
                <ToolBar bookRef={bookRef} user={user} leiId={leiId} onRestaurarTxtOriginal={setTextoOriginal} modoOriginalAtivo={modoOriginalAtivo} setModoOriginalAtivo={setModoOriginalAtivo} />
                {/* BARRA DE LEIS */}
                <div className="lawSideBar">
                    {leis.map((lei)=>(
                        <NavLink key={lei.id} className="lawItem" to={`/leis/${lei.id}`}><div>{lei.title}</div></NavLink>
                    ))}
                </div>
            </div>
            
            {/* CONTAINER em que a lei vai ser carregada */}
            <div className='book' id='book' ref={bookRef}></div>

            {/* TIPTAP EDITOR */}
            {editorBelowP && (
                <div
                    style={{
                    position: 'absolute',
                    top: editorBelowP.getBoundingClientRect().bottom + window.scrollY,
                    left: editorBelowP.getBoundingClientRect().left + window.scrollX,
                    width: editorBelowP.offsetWidth,
                    zIndex: 9,
                    backgroundColor: 'white',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '6px'
                    }}
                >
                    <TiptapEditor onBlur={() => setEditorBelowP(null)} />
                </div>
            )}

            {/* TOOLBAR2 - flutuante */}
            {hoveredP && hoveredP !== activeEditorP && !hoveredP.classList.contains('cmt-user') && (
                <div
                    className="toolbar-floating"
                    style={{
                        position: 'absolute',
                        top: hoveredP.getBoundingClientRect().top + window.scrollY - 5,
                        left: hoveredP.getBoundingClientRect().left + window.scrollY - 35,
                        zIndex: 10,
                    }}
                    onMouseEnter={() => setIsToolbarHovered(true)}
                    onMouseLeave={() => {
                        setIsToolbarHovered(false)
                        setHoveredP(null)
                    }}
                >
                    <ToolBar2
                        bookRef={bookRef}
                        editorIsActive={hoveredP && activeEditorP === hoveredP}
                        onToggleEditor={() => {
                            if (!hoveredP) return

                            const alreadyActive = activeEditorP === hoveredP

                            //Fechar se já está ativo
                            if (alreadyActive) {
                                hoveredP.parentNode.querySelectorAll('.editor-holder').forEach(el => el.remove())
                                setActiveEditorP(null)
                                return
                            }

                            // Remove qualquer outro editor aberto
                            bookRef.current.querySelectorAll('.editor-holder').forEach(el => el.remove())

                            // Cria o novo do editor
                            const editorDiv = document.createElement('div')
                            editorDiv.className = 'editor-holder'
                            hoveredP.parentNode.insertBefore(editorDiv, hoveredP.nextSibling)

                            const root = createRoot(editorDiv)
                            root.render(<TiptapEditor
                                onSubmit={(html) => {
                                    editorDiv.remove()
                                    setActiveEditorP(null)

                                    if (!html || html.trim() === '<p></p>' || html.trim() === '<p><br></p>') {
                                        return // não cria comentário vazio
                                    }

                                    const comentario = document.createElement('div')
                                    comentario.className = 'cmt-user alterado'
                                    comentario.innerHTML = html
                                    hoveredP.parentNode.insertBefore(comentario, hoveredP.nextSibling)
                                }} 
                            />)

                            // Marcar o <p> como ativo
                            setActiveEditorP(hoveredP)
                        }}
                        />
                </div>
            )}

            
        </div>
        </>
    )
}

export default VisualizeLei