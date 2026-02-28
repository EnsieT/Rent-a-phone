import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Phones from './pages/Phones'
import PhoneDetail from './pages/PhoneDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import MyRentals from './pages/MyRentals'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/phones" element={<Phones />} />
            <Route path="/phones/:id" element={<PhoneDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/rentals"
              element={
                <ProtectedRoute>
                  <MyRentals />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
