/* ESTRUTURA DOS MEUS DADOS:
leis (coleção)
│
├─ lei_8072_1990 (documento)
│   ├─ aTitle: "Lei dos Crimes Hediondos"
│   ├─ numLeiC: "8072"
│   ├─ numLeiR: "1990"
│   ├─ createdAt: timestamp
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
│       │
│       ├─ art2 (documento)
│       │   ├─ id: "art2"
│       │   ├─ html: "<p id='art2'>Art. 2º ...</p>"
│       │   ├─ ordem: 2
│       │   ├─ createdAt: timestamp
│       │   └─ comentariosPublicos (subcoleção)
│       │       └─ ...
│       │
│       └─ ...
*/
import { useState } from 'react';
import { db } from '../firebase/config'
import { collection, addDoc, serverTimestamp, setDoc, doc } from "firebase/firestore";

export const useSaveLeiOriginal = () => {
    const [salvando, setSalvando] = useState(false)

    const salvarLei = async ({title, apelido, numLeiC, numLeiR, texto}) => {
        setSalvando(true)
        try {
            //1. Cria o documento da lei
            const docRef = await addDoc(collection(db, 'leis'), {
                aTitle: title.trim(),
                apelido: apelido.trim(),
                numLeiC: numLeiC.trim(),
                numLeiR: numLeiR.trim(),
                texto: texto.trim(),
                createdAt: serverTimestamp(),
            })
            //2. Extrai os dispositivos, pegando pelos <p>
            let lastId = 'p0'
            let iCount = 1
            const disps = texto.split(/<\/p>/gi).map((disp, i) => {
                const clean = disp.trim();
                if (!clean) return null;

                const idMatch = clean.match(/id="([^"]+)"/);
                let id = idMatch ? idMatch[1] : null;

                if (id) {
                    lastId = id;
                    iCount = 1;
                } else {
                    id = `${lastId}i${iCount}`;
                    iCount++;
                }

                return {
                    id,
                    html: clean + '</p>',
                    ordem: i + 1,
                };
            }).filter(Boolean);

            //3. Salva cada <p> na subcoleção "disps"
            const dispsRef = collection(db, `leis/${docRef.id}/disps`);
                const batchSaves = disps.map(p => {
                if (!p.id || typeof p.id !== 'string' || p.id.includes('/')) {
                    console.warn("ID inválido ao salvar parágrafo:", p.id);
                    return null;
                }

                return setDoc(doc(dispsRef, p.id), p);
            }).filter(Boolean); // remove nulls

            await Promise.all(batchSaves);

            alert("Lei salva com sucesso");
        } catch (error) {
            console.error("Erro ao salvar lei:", error);
            console.dir(error);
            alert('Erro ao salvar a lei. Veja o console')
        } finally {
            setSalvando(false)
        }
    }
    
        return {salvarLei, salvando}
}