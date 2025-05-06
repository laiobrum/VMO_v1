import { sendPasswordResetEmail } from "firebase/auth"
import { useState } from "react"
import { auth } from "../firebase/config"


const Recover = () => {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async(evt) =>{
        evt.preventDefault()
        setMessage('')
        setError('')

        try {
            await sendPasswordResetEmail(auth, email)
            setMessage('Se este e-mail estiver cadastrado, você receberá um link para recuperação da senha.')
        } catch (error) {
            setError('Erro ao enviar o e-mail de recuperação. Verifique o endereço de e-mail informado')
            console.error(error.message)
        }
    }

  return (
    <div className="formContainer">
        <h2>Recuperação de senha</h2>
            <form onSubmit={handleSubmit}>
                <label className="formControl">
                    <span>Digite seu e-mail: </span>
                    <input type="email" name="email" placeholder="Digite seu email" onChange={(e)=>setEmail(e.target.value)} required />
                </label>
                <input type="submit" />
            </form>
            {error && <p className="errorMessage">{error}</p>}
            {message && <p className="errorMessage">{message}</p>}
    </div>
  )
}

export default Recover