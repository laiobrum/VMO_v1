import { collection, doc, getDocs } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { db } from '../firebase/config'

const Testes = ({user}) => {
  const [teste, setTeste] = useState(null)
  const [leis, setLeis] = useState([])

useEffect(() => {
  const loadData = async () => {
    try {
      // Leis públicas
      const leiRef = collection(db, 'leis')
      const leiSnap = await getDocs(leiRef)

      const leis = []
      leiSnap.docs.forEach(doc => {
        leis.push({ id: doc.id, title: doc.data().aTitle })
      })
      setLeis(leis)

      // Dados do usuário, apenas se logado
      if (user) {
        const userRef = collection(db, 'users', user.uid, 'alteracoesUsuario', 'AVTOHmcZho0i3TCYSpX5', 'disps')
        const userSnap = await getDocs(userRef)
        userSnap.docs.forEach(doc => {
          // console.log('Dispositivos alterados: ', doc.data().id)
        })

        const originalRef = collection(db, "leis", 'AVTOHmcZho0i3TCYSpX5', "disps")
        const alteredRef = collection(db, "users", user.uid, "alteracoesUsuario", 'AVTOHmcZho0i3TCYSpX5', "disps")

        const [originalSnap, alteredSnap] = await Promise.all([
          getDocs(originalRef),
          getDocs(alteredRef)
        ])

        alteredSnap.forEach(doc => {
          const data = doc.data()
          const comentarioHTML = data.comentarioHTML ? data.comentarioHTML : ''
          const novoHtml = (data.html || "") + comentarioHTML
        })
      }

    } catch (error) {
      console.log('DEU ERRO, LAIO: ', error)
    }
  }

  loadData()
}, [])


  return (
    <div>
      <h1>CONFERIR SE NÃO TÁ SUBINDO .alterado PARA O BANCO DE DADOS!</h1>
      <h4>Meus testes</h4>
        {leis.map((lei)=>(
          <p key={lei.id}>{lei.title}: {lei.id}</p>
        ))}
    </div>
  )
}

export default Testes

