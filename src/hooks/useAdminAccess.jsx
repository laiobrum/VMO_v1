import { doc, getDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../firebase/config"

export const useAdminAccess = (user) => {
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(()=>{
        const checkRole = async() => {
            if(!user) return
            try {
                const docRef = await doc(db, "users", user.uid)
                const docSnap = await getDoc(docRef)

                if(docSnap.exists()) {
                    const data = docSnap.data()
                    setIsAdmin(data.role === 'admin')
                }
            } catch (error) {
                console.log(error)
            }
        }
        checkRole()
        
    }, [user])

    return {isAdmin}
}