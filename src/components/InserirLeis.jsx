import { useState } from "react";

import {AddIndultoTags, FixIndultoTags} from '../utils/Leis em HTML/Indulto/IndultoTags'
import { addCFTags, fixCFTags } from "../utils/Leis em HTML/CF/CFtags";
import { useSaveLeiOriginal } from "../hooks/useSaveLeiOriginal";
import { NavLink } from "react-router-dom";
import { useFetchDocuments } from "../hooks/useFetchDocuments";
import { tirarEspacos } from "../utils/tirarEspacos";
import { inserirReferenciasExternasHTML } from "../utils/inserirReferenciasExternasHTML";
import { inserirReferenciasInternasNoHTML } from "../utils/inserirReferenciasInternasNoHTML";


function InserirLeis() {
    const [title, setTitle] = useState('')
    const [apelido, setApelido] = useState('')
    const [numLeiC, setNumLeiC] = useState('')
    const [numLeiR, setNumLeiR] = useState('')
    const [texto, setTexto] = useState('')

    //Salvamento no Banco de Dados
    const { salvarLei, salvando } = useSaveLeiOriginal()
    const handleSalvar = async (e) => {
        e.preventDefault()
        await salvarLei({title, apelido, numLeiC, numLeiR, texto})
        setTitle('')
        setNumLeiC('')
        setNumLeiR('')
        setTexto('')
    }

    //------------------------------------------------------------
    // ARRUMAR AS TAGS
    //------------------------------------------------------------
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

            //Substitui <sup>o</sup> por º
            .replace(/<sup>o<\/sup>/gi, 'º')
            .replace(/<sup><u>o<\/u><\/sup>/gi, 'º')

            // //Tags
            .replace(/<(html|font|span|u|sup|i|em|small|table|b|td|div|body|tbody|strong|tr|blockquote)[^>]*>/gi, '')//Remove todas as tags inúteis
            .replace(/<\/(html|font|span|u|sup|i|em|small|table|b|td|div|body|tbody|strong|tr|blockquote)>/gi, '')//Remove fechamento das tags inúteis
            

            // Move name="..." da <a> para id="..." do <p>
            .replace(/<p([^>]*)>\s*<a name="([^"]+)"[^>]*><\/a>([\s\S]*?)<\/p>/gi, '<p id="$2"$1>$3</p>')
            .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '<span>$1</span>')

            //Espaços e quebras
            .replace(/\s{2,}/g, ' ')//Remove espaço
            .replace(/^\s*(&nbsp;)*\s*$/gm, '')//Remove espaço
            .replace(/&nbsp;/g, '')//Remove &nbsp; sozinho no meio do texto
            .replace(/&quot;/g, '')//Remove &nbsp; sozinho no meio do texto
            .replace(/(?<!>)\n(?!<)/g, ' ')//Remove quebra de linha \n

            .replace(/<span>\s*<\/span>/gi, '')//Span só vai ser removida se estiver vazia
            
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

        //º
        .replace(/°/g, 'º')//substitui todos os graus por º

        //Art.
        .replace(/\bArt\. (\d+)o\b/g, 'Art. $1.º')//Art. 1o -> Art. 1.º
        .replace(/\bArt\. (\d+)º(?![.\w])/g, 'Art. $1.º')
        .replace(/\b(Art\.\s*\d+\.\º)\s*-\s*/g, '$1 ')//Art. X.º - → Art. X.º
        .replace(/\b(Art\.\s*\d+)\s*-\s*/g, '$1. ')//Art. X - → Art. X.
        .replace(/\bArt\. (\d+)\.\s*([A-Z])\./g, 'Art. $1-$2.')//Art. 154. A. → Art. 154-A.
        .replace(/§\s*(\d+)\s*º\b/g, '§ $1.º')//
        .replace(/\bArt\. (\d+)o-([A-Z])\./g, 'Art. $1.º-$2.')//Art. 8o-A. → Art. 8.º-A.
        .replace(/\bArt\. (\d+)([A-Z])\./g, 'Art. $1-$2.')//Art. 10A. → Art. 10-A.

        //§§
        .replace(/(§ \d+)º/g, "$1.º")//arrumar o § 1.º
        .replace(/§\s*(\d+)\s*o\b/g, '§ $1.º') //arruma § 2o para § 2.º
        .replace(/§\s*(\d+)º\b/g, '§ $1.º')//§ 1º → § 1.º
        .replace(/^§\s*(\d+)\s*-\s*/gm, "§ $1. ")//Arruma os § 10 - para § 10.
        .replace(/(§\s*\d+\.\º)\s*-\s*/g, '$1 ')//§ X.º - → § X.º tira o hífen
        .replace(/§\s*(\d+\.\º)\s*([A-Z])\./g, '§ $1-$2.')//§ 4.º B. → § 4.º-B.
        .replace(/§\s*(\d+\.\º)\s*([A-Z])\s*[–-]\s*/g, '§ $1-$2. ')//§ X.º A - → § X.º-A.
        .replace(/§\s*(\d+)o-([A-Z])\./g, '§ $1.º-$2.')//§ 2o-C. → § 2.º-C.
        .replace(/§\s*(\d{2,})-([A-Z])\./g, '§ $1.º-$2.')//§ 15-D.
        .replace(/(<p[^>]*>)\s*((?:[IVXLCDM]+-[A-Z])\.)/gi, '$1<span class="titles">$2</span>')//I-A. ou I-B. (deixar como está, mas evitar conflito com regra dos incisos tipo "I -")
        .replace(/\b(Parágrafo único)\s*[–-]\s*/gi, '$1. ')//Substitui Parágrafo único - por Parágrafo único.

        // &#150; - isso é um hífen de forma diferente
        .replace(/&#150;/g, '-')

        //-----------------------------------------------------------
        //ADICIONA OS <span></span>
        .replace(/(<p[^>]*?>)\s*(Art\.\s*\d+\.\º-[A-Z]\.)/gi, '$1<span class="titles">$2</span>') // Art. 4.º-A.
        .replace(/(<p[^>]*?>)\s*(Art\.\s*\d+-[A-Z]\.)/gi, '$1<span class="titles">$2</span>') // Art. 12-A.
        .replace(/(<p[^>]*?>)\s*(Art\.\s*\d+\.\º)/gi, '$1<span class="titles">$2</span>') // Art. 5.º
        .replace(/(<p[^>]*?>)\s*(Art\.\s*\d+\.)/gi, '$1<span class="titles">$2</span>') // Art. 10.
        .replace(/(<p[^>]*?>)\s*((?:[IVXLCDM]+(?:-[A-Z])?)\s*[–-]\s*)/gi, '$1<span class="titles">$2</span>') // I - ou I-A -
        .replace(/(<p[^>]*?>)\s*(§\s*\d+\.\º-[A-Z]\.)/gi, '$1<span class="titles">$2</span>')
        .replace(/(<p[^>]*?>)\s*(§\s*[1-9]\.\º)/gi, '$1<span class="titles">$2</span>') // § 1.º
        .replace(/(<p[^>]*?>)\s*(§\s*\d{2,}\.)/gi, '$1<span class="titles">$2</span>') // § 15.
        .replace(/(<p[^>]*?>)\s*([a-z]\))/gi, '$1<span class="titles">$2</span>') // a)
        .replace(/(<p[^>]*?>)\s*(Parágrafo único\.)/gi, '$1<span class="titles">$2</span>') // Parágrafo único.
        .replace(/(<p[^>]*?>)\s*(Pena)\b/gi, '$1<span class="titles">$2</span>') // Pena - texto

        //Troca <strike> por <del> e adiciona class="revogado" ao <p> que tenha antes do strike
        .replace(/<strike>/gi, '<del>')
        .replace(/<\/strike>/gi, '</del>')
        .replace(/<p([^>]*)>\s*(<del>)/gi, '<p$1 class="revogado">$2')


        //Adiciona class leiRef ao restante dos <span>, que são os que são referência de lei
        .replace(/<span>\s*<\/span>/gi, '')//primeiro deleta span vazios
        //leiRef - referência de arts; leiRef2 - Redação dada, Incluído pelo...etc; leiRef3 - msm do 2, mas no título; leiRef4 - Vide lei tal
        .replace(/<span>\s*\(Vide/gi, '<span class="leiRef4"> (Vide')
        .replace(/<span>\s*\(/gi, '<span class="leiRef2"> (')//Os que têm parêntese
        .replace(/<span>/gi, '<span class="leiRef">')

        // Envolver com class="titles center" todo <p> que não tenha <span> algum
        .replace(/<p([^>]*)>((?!<span)[^<]*)<\/p>/gi,
                (match, attrs, content) => {
                const cleanContent = content.trim()
                if (cleanContent.length === 0) return match // ignora <p> vazios
                return `<p${attrs} class="titles center">${cleanContent}</p>`
                })


        setTexto(textoLimpo)
        return 
    }

    const rmvEspacos = (e) => {
        e.preventDefault()

        const textoLimpo = tirarEspacos(texto)

        setTexto(textoLimpo)
        return 
    }

    const addTagSimples = (e) => {
        e.preventDefault()
        const textoLimpo = texto

        //Adiciona <p>
        .replace(/^(.+?)$/gm, '<p>$1</p>')
        // Art. com número e ponto: Art. 43.
        .replace(/(<p[^>]*?>)\s*(Art\.\s*\d+\.)/gi, '$1<span class="titles">$2 </span>')
        // Art. com ordinal: Art. 1.º
        .replace(/(<p[^>]*?>)\s*(Art\.\s*\d+\.\º)/gi, '$1<span class="titles">$2 </span>')
        // Incisos romanos: I -
        .replace(/(<p[^>]*?>)\s*((?:[IVXLCDM]+(?:-[A-Z])?)\s*[–-]\s*)/gi, '$1<span class="titles">$2 </span>')
        // Parágrafos: § 1.º ou § 10.
        .replace(/(<p[^>]*?>)\s*(§\s*\d+\.\º)/gi, '$1<span class="titles">$2 </span>')
        .replace(/(<p[^>]*?>)\s*(§\s*\d+\.)/gi, '$1<span class="titles">$2 </span>')
        // Alíneas: a), b)
        .replace(/(<p[^>]*?>)\s*([a-z]\))/gi, '$1<span class="titles">$2 </span>')
        // Parágrafo único.
        .replace(/(<p[^>]*?>)\s*(Parágrafo único\.)/gi, '$1<span class="titles">$2 </span>')
        //Envolver trechos entre parênteses contendo "Redação dada pela", "Incluído por", "Revogado por" etc.
        //leiRef - referência de arts; leiRef2 - Redação dada, Incluído pelo...etc; leiRef3 - msm do 2, mas no título; leiRef4 - Vide lei tal
        .replace(/\((Redação(?: dada)?|Incluído|Revogado)[^)]+\)/gi, match => `<span class="leiRef2">${match}</span>`)

        setTexto(textoLimpo)
        return 
    }

