import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

type NavItem = {
  label: string
  href: string
}

type AuthAction = {
  key: string
  label: string
  onClick?: () => void
  href?: string
}

const navItems: NavItem[] = [
  { label: 'Главная', href: '/' },
  { label: 'Соревнования', href: '/competitions' },
  { label: 'Тренировки', href: '/training' },
  { label: 'Новости', href: '/news' },
]

function renderAuthAction(
  action: AuthAction,
  className: string,
  onNavigate?: () => void,
) {
  const content = `[${action.label}]`

  if (action.href) {
    return (
      <Link key={action.key} to={action.href} onClick={onNavigate} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button key={action.key} type="button" onClick={action.onClick} className={className}>
      {content}
    </button>
  )
}

export function LiveNavigation() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isInitialized, isAuthenticated, login, register, logout } = useAuth()

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

  const authActions: AuthAction[] = !isInitialized
    ? []
    : isAuthenticated
      ? [
          { key: 'profile', label: 'Профиль', href: '/profile' },
          { key: 'logout', label: 'Выход', onClick: handleLogout },
        ]
      : [
          { key: 'register', label: 'Регистрация', onClick: handleRegister },
          { key: 'login', label: 'Войти', onClick: handleLogin },
        ]

  function renderNavLinks(linkClassName: string, onNavigate?: () => void) {
    return navItems.map((item) => {
      const isActive = location.pathname === item.href

      return (
        <Link
          key={item.href}
          to={item.href}
          onClick={onNavigate}
          className={[
            linkClassName,
            isActive
              ? 'text-[var(--color-accent)] underline'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-accent)]',
          ].join(' ')}
        >
          {item.label}
        </Link>
      )
    })
  }

  function renderAuthActions(
    actionClassName: string,
    separator: ReactNode,
    onNavigate?: () => void,
  ) {
    if (!isInitialized) {
      return <span className="text-[var(--color-text-muted)]">[Загрузка]</span>
    }

    return authActions.flatMap((action, index) => {
      const nodes: ReactNode[] = [
        renderAuthAction(action, actionClassName, onNavigate),
      ]

      if (separator && index < authActions.length - 1) {
        nodes.push(<span key={`${action.key}-separator`}>{separator}</span>)
      }

      return nodes
    })
  }

  return (
    <div className="group border-b border-[var(--color-border)] bg-[var(--color-bg)] font-mono">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 md:px-8">
        <Link
          to="/"
          onClick={closeMenu}
          className="min-w-0 truncate text-sm font-bold tracking-wide text-[var(--color-accent)] sm:text-base md:text-lg"
        >
          &gt;_ ТЕРМИНАЛ_КОДА
        </Link>

        <nav className="hidden items-center gap-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:flex">
          {renderNavLinks('text-lg tracking-[0.18em] underline-offset-4 transition-colors')}
        </nav>

        <div className="hidden items-center gap-3 text-lg tracking-[0.18em] text-[var(--color-text-muted)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:flex">
          {renderAuthActions('hover:text-[var(--color-accent)]', '/')}
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 border border-[var(--color-border)] text-[var(--color-accent)] md:hidden"
          aria-label="Открыть меню"
          aria-expanded={isMenuOpen}
        >
          <span
            className={[
              'block h-0.5 w-5 bg-[var(--color-accent)] transition-transform',
              isMenuOpen ? 'translate-y-2 rotate-45' : '',
            ].join(' ')}
          />
          <span
            className={[
              'block h-0.5 w-5 bg-[var(--color-accent)] transition-opacity',
              isMenuOpen ? 'opacity-0' : 'opacity-100',
            ].join(' ')}
          />
          <span
            className={[
              'block h-0.5 w-5 bg-[var(--color-accent)] transition-transform',
              isMenuOpen ? '-translate-y-2 -rotate-45' : '',
            ].join(' ')}
          />
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-[var(--color-border-muted)] bg-[var(--color-bg)] px-5 py-5 md:hidden">
          <nav className="flex flex-col gap-5">
            {renderNavLinks(
              'text-base tracking-[0.18em] underline-offset-4 transition-colors',
              closeMenu,
            )}
          </nav>

          <div className="mt-6 flex flex-col gap-3 border-t border-[var(--color-border-subtle)] pt-5 text-base tracking-[0.18em] text-[var(--color-text-muted)]">
            {renderAuthActions('text-left hover:text-[var(--color-accent)]', null, closeMenu)}
          </div>
        </div>
      )}
    </div>
  )
}