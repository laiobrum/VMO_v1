
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
  const [showRevogados, setShowRevogadosState] = useState(false)

  //HOOKS
  //Salva alterações ao apertar botão
  const {save, salvando} = useSaveUserAlterations( {bookRef, userId: user?.uid, leiId } )
  //Seleção da ferramenta a ser usada
  const { highlightColor, boldMode, underlineMode, eraseMode, toggleTool } = useToggleTool()

  // Funções de marcação
  const handleTool = () => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return
    const range = selection.getRangeAt(0)

  // VERIFICA SE A SELEÇÃO COMEÇA OU INTERSECTA TRECHO MARCADO
  const selectionHasMarkings = (selection, range, rootNode) => {
    // Verifica se ponto inicial da seleção já está dentro de marcação
    let node = selection.anchorNode
    while (node && node !== rootNode) {
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.tagName === 'SPAN' &&
        /(yellowHL|greenHL|pinkHL|boldTxt|underlineTxt)/.test(node.className)
      ) {
        return true
      }
      node = node.parentNode
    }

    // Verifica se seleção cruza marcações em qualquer ponto
    const walker = document.createTreeWalker(
      range.commonAncestorContainer,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          const nodeRange = document.createRange()
          nodeRange.selectNodeContents(node)
          if (
            range.intersectsNode(node) &&
            node.tagName === 'SPAN' &&
            /(yellowHL|greenHL|pinkHL|boldTxt|underlineTxt)/.test(node.className)
          ) {
            return NodeFilter.FILTER_ACCEPT
          }
          return NodeFilter.FILTER_SKIP
        }
      }
    )
    return walker.nextNode() !== null
  }

  if (!eraseMode && selectionHasMarkings(selection, range, bookRef?.current)) {
    setAlertMsg("A seleção inclui partes já marcadas.")
    selection.removeAllRanges()
    return
  }
    
    // Clona os nós selecionados (com HTML)
    const fragment = range.cloneContents()
    const tempDiv = document.createElement('div')
    tempDiv.appendChild(fragment.cloneNode(true))
    const html = tempDiv.innerHTML
    //Impede marcação de cruza parágrafos
    const containsParagraph = /<\/?p>/i.test(html)
    if(containsParagraph) {
      setAlertMsg("Você não pode marcar mais de um dispositivo de uma vez.")
      selection.removeAllRanges()
      return
    }

    // Apagar marcação por seleção
    if (eraseMode) {
      const spansToRemove = []
      const walker = document.createTreeWalker(
        range.commonAncestorContainer,
        NodeFilter.SHOW_ELEMENT,
        {
          acceptNode: (node) => {
            if (
              range.intersectsNode(node) &&
              node.tagName === 'SPAN' &&
              /(yellowHL|greenHL|pinkHL|boldTxt|underlineTxt)/.test(node.className)
            ) {
              return NodeFilter.FILTER_ACCEPT
            }
            return NodeFilter.FILTER_SKIP
          }
        }
      )
      let node
      while ((node = walker.nextNode())) {
        spansToRemove.push(node)
      }
      if (spansToRemove.length === 0) {
        setAlertMsg("Não há marcação para apagar nesta seleção")
        selection.removeAllRanges()
        return
      }
      spansToRemove.forEach(span => {
        const textNode = document.createTextNode(span.textContent)
        span.replaceWith(textNode)
      })
      selection.removeAllRanges()
      return
    }

    //Adicionar marcações, amerela, green, pink, bold e underline
    const span = document.createElement('span')
    let classes = []
    if(highlightColor) {
      const highlightClassMap = {
        yellow: 'yellowHL',
        green: 'greenHL',
        pink: 'pinkHL'
      }
      classes.push(highlightClassMap[highlightColor])
    } 
    if(boldMode) classes.push('boldTxt')
    if(underlineMode) classes.push('underlineTxt')
    if(classes.length > 0) classes.push("alterado")

    span.className = classes.join(' ')
    span.appendChild(range.extractContents())
    range.insertNode(span)

    selection.removeAllRanges()
  }


  // REGISTRA O LISTENER GLOBAL DE SELEÇÃO (MANTÉM FUNCIONALIDADE DE MARCAÇÃO)
  useEffect(() => {
    const isActive = highlightColor || boldMode || underlineMode || eraseMode
    if (isActive) {
      document.addEventListener('mouseup', handleTool)
    }

    return () => {
      document.removeEventListener('mouseup', handleTool)
    }
  }, [highlightColor, boldMode, underlineMode, eraseMode])

  // REGISTRA O CLICK PARA APAGAR SPAN (SOMENTE EM eraseMode)
  useEffect(() => {
    if (!eraseMode || !bookRef?.current) return

    const handleClickOnSpan = (e) => {
      const span = e.target
      if (span.tagName === 'SPAN' && /(yellowHL|greenHL|pinkHL|boldTxt|underlineTxt)/.test(span.className)) {
        const parent = span.parentNode
        const textNode = document.createTextNode(span.textContent)
        span.replaceWith(textNode)
      }
    }

    const current = bookRef.current
    current.addEventListener('click', handleClickOnSpan)

    return () => {
      current.removeEventListener('click', handleClickOnSpan)
    }
  }, [eraseMode, bookRef])

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

  return (
    <>
    <div className='toolbar'>
        <div className='toolContainer'>
          <div className='mtContainer'>
            <button className={`mt3 btnMarcaTexto ${highlightColor === 'pink' ? 'btnMarcaTextoClicked' : ""}`} title='Marca-texto' onClick={() => toggleTool('highlighter', 'pink')}><div className='colorMT color3MT'></div> <PiHighlighterFill /> </button>
            <button className={`mt2 btnMarcaTexto ${highlightColor === 'green' ? 'btnMarcaTextoClicked' : ""}`} title='Marca-texto' onClick={() => toggleTool('highlighter', 'green')}><div className='colorMT color2MT'></div> <PiHighlighterFill /> </button>
            <button className={`mt1 btnMarcaTexto ${highlightColor === 'yellow' ? 'btnMarcaTextoClicked' : ""}`} title='Marca-texto' onClick={() => toggleTool('highlighter', 'yellow')}><div className='colorMT color1MT'></div> <PiHighlighterFill /> </button>
          </div>
          <button className={`btnTool ${boldMode ? "btnToolClicked" : ""}`} title='Negrito' onClick={() => toggleTool('bold')} ><ImBold /></button>
          <button className={`btnTool ${underlineMode ? "btnToolClicked" : ""}`} title='Sublinhado' onClick={() => toggleTool('underline')}><MdFormatUnderlined /></button>
          <button className={`btnTool ${eraseMode ? "btnToolClicked" : ""}`} title='Apagar marcações' onClick={() => toggleTool('erase')}><PiEraserFill /></button>
          
          <button className='btnTool' title='Exibir comentários'><BiSolidCommentEdit /></button>
          <button className='btnTool' title='Exibir texto revogado'   onClick={toggleRevogados}> <CgFormatStrike /></button>
  
                
                    
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