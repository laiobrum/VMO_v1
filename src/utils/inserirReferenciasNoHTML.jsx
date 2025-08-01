export function normalizarReferencia(texto) {
  const tipoMap = {
    "Lei Complementar": "LC",
    "Lei": "L",
    "Decreto-Lei": "DEL",
    "Decreto": "D",
    "Medida Provisória": "MP",
    "Constituição Federal": "CF",
    "Emenda Constitucional": "EC"
  };

  for (let tipo in tipoMap) {
    const regex = new RegExp(`${tipo}\\s*n[ºo]?\\s*(\\d{1,5})(?:,|\\s|$)`, "i");
    const match = texto.match(regex);
    if (match) {
      return tipoMap[tipo] + match[1];
    }
  }

  if (/constituição federal/i.test(texto)) return "CF";
  return null;
}

export function inserirReferenciasNoHTML(html) {
  return html.replace(
    /<span class="leiRef"([^>]*)>(.*?)<\/span>/gi,
    (match, attrs, innerText) => {
      if (/data-lei=/.test(attrs)) return match; // já tem data-lei

      const cod = normalizarReferencia(innerText);
      if (!cod) return match;

      return `<span class="leiRef" ${attrs} data-lei="${cod}">${innerText}</span>`;
    }
  );
}