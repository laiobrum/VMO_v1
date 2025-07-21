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
import { collection, doc, setDoc } from "firebase/firestore"
import { db } from "../firebase/config"
import { useState } from "react"

export const useSaveUserAlterations = ({ bookRef, userId, leiId }) => {
  const [salvando, setSalvando] = useState(false)

  const save = async () => {
    if (!bookRef?.current || !userId || !leiId) return

    try {
      setSalvando(true)

      //Busca parágrafos marcados como alterados
      const alteredParagraphs = Array.from(bookRef.current.querySelectorAll(".alterado"))
      const altered = []

      for (const p of alteredParagraphs) {
        const id = p.getAttribute('id')
        if (!id) continue

        p.classList.remove('alterado')

        const alteredHtml = document.getElementById(id)?.outerHTML.trim()
        if (!alteredHtml) continue

        altered.push({ id, html: alteredHtml})
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