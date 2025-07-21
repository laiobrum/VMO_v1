import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
//Pages
import Navbar from "./components/layouts/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import { AuthProvider } from "./context/AuthContext"
import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./firebase/config"
import NotFound from "./pages/NotFound"
import Profile from "./pages/Profile"
import Recover from "./pages/Recover"
import AreaRestrita from "./pages/AreaRestrita"
import { useAdminAccess } from "./hooks/useAdminAccess"
import InserirLeis from "./components/InserirLeis"
// import TesteLei from "./pages/TesteLei"
import TesteLei from "./components/TesteLei"
import TodasLeis from "./pages/Leis/TodasLeis"
import VisualizeLei from "./pages/Leis/VisualizeLei"
import CompararLeis from "./components/CompararLeis"
import CompararViewComLei from "./pages/CompararViewComLei"

function App() {
  const [user, setUser] = useState(undefined)
  const {isAdmin} = useAdminAccess(user)
  const [emailVerifiedUser, setEmailVerifiedUser] = useState(null)
  useEffect(()=>{
    const unsubscribe = onAuthStateChanged(auth, (user)=>{
      setUser(user)
      if(user && user.emailVerified) {
        setEmailVerifiedUser(user)
      } else {
        setEmailVerifiedUser(null)
      }
    })
    return () => unsubscribe()
  }, [auth])

  return (
    <AuthProvider value={{user: emailVerifiedUser}}>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/login" element={!emailVerifiedUser ? <Login/> : <Navigate to='/'/>}/>
              <Route path="/register" element={!emailVerifiedUser ? <Register/> : <Navigate to='/'/>}/>
              <Route path="/profile" element={emailVerifiedUser ? <Profile/> : <Navigate to='/login'/>}/>
              <Route path="/recoverPassword" element={<Recover/>}/>
              <Route path="/restrictarea" element={(emailVerifiedUser && isAdmin) ? <AreaRestrita/> : <Navigate to='/'/>}/>
              <Route path="/insertlaws" element={(emailVerifiedUser && isAdmin) ? <InserirLeis/> : <Navigate to='/'/>}/>
              <Route path="/insertlaws/comparar" element={<CompararLeis/>}/>
              
              <Route path="/teste-nova-lei" element={<TesteLei/>}/>

              {/* Rotas públicas */}
              <Route path="/leis" element={<TodasLeis/>}/>
              <Route path="/leis/:leiId" element={<VisualizeLei/>}/>
              <Route path="/leis/comparar" element={<CompararViewComLei />} />
              
              
              
              <Route path="*" element={<NotFound/>}/>

          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
