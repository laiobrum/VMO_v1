import { useState } from "react"

export const useToggleTool = () => {
    const [highlightMode, setHighlightMode] = useState(false)
    const [boldMode, setBoldMode] = useState(false)
    const [underlineMode, setUnderlineMode] = useState(false)
    const [eraseMode, setEraseMode] = useState(false)

    // Liga/desliga o modo marcação - erase desliga os outros, bem como os outros desligam o erase
  const toggleTool = (tool) => {
    switch (tool) {
      case 'highlighter':
          setEraseMode(false)
          setHighlightMode(prev => !prev)
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
          setHighlightMode(false)
          setBoldMode(false)
          setUnderlineMode(false)
          setEraseMode(prev => !prev)
        break;
      default:
        break;
    }    
  }

  return { highlightMode, boldMode, underlineMode, eraseMode, toggleTool }
}
