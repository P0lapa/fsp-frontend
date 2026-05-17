import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

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
  { label: '\u0413\u043b\u0430\u0432\u043d\u0430\u044f', href: '/' },
  { label: '\u0421\u043e\u0440\u0435\u0432\u043d\u043e\u0432\u0430\u043d\u0438\u044f', href: '/competitions' },
  { label: '\u0422\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0438', href: '/training' },
  { label: '\u041d\u043e\u0432\u043e\u0441\u0442\u0438', href: '/news' },
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

  const authActions: AuthAction[] = !isInitialized
    ? []
    : isAuthenticated
      ? [
          { key: 'profile', label: '\u041f\u0440\u043e\u0444\u0438\u043b\u044c', href: '/profile' },
          { key: 'logout', label: '\u0412\u044b\u0445\u043e\u0434', onClick: handleLogout },
        ]
      : [
          { key: 'register', label: '\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f', onClick: handleRegister },
          { key: 'login', label: '\u0412\u043e\u0439\u0442\u0438', onClick: handleLogin },
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
      return <span className="text-[var(--color-text-muted)]">[\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430]</span>
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
    <header className="border-b border-[var(--color-border)] bg-[var(--color-bg)] font-mono">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 md:px-8">
        <Link
          to="/"
          onClick={closeMenu}
          className="min-w-0 truncate text-sm font-bold tracking-wide text-[var(--color-accent)] sm:text-base md:text-lg"
        >
          &gt;_ {'\u0422\u0415\u0420\u041c\u0418\u041d\u0410\u041b_\u041a\u041e\u0414\u0410'}
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {renderNavLinks('text-lg tracking-[0.18em] underline-offset-4 transition-colors')}
        </nav>

        <div className="hidden items-center gap-3 text-lg tracking-[0.18em] text-[var(--color-text-muted)] md:flex">
          {renderAuthActions('hover:text-[var(--color-accent)]', '/')}
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 border border-[var(--color-border)] text-[var(--color-accent)] md:hidden"
          aria-label={'\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043c\u0435\u043d\u044e'}
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
            {renderNavLinks('text-base tracking-[0.18em] underline-offset-4 transition-colors', closeMenu)}
          </nav>

          <div className="mt-6 flex flex-col gap-3 border-t border-[var(--color-border-subtle)] pt-5 text-base tracking-[0.18em] text-[var(--color-text-muted)]">
            {renderAuthActions('text-left hover:text-[var(--color-accent)]', null, closeMenu)}
          </div>
        </div>
      )}
    </header>
  )
}
