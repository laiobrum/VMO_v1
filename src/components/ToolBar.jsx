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
  const [alertMsg, setAlertMsg] = useState(null)

  // MARCA-TEXTO Função que aplica o destaque à seleção atual
  const handleHighlight = () => {
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
      console.log("Você não pode marcar mais de um dispositivo de uma vez.")
      setAlertMsg("Você não pode marcar mais de um dispositivo de uma vez.")
      selection.removeAllRanges()
      return
    }

    const span = document.createElement('span')
    span.className = 'yellowHL'
    span.appendChild(range.extractContents())
    range.insertNode(span)

    selection.removeAllRanges()
  }

  // Liga/desliga o modo marcação
  const toggleHighlightMode = () => {
    setHighlightMode(prev => !prev)
  }

  // Liga/desliga o listener global de seleção
  useEffect(() => {
    if (highlightMode) {
      document.addEventListener('mouseup', handleHighlight)
    } else {
      document.removeEventListener('mouseup', handleHighlight)
    }

    return () => {
      document.removeEventListener('mouseup', handleHighlight)
    }
  }, [highlightMode])

  return (
    <div className='toolbar'>
      <div className='toolContainer'>
      {/* ESTA TOOLBAR FUNCIONA PARA ACIONAR TODA A VIEW OU ENTÃO COMANDOS TOGGLE! */}
        <button onClick={toggleHighlightMode} style={{ backgroundColor: highlightMode ? "#ffd" : "" }}><PiHighlighterFill /></button>
        <button><ImBold /></button>
        <button><MdFormatUnderlined /></button>
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