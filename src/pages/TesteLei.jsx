import { useEffect, useState, useRef } from 'react';
import './lei.css';

const TesteLei = () => {
  const [textoCompleto, setTextoCompleto] = useState('');
  const bookRef = useRef(null);

  //Pega dados do storage temporário e coloca no estado
  useEffect(() => {
    const texto = localStorage.getItem('texto-temporário') || '';
    setTextoCompleto(texto);
  }, []);

  useEffect(() => {
    if (!textoCompleto) return;

    const book = bookRef.current;
    book.innerHTML = '';

    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = textoCompleto;
    const nodes = Array.from(tempContainer.childNodes);

    const columnsPerPage = 3;
    const maxLinesPerColumn = 30;  // Limite de linhas por coluna
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
        const node = nodes[index].cloneNode(true);
        column.appendChild(node);

        const totalHeight = column.clientHeight;
        const computedLineHeight = parseFloat(getComputedStyle(column).lineHeight);
        const numberOfLines = Math.floor(totalHeight / computedLineHeight);

        if (numberOfLines >= maxLinesPerColumn) {
          column.removeChild(node);  // Remove o último que estourou
          return index;  // Continua desse index na próxima coluna
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

    fillPages();
  }, [textoCompleto]);

  return (
    <div className="law_container">
      <div className='book' id='book' ref={bookRef}></div>
    </div>
  );
};

export default TesteLei;
