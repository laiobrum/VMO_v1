import { NavLink } from 'react-router-dom'
import './NavFoot.css'
import { useAuthValue } from '../../context/AuthContext'
import { useAuthentication } from '../../hooks/useAuthentication'
import { CgProfile } from "react-icons/cg"
import { MdOutlineArrowDropDown } from 'react-icons/md'

const Navbar = () => {
  const {user} = useAuthValue()
  const {logout} = useAuthentication()

    return (
      <nav>
          <h3><NavLink className='a1' to='/'>VMO</NavLink></h3>
          <ul>
            {user ? 
            <>
              <div> 
                <li><CgProfile /> {user.displayName} <MdOutlineArrowDropDown /></li>
                <container>
                  <li><NavLink className='a1' to='/profile'>Meu Painel</NavLink></li>
                  <li><button className='btn3' onClick={logout}>Sair</button></li>
                </container>
              </div>
              
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
