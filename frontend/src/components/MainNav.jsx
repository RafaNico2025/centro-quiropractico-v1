import React from 'react'
import { Link } from 'react-router-dom'

export function MainNav() {
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
        Inicio
      </Link>
      <Link to="/patients" className="text-sm font-medium transition-colors hover:text-primary">
        Pacientes
      </Link>
      <Link to="/clinical-records" className="text-sm font-medium transition-colors hover:text-primary">
        Registros Clínicos
      </Link>
      <Link to="/appointments" className="text-sm font-medium transition-colors hover:text-primary">
        Citas
      </Link>

      <Link to="/stats" className="text-sm font-medium transition-colors hover:text-primary">
        Estadísticas
      </Link>
      <Link to="/accounting" className="text-sm font-medium transition-colors hover:text-primary">
        Contabilidad
      </Link>
    </nav>
  )
} 