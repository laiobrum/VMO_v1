import { useState } from "react"

export const useToggleTool = () => {
    const [highlightColor, setHighlightColor] = useState(null)
    const [boldMode, setBoldMode] = useState(false)
    const [underlineMode, setUnderlineMode] = useState(false)
    const [eraseMode, setEraseMode] = useState(false)

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
      default:
        break;
    }    
  }

  return { highlightColor, boldMode, underlineMode, eraseMode, toggleTool }
}
