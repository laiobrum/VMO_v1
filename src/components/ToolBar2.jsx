import React, { useEffect, useState } from 'react'
import { PiHighlighterFill } from "react-icons/pi";
import { BiCommentEdit } from "react-icons/bi";
import { ImBold } from "react-icons/im";
import { MdFormatUnderlined } from "react-icons/md";
import { CgFormatStrike } from "react-icons/cg";
import { PiEraserFill } from "react-icons/pi";
import '../pages/lei.css'


const ToolBar2 = ({bookRef}) => {

  const handleTest = () => {
    console.log(bookRef)
  }


  return (
    <div className='toolbar2'>
      {/* ESTA TOOLBAR SÓ FUNCIONA PARA AÇÕES QUE ENVOLVEM APENAS O <p> HOVERED! */}
        <button onClick={handleTest}><BiCommentEdit /></button>
        <button><CgFormatStrike /></button>
    </div>
  )
}

export default ToolBar2