/* ESTRUTURA DE DADOS:
users (coleção)
 └─ {userId} (documento)
     └─ alteracoesUsuario (subcoleção)
         └─ {leiId} (documento)
             └─ disps (subcoleção)
                 └─ {paragrafoId} (documento)
                      - id: "art1"
                      - html: "<p id='art1'>Texto com marcação</p>"
                      - atualizadoEm: timestamp
*/
import { collection, doc, getDocs, setDoc } from "firebase/firestore"
import { db } from "../firebase/config"
import { useState } from "react"

export const useSaveUserAlterations = ({ bookRef, userId, leiId }) => {
  const [salvando, setSalvando] = useState(false)

  const save = async () => {
    if (!bookRef?.current || !userId || !leiId) return

    try {
      setSalvando(true)

      // 1. BUSCA OS PARÁGRAFOS ORIGINAIS
      const originalDispsSnap = await getDocs(collection(db, "leis", leiId, "disps"))
      const originalMap = new Map()
      originalDispsSnap.forEach(doc => {
        originalMap.set(doc.id, doc.data().html.trim())
      })

      // 2. OBTÉM OS PARÁGRAFOS ATUAIS DO USUÁRIO NA TELA
      const renderedParagraphs = Array.from(bookRef.current.querySelectorAll(".column > p, .column > div"))
      const altered = []

      for (const p of renderedParagraphs) {
        const id = p.getAttribute("id")
        if (!id) continue

        const htmlAtual = p.outerHTML.trim()
        const htmlOriginal = originalMap.get(id)

        if (!htmlOriginal || htmlAtual !== htmlOriginal) {
          altered.push({ id, html: htmlAtual })
        }
      }

      // 3. SALVA SOMENTE OS QUE FORAM ALTERADOS
      const dispsRef = collection(db, "users", userId, "alteracoesUsuario", leiId, "disps")
      for (const p of altered) {
        await setDoc(doc(dispsRef, p.id), {
          id: p.id,
          html: p.html,
          atualizadoEm: new Date()
        })
      }

      console.log(`Salvos ${altered.length} parágrafos alterados`)
    } catch (error) {
      console.error("Erro ao salvar alterações do usuário:", error)
    } finally {
      setSalvando(false)
    }
  }

  return { save, salvando }
}