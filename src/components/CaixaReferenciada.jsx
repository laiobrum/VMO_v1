/* Agora vou te passar uma tarefa muito complexa, que preciso que você raciocine bem em como é a melhor forma de implantá-la.
Considere tudo o que eu já te falei sobre meu projeto de consulta de leis, que estou construindo.
Conhecendo meu projeto e minha estrutura de dados como exemplificada abaixo, que é usada para salvar a lei em seu texto original, preciso que você me ajude a criar um componente e um hook que crie as referências cruzadas no meu texto de lei. O objetivo é conseguir alterar a lei original na base de dados. Como deve ser isso:
Há dispositivos legais que referenciam outros, por exemplo:
<p id="p14"><span class="titles">V - </span>por crime previsto na <span class="leiRef"> Lei nº 13.260, de 16 de março de 2016;</span></p>
Para conseguirmos fazer isso, eu já criei o <span class="leiRef">, que consegue separar o texto de lei que deve ser referenciado, bem como para conseguir transformá-lo em um botão, que ao ser apertado, abrirá uma caixa flutuante, que mostrará os primeiros <p> que existem na lei, que são os <p> que explicam o que a lei se trata, o chamado "preâmbulo".
Na base de dados, a lei já tem todas as referências necessárias, especialmente o campo L9455, que criei para facilitar encontrar a lei. No meu exemplo de span acima, normalizar Lei 13.260 para L13256 pode ajudar a encontrar a lei referida na base de dados. Lembrar que existem vários tipos de normas, como Lei (L) Decreto (D), Decreto-Lei (DEL), Medida Provisória (MP), Constituição Federal (CF), Lei Complementar (LC), Emenda Constitucional (EC), entre outros tipos de normas, que poderão ser considerados quando aparecerem.
Importante considerar que estou pedindo uma funcionalidade que realize a criação de referências cruzadas como um processo que vai acontecer ao longo do tempo, que vai sempre buscar as referências de uma lei nova que eu estiver inserindo no banco de dados, bem como buscar por todo banco de dados de leis originais algum dispositivo que referencie esta lei nova que estou inserindo.

leis (coleção)
│
├─ lei_8072_1990 (documento)
│   ├─ aTitle: "Lei dos Crimes Hediondos"
|   ├─ apelido: "lei-crimes-tortura"
│   ├─ numLeiC: "LEI Nº 9.455, DE 7 DE ABRIL DE 1997"
│   ├─ numLeiR: "L9455"
│   ├─ createdAt: timestamp
│   ├─ texto: "<p>texto corrido sem separação em html completo da lei aqui</p>"
│   └─ disps (subcoleção)
│       ├─ art1 (documento)
│       │   ├─ id: "art1"
│       │   ├─ html: "<p id='art1'>Art. 1º ...</p>"
│       │   ├─ ordem: 1
│       │   ├─ createdAt: timestamp
│       │   └─ comentariosPublicos (subcoleção)
│       │       ├─ comentario_abc123 (documento)
│       │       │   ├─ userId: "abc123"
│       │       │   ├─ nomeAutor: "Maria F."
│       │       │   ├─ comentario: "<p>Texto público...</p>"
│       │       │   ├─ criadoEm: timestamp
│       │       │   └─ reportado: false
│       │       └─ comentario_def456 (documento)
│       │           ├─ userId: "xyz789"
│       │           ├─ nomeAutor: "João S."
│       │           ├─ comentario: "<p>Outro comentário...</p>"
│       │           ├─ criadoEm: timestamp
│       │           └─ reportado: true
*/

import { useEffect, useState } from "react"
import { db } from "../firebase/config"
import { collection, query, where, getDocs } from "firebase/firestore"

const CaixaReferenciada = ({ codigoLei }) => {
  const [conteudo, setConteudo] = useState([])

  useEffect(() => {
    const fetchLei = async () => {
      const q = query(collection(db, "leis"), where("numLeiR", "==", codigoLei))
      const snap = await getDocs(q)
      if (!snap.empty) {
        const texto = snap.docs[0].data().texto
        const paragrafos = texto.match(/<p[^>]*>.*?<\/p>/gi) || []
        setConteudo(paragrafos.slice(0, 3))
      }
    }

    fetchLei()
  }, [codigoLei])

  return (
    <div className="tooltip-referencia"
    style={{
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        zIndex: 999,
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    }}>
      <button onClick={onClose} style={{ float: 'right' }}>✕</button>
      {conteudo.map((p, i) => (
        <div key={i} dangerouslySetInnerHTML={{ __html: p }} />
      ))}
    </div>
  )
}

export default CaixaReferenciada

