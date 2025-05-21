import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Centro Quiro
          </Link>

          {/* Botón de menú móvil */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-600 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Menú de navegación desktop */}
          <div className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-600 transition duration-300"
            >
              Inicio
            </Link>
            <Link
              to="/nosotros"
              className="text-gray-600 hover:text-blue-600 transition duration-300"
            >
              Nosotros
            </Link>
            <Link
              to="/servicios"
              className="text-gray-600 hover:text-blue-600 transition duration-300"
            >
              Servicios
            </Link>
            <Link
              to="/contacto"
              className="text-gray-600 hover:text-blue-600 transition duration-300"
            >
              Contacto
            </Link>
            <Link
              to="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-4">
            <Link
              to="/"
              className="block text-gray-600 hover:text-blue-600 transition duration-300"
              onClick={toggleMenu}
            >
              Inicio
            </Link>
            <Link
              to="/nosotros"
              className="block text-gray-600 hover:text-blue-600 transition duration-300"
              onClick={toggleMenu}
            >
              Nosotros
            </Link>
            <Link
              to="/servicios"
              className="block text-gray-600 hover:text-blue-600 transition duration-300"
              onClick={toggleMenu}
            >
              Servicios
            </Link>
            <Link
              to="/contacto"
              className="block text-gray-600 hover:text-blue-600 transition duration-300"
              onClick={toggleMenu}
            >
              Contacto
            </Link>
            <Link
              to="/login"
              className="block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300 text-center"
              onClick={toggleMenu}
            >
              Iniciar Sesión
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header 