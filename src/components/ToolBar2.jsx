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


const ToolBar2 = ({bookRef, onToggleEditor, editorIsActive }) => {

  const handleTest = () => {
    console.log(bookRef)
  }

  return (
    <div className='toolbar2'>
      {/* ESTA TOOLBAR SÓ FUNCIONA PARA AÇÕES QUE ENVOLVEM APENAS O <p> HOVERED! */}
        <button className={`btnTool2 ${editorIsActive ? 'active' : ''}`} onClick={onToggleEditor} title='Exibir comentários'><BiCommentEdit /></button>
        <button className='btnTool2' onClick={handleTest} title='Exibir comentários da comunidade'><IoIosPeople /></button>
        <button className='btnTool2' onClick={handleTest} title='Exibir jurisprudência'><GoLaw /></button>
    </div> 
  )
}

export default ToolBar2