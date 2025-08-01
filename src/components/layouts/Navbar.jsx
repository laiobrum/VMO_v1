import { NavLink, useLocation } from 'react-router-dom'
import './NavFoot.css'
import { useAuthValue } from '../../context/AuthContext'
import { useAuthentication } from '../../hooks/useAuthentication'
import { BsPersonFill } from "react-icons/bs";
import { MdOutlineArrowDropDown } from 'react-icons/md'
import { useEffect, useRef, useState } from 'react'
import { useAdminAccess } from '../../hooks/useAdminAccess';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const {user} = useAuthValue()
  const {isAdmin} = useAdminAccess(user)
  const {logout} = useAuthentication()
  const location = useLocation()
  const isOnLawPage = /^\/leis\/[^/]+$/.test(location.pathname)

  const toggleDropDown = () => { setDropdownOpen(prev => !prev) }

  //Fecha o dropdown menu ao clicar fora
  useEffect(()=> {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {//Se o clique for dentro do dropdown, não vai recolher
        setDropdownOpen(false)//Se o clique for fora, fecha
      }
    }
    document.addEventListener('mousedown', handleClickOutside)//Chama a função quando mousedown no documento todo
    return () => document.removeEventListener('mousedown', handleClickOutside)//Função de limpeza - quano desmonta o componente, o evento vai ser removido
  }, [])

  //Fecha dropdown ao clicar em itens internos
  const handleItemClick = (callback) => {
    setDropdownOpen(false)
    if (callback) callback()
  }

    return (
      <nav>
          <h3><NavLink className='a1' to='/'>VMO</NavLink></h3>
          <ul>
            {user ? 
            <>
              <li className='dropdown' ref={dropdownRef}><span className='dropdown-toggle' onClick={toggleDropDown}><BsPersonFill className='profileIcon' /> {user.displayName} <MdOutlineArrowDropDown /></span>

                <ul className={`dropdown-menu ${dropdownOpen ? 'open' : ''}`}>
                  <NavLink className='a1' to='/profile' onClick={() => handleItemClick()}><li>Meu Painel </li></NavLink>
                  <NavLink className='a1' to='/leis-usuario'><li>Minhas Leis</li></NavLink>
                  {isAdmin && (
                    <>
                      <NavLink className='a1' to='/insertlaws'><li>Incluir leis</li></NavLink>
                      <NavLink to='/insertlaws/comparar' target="_blank" rel="noopener noreferrer" className="a1 "><li>Comparar Leis</li></NavLink>
                    </>
                  )}
                  
                  <li className='btn3' onClick={() => handleItemClick(logout)}>Sair</li>
                </ul>
              </li>
              
            </>
            :
            <>
              <li><NavLink className='a1' to='/login'>Entrar</NavLink></li>
              <li><NavLink className='a2' to='/register'>Cadastre-se gratuitamente</NavLink></li>
            </>
            }
              
          </ul>
      </nav>
    )
  }

  export default Navbar
