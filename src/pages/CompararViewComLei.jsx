
DESISTOOOOOOOOOOOOOOOOOOOOO VOU COLOCAR NA BASE DE DADOS O HTML DA LEI ORIGINAL E FAZER A COMPARAÇÃO COM ELE. 
DAÍ, VOU PEGAR E EXIBIR A COMPARAÇÃO SOMENTE COM AS LEIS MAIS IMPORTANTES!

import { useLocation } from 'react-router-dom'
import DiffViewer from 'react-diff-viewer'

const CompararViewComLei = () => {
  const { state } = useLocation()
  const { textoAtual, textoOriginal } = state || {}

  if (!textoAtual || !textoOriginal) return <p>Dados insuficientes para comparação.</p>

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Comparação entre texto original e atual</h2>
      <DiffViewer
        oldValue={textoOriginal}
        newValue={textoAtual}
        splitView={true}
        showDiffOnly={false}
      />
    </div>
  )
}

export default CompararViewComLei
