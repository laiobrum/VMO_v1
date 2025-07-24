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

      const alteredElements = Array.from(bookRef.current.querySelectorAll(".alterado"))

      for (const el of alteredElements) {
        let id, html = null, comentario = null

        // Caso 1: <p class="alterado">...</p>
        if (el.tagName === 'P') {
          id = el.getAttribute('id')
          if (!id) continue
          html = el.outerHTML.trim()
        }

        // Caso 2: <div class="cmt-user alterado"><p>comentário</p></div>
        else if (el.classList.contains('cmt-user')) {
        let prev = el.previousElementSibling
        while (prev && prev.tagName !== 'P') {
          prev = prev.previousElementSibling
        }
        if (!prev) continue

        id = prev.getAttribute('id')
        if (!id) continue

        const pElement = document.getElementById(id)
        if (!pElement) continue

        html = pElement.outerHTML.trim()

        if (el.textContent.trim()) {
          const clone = el.cloneNode(true)
          clone.classList.remove('alterado')
          comentario = clone.outerHTML.trim()
        }
      }

        // Não faz nada se não encontrou html nem comentário
        if (!html && !comentario) continue

        // Remove a classe 'alterado' do original
        el.classList.remove('alterado')

        // Salva no Firestore
        const docRef = doc(db, "users", userId, "alteracoesUsuario", leiId, "disps", id)
        await setDoc(docRef, {
          id,
          html,
          atualizadoEm: new Date(),
          ...(comentario && { comentario }) // só inclui se existir
        })
      }

      console.log(`Salvos ${alteredElements.length} elementos alterados`)
    } catch (error) {
      console.error("Erro ao salvar alterações do usuário:", error)
    } finally {
      setSalvando(false)
    }
  }

  return { save, salvando }
}
