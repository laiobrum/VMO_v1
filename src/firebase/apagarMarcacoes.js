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

// apagarMarcacoes.js (ESM)
import admin from "firebase-admin";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Emula __dirname em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega a chave de serviço
const serviceAccountPath = path.resolve(__dirname, "vmo-v1-firebase-adminsdk-fbsvc-58b7a13ae1.json");
if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ Não encontrei firebase-service-account.json em", serviceAccountPath);
  process.exit(1);
}
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Inicializa Admin
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

/**
 * Apaga marcações de múltiplos parágrafos para TODOS os usuários, em lote.
 * - Sem get() (delete direto)
 * - Com BulkWriter (paraleliza + retries)
 */
export async function apagarMarcacoesUsuariosEmLote(leiId, paragrafoIds) {
  if (!leiId || !paragrafoIds?.length) {
    throw new Error("leiId e lista de paragrafoIds são obrigatórios");
  }

  const usersSnap = await db.collection("users").get();
  console.log(`👥 Usuários encontrados: ${usersSnap.size}`);
  console.log(`🧩 Dispositivos a apagar: ${paragrafoIds.join(", ")}`);

  const writer = db.bulkWriter();
  // Retry automático com backoff
  writer.onWriteError((err) => {
    if (err.failedAttempts < 5) {
      console.warn(`⚠️ Tentando novamente (${err.failedAttempts}) para`, err.documentRef.path);
      return true; // retry
    }
    console.error("💥 Falha permanente:", err.documentRef.path, err.message);
    return false;
  });

  let count = 0;
  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;
    for (const pid of paragrafoIds) {
      const ref = db.doc(`users/${userId}/alteracoesUsuario/${leiId}/disps/${pid}`);
      writer.delete(ref);
      count++;
    }
  }

  await writer.close(); // aguarda todas as operações
  console.log(`✅ Deleções enfileiradas: ${count}`);
  console.log("🏁 Concluído.");
}

// CLI: node apagarMarcacoes.js <leiId> <paragrafoId1> <paragrafoId2> ...
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
