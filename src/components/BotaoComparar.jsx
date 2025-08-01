import { MdVerified } from "react-icons/md"

const BotaoComparar = ({ onClick }) => (
    <>
    <div className="btnComparacao" >
        <button className="btnVerified" onClick={onClick}>
            <MdVerified size={20} style={{ marginRight: 8 }} />
            <div>
                Lei idêntica à original
            </div>            
        </button>
    </div>
    </>
  
)

export default BotaoComparar