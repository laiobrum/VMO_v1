import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import '../lei.css'
import ToolBar2 from "../../components/ToolBar2"
import { useFetchDocument } from "../../hooks/useFetchDocument"
import { useAuthValue } from "../../context/AuthContext"

const VisualizeLei = () => {
    const { leiId } = useParams()
    const {user} = useAuthValue()
    const [hoveredP, setHoveredP] = useState(null)
    const [isToolbarHovered, setIsToolbarHovered] = useState(false)
    const bookRef = useRef(null)

    //Fetch dos dados - coloca no estado "Lei"
    const {document: lei, loading, error} = useFetchDocument('leis', leiId)

    useEffect(() => {
        if (!lei) return

        const book = bookRef.current
        book.innerHTML = ''

        const tempContainer = document.createElement('div')
        tempContainer.innerHTML = lei.texto
        const nodes = Array.from(tempContainer.childNodes)

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
            while(currentNodeIndex < nodes.length) {
                const page = createPage()
                const columns = page.getElementsByClassName('column')
                for (let i = 0; i < columns.length && currentNodeIndex < nodes.length; i++) {
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
            if(!bookRef.current.contains(e.relatedTarget) && !isToolbarHovered) {
                setHoveredP(null)
            }
        }

        book.addEventListener('mouseover', handleMouseOver)
        book.addEventListener('mouseleave', handleMouseLeave)

        fillPages()

        return () => {
            book.removeEventListener('mouseover', handleMouseOver)
            book.removeEventListener('mouseleave', handleMouseLeave)
        }

    }, [lei, isToolbarHovered])

    if (loading) return <p>Carregando...</p>
    if (error) return <p>Ocorreu algum erro</p>

    return (
        <div className="law_container">
            
            <div className='book' id='book' ref={bookRef}>
            </div>
            {hoveredP && (
                <div className="toolbar-floating" style={{
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
                    <ToolBar2 bookRef={bookRef}/>
                </div>
            )}
        </div>
    )
}

export default VisualizeLei