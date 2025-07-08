
//NÃO TÁ DANDO CERTO!
//1. PEDIR PARA CHAT ME AJUDAR A DEBBUGAR
//2. REFINAR A DETERCÇÃO DE MARCAÇÕES PARCIALMENTE SOBREPOSTAS
//3. IMPLEMENTAR MARCAÇÕES ANINHADAS
//4. TORNAR O CÓDIGO MAIS MODULAR



import React, { useEffect, useState } from 'react'
import { PiEraserFill, PiHighlighterFill } from "react-icons/pi";
import { BiSolidCommentEdit } from "react-icons/bi";
import { CgFormatStrike } from "react-icons/cg";
import '../pages/lei.css'
import { ImBold } from 'react-icons/im';
import { MdFormatUnderlined } from 'react-icons/md';
import './ToolBar.css'
import AlertMessage from './AlertMessage';

const ToolBar = ({bookRef}) => {
  const [highlightMode, setHighlightMode] = useState(false)
  const [boldMode, setBoldMode] = useState(false)
  const [underlineMode, setUnderlineMode] = useState(false)
  const [eraseMode, setEraseMode] = useState(false)
  const [alertMsg, setAlertMsg] = useState(null)

  //Conserta o texto após a remoção das marcações
  const cleanTextNodes = (parent) => {
    const textContent = Array.from(parent.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent)
      .join('');

    Array.from(parent.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) parent.removeChild(node)
    });

    if (textContent.trim()) {
      parent.appendChild(document.createTextNode(textContent))
    }
  }

  // Funções de marcação
  const handleTool = () => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return
    const range = selection.getRangeAt(0)
    // Se estamos em modo marcação (não apagando), verificar se já existe marcação
    if (!eraseMode) {
      let node = selection.anchorNode
      while (node && node !== bookRef?.current) {
        if (
          node.nodeType === Node.ELEMENT_NODE &&
          node.tagName === 'SPAN' &&
          /(yellowHL|boldTxt|underlineTxt)/.test(node.className)
        ) {
          setAlertMsg("Já existe uma marcação nesta seleção.")
          selection.removeAllRanges()
          return
        }
        node = node.parentNode
      }
    }
    // Clona os nós selecionados (com HTML)
    const fragment = range.cloneContents()
    const tempDiv = document.createElement('div')
    tempDiv.appendChild(fragment.cloneNode(true))
    const html = tempDiv.innerHTML
    //Checa se contém qualquer <p> ou </p> e impede marcação 
    const containsParagraph = /<\/?p>/i.test(html)
    if(containsParagraph) {
      setAlertMsg("Você não pode marcar mais de um dispositivo de uma vez.")
      selection.removeAllRanges()
      return
    }

    // Apagar marcação
    if (eraseMode) {
      const contents = range.cloneContents()
      const spans = contents.querySelectorAll('span.yellowHL, span.boldTxt, span.underlineTxt')
      if(spans.length === 0) {
        setAlertMsg("Não há marcação para apagar nesta seleção")
        selection.removeAllRanges()
        return
      }
    
      spans.forEach(originalSpan => {
        const textNode = document.createTextNode(originalSpan.textContent)
        const spanInDom = findMatchingSpanInDom(bookRef.current, originalSpan.textContent)
        if (spanInDom) {
          const parent = spanInDom.parentNode
          spanInDom.replaceWith(textNode)
          cleanTextNodes(parent)
        }
      })
    
      selection.removeAllRanges()
      return
    }

    //Adicionar marcações, amerela, bold e underline
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

  const findMatchingSpanInDom = (container, text) => {
    const spans = container.querySelectorAll('span.yellowHL, span.boldTxt, span.underlineTxt')
    for (let span of spans) {
      if (span.textContent === text) {
        return span
      }
    }
    return null
  }

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

  // REGISTRA O LISTENER GLOBAL DE SELEÇÃO (MANTÉM FUNCIONALIDADE DE MARCAÇÃO)
  useEffect(() => {
    const isActive = highlightMode || boldMode || underlineMode || eraseMode
    if (isActive) {
      document.addEventListener('mouseup', handleTool)
    }

    return () => {
      document.removeEventListener('mouseup', handleTool)
    }
  }, [highlightMode, boldMode, underlineMode, eraseMode])

  // REGISTRA O CLICK PARA APAGAR SPAN (SOMENTE EM eraseMode)
  useEffect(() => {
    if (!eraseMode || !bookRef?.current) return

    const handleClickOnSpan = (e) => {
      const span = e.target
      if (span.tagName === 'SPAN' && /(yellowHL|boldTxt|underlineTxt)/.test(span.className)) {
        const parent = span.parentNode
        const textNode = document.createTextNode(span.textContent)
        span.replaceWith(textNode)
        cleanTextNodes(parent)
      }
    }

    const current = bookRef.current
    current.addEventListener('click', handleClickOnSpan)

    return () => {
      current.removeEventListener('click', handleClickOnSpan)
    }
  }, [eraseMode, bookRef])

  return (
    <div className='toolbar'>
      <div className='toolContainer'>
      {/* ESTA TOOLBAR FUNCIONA PARA ACIONAR TODA A VIEW OU ENTÃO COMANDOS TOGGLE! */}
        <button onClick={() => toggleTool('highlighter')} style={{ backgroundColor: highlightMode ? "#ffd" : "" }}><PiHighlighterFill /></button>
        <button onClick={() => toggleTool('bold')} style={{ backgroundColor: boldMode ? "#d8d8ff" : "" }}><ImBold /></button>
        <button onClick={() => toggleTool('underline')} style={{ backgroundColor: underlineMode ? "#d8d8ff" : "" }}><MdFormatUnderlined /></button>
        <button onClick={() => toggleTool('erase')} style={{ backgroundColor: eraseMode ? "#d8d8ff" : "" }}><PiEraserFill /></button>
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