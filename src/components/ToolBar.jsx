
//NÃO TÁ DANDO CERTO!
//1. IMPEDIR QUE DESFAÇA O SPAN DO ARTIGO - ART. 1º
//2. REFINAR A DETERCÇÃO DE MARCAÇÕES PARCIALMENTE SOBREPOSTAS
//3. IMPLEMENTAR MARCAÇÕES ANINHADAS

import React, { useEffect, useState } from 'react'
import { PiEraserFill, PiHighlighterFill } from "react-icons/pi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BiSolidCommentEdit } from "react-icons/bi";
import { CgFormatStrike } from "react-icons/cg";
import '../pages/lei.css'
import { ImBold } from 'react-icons/im';
import { IoMdSave } from "react-icons/io";
import { MdFormatUnderlined } from 'react-icons/md';
import './ToolBar.css'
import AlertMessage from './AlertMessage';
import { useToggleTool } from '../hooks/useToggleTool';
import { useSaveUserAlterations } from '../hooks/useSaveUserAlterations';

const ToolBar = ({bookRef, user, leiId}) => {
  const [alertMsg, setAlertMsg] = useState(null)

  //HOOKS
  //Salva alterações ao apertar botão
  const {save, salvando} = useSaveUserAlterations( {bookRef, userId: user?.uid, leiId } )
  //Seleção da ferramenta a ser usada
  const { highlightMode, boldMode, underlineMode, eraseMode, toggleTool } = useToggleTool()
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

    // Apagar marcação por seleção
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
    <>
    <div className='toolbar'>
        <div className='toolContainer'>
          <div className='mtContainer'>
            <button className={`mt2 btnMarcaTexto ${highlightMode ? 'btnMarcaTextoClicked' : ""}`} title='Marca-texto' onClick={() => toggleTool('highlighter')}><div className='colorMT color2MT'></div> <PiHighlighterFill /> </button>
            <button className={`mt3 btnMarcaTexto ${highlightMode ? 'btnMarcaTextoClicked' : ""}`} title='Marca-texto' onClick={() => toggleTool('highlighter')}><div className='colorMT color3MT'></div> <PiHighlighterFill /> </button>
            <button className={`mt1 btnMarcaTexto ${highlightMode ? 'btnMarcaTextoClicked' : ""}`} title='Marca-texto' onClick={() => toggleTool('highlighter')}><div className='colorMT color1MT'></div> <PiHighlighterFill /> </button>
          </div>
          <button className={`btnTool ${boldMode ? "btnToolClicked" : ""}`} title='Negrito' onClick={() => toggleTool('bold')} ><ImBold /></button>
          <button className={`btnTool ${underlineMode ? "btnToolClicked" : ""}`} title='Sublinhado' onClick={() => toggleTool('underline')}><MdFormatUnderlined /></button>
          <button className={`btnTool ${eraseMode ? "btnToolClicked" : ""}`} title='Apagar marcações' onClick={() => toggleTool('erase')}><PiEraserFill /></button>
          
          <button className='btnTool' title='Exibir comentários'><BiSolidCommentEdit /></button>
          <button className='btnTool' title='Exibir texto revogado'><CgFormatStrike /></button>
          <button className='btnTool' title='As alterações são salvas automaticamente a cada 30 segundos' onClick={save} disabled={salvando} >{salvando ? <AiOutlineLoading3Quarters className='loadingIcon' /> :<IoMdSave />}</button>
        </div>
    </div>
    <div className='alertContainer'>
          {alertMsg && (<AlertMessage message={alertMsg} onClose={()=>setAlertMsg(null)} />)}
    </div>
    </>
    
  )
}

export default ToolBar