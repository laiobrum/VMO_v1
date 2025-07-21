import { useEffect, useRef, useState } from "react"
import { NavLink, useNavigate, useParams } from "react-router-dom"
import '../lei.css'
import ToolBar2 from "../../components/ToolBar2"
import { useAuthValue } from "../../context/AuthContext"
import ToolBar from "../../components/ToolBar"
import { useFetchDocuments } from "../../hooks/useFetchDocuments"
import { useMergedLaw } from "../../hooks/useMergedLaw"
import BotaoComparar from "../../components/BotaoComparar"
import { createRoot } from "react-dom/client"

const VisualizeLei = () => {
    const { leiId } = useParams()
    const {user} = useAuthValue()
    const bookRef = useRef(null)

    const [hoveredP, setHoveredP] = useState(null)
    const [isToolbarHovered, setIsToolbarHovered] = useState(false)
    
    //HOOKS:
    //Fetch dos dados - pega a lei alterada pelo usuário, se não tiver, pega a lei original - coloca no estado "Lei"
    const { mergedDisps, loading, error } = useMergedLaw({ userId: user?.uid, leiId })

    const {documents: leis} = useFetchDocuments('leis')

    //COMPARAÇÃO DE TEXTOS LEGAIS
    const navigate = useNavigate()
    const compararVersoes = () => {
    const book = bookRef.current
    if (!book) return
    // 🟡 Pega todo o texto da lei sem tags HTML
    const textoAtual = book.innerText.trim()
    // 🔵 Pega o link do primeiro <a> dentro do #p1
    const primeiroLink = document.querySelector('#p1 > a')
    const textoOriginal = primeiroLink?.getAttribute('href') || ''
    // Navega para a página de comparação, enviando os dados via state
    navigate('/leis/comparar', {
            state: {
                textoAtual,
                textoOriginal,
            }
        })
    }
    //---------------------------------

    useEffect(() => {
        if (!mergedDisps?.length) return
        const nodes = mergedDisps.map(d => {
            const div = document.createElement('div')
            div.innerHTML = d.html
            return div.firstChild
        }).filter(Boolean)

        const book = bookRef.current
        book.innerHTML = ''

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
                        root.render(<BotaoComparar onClick={compararVersoes} />)

                        botaoInserido = true
                    }

                    currentNodeIndex = fillColumn(columns[i], currentNodeIndex)
                }
            }
        }
        
        function handleMouseOver(e) {
            if (e.target.tagName === 'P') {
                setHoveredP(e.target)
            }
        }

        function handleMouseLeave(e) {
            setTimeout(() => {
                const toolbarHovered = document.querySelector(".toolbar-floating")?.matches(":hover")
                const stillInsideBook = bookRef.current?.contains(document.activeElement)
                if (!toolbarHovered && !stillInsideBook) {
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

    }, [mergedDisps])//Não colocar isToolbarHovered, pq sempre quando hover, ele restarta o useEffect e tira as marcações!

    if (loading) return <p>Carregando...</p>
    if (error) return <p>Ocorreu algum erro</p>

    return (     
        <>
        <div className="law_container">
            {/* TOOLBAR e botão COMPARAR fixos */}
            <div className="toolContainer">
                <ToolBar bookRef={bookRef} user={user} leiId={leiId} />
                {/* BARRA DE LEIS */}
                <div className="lawSideBar">
                    {leis.map((lei)=>(
                        <NavLink key={lei.id} className="lawItem" to={`/leis/${lei.id}`}><div>{lei.title}</div></NavLink>
                    ))}
                </div>
            </div>
            
            {/* CONTAINER em que a lei vai ser carregada */}
            <div className='book' id='book' ref={bookRef}></div>

            {/* TOOLBAR2 - flutuante */}
            {hoveredP && (
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
                    <ToolBar2 bookRef={bookRef} />
                </div>
            )}

            
        </div>
        </>
    )
}

export default VisualizeLei