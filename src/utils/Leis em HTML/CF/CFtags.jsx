
export const fixCFTags = (texto) => {
    texto = texto


    return texto
}

export const addCFTags = (texto) => {
    texto = texto
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


        return texto
}