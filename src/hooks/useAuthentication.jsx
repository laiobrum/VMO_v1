import { useState } from 'react'
// Autenticação
import { auth, db, googleProvider } from '../firebase/config'
import {createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

export const useAuthentication = () => {
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(null)
    const [confirmMessage, setConfirmMessage] = useState(null)
    const [cancelled, setCancelled] = useState(false)

    function checkIfItsCancelled(){
        if (cancelled) {
            return
        }
    }

    //Login
    const login = async(email, password) => {
        checkIfItsCancelled()
        setLoading(true)
        setError(null)
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            if (!user.emailVerified) {
                auth.signOut()
                setError('O e-mail ainda não foi verificado. Por favor, verifique sua caixa de entrada, ou caixa de spam.') 
            }
            return user
        } catch (error) {
            console.log(error.message)
            let systemErrorMessage 
            if (error.message.includes('invalid-credential')) {
                systemErrorMessage = 'Senha ou login incorretos'
            } else {
                systemErrorMessage = 'Ocorreu algum erro. Tente novamente mais tarde'
            }
            setError(systemErrorMessage)
        } finally {
            setLoading(false)
        }
    }

    //Register com E-mail e senha
    const createUser = async(data, password) => {  
        checkIfItsCancelled()
        setLoading(true)
        setError(null)
        try {
            //Criação de usuário no Authentication
            const {user} = await createUserWithEmailAndPassword(auth, data.email, password)
            await updateProfile(user, {
                displayName: data.name
            })
            //Criar usuário no firestore
            await setDoc(doc(db, "users", user.uid), {
                name: data.name,
                surname: data.surname,
                email: data.email,
                role: data.role,
            })
            //Verificação de e-mail
            await sendEmailVerification(user)
            setConfirmMessage('Verifique seu e-mail para ativar sua conta. Confira a caixa de spam.')
            return user
        } catch (error) {
            console.log(error)
            let systemErrorMessage 
            if (error?.message?.includes('email-already')) {
                systemErrorMessage = 'O e-mail já está sendo usado. Tente outro.'
            } else {
                systemErrorMessage = 'Ocorreu algum erro. Tente novamente mais tarde'
            }
            setError(systemErrorMessage)
        } finally {
            setLoading(false)
        }
    }
    //Registrar ou entrar com o Google - é o mesmo método para registrar e entrar. Não tendo, ele registra automaticamente
    const signInWithGoogle = async() =>{
        try {
            //Criar usuário com google
            const res = await signInWithPopup(auth, googleProvider)
             
             //PROBLEMA: Não tenho o usuário criado no firestore! Ver como fazer depois! Ou até ver se é necessário!
             
            return res.user
        } catch (error) {
            setError(error.message)
        }
    }

    //Logout
    const logout = () => {
        signOut(auth)
    }

    return { createUser, signInWithGoogle, logout, login, error, loading, confirmMessage }
}