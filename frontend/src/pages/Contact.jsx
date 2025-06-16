import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import WhatsAppButton from '../components/WhatsAppButton'
import Footer from '../components/Footer'
import { contactService } from '../services/contact.service'
import { useToast } from '../components/ui/use-toast'

const Contact = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar campos requeridos
      if (!formData.nombre.trim() || !formData.email.trim() || !formData.mensaje.trim()) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos obligatorios",
          variant: "destructive"
        })
        return
      }

      // Mostrar toast de carga
      const loadingToast = toast({
        title: "Enviando mensaje...",
        description: "Por favor espera mientras procesamos tu mensaje",
        duration: 3000
      })

      // Enviar mensaje usando el servicio
      const response = await contactService.sendMessage(formData)

      // Limpiar formulario
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        mensaje: ''
      })

      // Mostrar mensaje de éxito
      toast({
        title: "¡Mensaje enviado exitosamente!",
        description: "Nos pondremos en contacto contigo pronto.",
        duration: 5000
      })

    } catch (error) {
      console.error("Error al enviar mensaje:", error)
      
      // Mostrar mensaje de error
      toast({
        title: "Error al enviar mensaje",
        description: error.error || error.message || "Hubo un problema al enviar tu mensaje. Por favor intenta de nuevo o contacta por WhatsApp.",
        variant: "destructive",
        duration: 8000
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src="/init-logo.png" alt="Logo" className="h-12" />
              <span className="ml-2 text-xl font-bold text-gray-800">Gonzalo Cajeao Quiropraxia</span>
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
      <section className="relative py-20 bg-gradient-to-b from-blue-600 to-blue-800">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Contáctanos
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Estamos aquí para ayudarte en tu camino hacia una mejor salud
            </p>
          </div>
        </div>
      </section>

      {/* Información de Contacto */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Formulario de Contacto */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-3xl font-semibold mb-6 text-gray-800">Envíanos un mensaje</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="nombre">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="email">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tu Email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="telefono">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tu número de teléfono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="mensaje">
                    Mensaje
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="¿En qué podemos ayudarte?"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Enviando..." : "Enviar mensaje"}
                </button>
              </form>
            </div>

            {/* Información de Contacto */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">Información de contacto</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-gray-800">Dirección</h4>
                      <p className="text-gray-600">Vélez Sársfield 149, Bell Ville X2550AUC</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-gray-800">Teléfono</h4>
                      <p className="text-gray-600">+54 353 730 4294</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-gray-800">Email</h4>
                      <p className="text-gray-600">quiropraxiagonzalocajeao@gmail.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">Horarios de atención</h3>
                <div className="space-y-2">
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
        </div>
      </section>

      <WhatsAppButton />

      {/* Footer */}
      <Footer/>
    </div>
  )
}

export default Contact 