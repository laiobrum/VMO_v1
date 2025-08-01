import { collection, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "../firebase/config"

function normalizarReferencia(texto) {
  const tipoMap = {
    "Lei Complementar": "LC",
    "Lei Ordinária": "L",
    "Lei": "L",
    "Decreto-Lei": "DEL",
    "Decreto": "D",
    "Medida Provisória": "MP",
    "Constituição Federal": "CF",
    "Emenda Constitucional": "EC"
  };

  for (let tipo in tipoMap) {
    const regex = new RegExp(`${tipo}\\s*n[ºo]?\\s*(\\d{1,5})(?:,\\s*de)?`, "i");
    const match = texto.match(regex);
    if (match) {
      return tipoMap[tipo] + match[1];
    }
  }

  if (/constituição federal/i.test(texto)) return "CF";
  return null;
}

export const useCrossReferences = () => {
  const gerarReferencias = async () => {
    const leisSnapshot = await getDocs(collection(db, "leis"))

    for (const leiDoc of leisSnapshot.docs) {
      const leiId = leiDoc.id
      const dispsRef = collection(db, "leis", leiId, "disps")
      const dispsSnap = await getDocs(dispsRef)

      for (const disp of dispsSnap.docs) {
        const html = disp.data().html

        // Detectar referências e substituir por spans clicáveis
        const novaHtml = html.replace(/(Lei Complementar|Lei|Decreto-Lei|Decreto|Medida Provisória|Emenda Constitucional|Constituição Federal)[^<;]{3,80}?(\d{4})?/gi, (match) => {
          const codNorma = normalizarReferencia(match)
          return codNorma
            ? `<span class="leiRef" data-lei="${codNorma}">${match}</span>`
            : match
        })

        // Só atualiza se mudou
        if (novaHtml !== html) {
          await updateDoc(doc(db, "leis", leiId, "disps", disp.id), {
            html: novaHtml
          })
        }
      }
    }
  }

  return { gerarReferencias }
}