
import React, { useEffect, useState } from 'react'
import { PiEraserFill, PiHighlighterFill } from "react-icons/pi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BiSolidCommentEdit } from "react-icons/bi";
import { CgFormatStrike } from "react-icons/cg";
import { GoLaw } from "react-icons/go";
import '../pages/lei.css'
import { ImBold } from 'react-icons/im';
import { IoIosPeople, IoMdSave } from "react-icons/io";
import { MdFormatUnderlined, MdOutlineReport } from 'react-icons/md';
import { IoSettingsOutline } from "react-icons/io5";
import './ToolBar.css'
import AlertMessage from './AlertMessage';
import { useToggleTool } from '../hooks/useToggleTool';
import { useSaveUserAlterations } from '../hooks/useSaveUserAlterations';
import { useFetchOriginalLei } from '../hooks/useFetchOriginalLei';
import { ToggleSwitch } from './ToggleSwitch';
import { TiWarningOutline } from 'react-icons/ti';

const ToolBar = ({bookRef, user, leiId, onRestaurarTxtOriginal, modoOriginalAtivo, setModoOriginalAtivo}) => {
  const [alertMsg, setAlertMsg] = useState(null)
  const [fontSize, setFontSize] = useState(14) 
  
  //HOOKS
  //Salva alterações ao apertar botão
  const {save, salvando} = useSaveUserAlterations( {bookRef, userId: user?.uid, leiId, onRestaurarTxtOriginal } )
  //Seleção da ferramenta a ser usada
  const { highlightColor, boldMode, underlineMode, eraseMode, showComentarios, showRevogados, toggleTool } = useToggleTool(bookRef)
  //Texto original, sem marcações ou comentários
  const { fetchOriginal, loadingOriginal, error } = useFetchOriginalLei()

  // Funções de marcação
  const handleTool = () => {
    //Modo texto original - impede marcação da lei
    if (modoOriginalAtivo) {
      const isTextoOriginalBtn = event?.target?.closest('.btnToolClicked')?.textContent?.includes('Texto Original')
      if (!isTextoOriginalBtn) {
        setAlertMsg('Você está visualizando o texto original. Clique novamente em <span class="btnTool">Texto Original</span> para voltar ao modo de edição.')
      }
      return
    }

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

        //Marca parágrafo como alterado
        const paragraph = span.closest('p')
        if(paragraph) paragraph.classList.add('alterado')
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

    span.className = classes.join(' ')
    span.appendChild(range.extractContents())
    range.insertNode(span)

    // ✅ Marca o parágrafo-pai como alterado
    const paragraph = span.closest('p')
    if (paragraph) paragraph.classList.add('alterado')

    selection.removeAllRanges()
  }


  // REGISTRA O LISTENER GLOBAL DE SELEÇÃO (MANTÉM FUNCIONALIDADE DE MARCAÇÃO)
  useEffect(() => {
    const isActive = highlightColor || boldMode || underlineMode || eraseMode
    const listener = (e) => handleTool(e)
    if (isActive) {
      document.addEventListener('mouseup', listener)
    }
    return () => {
      document.removeEventListener('mouseup', listener)
    }
  }, [highlightColor, boldMode, underlineMode, eraseMode, modoOriginalAtivo])

  // REGISTRA O CLICK PARA APAGAR SPAN (SOMENTE EM eraseMode)
  useEffect(() => {
    if (!eraseMode || !bookRef?.current) return

    const handleClickOnSpan = (e) => {
      const span = e.target
      // Confirma que o clique foi em uma marcação relevante
      if (
        span.tagName === 'SPAN' &&
        /(yellowHL|greenHL|pinkHL|boldTxt|underlineTxt)/.test(span.className)
      ) {
        const paragraph = span.closest('p')

        // Substitui o span pelo texto puro
        const textNode = document.createTextNode(span.textContent)
        span.replaceWith(textNode)

        // ✅ Marca o parágrafo (com id) como alterado
        if (paragraph) {
          paragraph.classList.add('alterado')
          console.log(`Parágrafo ${paragraph.id} marcado como alterado.`)
        }
      }
    }

    const current = bookRef.current
    current.addEventListener('click', handleClickOnSpan)

    return () => {
      current.removeEventListener('click', handleClickOnSpan)
    }
  }, [eraseMode, bookRef])

  
  const restaurarTextoOriginal = async () =>{
    if (modoOriginalAtivo) {
      //Voltar para texto com marcações
      onRestaurarTxtOriginal([])// esvazia o textoOriginal > volta ao mergeDisps
      setModoOriginalAtivo(false)
    } else {
      // Carrega o texto original
      const textoOriginal = await fetchOriginal(leiId)
      onRestaurarTxtOriginal(textoOriginal)// <- Envia para o pai, VisualizeLei
      setModoOriginalAtivo(true)
    }
  }

  //BOTÃO DE ALTERAR TAMANHO DO TEXTO
  useEffect(() => {
    if (!bookRef?.current) return;

    // Aplica o fontSize em cada coluna renderizada
    const columns = bookRef.current.querySelectorAll('.column')
    columns.forEach(col => {
      col.style.fontSize = `${fontSize}px`
    })

  }, [fontSize, bookRef])

  return (
    <>
    <div className='toolbar'>
        <div className='toolContainer'>
          {/* Marca-textos */}
          <div className='mtContainer'>
            <button 
              className={`mt3 btnMarcaTexto ${highlightColor === 'pink' ? 'btnMarcaTextoClicked' : ""}`} title='Marca-texto' onClick={() => toggleTool('highlighter', 'pink')}> <div className='colorMT color3MT'></div> <PiHighlighterFill /> 
            </button>
            <button 
              className={`mt2 btnMarcaTexto ${highlightColor === 'green' ? 'btnMarcaTextoClicked' : ""}`} title='Marca-texto' onClick={() => toggleTool('highlighter', 'green')}><div className='colorMT color2MT'></div> <PiHighlighterFill /> 
            </button>
            <button 
              className={`mt1 btnMarcaTexto ${highlightColor === 'yellow' ? 'btnMarcaTextoClicked' : ""}`} title='Marca-texto' onClick={() => toggleTool('highlighter', 'yellow')}><div className='colorMT color1MT'></div> <PiHighlighterFill /> 
            </button>
          </div>
          {/* ------------------ */}
          {/* Outros comandos: */}
          <button 
            className={`btnTool ${boldMode ? "btnToolClicked" : ""}`} title='Negrito' onClick={() => toggleTool('bold')} ><ImBold />
          </button>
          <button 
            className={`btnTool ${underlineMode ? "btnToolClicked" : ""}`} title='Sublinhado' onClick={() => toggleTool('underline')}><MdFormatUnderlined />
          </button>
          <button 
            className={`btnTool ${eraseMode ? "btnToolClicked" : ""}`} title='Apagar marcações' onClick={() => toggleTool('erase')}><PiEraserFill />
          </button>
          {/* Comentários */}
          <button 
            className={`btnTool ${showComentarios ? 'btnToolClicked' : ''}`} onClick={()=>toggleTool('comentarios')} title='Meus comentários'><BiSolidCommentEdit />
          </button>
          <button 
            className='btnTool' title='Comentários da comunidade'><IoIosPeople />
          </button>
          <button 
            className='btnTool' title='Exibir jurisprudência'><GoLaw />
          </button>
          <button 
            className={`btnTool ${showRevogados ? 'btnToolClicked' : ''}`} title='Exibir texto revogado' onClick={()=>toggleTool('revogados')}> <CgFormatStrike />
          </button>                    
          <button 
            className='btnTool' title='As alterações são salvas automaticamente a cada 30 segundos' onClick={save} disabled={salvando} >{salvando ? <AiOutlineLoading3Quarters className='loadingIcon' /> :<IoMdSave />}
          </button>

          {/* Outras ferramentas: */}
          <div className='dropdownTool'>
            <button className="btnTool dropdownTool-toggle" title="Outras ferramentas"><IoSettingsOutline /></button>
            <div className='dropdownTool-menu'>
              <button 
                className={`btnSwitch ${modoOriginalAtivo ? 'btnSwitchClicked' : ''}`} title='Reportar erro' onClick={restaurarTextoOriginal} disabled={loadingOriginal}><ToggleSwitch isOn={modoOriginalAtivo} handleToggle={restaurarTextoOriginal} />Texto original
              </button>

              <button className='btnTool' title='Exibir texto revogado' onClick={()=>setAlertMsg('Reporte o erro clicando no botão ⚠︎ que aparece ao passar o mouse no texto da lei')} ><TiWarningOutline /> Reportar erro</button>

                <div className='letrasize'>
                  <button className='btnTool' onClick={() => setFontSize(prev => Math.max(prev - 1, 12))} title="Diminuir texto">A-</button>
                  <span style={{ fontSize: '0.9em' }}>{fontSize}px</span>
                  <button className='btnTool' onClick={() => setFontSize(prev => Math.min(prev + 1, 28))} title="Aumentar texto">A+</button>
                </div>

              <button className='btnTool' title='' >LANÇAMENTO VERSÃO BETA:</button>
              <button className='btnTool' title='' >Refs cruzadas</button>
              <button className='btnTool' title='' >Editar comentários</button>
              <button className='btnTool' title='' >"Ver mais..." nos comentários</button>
              <button className='btnTool' title='' >Comentários mt grandes quebram a view</button>
              <button className='btnTool' title='' >Autosave a cada 30s</button>
              <button className='btnTool' title='' >SEO optimization - Next.JS???</button>
              <button className='btnTool' title='' >Colocar leis principais</button>
              <button className='btnTool' title='' >---------------------------</button>
              <button className='btnTool' title='' >MELHORAMENTOS POSTERIORES:</button>
              <button className='btnTool' title='' >Teclas de atalho</button>
              <button className='btnTool' title='' >Inserir conteúdo do Vade Mecum Saraiva</button>
              <button className='btnTool' title='' >Recalcular página para revogados ???</button>
              <button className='btnTool' title='' >Lazy load comments só da pág visível</button>
              <button className='btnTool' title='' >Quebrar comentários em colunas ???</button>
              <button className='btnTool' title='' >Entender como monitorar e melhorar performance</button>
              <button className='btnTool' title='' >Marca-página ou menu de títulos?</button>
              
              
            </div>
          </div>

        </div>
    </div>
    <div className='alertContainer'>
          {alertMsg && (<AlertMessage message={alertMsg} onClose={()=>setAlertMsg(null)} />)}
    </div>
    </>
    
  )
}

export default ToolBar