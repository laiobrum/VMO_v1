
export const tirarEspacos = (texto) => {
    texto = texto

        .replace(/\r?\n|\r/g, ' ')      // Remove quebras de linha
        .replace(/[ \t]{2,}/g, ' ')     // Remove múltiplos espaços por 1
        .replace(/>\s+</g, '> <');      // Mantém UM espaço entre tags

    return texto
}