const createIds = (e) => {
    e.preventDefault()
    let contador = 1
    const idsGerados = new Set()

    const textoComIds = texto.replace(/<p(?![^>]*id=)([^>]*)>(.*?)<\/p>/gis, (match, otherAttrs, innerHTML) => {
        const isRevogado = /class\s*=\s*["'][^"']*\brevogado\b[^"']*["']/i.test(otherAttrs)

        // Extrai só o conteúdo de <span class="titles">...</span>
        const titlesMatch = innerHTML.match(/<span[^>]*class=["']titles["'][^>]*>(.*?)<\/span>/i)
        let id
        if (titlesMatch) {
            const titulo = titlesMatch[1]
            // Tenta extrair "Art. 4º", "Art. 12", "Art. 2-A" etc. SOMENTE do <span class="titles">
            const artigoMatch = titulo.match(/Art\.?\s*(\d+)(?:[\.\ºoº]?)(?:-([A-Za-z]))?/i)
            if (artigoMatch) {
                const numero = artigoMatch[1]
                const sufixo = artigoMatch[2] ? artigoMatch[2].toLowerCase() : ""
                let tentativaId = `art${numero}${sufixo}${isRevogado ? "rv" : ""}`

                // Garante unicidade
                let contadorSufixo = 1
                while (idsGerados.has(tentativaId)) {
                    tentativaId = `art${numero}${sufixo}${isRevogado ? "rv" : ""}_${contadorSufixo++}`
                }

                id = tentativaId
                idsGerados.add(id)
            }
        }
        // Se não gerou id baseado em artigo, usa fallback pX
        if (!id) {
            while (idsGerados.has(`p${contador}`)) contador++
            id = `p${contador++}`
            idsGerados.add(id)
        }
        return `<p id="${id}"${otherAttrs}>${innerHTML}</p>`
        })
        setTexto(textoComIds)
    }

    const checkSameId = (e) => {
        e.preventDefault()
        const regex = /id\s*=\s*["']([^"']+)["']/g;
        const ids = {};
        const duplicados = [];
        let match;
        while ((match = regex.exec(texto)) !== null) {
            const id = match[1];
            if (ids[id]) {
            duplicados.push(id);
            } else {
            ids[id] = true;
            }
        }
        if (duplicados.length > 0) {
            alert(`IDs duplicados encontrados:\n\n${[...new Set(duplicados)].join('\n')}`);
        } else {
            alert('Nenhum ID duplicado encontrado.');
        }

        return 
    }

    //------------------------------------------------------------
    // GERAR LINKS
    //------------------------------------------------------------
    const inserirRef = (e) => {
        if(!numLeiR) return alert("Insira o Número da lei resumido")
        e.preventDefault()
        let textoRefs = inserirReferenciasExternasHTML(texto)
        textoRefs = inserirReferenciasInternasNoHTML(textoRefs, numLeiR)

        setTexto(textoRefs);
        alert("1. Pesquisar texto 'do art', visto que ele não pega bem; \n 2. Puxar o </span> para menções de múltiplos artigos.")
        console.log("1. Pesquisar texto 'do art', visto que ele não pega bem; \n 2. Puxar o </span> para menções de múltiplos artigos.")
        return
    }

    //------------------------------------------------------------
    // PRÉ-VISUALIZAÇÃO DAS LEIS
    //------------------------------------------------------------
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
                        <span>Apelido (para URL): </span>
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
                    <span>Texto da lei modificado: </span>
                    <textarea type="textarea" name="texto" placeholder="Insira todo o texto legal" onChange={(e)=>setTexto(e.target.value)} value={texto} ></textarea>
                </label>
                
                <div className="btnContainer">
                    <button onClick={fixOriginalTags} className="btn2">Editar tags originais</button>&nbsp;➤&nbsp;
                    <button onClick={addMyTags} className="btn2">Adicionar HTML</button>&nbsp;➤&nbsp;
                    <button onClick={createIds} className="btn2">Criar IDs que faltam</button>&nbsp;➤&nbsp;
                    <button onClick={checkSameId} className="btn2">IDs repetidos</button>&nbsp;➤&nbsp;
                    <button onClick={inserirRef} className="btn2">Gerar links</button>&nbsp;➤&nbsp;
                    <button onClick={visualize} className="btn2">Pré-visualizar</button>&nbsp;➤&nbsp;
                    <input className="btn1" type="submit" value={salvando ? "Salvando lei original..." : "Salvar Lei"} />&nbsp;&nbsp;

                    <br />
                    <br />
                    <button onClick={addTagSimples} className="btn2">Add tag simples</button>&nbsp;➤&nbsp;
                    <button onClick={rmvEspacos} className="btn2">Remover Espacos</button>&nbsp;➤&nbsp;
                    <NavLink to='/insertlaws/comparar' target="_blank" rel="noopener noreferrer" className="a2 ">Comparar Leis</NavLink>&nbsp;
                </div>
            </form>
        </div>
    )
}

export default InserirLeis