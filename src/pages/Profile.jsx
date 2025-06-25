import { Link, NavLink } from "react-router-dom"
import { useAuthValue } from "../context/AuthContext"
import { useAdminAccess } from "../hooks/useAdminAccess"
import { MdOutlineArrowDropDown } from "react-icons/md"

const Profile = () => {
    const {user} = useAuthValue()
    const {isAdmin} = useAdminAccess(user)

  return (
    <>
      <div>
          {user && 
          <>
            <h1>Olá, {user.uid}</h1>
            <h2>{user.displayName}</h2>
            <h3>{user.email}</h3>
            <h3>Alterar dados</h3>
            <Link to='/recoverPassword'>Alterar senha</Link>
          </>
          }
          <h2>Estas são as leis que você marcou ou comentou:</h2>
      </div>

      

      {isAdmin && <NavLink className='a2' to='/restrictarea'>Área Restrita</NavLink>}
    </>
  )
}

export default Profile