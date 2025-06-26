import { collection, getDocs } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { db } from '../../firebase/config'
import { NavLink } from 'react-router-dom'

const TodasLeis = () => {
    const [leis, setLeis] = useState([])
    console.log(leis)

    useEffect(() => {
        const fetchLeis = async () => {
            const ref = collection(db, 'leis')
            const snap = await getDocs(ref)
            const lista = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setLeis(lista)
        }
        fetchLeis()
    }, [])
  return (
    <div>
        <h1>Todas as leis</h1>

        <ul>
            {leis.map((lei) => (
                <li>
                    <NavLink to={`/leis/${lei.id}`}>{lei.title}</NavLink>
                </li>
            ))}
        </ul>
    </div>
  )
}

export default TodasLeis