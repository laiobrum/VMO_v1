import { useState } from "react"

export const useToggleTool = (bookRef) => {
    const [highlightColor, setHighlightColor] = useState(null)
    const [boldMode, setBoldMode] = useState(false)
    const [underlineMode, setUnderlineMode] = useState(false)
    const [eraseMode, setEraseMode] = useState(false)
    const [showComentarios, setShowComentarios] = useState(true)
    const [showRevogados, setShowRevogadosState] = useState(false)

    const toggleComentarios = () => {
      const newState = !showComentarios
      setShowComentarios(newState)

      const comentarios = bookRef.current?.querySelectorAll('.cmt-user')
      comentarios?.forEach(comentario => {
        comentario.style.display = newState ? 'block' : 'none'
      })
    }

    const toggleRevogados = () => {
      setShowRevogadosState(prev => {
        const newState = !prev
        const delTags = bookRef.current?.querySelectorAll('.revogado')
        delTags?.forEach(delTag => {
          delTag.classList.toggle('aparecer', newState)
        })
        return newState
      })
    }

    // Liga/desliga o modo marcação - erase desliga os outros, bem como os outros desligam o erase
  const toggleTool = (tool, color = null) => {
    switch (tool) {
      case 'highlighter':
          setEraseMode(false)
          setHighlightColor(prev => prev === color ? null : color)
        break;
      case 'bold':
          setEraseMode(false)
          setBoldMode(prev => !prev)
        break;
      case 'underline':
          setEraseMode(false)
          setUnderlineMode(prev => !prev)
        break;
      case 'erase':
          setHighlightColor(null)
          setBoldMode(false)
          setUnderlineMode(false)
          setEraseMode(prev => !prev)
        break;
      case 'comentarios':
        toggleComentarios()
        break;
      case 'revogados':
        toggleRevogados()
        break;
      default:
        break;
    }    
  }

    

  

  return { highlightColor, boldMode, underlineMode, eraseMode, showComentarios, showRevogados, toggleTool }
}
