const IndultoTags = (texto) => {
    texto = texto

            //Exclui atributos de <p>
            .replace(/<p[^>]*>/gi, '<p>')

            // //Tags
            .replace(/<(font|span|u|sup|i|small|table|b|td)[^>]*>/gi, '')//Remove todas as tags inúteis
            .replace(/<\/(font|span|u|sup|i|small|table|b|td)>/gi, '')//Remove fechamento das tags inúteis

            // Move name="..." da <a> para id="..." do <p>
            .replace(/<p([^>]*)>\s*<a name="([^"]+)"[^>]*><\/a>([\s\S]*?)<\/p>/gi, '<p id="$2"$1>$3</p>')
            .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '<span>$1</span>')

            //Espaços e quebras
            .replace(/ {2,}/g, ' ')//Remove espaço
            .replace(/^\s*(&nbsp;)*\s*$/gm, '')//Remove espaço
            .replace(/&nbsp;/g, '')//Remove &nbsp; sozinho no meio do texto
            .replace(/&quot;/g, '')//Remove &nbsp; sozinho no meio do texto
            .replace(/\n{2,}/g, '\n') //Remove quebra de linha
            .replace(/\s+/g, ' ')//Remove espaço dado com tab

        return texto
}

export default IndultoTags