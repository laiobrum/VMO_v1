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

import {AddIndultoTags, FixIndultoTags} from '../utils/Leis em HTML/Indulto/IndultoTags'
import { addCFTags, fixCFTags } from "../utils/Leis em HTML/CF/CFtags";
import { useSaveLeiOriginal } from "../hooks/useSaveLeiOriginal";

function InserirLeis() {
    const [title, setTitle] = useState('')
    const [apelido, setApelido] = useState('')
    const [numLeiC, setNumLeiC] = useState('')
    const [numLeiR, setNumLeiR] = useState('')
    const [texto, setTexto] = useState('')

    const { salvarLei, salvando } = useSaveLeiOriginal()
    const handleSalvar = async (e) => {
        e.preventDefault()
        await salvarLei({title, apelido, numLeiC, numLeiR, texto})
        setTitle('')
        setNumLeiC('')
        setNumLeiR('')
        setTexto('')
    }

    //EDITA AS TAGS ORIGINAIS DO SITE DO PLANALTO
    const fixOriginalTags = (e) => {
        e.preventDefault()
        /* ARQUIVO REMOVEDOR DE TAGS: */
        // const textoLimpo = fixCFTags(texto)
        // const textoLimpo = FixIndultoTags(texto)
        
        

        /* TESTES - OS TESTES DEVEM SER AQUI, VISTO QUE O VITE NÃO ATUALIZA OS ARQUIVOS REMOVEDORES NA HORA!!! */
        const textoLimpo = texto
            //OBSERVAÇÃO: NÃO PODE APERTAR 2X, PQ APAGA O id=""
            //Exclui atributos de <p>
            .replace(/<p[^>]*>/gi, '<p>')

            // //Tags
            .replace(/<(font|span|u|sup|i|small|table|b|td|div|body|tbody|strong|tr|blockquote)[^>]*>/gi, '')//Remove todas as tags inúteis
            .replace(/<\/(font|span|u|sup|i|small|table|b|td|div|body|tbody|strong|tr|blockquote)>/gi, '')//Remove fechamento das tags inúteis

            // Move name="..." da <a> para id="..." do <p>
            .replace(/<p([^>]*)>\s*<a name="([^"]+)"[^>]*><\/a>([\s\S]*?)<\/p>/gi, '<p id="$2"$1>$3</p>')
            .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '<span>$1</span>')

            //Espaços e quebras
            .replace(/\s{2,}/g, ' ')//Remove espaço
            .replace(/^\s*(&nbsp;)*\s*$/gm, '')//Remove espaço
            .replace(/&nbsp;/g, '')//Remove &nbsp; sozinho no meio do texto
            .replace(/&quot;/g, '')//Remove &nbsp; sozinho no meio do texto
            
        setTexto(textoLimpo)
        return
    }

    //ARRUMA TAGS DEFEITUOSAS E INCLUI AS MINHAS
    const addMyTags = (e) => {
        e.preventDefault()
        /* ARQUIVO ADICIONADOR DE TAGS: */
        // const textoLimpo = addCFTags(texto)
        // const textoLimpo = AddIndultoTags(texto)
            


            /* TESTES - OS TESTES DEVEM SER AQUI, VISTO QUE O VITE NÃO ATUALIZA OS ARQUIVOS REMOVEDORES NA HORA!!! */
            const textoLimpo = texto

                    //Capítulos e títulos: tem que ser na mão

        // //Espaços
        .replace(/^\s*\n/gm, "")//exclui parágrafos vazios
        .replace(/^\s*/gm, "")//exclui espaços vazios

        //§§
        .replace(/(§ \d+)º/g, "$1.º")//arrumar o § 1.º
        .replace(/§\s*(\d+)o\b/g, '§ $1.º') //arruma § 2o para § 2.º
        .replace(/^§\s*(\d+)\s*-\s*/gm, "§ $1. ")//Arruma os § 10 - para § 10.

        // &#150; - isso é um hífen de forma diferente
        .replace(/&#150;/g, '-')

        //Envolver "Art. Xº" no início do parágrafo com <span class="titles">
        .replace(/(<p[^>]*>)\s*(Art\.\s*\d+º)/gi, '$1<span class="titles">$2</span>')
        //Envolver "Art. X." - a partir de 10 - no início do parágrafo com <span class="titles">
        .replace(/(<p[^>]*>)\s*(Art\.\s*\d+\.)/gi, '$1<span class="titles">$2</span>')
        //Envolver números romanos com hífen (I - até XX - etc.). Se tiver I-A, I-B vai pegar tb!
        .replace(/(<p[^>]*>)\s*((?:[IVXLCDM]+(?:-[A-Z])?)\s*[–-]\s*)/gi, '$1<span class="titles">$2</span>')
        //Envolver parágrafos iniciados por "§ nº" (de 1 a 9):
        .replace(/(<p[^>]*>)\s*(§\s*[1-9].º)/gi, '$1<span class="titles">$2</span>')
        //Envolver alíneas com letras de a) a z):
        .replace(/(<p[^>]*>)\s*([a-z]\))/gi, '$1<span class="titles">$2</span>')
        //Envolver parágrafo único:
        .replace(/(<p[^>]*>)\s*(Parágrafo único\.)/gi, '$1<span class="titles">$2</span>')

        //Troca <strike> por <del> e adiciona class="revogado" ao <p> que tenha antes do strike
        .replace(/<p[^>]*>\s*<strike>/gi, '<p class="revogado"><del>')
        .replace(/<\/strike>/gi, '</del>')

        //Adiciona class leiRef ao restante dos <span>, que são os que são referência de lei
        .replace(/<span>\(/gi, '<span class="leiRef2">(')
        .replace(/<span>/gi, '<span class="leiRef">')


        setTexto(textoLimpo)
        return 
    }

    const createIds = (e) => {
        e.preventDefault()
        let contador = 1;
        const textoLimpo = texto

        .replace(/<p(?![^>]*id=)([^>]*)>/gi, (_, otherAttrs) => {
        const id = `p${contador++}`
        return `<p id="${id}"${otherAttrs}>`
        })

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
            <form className="formContainer2" onSubmit={handleSalvar}>
                <div className="flex">
                    <label className="formControl">
                        <span>Título da lei: </span>
                        <input type="text" name="title" placeholder="Ex.: Código Penal" onChange={(e)=>setTitle(e.target.value)} required />
                    </label>
                    <label className="formControl">
                        <span>Apelido: </span>
                        <input type="text" name="apelido" placeholder="Ex.: CPC" onChange={(e)=>setApelido(e.target.value)} />
                    </label>
                </div>
                <div className="flex">
                    <label className="formControl">
                        <span>Número da lei completo: </span>
                        <input type="text" name="numLeiC" placeholder="Ex.: DECRETO Nº 12.338, DE 23 DE DEZEMBRO DE 2024" onChange={(e)=>setNumLeiC(e.target.value)} required />
                    </label>
                    <label className="formControl">
                        <span>Número da lei resumido: </span>
                        <input type="text" name="numLeiR" placeholder="Ex.: DEL2848, D12500, L12850, MP1500" onChange={(e)=>setNumLeiR(e.target.value)} required />
                    </label>
                </div>

                {/* Tag TEXTAREA - é igual */}
                <label className="formControl">
                    <span>Texto da lei: </span>
                    <textarea type="textarea" name="texto" placeholder="Insira todo o texto legal" onChange={(e)=>setTexto(e.target.value)} value={texto} ></textarea>
                </label>
                
                <div className="btnContainer">
                    <button onClick={fixOriginalTags} className="btn2">Editar tags originais</button>&nbsp;➤&nbsp;
                    <button onClick={addMyTags} className="btn2">Adicionar HTML</button>&nbsp;➤&nbsp;
                    <button onClick={createIds} className="btn2">Criar IDs que faltam</button>&nbsp;➤&nbsp;
                    <button className="btn2">Gerar links</button>&nbsp;➤&nbsp;
                    <button onClick={visualize} className="btn2">Pré-visualizar</button>&nbsp;➤&nbsp;
                    <input className="btn1" type="submit" value={salvando ? "Salvando lei original..." : "Salvar Lei"} />&nbsp;&nbsp;

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