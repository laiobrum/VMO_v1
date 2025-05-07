import { useEffect, useState } from "react"

const TesteLei = () => {
    const [testeTexto, setTexto] = useState('')
    useEffect(()=>{
        const texto = localStorage.getItem('texto-temporário')
        setTexto(texto)
    }, [])

  return (
    <div>
        <div dangerouslySetInnerHTML={{ __html: testeTexto}}/>
    </div>
  )
}

export default TesteLei