import { useEffect, useState, useRef } from 'react';
import '../pages/lei.css';

const TesteLei = () => {
  const [textoCompleto, setTextoCompleto] = useState('');
  const bookRef = useRef(null);

  // Pega dados do storage temporário e coloca no estado
  useEffect(() => {
    const texto = localStorage.getItem('texto-temporário') || '';
    setTextoCompleto(texto);
  }, []);

  useEffect(() => {
    if (!textoCompleto) return;

    const book = bookRef.current;
    if (!book) return;
    book.innerHTML = '';

    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = textoCompleto;

    // Pegamos apenas <p>, <div>, etc. — evitando TextNodes soltos
    const nodes = Array.from(tempContainer.querySelectorAll('p, div, section, article'));

    const columnsPerPage = 3;
    const maxLinesPerColumn = 30;
    let currentNodeIndex = 0;

    function createPage() {
      const page = document.createElement('div');
      page.className = 'page';
      for (let i = 0; i < columnsPerPage; i++) {
        const column = document.createElement('div');
        column.className = 'column';
        page.appendChild(column);
      }
      book.appendChild(page);
      return page;
    }

    function fillColumn(column, startIndex) {
      let index = startIndex;

      while (index < nodes.length) {
        const node = nodes[index];
        if (!node || node.nodeType !== 1) {
          index++;
          continue;
        }

        const cloned = node.cloneNode(true);
        column.appendChild(cloned);

        const totalHeight = column.clientHeight;
        const computedLineHeight = parseFloat(getComputedStyle(column).lineHeight || '20');
        const numberOfLines = Math.floor(totalHeight / computedLineHeight);

        if (numberOfLines >= maxLinesPerColumn) {
          column.removeChild(cloned);
          return index;
        }

        index++;
      }

      return index;
    }

    function fillPages() {
      while (currentNodeIndex < nodes.length) {
        const page = createPage();
        const columns = page.getElementsByClassName('column');
        for (let i = 0; i < columns.length && currentNodeIndex < nodes.length; i++) {
          currentNodeIndex = fillColumn(columns[i], currentNodeIndex);
        }
      }
    }

    // Deixa a renderização mais suave para textos longos
    setTimeout(() => {
      fillPages();
    }, 0);
  }, [textoCompleto]);

  return (
    <div className="law_container">
      <div className="book" id="book" ref={bookRef}></div>
    </div>
  );
};

export default TesteLei;
