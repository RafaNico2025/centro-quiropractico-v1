import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import Footer from '../components/Footer'
const About = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

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
      <section className="relative py-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="/backgrounds/2025-05-21_14-51_1.png" 
            alt="Tratamiento quiropráctico" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-blue-600/50"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Sobre Nosotros
            </h1>
            <p className="text-xl mb-8">
              Somos un centro quiropráctico comprometido con tu bienestar y salud integral, 
              utilizando técnicas avanzadas y un enfoque personalizado para cada paciente.
            </p>
          </div>
        </div>
      </section>

      {/* Nuestra Historia */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Nuestra Historia</h2>
              <p className="text-gray-600 mb-4">
                Fundado con la visión de proporcionar atención quiroprática de la más alta calidad, 
                nuestro centro ha estado sirviendo a la comunidad con dedicación y excelencia.
              </p>
              <p className="text-gray-600 mb-4">
                A lo largo de los años, hemos ayudado a miles de pacientes a recuperar su salud 
                y bienestar a través de técnicas quiropráticas avanzadas y un enfoque holístico 
                del cuidado de la salud.
              </p>
            </div>
            <div className="relative h-96">
              <img 
                src="/backgrounds/2025-05-21_14-52_1.png"
                alt="Consultorio"
                className="w-full h-full object-cover rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Nuestros Valores */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nuestros Valores</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Compromiso</h3>
                <p className="text-gray-600">
                  Dedicados a proporcionar el mejor cuidado posible para cada paciente, 
                  adaptándonos a sus necesidades específicas.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Excelencia</h3>
                <p className="text-gray-600">
                  Buscamos la excelencia en cada tratamiento, manteniéndonos actualizados 
                  con las últimas técnicas y avances en quiropráctica.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Comunidad</h3>
                <p className="text-gray-600">
                  Creemos en construir relaciones duraderas con nuestros pacientes y 
                  ser parte activa de nuestra comunidad.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Nuestro Enfoque */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Nuestro Enfoque</h2>
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Diagnóstico Preciso</h3>
                  <p className="text-gray-600">
                    Realizamos una evaluación completa para entender la causa raíz de tus molestias 
                    y desarrollar un plan de tratamiento efectivo.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Tratamiento Personalizado</h3>
                  <p className="text-gray-600">
                    Cada plan de tratamiento se adapta a las necesidades específicas del paciente, 
                    considerando su estilo de vida y objetivos de salud.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Resultados Duraderos</h3>
                  <p className="text-gray-600">
                    Nos enfocamos en soluciones a largo plazo, no solo en aliviar los síntomas 
                    temporalmente, educando a nuestros pacientes sobre el cuidado preventivo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Comienza Tu Camino Hacia el Bienestar
          </h2>
          <p className="text-xl text-white mb-8">
            Agenda una consulta y descubre cómo podemos ayudarte a mejorar tu calidad de vida.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Agendar Cita
              </Button>
            </Link>
            <Link to="/contacto">
              <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
                Contactarnos
              </Button>
            </Link>
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

export default About 