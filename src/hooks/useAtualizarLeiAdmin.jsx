// src/hooks/useAtualizarLei.jsx
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

export const useAtualizarLeiAdmin = () => {
  const atualizarLei = async ({ leiId, alteracoes = {}, inclusoes = [] }) => {
    if (!leiId) throw new Error("leiId é obrigatório");

    const dispsRef = (id) => doc(db, "leis", leiId, "disps", id);

    function htmlToText(html) {
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.innerText;
    }

    try {
      // Processar alterações (revogações e modificações)
      for (const [id, info] of Object.entries(alteracoes)) {
        const docOriginalRef = dispsRef(id);
        const snap = await getDoc(docOriginalRef);
        if (!snap.exists()) {
          console.warn(`Dispositivo ${id} não encontrado`);
          continue;
        }

        const originalData = snap.data();

        // Copiar doc original para novo ID com "rv"
        const idRevogado = id + "rv";
        const docRevogadoRef = dispsRef(idRevogado);

        const textoLimpo = htmlToText(originalData.html);
        const htmlRevogado = `<p id="${idRevogado}" class="revogado aparecer"><del>${textoLimpo}</del></p>`;
        await setDoc(docRevogadoRef, {
            id: idRevogado,
            html: htmlRevogado,
            ordem: originalData.ordem - 0.01,
            createdAt: serverTimestamp()
        });

        // Deletar o original
        await deleteDoc(docOriginalRef);

        if (info.tipo === "alteracao") {
          // Criar novo doc com ID original (nova redação)
          const nota = `<span class="leiRef2 aparecer">(Redação dada pela ${info.leiModificadora})</span>`;
          const novoHtml = info.novoHtml.replace('</p>', `${nota}</p>`); // insere antes do fechamento do <p>

          await setDoc(docOriginalRef, {
            id,
            html: novoHtml,
            ordem: originalData.ordem,
            createdAt: serverTimestamp()
          });
        }

        // Se for só revogação, insere apenas a revogação com o span
        if (info.tipo === "revogacao") {
          const htmlRevogado = `<p id="${id}" class="revogado aparecer"><span class="leiRef2 aparecer">(Revogado pela ${info.leiModificadora})</span></p>`;
          await setDoc(docOriginalRef, {
            id,
            html: htmlRevogado,
            ordem: originalData.ordem,
            createdAt: serverTimestamp()
          });
        }
      }

      // Processar inclusões
      for (const novo of inclusoes) {
        if (!novo.id || !novo.html || novo.ordem == null) {
          console.warn(`Inclusão inválida:`, novo);
          continue;
        }

        const nota = `<span class="leiRef2 aparecer">(Incluído pela ${novo.leiModificadora})</span>`;
        const htmlComNota = novo.html.replace('</p>', `${nota}</p>`);

        await setDoc(dispsRef(novo.id), {
          id: novo.id,
          html: htmlComNota,
          ordem: novo.ordem,
          createdAt: serverTimestamp()
        });
      }

      return { success: true };

    } catch (error) {
      console.error("Erro ao atualizar lei:", error);
      return { success: false, error: error.message };
    }
  };

  return { atualizarLei };
};
