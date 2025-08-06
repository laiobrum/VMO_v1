export function inserirReferenciasInternasNoHTML(html, codigoDaLei) {
  const expressoes = [
    "nos artigos", "nos arts.",
    "dos artigos", "dos arts.",
    "no artigo", "no art.",
    "do artigo", "do art.",
    "os artigos", "os arts.",
    "o artigo", "o art."
  ];

  const regex = new RegExp(
    `\\b(${expressoes
      .sort((a, b) => b.length - a.length)
      .map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join("|")})\\s+(\\d+[ºo\\.\\-A-Z]*)\\b`,
    "gi"
  );

  return html.replace(regex, (match, prefixo, numero, offset) => {
    const textoSeguinte = html.slice(offset, offset + 100).toLowerCase();

    const mencionaLeiExterna = /(lei\s+n[º°\.]?|decreto[-\s]?lei|decreto\s+n[º°\.]?|constituição|código\s+\w+)/i.test(textoSeguinte);

    // Se menciona outra lei → é externa → não marca
    if (mencionaLeiExterna) {
      return match;
    }

    // Se já estiver dentro de um span leiRef, evita duplicar
    if (/class=["']?leiRef["']?/.test(match)) return match;

    return `<span class="leiRef" data-lei="${codigoDaLei}">${match.trim()}</span>`;
  });
}


