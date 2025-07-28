import { useState } from "react";
import './Forms.css'
import { Link } from "react-router-dom";
import { useAuthentication } from "../hooks/useAuthentication";
import { FcGoogle } from "react-icons/fc";

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const {login, signInWithGoogle, error: authError} = useAuthentication()
    const handleSubmit = async (e) =>{
      e.preventDefault()
      const user = await login(email, password)
      if (user && user.emailVerified) {
        window.location.reload()//Força o App.jsx recarregar o contexto
      }
    }

    return (
      <>
        <div className="formContainer">
          <h2>Entre</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email" className="formControl">
                    <span>Nome: </span>
                    <input id="emailInput" type="text" name="email" placeholder="Digite seu email" onChange={(e)=>setEmail(e.target.value)} required />
                </label>
                <label htmlFor="senha" className="formControl">
                    <span>Senha: </span>
                    <input id="senhaInput" type="password" name="password" placeholder="Digite seu nome" onChange={(e)=>setPassword(e.target.value)} required />
                    <div>
                      {authError && <p>Esqueceu sua senha? <Link to='/recoverPassword'>Clique Aqui</Link></p>}
                    </div>
                </label>

                <input className="standardBtn" type="submit" value="Entrar" />
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