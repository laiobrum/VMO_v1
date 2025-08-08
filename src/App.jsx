import { BrowserRouter, Navigate, Route, Routes, Outlet, useParams } from "react-router-dom";
import Navbar from "./components/layouts/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./context/AuthContext";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth} from "./firebase/config";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Recover from "./pages/Recover";
import AreaRestrita from "./pages/AreaRestrita";
import { useAdminAccess } from "./hooks/useAdminAccess";
import InserirLeis from "./components/InserirLeis";
import TodasLeis from "./pages/TodasLeis";
import VisualizeLei from "./pages/VisualizeLei";
import CompararLeis from "./components/CompararLeis";
import LeisUsuario from "./pages/LeisUsuario";
import BuscarDispositivosPorTexto from "./components/BuscarDispositivoPorTexto";
import ExcluirAlteracoesUser from "./components/ExcluirAlteracoesUser";
import TesteNovaLei from "./components/TesteNovaLei";
import EditarLeiAdmin from "./components/EditarLeiAdmin.jsx";


function App() {
  const [user, setUser] = useState(undefined);
  const [emailVerifiedUser, setEmailVerifiedUser] = useState(null);
  const { isAdmin } = useAdminAccess(user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user && user.emailVerified) {
        setEmailVerifiedUser(user);
      } else {
        setEmailVerifiedUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const carregando = user === undefined || isAdmin === null;
  if (carregando) {
    return <div>Carregando...</div>;
  }

  const AdminRoute = () => {
    return emailVerifiedUser && isAdmin ? <Outlet /> : <Navigate to="/" />;
  };

  return (
    <AuthProvider value={{ user: emailVerifiedUser }}>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            {/* ROTAS RESTRITAS PARA 'admin' */}
            <Route element={<AdminRoute />}>
              <Route path="/restrictarea" element={<AreaRestrita />} />
              <Route path="/insertlaws" element={<InserirLeis />} />
              <Route path="/insertlaws/comparar" element={<CompararLeis />} />
              <Route path="/teste-nova-lei" element={<TesteNovaLei />} />
              <Route path="/consulta-base-dados" element={<BuscarDispositivosPorTexto />} />
              <Route path="/excluir-alteracoes-user" element={<ExcluirAlteracoesUser />} />
              <Route path="/editar-lei-admin" element={<EditarLeiAdmin />} />
            </Route>

            {/* ROTAS PÚBLICAS PARA 'customer' */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!emailVerifiedUser ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!emailVerifiedUser ? <Register /> : <Navigate to="/" />} />
            <Route path="/profile" element={emailVerifiedUser ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/recoverPassword" element={<Recover />} />

            <Route path="/leis-usuario" element={emailVerifiedUser ? <LeisUsuario /> : <Navigate to="/login" />}/>
            
            <Route path="/leis" element={<TodasLeis />} />
            <Route path="/leis/:slug" element={<VisualizeLei />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;