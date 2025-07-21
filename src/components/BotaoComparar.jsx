import { MdVerified } from "react-icons/md"

const BotaoComparar = ({ onClick }) => (
    <>
    <div className="btnComparacao" >
        <button className="btnVerified" onClick={onClick}>
            <MdVerified size={20} style={{ marginRight: 8 }} />
        </button>
        <button className="btnHide">
            Lei idêntica à original<br />
            <strong>Clique aqui para comparar</strong>
        </button>
    </div>
    </>
  
)

export default BotaoComparar