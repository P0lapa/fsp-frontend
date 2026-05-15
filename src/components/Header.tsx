import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

type NavItem = {
  label: string
  href: string
}

const navItems: NavItem[] = [
  { label: 'Главная', href: '/' },
  { label: 'Соревнования', href: '/competitions' },
  { label: 'Тренировки', href: '/training' },
  { label: 'Новости', href: '/news' },
]

export function Header() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const {
    isInitialized,
    isAuthenticated,
    login,
    register,
    logout,
  } = useAuth()

  function closeMenu() {
    setIsMenuOpen(false)
  }

  async function handleLogin() {
    closeMenu()
    await login()
  }

  async function handleRegister() {
    closeMenu()
    await register()
  }

  async function handleLogout() {
    closeMenu()
    await logout()
  }

  return (
    <header className="border-b border-[#04CA37] bg-[#0a0a0a] font-mono">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 md:px-8">
        <Link
          to="/"
          onClick={closeMenu}
          className="min-w-0 truncate text-sm font-bold tracking-wide text-[#04CA37] sm:text-base md:text-lg"
        >
          &gt;_ ТЕРМИНАЛ_КОДА
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href

            return (
              <Link
                key={item.href}
                to={item.href}
                className={[
                  'text-lg tracking-[0.18em] underline-offset-4 transition-colors',
                  isActive
                    ? 'text-[#04CA37] underline'
                    : 'text-[#079918] hover:text-[#04CA37]',
                ].join(' ')}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-3 text-lg tracking-[0.18em] text-[#079918] md:flex">
          {!isInitialized ? (
            <span className="text-[#079918]">[Загрузка]</span>
          ) : isAuthenticated ? (
            <>
              <Link to="/profile" className="hover:text-[#04CA37]">
                [Профиль]
              </Link>
              <span>/</span>
              <button
                type="button"
                onClick={handleLogout}
                className="hover:text-[#04CA37]"
              >
                [Выход]
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRegister}
                className="hover:text-[#04CA37]"
              >
                [Регистрация]
              </button>
              <span>/</span>
              <button
                type="button"
                onClick={handleLogin}
                className="hover:text-[#04CA37]"
              >
                [Войти]
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 border border-[#04CA37] text-[#04CA37] md:hidden"
          aria-label="Открыть меню"
          aria-expanded={isMenuOpen}
        >
          <span
            className={[
              'block h-0.5 w-5 bg-[#04CA37] transition-transform',
              isMenuOpen ? 'translate-y-2 rotate-45' : '',
            ].join(' ')}
          />
          <span
            className={[
              'block h-0.5 w-5 bg-[#04CA37] transition-opacity',
              isMenuOpen ? 'opacity-0' : 'opacity-100',
            ].join(' ')}
          />
          <span
            className={[
              'block h-0.5 w-5 bg-[#04CA37] transition-transform',
              isMenuOpen ? '-translate-y-2 -rotate-45' : '',
            ].join(' ')}
          />
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-[#04CA37]/40 bg-[#0a0a0a] px-5 py-5 md:hidden">
          <nav className="flex flex-col gap-5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={closeMenu}
                  className={[
                    'text-base tracking-[0.18em] underline-offset-4 transition-colors',
                    isActive
                      ? 'text-[#04CA37] underline'
                      : 'text-[#079918] hover:text-[#04CA37]',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-6 flex flex-col gap-3 border-t border-[#04CA37]/30 pt-5 text-base tracking-[0.18em] text-[#079918]">
            {!isInitialized ? (
              <span>[Загрузка]</span>
            ) : isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="hover:text-[#04CA37]"
                >
                  [Профиль]
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-left hover:text-[#04CA37]"
                >
                  [Выход]
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleRegister}
                  className="text-left hover:text-[#04CA37]"
                >
                  [Регистрация]
                </button>

                <button
                  type="button"
                  onClick={handleLogin}
                  className="text-left hover:text-[#04CA37]"
                >
                  [Войти]
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
