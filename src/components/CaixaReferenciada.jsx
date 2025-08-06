import { useEffect, useState, useRef } from "react"
import { db } from "../firebase/config"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"



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
  const tooltipRef = useRef(null);
  const [tooltipTop, setTooltipTop] = useState(pos.top);


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

        // const artigosPromises = artigosExtraidos.map(async (artId) => {
        //   const artDoc = await getDoc(doc(db, "leis", leiDoc.id, "disps", artId))
        //   if (artDoc.exists()) return artDoc.data().html
        //   return `<p><i>Artigo ${artId.replace('art', '')} não encontrado.</i></p>`
        // })

        const artigosPromises = artigosExtraidos.map(async (artId) => {
          const artDoc = await getDoc(doc(db, "leis", leiDoc.id, "disps", artId));
          if (!artDoc.exists()) {
            return `<p><i>Artigo ${artId.replace('art', '')} não encontrado.</i></p>`;
          }

          const htmlArtigo = artDoc.data().html;

          // Se for a DEL2848, vamos tentar puxar o tipo penal antes do artigo
          if (codigoLei === 'DEL2848') {
            // Encontrar o <p id="art312"> ou correspondente
            const artigoIndex = paragrafos.findIndex(p => p.includes(`id="${artId}"`));
            if (artigoIndex > 0) {
              const anterior = paragrafos[artigoIndex - 1];
              const isTipoPenal = anterior.includes('class="tipoPenal"');
              if (isTipoPenal) {
                return anterior + htmlArtigo;
              }
            }
          }

          return htmlArtigo;
        });


        const artigosHtml = await Promise.all(artigosPromises)
        setArtigos(artigosHtml)

        setTimeout(() => {
          if (tooltipRef.current) {
            const alturaReal = tooltipRef.current.offsetHeight;
            const margem = 20;
            const novaTop = pos.top + alturaReal + margem > window.innerHeight
              ? pos.top - alturaReal - 90
              : pos.top + 12;
            setTooltipTop(novaTop);
          }
        }, 0);

      } catch (error) {
        setConteudo(["<p><i>Erro ao buscar a lei.</i></p>"])
      }
    }

    fetchLeiEArtigos()
  }, [codigoLei, textoSpan])

  const alturaCaixa = 250; // altura estimada da caixa em pixels
  const margem = 20;
  const deveAbrirParaCima = pos.top + alturaCaixa + margem > window.innerHeight;

  const estiloTooltip = {
    position: 'absolute',
    top: tooltipTop,
    left: pos.left,
    zIndex: 9999,
    background: 'white',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '12px',
    maxWidth: '450px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
  };

  return (
    <div className="tooltip-referencia" ref={tooltipRef} style={estiloTooltip}>


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



