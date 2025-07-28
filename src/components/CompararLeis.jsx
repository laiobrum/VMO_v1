import { useRef, useState } from "react"
import ReactDiffViewer from 'react-diff-viewer'

const CompararLeis = () => {
  const [original, setOriginal] = useState('')
  const [novaVersao, setNovaVersao] = useState('')
  const [mostrarDiff, setMostrarDiff] = useState(false)

  const diffRef = useRef(null)

  const comparar = (e) => {
    e.preventDefault()
    setMostrarDiff(true)

    diffRef.current?.scrollIntoView({behavior: "smooth"})
  }
  
  return (
    <>
      <h2>Comparar Leis</h2>
      <form onSubmit={comparar}>
        <div className='flex formContainer3'>
            <label className='formControl'><h3>Texto original da lei:</h3>
              <textarea type='textarea' name="antigo" onChange={e => setOriginal(e.target.value)}></textarea>
            </label >
            <label className='formControl'><h3>Meu texto do VMO:</h3>
              <textarea type='textarea' name="novo" onChange={e => setNovaVersao(e.target.value)}></textarea>
            </label>
        </div>
        <input type='submit' className='btn1' value='Comparar'/>

      </form>

      <div className="diffHeaders">
          <h3 className="diffHeader">Texto original da lei:</h3>
          <h3 className="diffHeader">Meu texto do VMO:</h3>
      </div>

      
      <div className="diffViewer" style={{ height: '90vh', overflowY: 'auto' }}>

        <div ref={diffRef} style={{ marginTop: "2rem" }}>
          <ReactDiffViewer
            oldValue={original}
            newValue={novaVersao}
            splitView={true}
            showDiffOnly={false}
            compareMethod="diffWords"
          />
        </div>
      </div>
    </>
  )
}

export default CompararLeis