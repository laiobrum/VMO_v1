const CPCtags = (texto) => {
    texto = texto
    
        //FALTOU (vou ter que fazer à mão): o 2º replace apaga os <p> que não têm <a name=""> para transformar em id. 
            //Vou ter que corrigir na mão, pq as regras já estão muito complicadas, e são poucas correções
            //Manter os ids dos títulos e colocar os títulos faltantes entre <p></p>

        //FICAR EM 1º - Extrai <a class="c927"> tags para não atrapalhar o id abaixo (é o ícone de julgados)
        .replace(/<a[^>]*class="c927"[^>]*><\/a>/gi, '')
        //FICAR 2º - Extrai as tags <a name=""> e coloca como id dos <p>. Remove as tags <a>, mantendo as que tem href
        .replace(/<p([^>]*)>[\s\S]*?<a name="([^"]+)"[^>]*>[\s\S]*?<\/a>\s*([\s\S]*?)<\/p>/gi, '<p id="$2"$1>$3</p>')
        //3º - extrai todos os atributos de <p>
        .replace(/<p[^>]*id="([^"]+)"[^>]*>/gi, '<p id="$1">')

        //Tags
        .replace(/<(font|span|u|sup|i|small|b)[^>]*>/gi, '')//Remove todas as tags inúteis
        .replace(/<\/(font|span|u|sup|i|small|b)>/gi, '')//Remove fechamento das tags inúteis

        //Espaços e quebras
        .replace(/ {2,}/g, ' ')//Remove espaço
        .replace(/^\s*(&nbsp;)*\s*$/gm, '')//Remove espaço
        .replace(/&nbsp;/g, '')//Remove &nbsp; sozinho no meio do texto
        .replace(/\n{2,}/g, '\n') //Remove quebra de linha
        .replace(/\s+/g, ' ')//Remove espaço dado com tab - DEIXA VISÃO RUIM - FAZER SÓ NO FIM!

        return texto
}

export default CPCtags
