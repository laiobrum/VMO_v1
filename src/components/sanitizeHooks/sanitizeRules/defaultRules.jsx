export const defaultRules = [
    {
        pattern: / {2,}/g, //Remove espaços duplos
        replacement: ' ' //Por espaço único
    },
    {
        pattern: /^\s*(&nbsp;)*\s*$/gm, //remove &nbsp;
        replacement: ''
    },
    {
        pattern: /&nbsp;/g, //Remove &nbsp; sozinho no meio do texto
        replacement: ''
    },
    {
        pattern: /\n{2,}/g, //Remove quebra de linha dupla
        replacement: '\n'
    },
]