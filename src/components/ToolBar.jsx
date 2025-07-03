import React, { useEffect, useState } from 'react'
import { PiEraserFill, PiHighlighterFill } from "react-icons/pi";
import { BiSolidCommentEdit } from "react-icons/bi";
import { CgFormatStrike } from "react-icons/cg";
import '../pages/lei.css'
import { ImBold } from 'react-icons/im';
import { MdFormatUnderlined } from 'react-icons/md';
import './ToolBar.css'
import AlertMessage from './AlertMessage';

const ToolBar = () => {
  const [highlightMode, setHighlightMode] = useState(false)
  const [boldMode, setBoldMode] = useState(false)
  const [underlineMode, setUnderlineMode] = useState(false)
  const [alertMsg, setAlertMsg] = useState(null)

  // MARCA-TEXTO Função que aplica o destaque à seleção atual
  const handleTool = () => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return

    const range = selection.getRangeAt(0)

    // Clona os nós selecionados (com HTML)
    const fragment = range.cloneContents()
    const tempDiv = document.createElement('div')
    tempDiv.appendChild(fragment.cloneNode(true))
    const html = tempDiv.innerHTML
    //Checa se contém qualquer <p> ou </p>
    const containsParagraph = /<\/?p>/i.test(html)
    if(containsParagraph) {
      setAlertMsg("Você não pode marcar mais de um dispositivo de uma vez.")
      selection.removeAllRanges()
      return
    }
//WHATEVER
    const span = document.createElement('span')
    const toolClasses = {
      highlightMode: 'yellowHL',
      boldMode: 'boldTxt',
      underlineMode: 'underlineTxt'
    }
    let classes = []
    if(highlightMode) classes.push(toolClasses.highlightMode)
    if(boldMode) classes.push(toolClasses.boldMode)
    if(underlineMode) classes.push(toolClasses.underlineMode)
    span.className = classes.join(' ')
    span.appendChild(range.extractContents())
    range.insertNode(span)

    selection.removeAllRanges()
  }

  // Liga/desliga o modo marcação
  const toggleTool = (tool) => {
    switch (tool) {
      case 'highlighter':
          setHighlightMode(prev => !prev)
        break;
      case 'bold':
          setBoldMode(prev => !prev)
        break;
      case 'underline':
          setUnderlineMode(prev => !prev)
      break;
      default:
        break;
    }    
  }

  // Liga/desliga o listener global de seleção
  useEffect(() => {
    const isActive = highlightMode || boldMode || underlineMode
    if (isActive) {
      document.addEventListener('mouseup', handleTool)
    } 

    return () => {
      document.removeEventListener('mouseup', handleTool)
    }
  }, [highlightMode, boldMode, underlineMode])

  return (
    <div className='toolbar'>
      <div className='toolContainer'>
      {/* ESTA TOOLBAR FUNCIONA PARA ACIONAR TODA A VIEW OU ENTÃO COMANDOS TOGGLE! */}
        <button onClick={() => toggleTool('highlighter')} style={{ backgroundColor: highlightMode ? "#ffd" : "" }}><PiHighlighterFill /></button>
        <button onClick={() => toggleTool('bold')} style={{ backgroundColor: boldMode ? "#d8d8ff" : "" }}><ImBold /></button>
        <button onClick={() => toggleTool('underline')} style={{ backgroundColor: underlineMode ? "#d8d8ff" : "" }}><MdFormatUnderlined /></button>
        <button><PiEraserFill /></button>
        <button><BiSolidCommentEdit /></button>
        <button><CgFormatStrike /></button>
      </div>
      <div className='toolContainer'>
          {alertMsg && (<AlertMessage message={alertMsg} onClose={()=>setAlertMsg(null)} />)}
      </div>
    </div>
  )
}

export default ToolBar