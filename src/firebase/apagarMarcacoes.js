/* >>> IMPORTANTE!!!!!!!!!!!!!!
-------------------------------
EXPLICAÇÃO:
Apagar um comentário, adicionar uma marcação, inserir um dispositivo é uma coisa
Mas, APAGAR EM LOTE UM MONTE DE COISAS DOS USUÁRIOS É OUTRA!
Isso é uma falha de segurança!
Não pode ser dado acesso a isso no frontend!
Por isso isso aqui existe!
-------------------------------
>>> IMPORTANTE!!!!!!!!!!!!!! */

// apagarMarcacoes.js (ESM) — move comentários p/ {dispId}rv e copia HTML REVOGADO da base leis
import admin from "firebase-admin";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// __dirname em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega a chave de serviço
const serviceAccountPath = path.resolve(
  `${__dirname}/keys-SUPER-PRIVATE/`,
  "vmo-v1-firebase-adminsdk-fbsvc-eba40236fe.json"
);
if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ Não encontrei firebase-service-account.json em", serviceAccountPath);
  process.exit(1);
}
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Admin
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
const { FieldValue } = admin.firestore;

const AVISO = '<b class="redTxt">Comentário de dispositivo revogado</b>';

function ensureAvisoOnce(htmlComentario) {
  if (typeof htmlComentario !== "string") return htmlComentario;
  if (htmlComentario.includes(AVISO)) return htmlComentario; // já tem
  const idx = htmlComentario.indexOf(">");
  if (idx === -1) return htmlComentario + AVISO;
  return htmlComentario.slice(0, idx + 1) + AVISO + htmlComentario.slice(idx + 1);
}

function updateDivIdComentario(htmlComentario, oldDispId, newDispId) {
  if (typeof htmlComentario !== "string") return htmlComentario;
  return htmlComentario.replace(
    new RegExp(`id=["']${oldDispId}-cmt["']`, "i"),
    `id="${newDispId}-cmt"`
  );
}

// cache local: { pid: htmlRevogado }
const revokedHtmlCache = new Map();

async function getRevokedHtml(leiId, pid) {
  if (revokedHtmlCache.has(pid)) return revokedHtmlCache.get(pid);
  const rvRef = db.doc(`leis/${leiId}/disps/${pid}rv`);
  const rvSnap = await rvRef.get();
  if (!rvSnap.exists) {
    console.warn(`⚠️ Não encontrei leis/${leiId}/disps/${pid}rv — vou pular criação no users.`);
    revokedHtmlCache.set(pid, null);
    return null;
  }
  const html = rvSnap.data().html || null;
  revokedHtmlCache.set(pid, html);
  return html;
}

/**
 * Para cada dispId informado:
 *  - Se houver comentario no doc do usuário: cria/atualiza users/.../disps/{dispId}rv com o HTML REVOGADO da base leis e o comentário ajustado; apaga doc antigo
 *  - Se não houver: apaga doc antigo
 */
export async function apagarMarcacoesUsuariosEmLote(leiId, paragrafoIds) {
  if (!leiId || !paragrafoIds?.length) {
    throw new Error("leiId e lista de paragrafoIds são obrigatórios");
  }

  // Pré-carrega HTML revogado de todos os dispIds (1 leitura por dispId)
  await Promise.all(paragrafoIds.map(pid => getRevokedHtml(leiId, pid)));

  const usersSnap = await db.collection("users").get();
  console.log(`👥 Usuários encontrados: ${usersSnap.size}`);
  console.log(`🧩 Dispositivos-alvo: ${paragrafoIds.join(", ")}`);

  const writer = db.bulkWriter();
  writer.onWriteError((err) => {
    if (err.failedAttempts < 5) {
      console.warn(`⚠️ Retry ${err.failedAttempts} →`, err.documentRef.path);
      return true;
    }
    console.error("💥 Falha permanente:", err.documentRef.path, err.message);
    return false;
  });

  let movidos = 0, deletados = 0, inexistentes = 0, puladosSemHtmlRv = 0;

  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;

    for (const pid of paragrafoIds) {
      const oldRef = db.doc(`users/${userId}/alteracoesUsuario/${leiId}/disps/${pid}`);
      const snap = await oldRef.get();

      if (!snap.exists) {
        inexistentes++;
        continue;
      }

      const data = snap.data() || {};
      const temComentario = typeof data.comentario === "string" && data.comentario.trim() !== "";

      if (temComentario) {
        const revokedHtml = revokedHtmlCache.get(pid);
        if (!revokedHtml) {
          // Sem HTML revogado em leis — não cria {pid}rv pra esse usuário
          // (evita sobrescrever com html vazio)
          writer.delete(oldRef);
          puladosSemHtmlRv++;
          continue;
        }

        const newPid = `${pid}rv`;
        const newRef = db.doc(`users/${userId}/alteracoesUsuario/${leiId}/disps/${newPid}`);

        // Ajusta comentário: aviso + troca id do <div ...-cmt>
        let comentarioAjustado = ensureAvisoOnce(data.comentario);
        comentarioAjustado = updateDivIdComentario(comentarioAjustado, pid, newPid);

        // Cria/atualiza novo doc com HTML revogado oficial + comentário
        writer.set(
          newRef,
          {
            id: newPid,
            html: revokedHtml,          // <- HTML revogado oficial da base leis
            comentario: comentarioAjustado,
            atualizadoEm: FieldValue.delete(),
          },
          { merge: true }
        );

        // Apaga o antigo
        writer.delete(oldRef);
        movidos++;
      } else {
        // Sem comentário: só apaga o antigo
        writer.delete(oldRef);
        deletados++;
      }
    }
  }

  await writer.close();
  console.log(
    `✅ Movidos (com comentário → *rv): ${movidos} | Deletados (sem comentário): ${deletados} | Inexistentes: ${inexistentes} | Pulados (sem html revogado em leis): ${puladosSemHtmlRv}`
  );
  console.log("🏁 Concluído.");
}

