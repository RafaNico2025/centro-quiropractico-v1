import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { ThemeProvider } from './theme-provider'
import { MainNav } from './MainNav'
import { UserNav } from './UserNav'
import { Button } from './ui/button'

export default function Layout() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)

  const handleLogin = () => {
    navigate('/login')
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <MainNav />
            <div className="flex items-center gap-4">
              {!isLoggedIn && (
                <Button variant="outline" onClick={handleLogin}>
                  Iniciar Sesión
                </Button>
              )}
              <UserNav />
            </div>
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  )
} 