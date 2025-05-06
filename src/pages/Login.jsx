import { useState } from "react";
import './Forms.css'
import { Link } from "react-router-dom";
import { useAuthentication } from "../hooks/useAuthentication";
import { FcGoogle } from "react-icons/fc";

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const {login, signInWithGoogle, error: authError} = useAuthentication()
    const handleSubmit = (e) =>{
      e.preventDefault()
      login(email, password)
      return
    }

    return (
      <>
        <div className="formContainer">
          <h2>Entre</h2>
            <form onSubmit={handleSubmit}>
                <label className="formControl">
                    <span htmlFor="email">Nome: </span>
                    <input id="emailInput" type="text" name="email" placeholder="Digite seu email" onChange={(e)=>setEmail(e.target.value)} required />
                </label>
                <label className="formControl">
                    <span htmlFor="name">Senha: </span>
                    <input id="nameInput" type="password" name="name" placeholder="Digite seu nome" onChange={(e)=>setPassword(e.target.value)} required />
                    <div>
                      {authError && <p>Esqueceu sua senha? <Link to='/recoverPassword'>Clique Aqui</Link></p>}
                    </div>
                </label>

                <input className="standardBtn" type="submit" />
                {authError ? <p className="errorMessage">{authError}</p> : ''}
            </form>
            <p>Cadastre-se: <Link to='/register'>Clique Aqui</Link></p>
      </div>

      <div className="formContainer">
        <button onClick={signInWithGoogle} className="btn2"><FcGoogle /> Entre com o Google</button>
      </div>
    </>
  )
}

export default Login