import { useState } from "react";
import './Forms.css'
import { Link } from "react-router-dom";
import {useAuthentication} from '../hooks/useAuthentication'
import { FcGoogle } from "react-icons/fc";

function Register() {
    const [name, setName] = useState('')
    const [surname, setSurname] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setCofirmPassword] = useState('')
    const [error, setError] = useState('')

    const {createUser, signInWithGoogle, confirmMessage, error: authError, loading} = useAuthentication()

    const handleSubmit=(evt)=>{
      evt.preventDefault()
      //Validação de senha
      if (password !== confirmPassword) {
        setError('As senhas não coincidem!')
        return
      }
      const user = {
          name,
          surname,
          email,
          role: 'customer' //'admin' tem privilégios especiais, 'customer' é o usuário comum. A única forma de criar um usuário com privilégios especiais é alterando este código. Depois pesquisar como é a melhor prática!
          //Só funciona para login com e-mail e senha. Cadastrei laiobrum2@gmail.com e laio-brum@hotmail.com!
      }
      //Cria no banco de dados - hook
      const resAuth = createUser(user, password)
    }


    return (
      <>
        {!confirmMessage ? 
        <>
          <div className="formContainer">
            <h2>Registre-se</h2>
            <form onSubmit={handleSubmit}>
                <label className="formControl">
                    <span htmlFor="name">Nome: </span>
                    <input id="nameInput" type="text" name="name" placeholder="Digite seu nome" value={name} onChange={(e)=>setName(e.target.value)} required />
                </label>
                <label className="formControl">
                    <span htmlFor="surname">Sobrenome: </span>
                    <input id="surnameInput" type="text" name="surname" placeholder="Digite seu sobrenome" value={surname} onChange={(e)=>setSurname(e.target.value)} required />
                </label>
                <label className="formControl">
                    <span htmlFor="email">E-mail: </span>
                    <input id="email" type="email" name="email" placeholder="Digite seu e-mail" value={email} onChange={(e)=>setEmail(e.target.value)} required />
                </label>
                <label className="formControl">
                    <span htmlFor="password">Senha: </span>
                    <input id="passwordInput" type="password" name="password" placeholder="Digite sua senha" value={password} onChange={(e)=>setPassword(e.target.value)} required />
                </label>
                <label className="formControl">
                    <span htmlFor="confirmPassword">Confirme sua senha: </span>
                    <input id="confirmPassword" type="password" name="confirmPassword" placeholder="Confirme sua senha" value={confirmPassword} onChange={(e)=>setCofirmPassword(e.target.value)} required />
                    {error && <p>Esqueceu sua senha? <Link to='/recoverPassword'>Clique Aqui</Link></p>}
                </label>

                {!loading ? <input type="submit" /> : <input className="disabledBtn" type="submit" value='Enviando...' disabled/> }
                {error ? <p className="errorMessage">{error}</p> : ''}  
            </form>
            {authError ? <p className="errorMessage">{authError}</p> : ''}
            <p>Já tem cadastro? <Link to='/login'>Clique Aqui</Link></p>
          </div>

          <div className="formContainer">
            <button onClick={signInWithGoogle} className="btn2"><FcGoogle /> Registre-se com o Google</button>
          </div>
        </>
        : 
          //Mensagam de "Verifique seu e-mail para ativar sua conta. Confira a caixa de spam."
          <h3>{confirmMessage}</h3>
        }

      </>
        

    
  )
}

export default Register