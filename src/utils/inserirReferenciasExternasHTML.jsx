export function normalizarReferencia(textoOriginal) {
  const tipoMap = {
    "Decreto-Lei": "DEL",
    "Lei Complementar": "LC",
    "Lei": "L",
    "Decreto": "D",
    "Medida Provisória": "MP",
    "Constituição Federal": "CF",
    "Emenda Constitucional": "EC"
  };

  const texto = textoOriginal.replace(/\s+/g, ' ').trim(); // remove espaços e quebras de linha

  // Primeiro: trata Constituição Federal (única sem número)
  if (/constituição federal/i.test(texto)) return "CF";

  // Depois trata normas com número
  for (let tipo in tipoMap) {
    if (tipo === "Constituição Federal") continue;

    const regex = new RegExp(`\\b${tipo}\\s*n[ºo]?\\s*(\\d{1,6}(?:\\.\\d{3})*)`, "i");
    const match = texto.match(regex);
    if (match) {
      const numeroSemPontos = match[1].replace(/\./g, '');
      return tipoMap[tipo] + numeroSemPontos;
    }
  }

  return null;
}

export function inserirReferenciasExternasHTML(html) {
  return html.replace(
    /<span\s+class="leiRef"\s*>([\s\S]*?)<\/span>/gi,
    (match, innerText) => {
      const innerTextTrim = innerText.trim();
      const cod = normalizarReferencia(innerTextTrim);
      if (!cod) return match;
      return `<span class="leiRef" data-lei="${cod}">${innerText}</span>`;
    }
  );
}