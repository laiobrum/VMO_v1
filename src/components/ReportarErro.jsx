import { useEffect, useState } from "react"
import { useAdminAccess } from "../hooks/useAdminAccess";
import { useAuthValue } from "../context/AuthContext";
import { useSaveDispositivo } from "../hooks/useSaveDispositivo";
import { inserirReferenciasExternasHTML } from "../utils/inserirReferenciasExternasHTML";
import { SlClose } from "react-icons/sl";
import { tirarEspacos } from "../utils/tirarEspacos";
import { inserirReferenciasInternasNoHTML } from "../utils/inserirReferenciasInternasNoHTML";

const ReportarErro = ({isOpen, onClose, onSubmit, hoveredP, modoOriginalAtivo}) => {
    const {user} = useAuthValue()
    const {isAdmin} = useAdminAccess(user)
    const [correcao, setCorrecao] = useState(""); // usado por admins
    const [explicacao, setExplicacao] = useState(""); // usado por usuários
    const [email, setEmail] = useState(user.email || '')

    const {salvarDispositivo, salvando} = useSaveDispositivo(hoveredP)

    // Preenche o textarea com o conteúdo do parágrafo quando o modal abrir
    useEffect(() => {
        if(isOpen && hoveredP) {
            setCorrecao(hoveredP.outerHTML || "")
        }
    }, [isOpen, hoveredP])

    // Fecha com ESC ou clique fora
    useEffect(()=> {
        const handleKeyDown = (e) => {
            if(e.key === "Escape") onClose()
        }
        const handleClickOutside = (e) => {
            if(e.target.classList.contains('modal-overlay')) {
                onClose()
            }
        }
        document.addEventListener("keydown", handleKeyDown)
        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("keydown", handleKeyDown)
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [onClose])

    if(!isOpen) return null

    const handleSubmitUser = (e) => {
        e.preventDefault();
        onSubmit({
            email,
            explicacao,
            trecho: hoveredP?.outerHTML || "",
        });
        onClose();
    };

    const handleEnviarAdmin = async (e) => {
        e.preventDefault()
        await salvarDispositivo({correcao})
        onClose()
        localStorage.setItem('scrollToId', hoveredP.id)
        window.location.reload()
    }

    //Pré-visualizar lei
    const visualize = (e) => {
        e.preventDefault()
        localStorage.setItem('texto-temporário', correcao)
        window.open('/teste-nova-lei', '_blank')
    }

    //Inserir referência cruzada
    const inserirRef = (e) => {
      e.preventDefault()
      let novoHtml = inserirReferenciasExternasHTML(correcao)
      novoHtml = inserirReferenciasInternasNoHTML(correcao, "FALTA DAR UM JEITO DE PASSAR NUMERO DA LEI AQUI!!!")
      setCorrecao(novoHtml)
    }

    const rmvEspacos = (e) => {
        e.preventDefault()

        const textoLimpo = tirarEspacos(correcao)

        setCorrecao(textoLimpo)
        return 
    }
    

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="btnXcontainer">
          <button className="btnX" type="button" onClick={onClose}><SlClose /></button>
        </div>
        <h3>Você selecionou o texto:</h3>
        <p>{hoveredP?.innerText}</p>

        {!isAdmin ? (
          <form className="formControl" onSubmit={handleSubmitUser}>
            <label>
              <h3>E-mail:</h3>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              <h3>Explique o erro:</h3>
              <textarea
                className="modaltxt"
                name="erro"
                value={explicacao}
                onChange={(e) => setExplicacao(e.target.value)}
                required
              />
            </label>
            <div className="modal-buttons">
              <button className="btn1" type="button" onClick={onClose}>Fechar</button>
              <input className="btn1" type="submit" value="Enviar" />
            </div>
          </form>
        ) : (
          <form className="formControl" onSubmit={handleEnviarAdmin}>
            <h3>Usuário: {user.displayName}</h3>
            <label>
              <h3>Corrija na base de dados:</h3>
              <textarea
                className="modaltxt"
                name="correcao"
                value={correcao}
                onChange={(e) => setCorrecao(e.target.value)}
                required
              />
            </label>
            <div className="modal-buttons">
              <button onClick={visualize} className="btn2">Pré-visualizar</button>
              <button onClick={rmvEspacos} className="btn2">Tirar Espacos</button>
              <button onClick={inserirRef} className="btn2">Inserir Referência</button>
              <input className="btn1" type="submit" value={salvando ? "Editando... aguarde" : "Editar na base de dados"} 
                onClick={(e) => { 
                  if (!modoOriginalAtivo) {
                    const continuar = window.confirm("O texto original não está ativado. Tem certeza que deseja continuar? \nCaso haja edição no texto, ele não poderá CORROMPER a o texto original");
                    if (!continuar) {
                      e.preventDefault(); // só impede se o usuário cancelar
                    }
                  }
                }}
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
};


export default ReportarErro