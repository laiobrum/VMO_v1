import React, { useEffect, useState } from 'react'
import { PiHighlighterFill } from "react-icons/pi";
import { BiCommentEdit } from "react-icons/bi";
import { ImBold } from "react-icons/im";
import { MdFormatUnderlined } from "react-icons/md";
import { CgFormatStrike } from "react-icons/cg";
import { PiEraserFill } from "react-icons/pi";
import '../pages/lei.css'
import { GoLaw } from 'react-icons/go';
import { IoIosPeople } from 'react-icons/io';
import { MdOutlineReport } from "react-icons/md";
import ReportarErro from './ReportarErro';


const ToolBar2 = ({bookRef, hoveredP, onToggleEditor, editorIsActive }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpen = () => setIsModalOpen(true)
  const handleClose = () => setIsModalOpen(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = new FormData(e.target)
    const nome = data.get('nome')
    const email = data.get('email')
    console.log("Dados enviados:", { nome, email })
    setIsModalOpen(false)
  }

  const handleTest = () => {
    console.log(bookRef)
  }

  return (
    <div className='toolbar2'>
      {/* ESTA TOOLBAR SÓ FUNCIONA PARA AÇÕES QUE ENVOLVEM APENAS O <p> HOVERED! */}
        <button className={`btnTool2 ${editorIsActive ? 'active' : ''}`} onClick={onToggleEditor} title='Exibir comentários'><BiCommentEdit /></button>
        <button className='btnTool2' onClick={handleTest} title='Exibir comentários da comunidade'><IoIosPeople /></button>
        <button className='btnTool2' onClick={handleTest} title='Exibir jurisprudência'><GoLaw /></button>
        <button className='btnTool2' onClick={handleOpen} title='Reportar erro'><MdOutlineReport /></button>
        <ReportarErro hoveredP={hoveredP} isOpen={isModalOpen} onClose={handleClose} onSubmit={handleSubmit} />
    </div> 
  )
}

export default ToolBar2