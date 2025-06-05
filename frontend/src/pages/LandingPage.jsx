import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import Footer from '../components/Footer'

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const packages = [
    {
      name: 'Básico',
      price: '$2500',
      features: ['4 sesiones', 'Evaluación inicial', 'Plan personalizado', 'Ajuste quiropráctico']
    },
    {
      name: 'Premium',
      price: '$4500',
      features: ['8 sesiones', 'Evaluación completa', 'Plan personalizado', 'Ajuste quiropráctico', 'Terapia manual', 'Seguimiento']
    },
    {
      name: 'VIP',
      price: '$6500',
      features: ['12 sesiones', 'Evaluación completa', 'Plan personalizado', 'Ajuste quiropráctico', 'Terapia manual', 'Masajes incluidos', 'Seguimiento personalizado']
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src="/init-logo.png" alt="Logo" className="h-12" />
              <span className="ml-2 text-xl font-bold text-gray-800">Centro Quiropráctico</span>
            </Link>

            {/* Menú de navegación - Desktop */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-600 hover:text-blue-600">Inicio</Link>
              <Link to="/nosotros" className="text-gray-600 hover:text-blue-600">Nosotros</Link>
              <Link to="/servicios" className="text-gray-600 hover:text-blue-600">Servicios</Link>
              {/* <Link to="/blog" className="text-gray-600 hover:text-blue-600">Blog</Link> */}
              <Link to="/contacto" className="text-gray-600 hover:text-blue-600">Contacto</Link>
            </nav>

            {/* Botones de autenticación */}
            <div className="hidden md:flex space-x-4">
              <Link to="/login">
                <Button variant="outline">Iniciar Sesión</Button>
              </Link>
              <Link to="/register">
                <Button>Registrarse</Button>
              </Link>
            </div>

            {/* Botón de menú móvil */}
            <button 
              className="md:hidden text-gray-600"
              onClick={toggleMenu}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Menú móvil */}
          {isMenuOpen && (
            <div className="md:hidden py-4">
              <nav className="flex flex-col space-y-4">
                <Link to="/" className="text-gray-600 hover:text-blue-600">Inicio</Link>
                <Link to="/nosotros" className="text-gray-600 hover:text-blue-600">Nosotros</Link>
                <Link to="/servicios" className="text-gray-600 hover:text-blue-600">Servicios</Link>
                {/* <Link to="/blog" className="text-gray-600 hover:text-blue-600">Blog</Link> */}
                <Link to="/contacto" className="text-gray-600 hover:text-blue-600">Contacto</Link>
                <div className="flex flex-col space-y-2 pt-4">
                  <Link to="/login">
                    <Button variant="outline" className="w-full">Iniciar Sesión</Button>
                  </Link>
                  <Link to="/register">
                    <Button className="w-full">Registrarse</Button>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-50 to-white py-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="/backgrounds/2025-05-21_14-50.png" 
            alt="Bienestar" 
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-white/80 p-8 rounded-lg backdrop-blur-sm">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Tu Salud en Buenas Manos
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Ofrecemos tratamientos quiroprácticos profesionales para mejorar tu calidad de vida y bienestar. 
                Nuestro equipo de expertos está comprometido con tu salud.
              </p>
              <div className="flex space-x-4">
                <Link to="/register">
                  <Button size="lg">Solicitar Cita</Button>
                </Link>
                <Link to="/servicios">
                  <Button variant="outline" size="lg">Ver Servicios</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios Destacados */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nuestros Servicios</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className="relative h-48">
                <img 
                  src="/backgrounds/2025-05-21_14-52_1.png"
                  alt="Cuidado Quiropráctico"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>Cuidado Quiropráctico para todas las etapas de la vida</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Para restablecer las funciones del organismo y mejorar la calidad de vida.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Restablecimiento de funciones
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Mejora de calidad de vida
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className="relative h-48">
                <img 
                  src="/backgrounds/2025-05-21_14-51.png"
                  alt="Cuidado Deportivo"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>Cuidado Quiropráctico para deportistas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Atención especializada para deportistas amateurs y profesionales.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Maximización del rendimiento deportivo
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Mejor recuperación post entrenamiento
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Optimización del rendimiento en competencias
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Paquetes - Nueva sección */}
      {/* <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nuestros Paquetes</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <Card key={index} className={`hover:shadow-lg transition-shadow ${index === 1 ? 'border-2 border-blue-500' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-center">{pkg.name}</CardTitle>
                  <div className="text-3xl font-bold text-center text-blue-600">{pkg.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Button className="w-full">Seleccionar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="relative py-16">
        <div className="absolute inset-0 z-0">
          <img 
            src="/backgrounds/2025-05-21_14-51_1.png"
            alt="Tratamiento quiropráctico"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-blue-600/70"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">¿Listo para Mejorar tu Salud?</h2>
          <p className="text-xl mb-8 text-white">
            Agenda una cita hoy mismo y comienza tu camino hacia una vida más saludable.
            Nuestros especialistas están listos para ayudarte.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register">
              <Button size="lg" variant="secondary">Comenzar Ahora</Button>
            </Link>
            <a 
              href="https://wa.me/5493516171562" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
                Contactar por WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Contacto y Mapa */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Contacto</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mt-1 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <h3 className="font-bold">Dirección</h3>
                    <p className="text-gray-600">Vélez Sársfield 149, Bell Ville X2550AUC</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mt-1 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <h3 className="font-bold">Teléfono</h3>
                    <p className="text-gray-600">+54 353 730 4294</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mt-1 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <h3 className="font-bold">Email</h3>
                    <p className="text-gray-600">info@centroquiro.com</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mt-1 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-bold">Horario</h3>
                    <p className="text-gray-600">Lunes: 14:00 - 20:00</p>
                    <p className="text-gray-600">Martes: 14:00 - 20:00</p>
                    <p className="text-gray-600">Miércoles: 14:00 - 18:00</p>
                    <p className="text-gray-600">Jueves: 14:00 - 20:00</p>
                    <p className="text-gray-600">Viernes: 14:00 - 17:00</p>
                    <p className="text-gray-600">Sábados y Domingos: Cerrado</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3348.1234567890123!2d-62.6889!3d-32.6239!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95c7d1c9c9c9c9c9%3A0x1234567890abcdef!2sV%C3%A9lez%20S%C3%A1rsfield%20149%2C%20Bell%20Ville%2C%20C%C3%B3rdoba!5e0!3m2!1ses!2sar!4v1620000000000!5m2!1ses!2sar"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                className="rounded-lg shadow-lg"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Mejorado */}
      <Footer />

      {/* Botón flotante de WhatsApp */}
      <a
        href="https://wa.me/5493516171562"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors duration-300 z-50"
      >
        <svg
          className="w-8 h-8"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  )
}

export default LandingPage 