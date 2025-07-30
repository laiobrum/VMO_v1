import { useEffect, useState } from "react"
import { useAdminAccess } from "../hooks/useAdminAccess";
import { useAuthValue } from "../context/AuthContext";
import { useSaveDispositivo } from "../hooks/useSaveDispositivo";


const ReportarErro = ({isOpen, onClose, onSubmit, hoveredP}) => {
    const {user} = useAuthValue()
    const {isAdmin} = useAdminAccess(user)
    const [correcao, setCorrecao] = useState(""); // usado por admins
    const [explicacao, setExplicacao] = useState(""); // usado por usuários
    const [email, setEmail] = useState(user.email)

    const {salvarDispositivo, salvando} = useSaveDispositivo(hoveredP)

    // Atualiza o textarea com o conteúdo do parágrafo quando o modal abrir
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
    

  return (
    <div className="modal-overlay">
      <div className="modal">
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
              <button className="btn1" type="button" onClick={onClose}>
                Fechar
              </button>
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
              <button className="btn1" type="button" onClick={onClose}>
                Fechar
              </button>
              <button onClick={visualize} className="btn2">Pré-visualizar</button>
              <input
                className="btn1"
                type="submit"
                value={salvando ? "Editando... aguarde" : "Editar na base de dados"}
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
};


export default ReportarErro