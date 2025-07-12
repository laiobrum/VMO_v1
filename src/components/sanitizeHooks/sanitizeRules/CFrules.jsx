export const CFrules = [
    {
        pattern: /<(font|span|u|sup|i|small|b)[^>]*>/gi, //substitui tags inúteis
        replacement: '' //por nada
    },
    {
        pattern: /<\/(font|span|u|sup|i|small|b)>/gi, //fechamento de tags
        replacement: '' 
    }
]