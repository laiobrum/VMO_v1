export const FixIndultoTags = (texto) => {
    texto = texto

            //OBSERVAÇÃO: NÃO PODE APERTAR 2X, PQ APAGA O id=""
            //Exclui atributos de <p>
            .replace(/<p[^>]*>/gi, '<p>')

            // //Tags
            .replace(/<(font|span|u|sup|i|small|table|b|td|tbody|strong|tr)[^>]*>/gi, '')//Remove todas as tags inúteis
            .replace(/<\/(font|span|u|sup|i|small|table|b|td|tbody|strong|tr)>/gi, '')//Remove fechamento das tags inúteis

            // Move name="..." da <a> para id="..." do <p>
            .replace(/<p([^>]*)>\s*<a name="([^"]+)"[^>]*><\/a>([\s\S]*?)<\/p>/gi, '<p id="$2"$1>$3</p>')
            .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '<span>$1</span>')

            //Espaços e quebras
            .replace(/\s{2,}/g, ' ')//Remove espaço
            .replace(/^\s*(&nbsp;)*\s*$/gm, '')//Remove espaço
            .replace(/&nbsp;/g, '')//Remove &nbsp; sozinho no meio do texto
            .replace(/&quot;/g, '')//Remove &nbsp; sozinho no meio do texto

        return texto
}

export const AddIndultoTags = (texto) => {
    texto = texto

        //Capítulos e títulos: tem que ser na mão

        // //Espaços
        .replace(/^\s*\n/gm, "")//exclui parágrafos vazios
        .replace(/^\s*/gm, "")//exclui espaços vazios

        //§§
        .replace(/(§ \d+)º/g, "$1.º")//arrumar o § 1.º

        //Envolver "Art. Xº" no início do parágrafo com <span class="titles">
        .replace(/(<p[^>]*>)\s*(Art\.\s*\d+º)/gi, '$1<span class="titles">$2</span>')
        //Envolver "Art. X." - a partir de 10 - no início do parágrafo com <span class="titles">
        .replace(/(<p[^>]*>)\s*(Art\.\s*\d+\.)/gi, '$1<span class="titles">$2</span>')
        //Envolver números romanos com hífen (I - até XX - etc.)
        .replace(/(<p[^>]*>)\s*((?:[IVXLCDM]{1,5})\s*-\s*)/gi, '$1<span class="titles">$2</span>')
        //Envolver parágrafos iniciados por "§ nº" (de 1 a 9):
        .replace(/(<p[^>]*>)\s*(§\s*[1-9].º)/gi, '$1<span class="titles">$2</span>')
        //Envolver alíneas com letras de a) a z):
        .replace(/(<p[^>]*>)\s*([a-z]\))/gi, '$1<span class="titles">$2</span>')
        //Envolver parágrafo único:
        .replace(/(<p[^>]*>)\s*(Parágrafo único\.)/gi, '$1<span class="titles">$2</span>')

        //Adiciona classe strikeHidden aos <strike>
        .replace(/<strike>/gi, '<strike class="strikeHidden">')

        //Adiciona class leiRef ao restante dos <span>, que são os que são referência de lei
        .replace(/<span>/gi, '<span class="leiRef">')

    return texto
}

