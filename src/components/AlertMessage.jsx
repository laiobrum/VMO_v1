import React, { useEffect, useState } from 'react'

const AlertMessage = ({message, duration = 3000, onClose}) => {
    const [visible, setVisible] = useState(true)

    useEffect(()=> {
        const timer = setTimeout(()=> {
            
            setVisible(false)
            if(onClose) onClose()
        }, duration)

        return () => clearTimeout(timer)
    }, [duration, onClose])

    if(!visible) return null
  return (
    <div 
    className='alertMsg fade'
    dangerouslySetInnerHTML={{ __html: message }}
    />
  )
}

export default AlertMessage