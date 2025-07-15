/*SANITIZAÇÃO DAS LEIS:
-
-
-
1. ADAPTAR CÓDIGO PARA CADA UMA DAS LEIS
2. COMPARAR OS RESULTADOS NO GOOGLE DOCS DO texto original x texto sanitizado 
    > ctrl+shift+v no docs 
    > Ferramentas > Comparar documentos
-
-           PAREI EM: percebi que no meu teste CPC, nem veio "DAS NORMAS PROCESSUAIS CIVIS" - mas o site do Planalto parou... esperar voltar
-
*/



import { useState } from "react";
import { db } from '../firebase/config'
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import CPCtags from '../../Leis em HTML/CPC/CPCtags'
import IndultoTags from '../../Leis em HTML/Indulto/IndultoTags'

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
        // const textoLimpo = CPCtags(texto)
        const textoLimpo = IndultoTags(texto)
        FAZEEEEEEEEEEEEEEEEEEEEEEEEEEERRR:
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
            
        setTexto(textoLimpo)
        return
    }

    //ARRUMA TAGS DEFEITUOSAS E INCLUI AS MINHAS
    const fixMyTags = (e) => {
        e.preventDefault()
        setTexto(texto
            //ALTERAR agora que vamos subir tags novas com id
            //Tentar automatizar envolver a div dos títulos
            
            //Espaços
            .replace(/^\s*\n/gm, "")//exclui parágrafos vazios
            .replace(/^\s*/gm, "")//exclui espaços vazios

            //Números ordinais
            .replace(/(\d+)º/g, "$1.º")//Coloca na grafia correta "1.º"

            //Art.
            .replace(/Art\./g, "<p><span>Art.")//span antes do Art.
            .replace(/(Art\. \d+\.º)/g, "$1</span>")//span nos Art º
            .replace(/(Art\. \d+\. )/g, "$1</span>")// /Span após o Art.

            // .replace(/(Art\. \d+\.º)/g, "$1</span>")
            // .replace(/(Art\. \d+º)/g, "$1.º</span>")// /Span após o Art. º 
            .replace(/(Art\. \d+-[A-Z]\.)/g, "$1</span>")// /span após "Art. 146-A."

            //§§
            .replace(/(§ \d+)º/g, "$1.º")//arrumar o § 1.º
            .replace(/^§\s*(\d+)\s*-\s*/gm, "§ $1. ")//Arruma os § 10 - para § 10.
            .replace(/^§\s*\d+\.º/gm, match => `<p><span>${match}</span>`)//Adiciona <p> e <span> nos º, só no início do parágrafo
            .replace(/^§\s*\d+\. /gm, match => `<p><span>${match}</span>`)//Adiciona <p> e <span> nos ., só no início do parágrafo
            .replace(/Parágrafo único./g, "Parágrafo único.</span>")//inclui /span após pu

            //<p> em todos os parágrafos
            .replace(/^(\w)/gm, "<p><span>$1")// inclui span e p antes de qualquer parágrafo
            .replace(/(.+)$/gm, "$1</p>")//adiciona p ao fim de todas as linhas

            //Incisos:
            // .replace(/ - /g, " - </span>")//adiciona /span após hífens
            // .replace(/ – /g, " - </span>")//adiciona /span após hífens - ele diferencia os hífens grandes dos pequenos
            .replace(/<p><span>([IVXLCDM]+)\s*-\s*/gm, "<p><span>$1</span> - ")

            //Alíneas
            // .replace(/([a-zA-Z])\)/g, "$1)</span>")// adiciona /span após alíneas 'a)'
            .replace(/<p><span>([a-zA-Z]\))\s*/gm, "<p><span>$1</span> ")
            
            //Textos recorrentes
            .replace(/<p>\s*<\/p>/gm, "")//remove todos os <p></p> vazios

        )
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
                
                <button onClick={fixOriginalTags} className="btn2">Editar tags originais</button>&nbsp;&nbsp;
                <button onClick={fixMyTags} className="btn2">Adicionar HTML</button>&nbsp;&nbsp;
                <button onClick={visualize} className="btn2">Pré-visualizar</button>
                <br />
                <br />
                <input className="btn1" type="submit" value="Salvar Lei" />
            </form>
        </div>
    )
}

export default InserirLeis