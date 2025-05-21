import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-bold text-white">
              Centro Quiro
            </Link>
            <p className="text-gray-400">
              Comprometidos con tu bienestar y salud a través de tratamientos quiroprácticos profesionales.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition duration-300">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="text-gray-400 hover:text-white transition duration-300">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link to="/servicios" className="text-gray-400 hover:text-white transition duration-300">
                  Servicios
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-gray-400 hover:text-white transition duration-300">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Nuestros servicios</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Ajuste quiropráctico</li>
              <li className="text-gray-400">Terapia manual</li>
              <li className="text-gray-400">Rehabilitación</li>
              <li className="text-gray-400">Evaluación postural</li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">
                <span className="block">Dirección:</span>
                Av. Principal 123, Ciudad
              </li>
              <li className="text-gray-400">
                <span className="block">Teléfono:</span>
                +54 123 456 7890
              </li>
              <li className="text-gray-400">
                <span className="block">Email:</span>
                contacto@centroquiro.com
              </li>
            </ul>
          </div>
        </div>

        {/* Derechos de autor */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Centro Quiro. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 