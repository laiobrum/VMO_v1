import { useState } from "react"

export const useLawSanitizer = (rules) => {
    const [texto, setTexto] = useState('')

    const applySanitization = () => {
        let sanitized = texto
        for (const rule of rules) {
            sanitized = sanitized.replace(rule.pattern, rule.replacement)
        }
        setTexto(sanitized)
    }

    return { texto, setTexto, applySanitization }
}