
export const ToggleSwitch = ({ isOn, handleToggle }) => {
    return (
        <div className="toggle-switch" onClick={handleToggle}>
            <div className={`switch ${isOn ? "on" : "off"}`}>
                <div className="ball"/>
            </div>
        </div>
    )
}

