import { useEffect, useState } from "react"
import { db } from "../firebase/config"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"

// function extrairArtigos(texto) {
//   const regex = /\b(art(?:s)?\.?|artigo(?:s)?)\s*(\d+[ºA-Z\-]*)/gi;
//   const matches = [...texto.matchAll(regex)];
//   const artigos = matches.map((m) =>
//     `art${m[2].replace('-', '').toLowerCase()}`
//   );
//   return [...new Set(artigos)];
// }

// function extrairArtigos(texto) {
//   const artigos = new Set();
//   const regexGrupo = /\b(art(?:s)?\.?|artigo(?:s)?)\s+([^<;.]+)/gi;

//   let match;
//   while ((match = regexGrupo.exec(texto)) !== null) {
//     const trecho = match[2];

//     const numeros = [...trecho.matchAll(/\d+[ºA-Z\-]*/gi)];

//     numeros.forEach(m => {
//       const normalizado = m[0].replace(/[-º]/g, '').toLowerCase();
//       artigos.add(`art${normalizado}`);
//     });
//   }

//   return [...artigos];
// }

function extrairArtigos(texto) {
  const artigos = new Set();
  // Encontra expressões como "art. 121-A", "arts. 118, 125 e 127", etc.
  const regexGrupo = /\b(art(?:s)?\.?|artigo(?:s)?)\s+([^<;.]+)/gi;
  let match;
  while ((match = regexGrupo.exec(texto)) !== null) {
    const trecho = match[2];
    // Ignorar referências a parágrafos
    const trechoLimpo = trecho.replace(/§{1,2}\s*\d+[º\.]*/gi, '');
    // Agora extraímos apenas os números e letras
    const numeros = [...trechoLimpo.matchAll(/\d+[ºA-Z\-]*/gi)];
    numeros.forEach(m => {
      const normalizado = m[0].replace(/[-º]/g, '').toLowerCase();
      // Evita incluir números muito curtos isolados (ex: '1' solto após vírgula)
      if (normalizado.length >= 2 || normalizado.match(/\d{2,}/)) {
        artigos.add(`art${normalizado}`);
      }
    });
  }

  return [...artigos];
}


const CaixaReferenciada = ({ codigoLei, pos, onClose, textoSpan }) => {
  const [conteudo, setConteudo] = useState([])
  const [artigos, setArtigos] = useState([])

  useEffect(() => {
    const fetchLeiEArtigos = async () => {
      try {
        const q = query(collection(db, "leis"), where("numLeiR", "==", codigoLei))
        const snap = await getDocs(q)

        if (snap.empty) {
          setConteudo(["<p><i>Lei não encontrada.</i></p>"])
          return
        }

        const leiDoc = snap.docs[0]
        const apelido = leiDoc.data().apelido
        const numLeiC = leiDoc.data().numLeiC
        const texto = leiDoc.data().texto
        const paragrafos = texto.match(/<p[^>]*>.*?<\/p>/gis) || []
        const paragrafos2a3 = paragrafos.slice(1, 3)
        const conteudoL = []
        conteudoL.push(apelido)
        conteudoL.push(numLeiC)
        conteudoL.push(paragrafos2a3)

        setConteudo(conteudoL)

        // Extrair artigos mencionados
        const artigosExtraidos = extrairArtigos(textoSpan)
        console.log(artigosExtraidos)
        if (artigosExtraidos.length === 0) return

        const artigosPromises = artigosExtraidos.map(async (artId) => {
          const artDoc = await getDoc(doc(db, "leis", leiDoc.id, "disps", artId))
          if (artDoc.exists()) return artDoc.data().html
          return `<p><i>Artigo ${artId.replace('art', '')} não encontrado.</i></p>`
        })

        const artigosHtml = await Promise.all(artigosPromises)
        setArtigos(artigosHtml)

      } catch (error) {
        setConteudo(["<p><i>Erro ao buscar a lei.</i></p>"])
      }
    }

    fetchLeiEArtigos()
  }, [codigoLei, textoSpan])

  return (
    <div
      className="tooltip-referencia"
      style={{
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        zIndex: 9999,
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '12px',
        maxWidth: '450px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}
    >

      <button onClick={onClose} style={{ float: 'right' }}>✕</button>
      {/* CONTEÚDO COM O TEXTO E LINK DA LEI: */}
        {conteudo.length >= 2 && (
          <p className="titles center">
            <a href={`/leis/${conteudo[0]}`} target="_blank" rel="noopener noreferrer">
              {conteudo[1]}
            </a>
          </p>
        )}
        {Array.isArray(conteudo[2]) &&
          conteudo[2].map((p, i) => (
            <div key={`p${i}`} dangerouslySetInnerHTML={{ __html: p }} />
          ))
        }
      {/* CONTEÚDO COM A MENSAGEM DE ERRO: */}
        {conteudo.length === 1 && typeof conteudo[0] === 'string' && (
          <div dangerouslySetInnerHTML={{ __html: conteudo[0] }} />
        )}

      {artigos.length > 0 && (
        <>
          <hr />
          <strong>Artigos citados:</strong>
          {artigos.map((html, i) => (
            <div key={`a${i}`} dangerouslySetInnerHTML={{ __html: html }} />
          ))}
        </>
      )}
    </div>
  )
}

export default CaixaReferenciada