// CLI
if (process.argv.length >= 4) {
  const [, , leiId, ...ids] = process.argv;
  apagarMarcacoesUsuariosEmLote(leiId, ids).catch((e) => {
    console.error("Erro no lote:", e);
    process.exit(1);
  });
} else {
  console.log("Uso: node apagarMarcacoes.js <leiId> <paragrafoId1> <paragrafoId2> ...");
  process.exit(1);
}






// if (!fs.existsSync(serviceAccountPath)) {
//   console.error("❌ Não encontrei firebase-service-account.json em", serviceAccountPath);
//   process.exit(1);
// }
// const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// // Inicializa Admin
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
// const db = admin.firestore();

// /**
//  * Apaga marcações de múltiplos parágrafos para TODOS os usuários, em lote.
//  * - Sem get() (delete direto)
//  * - Com BulkWriter (paraleliza + retries)
//  */
// export async function apagarMarcacoesUsuariosEmLote(leiId, paragrafoIds) {
//   if (!leiId || !paragrafoIds?.length) {
//     throw new Error("leiId e lista de paragrafoIds são obrigatórios");
//   }

//   const usersSnap = await db.collection("users").get();
//   console.log(`👥 Usuários encontrados: ${usersSnap.size}`);
//   console.log(`🧩 Dispositivos a apagar: ${paragrafoIds.join(", ")}`);

//   const writer = db.bulkWriter();
//   // Retry automático com backoff
//   writer.onWriteError((err) => {
//     if (err.failedAttempts < 5) {
//       console.warn(`⚠️ Tentando novamente (${err.failedAttempts}) para`, err.documentRef.path);
//       return true; // retry
//     }
//     console.error("💥 Falha permanente:", err.documentRef.path, err.message);
//     return false;
//   });

//   let count = 0;
//   for (const userDoc of usersSnap.docs) {
//     const userId = userDoc.id;
//     for (const pid of paragrafoIds) {
//       const ref = db.doc(`users/${userId}/alteracoesUsuario/${leiId}/disps/${pid}`);
//       writer.delete(ref);
//       count++;
//     }
//   }

//   await writer.close(); // aguarda todas as operações
//   console.log(`✅ Deleções enfileiradas: ${count}`);
//   console.log("🏁 Concluído.");
// }

// // CLI: node apagarMarcacoes.js <leiId> <paragrafoId1> <paragrafoId2> ...
// if (process.argv.length >= 4) {
//   const [, , leiId, ...ids] = process.argv;
//   apagarMarcacoesUsuariosEmLote(leiId, ids).catch((e) => {
//     console.error("Erro no lote:", e);
//     process.exit(1);
//   });
// } else {
//   console.log("Uso: node apagarMarcacoes.js <leiId> <paragrafoId1> <paragrafoId2> ...");
//   process.exit(1);
// }





// // apagarMarcacoes.js
// import admin from "firebase-admin";
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";

// // Emula __dirname em ESM
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Caminho absoluto para sua chave de serviço
// const serviceAccountPath = path.resolve(__dirname, "vmo-v1-firebase-adminsdk-fbsvc-58b7a13ae1.json");
// const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// // Inicializa o Firebase Admin
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// const db = admin.firestore();

// export async function apagarMarcacoesUsuarios(leiId, paragrafoId) {
//   const usersSnap = await db.collection("users").get();

//   for (const userDoc of usersSnap.docs) {
//     const userId = userDoc.id;
//     const ref = db.doc(`users/${userId}/alteracoesUsuario/${leiId}/disps/${paragrafoId}`);
//     const snap = await ref.get();
//     if (snap.exists) {
//       await ref.delete();
//       console.log(`🗑️ Apagado: ${userId} > ${leiId} > ${paragrafoId}`);
//     }
//   }

//   console.log("✅ Concluído.");
// }

// // Executa se chamado diretamente
// if (process.argv.length === 4) {
//   const leiId = process.argv[2];
//   const dispId = process.argv[3];
//   apagarMarcacoesUsuarios(leiId, dispId);
// }
