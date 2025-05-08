import { useState } from "react";

function InserirLeis() {
    const [title, setTitle] = useState('')
    const [texto, setTexto] = useState('')

    const handleSubmit=(evt)=>{
        const user = {
            title,
            texto
        }
        console.log(user)
    }

    const formatLaw = (e) => {
        e.preventDefault()
        setTexto(texto
            //Espaços
            .replace(/^\s*\n/gm, "")//exclui parágrafos vazios
            .replace(/^\s*/gm, "")//exclui espaços vazios
            //Números ordinais
            .replace(/(\d+)º/g, "$1.º")//Coloca na grafia correta "1.º"
            //Art.
            .replace(/Art\./g, "<span>Art.")//span antes do Art.
            .replace(/(Art\. \d+\.º)/g, "$1</span>")
            .replace(/(Art\. \d+\. )/g, "$1</span>")// /Span após o Art.
            // .replace(/(Art\. \d+\.º)/g, "$1</span>")
            // .replace(/(Art\. \d+º)/g, "$1.º</span>")// /Span após o Art. º 
            .replace(/(Art\. \d+-[A-Z]\.)/g, "$1</span>")// /span após "Art. 146-A."
            //§§
            .replace(/(§ \d+)º/g, "$1.º")//arrumar o § 1.º
            .replace(/(§ \d+\.º)/g, "<span>$1</span>")//span antes do § com º

            .replace(/(§ \d+\. )/g, "<span>$1</span>")// /span após o § com º
            
            .replace(/Parágrafo único./g, "Parágrafo único.</span>")//inclui /span após pu
            //<p> em todos os parágrafos
            .replace(/^(\w)/gm, "<p><span>$1")// inclui span e p antes de qualquer parágrafo
            .replace(/(.+)$/gm, "$1</p>")//adiciona p ao fim de todas as linhas
            //Incisos:
            .replace(/ - /g, " - </span>")//adiciona /span após hífens
            .replace(/ – /g, " - </span>")//adiciona /span após hífens - ele diferencia os hífens grandes dos pequenos
            //Alíneas
            .replace(/([a-zA-Z])\)/g, "$1)</span>")// adiciona /span após alíneas 'a)'
            //Textos recorrentes

        )
        return 
    }

    const visualize = (e) => {
        e.preventDefault()
        localStorage.setItem('texto-temporário', texto)
        window.open('/teste-nova-lei', '_blank')
    }

    return (
        <div>
            <h2>Formatação e inclusão de lei:</h2>
            <form className="formContainer2" onSubmit={handleSubmit}>
                <label className="formControl">
                    <span>Título da lei: </span>
                    <input type="text" name="title" placeholder="Ex.: Constituição Federal" onChange={(e)=>setTitle(e.target.value)} required />
                </label>

                {/* Tag TEXTAREA - é igual */}
                <label className="formControl">
                    <span>Texto da lei: </span>
                    <textarea type="textarea" name="texto" placeholder="Insira todo o texto legal" onChange={(e)=>setTexto(e.target.value)} value={texto} ></textarea>
                </label>
                
                <button onClick={formatLaw} className="btn2">Adicionar HTML</button>&nbsp;&nbsp;
                <button onClick={visualize} className="btn2">Pré-visualizar</button>
                <br />
                <br />
                <input className="btn1" type="submit" />
            </form>
        </div>
    )
}

export default InserirLeis