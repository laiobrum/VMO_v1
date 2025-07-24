import { collection, getDocs } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { db } from '../firebase/config'

const Testes = ({user}) => {
  console.log(user.uid.name)
  const [teste, setTeste] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        //Minha coleção leis ------------------------------------
        const leiRef = collection(db, 'leis')
        const leiSnap = await getDocs(leiRef)
        console.log('leisRef: ', leiRef)
        console.log('leisSnap: ', leiSnap)

        leiSnap.docs.forEach(doc=>(
          console.log('Títulos das leis: ', doc.data().aTitle)
        ))

        //Minha coleção users ------------------------------------
        // const userRef = collection(db, 'users', 'alteracoesUsuario', 'disps')
        // const userSnap = await getDocs(userRef)
        // userSnap.docs.forEach(doc => (
        //   console.log('Dispositivos alterados: ', doc.data().id)
        // ))
      } catch (error) {
        console.log('DEU ERRO, LAIO: ', error)
      }
    }

    loadData()
  }, [])

  return (
    <div>Testes</div>
  )
}

export default Testes

