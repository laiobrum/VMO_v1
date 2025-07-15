/*SANITIZAÇÃO DAS LEIS:
-
-
-
1. ADAPTAR CÓDIGO PARA CADA UMA DAS LEIS
2. COMPARAR OS RESULTADOS NO GOOGLE DOCS DO texto original x texto sanitizado 
    > ctrl+shift+v no docs 
    > Ferramentas > Comparar documentos
-
-                   FAZEEEEEEEEEEEEEEEEEEEEEEEEEEERRR:
            > Botão salvar lei para consulta de referência cruzada - chatGPT disse que minha estrutura de dados tem que ser:
                    /laws/{lawId}/articles/{articleId}
                        {
                          html: "<p><span class='titles'>Art. 33.</span> ...",
                          plainText: "Art. 33. A pena será aplicada..."
                        }
            > Botão para gerar automaticamente os links nas leis: chatGPT > VMO - data structure > 1. 📦 Padronize a Identificação de Leis
            > Botão para salvar lei para pesquisa de palavra-chave - ver fazer estrutura dos dados para MeiliSearch
            > Botão salvar lei para original do usuário: 
                                                        <div id="a1ii">
                                                            <p class="tx"> Lorem ipsum </p>
                                                            <p class="cmt"></p>
                                                        </div>
-
*/



import { useState } from "react";
import { db } from '../firebase/config'
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import {AddIndultoTags, FixIndultoTags} from '../utils/Leis em HTML/Indulto/IndultoTags'
import { addCFTags, fixCFTags } from "../utils/Leis em HTML/CF/CFtags";

function InserirLeis() {
    const [title, setTitle] = useState('')
    const [texto, setTexto] = useState('')

    const salvarLei = async (e) => {
        e.preventDefault()

        try {
            await addDoc(collection(db, 'leis'), {
                title: title.trim(),
                texto: texto.trim(),
                createdAt: serverTimestamp(),
            })
            alert("Lei salva com sucesso")
            setTitle('')
            setTexto('')
        } catch (error) {
            console.error("Erro ao salvar lei: ", error)
            alert('Erro ao salvar a lei. Veja o console')
        }
    }

    //EDITA AS TAGS ORIGINAIS DO SITE DO PLANALTO
    const fixOriginalTags = (e) => {
        e.preventDefault()
        /* ARQUIVO REMOVEDOR DE TAGS: */
        // const textoLimpo = fixCFTags(texto)
        const textoLimpo = FixIndultoTags(texto)
        
        

        /* TESTES - OS TESTES DEVEM SER AQUI, VISTO QUE O VITE NÃO ATUALIZA OS ARQUIVOS REMOVEDORES NA HORA!!! */
        // const textoLimpo = texto
            

            
        setTexto(textoLimpo)
        return
    }

    //ARRUMA TAGS DEFEITUOSAS E INCLUI AS MINHAS
    const addMyTags = (e) => {
        e.preventDefault()
        /* ARQUIVO ADICIONADOR DE TAGS: */
        // const textoLimpo = addCFTags(texto)
        const textoLimpo = AddIndultoTags(texto)
            


            /* TESTES - OS TESTES DEVEM SER AQUI, VISTO QUE O VITE NÃO ATUALIZA OS ARQUIVOS REMOVEDORES NA HORA!!! */
            // const textoLimpo = texto



        setTexto(textoLimpo)
        return 
    }

    const visualize = (e) => {
        e.preventDefault()
        localStorage.setItem('texto-temporário', texto)
        window.open('/teste-nova-lei', '_blank')
    }

    return (
        <div>
            <h2>Formatação e inclusão de lei:</h2>
            <form className="formContainer2" onSubmit={salvarLei}>
                <label className="formControl">
                    <span>Título da lei: </span>
                    <input type="text" name="title" placeholder="Ex.: Constituição Federal" onChange={(e)=>setTitle(e.target.value)} required />
                </label>

                {/* Tag TEXTAREA - é igual */}
                <label className="formControl">
                    <span>Texto da lei: </span>
                    <textarea type="textarea" name="texto" placeholder="Insira todo o texto legal" onChange={(e)=>setTexto(e.target.value)} value={texto} ></textarea>
                </label>
                
                <div className="btnContainer">
                    <button onClick={fixOriginalTags} className="btn2">Editar tags originais</button>&nbsp;➤&nbsp;
                    <button onClick={addMyTags} className="btn2">Adicionar HTML</button>&nbsp;➤&nbsp;
                    <button className="btn2">Gerar links</button>&nbsp;➤&nbsp;
                    <button onClick={visualize} className="btn2">Pré-visualizar</button>&nbsp;➤&nbsp;
                    <input className="btn1" type="submit" value="Salvar Lei" />&nbsp;&nbsp;

                    <br />
                    <br />
                    <button className="btn2">Editar p/ referência cruzada</button>&nbsp;➤&nbsp;
                    <input className="btn1" type="submit" value="Salvar p/ referência cruzada" />
                </div>
            </form>
        </div>
    )
}

export default InserirLeis