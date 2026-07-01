import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './routes/ProtectedRoute'
import { InstallPrompt } from './components/InstallPrompt'
import { UpdateToast } from './components/UpdateToast'

import Splash from './pages/Splash'
import Onboarding from './pages/Onboarding'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import RecuperarSenha from './pages/RecuperarSenha'
import Dashboard from './pages/Dashboard'
import Biblioteca from './pages/Biblioteca'
import LivroDetalhe from './pages/LivroDetalhe'
import Configuracoes from './pages/Configuracoes'
import Lumi from './pages/Lumi'
import Social from './pages/Social'
import Amigos from './pages/Amigos'
import Perfil from './pages/Perfil'
import PerfilUsuario from './pages/PerfilUsuario'
import Ranking from './pages/Ranking'

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/recuperar-senha" element={<RecuperarSenha />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/biblioteca"
              element={
                <ProtectedRoute>
                  <Biblioteca />
                </ProtectedRoute>
              }
            />
            <Route
              path="/biblioteca/:bookId"
              element={
                <ProtectedRoute>
                  <LivroDetalhe />
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracoes"
              element={
                <ProtectedRoute>
                  <Configuracoes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lumi"
              element={
                <ProtectedRoute>
                  <Lumi />
                </ProtectedRoute>
              }
            />
            <Route
              path="/social"
              element={
                <ProtectedRoute>
                  <Social />
                </ProtectedRoute>
              }
            />
            <Route
              path="/amigos"
              element={
                <ProtectedRoute>
                  <Amigos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ranking"
              element={
                <ProtectedRoute>
                  <Ranking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <Perfil />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuario/:uid"
              element={
                <ProtectedRoute>
                  <PerfilUsuario />
                </ProtectedRoute>
              }
            />
          </Routes>
          <InstallPrompt />
          <UpdateToast />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  )
}
