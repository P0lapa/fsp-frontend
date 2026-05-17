import { Link } from 'react-router-dom'
import { SectionFolderLabel } from './home/SectionFolderLabel'
import { useTheme } from '../theme/useTheme'
import themeToggleIconMarkup from '../assets/change-theme.svg?raw'

type FooterLink = {
  label: string
  href?: string
  placeholder?: boolean
}

const navigationLinks: FooterLink[] = [
  { label: 'Главная', href: '/' },
  { label: 'Соревнования', href: '/competitions' },
  { label: 'Тренировки', href: '/training' },
  { label: 'Новости', href: '/news' },
]

const policyLinks: FooterLink[] = [
  { label: 'Пользовательское соглашение', placeholder: true },
  { label: 'Политика конфиденциальности', placeholder: true },
  { label: 'Полезные материалы', placeholder: true },
]

function renderFooterLink(link: FooterLink) {
  const className =
    'font-ibm text-[16px] leading-[1.55] text-[var(--color-text-muted)] transition hover:text-[var(--color-accent)]'

  if (link.href) {
    return (
      <Link key={link.label} to={link.href} className={className}>
        {link.label}
      </Link>
    )
  }

  return (
    <button
      key={link.label}
      type="button"
      className={`${className} text-left`}
      aria-disabled="true"
      title="Раздел появится позже"
    >
      {link.label}
    </button>
  )
}

export function Footer() {
  const { theme, toggleTheme } = useTheme()
  const nextThemeLabel = theme === 'dark' ? 'светлую' : 'тёмную'

  return (
    <footer className="border-t border-[var(--color-border-muted)] bg-[var(--color-bg)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8 lg:px-12 lg:py-14">
        <div className="mb-8">
          <SectionFolderLabel path="ТЕРМИНАЛ_КОДА" />
        </div>

        <div className="grid gap-10 md:grid-cols-[1.4fr_0.9fr_1.35fr_0.8fr]">
          <div className="space-y-4">
            <div className="font-ibm text-[18px] leading-[1.55] text-[var(--color-text-muted)]">
              По вопросам сотрудничества
            </div>
            <a
              href="mailto:terminal_useradmin@mail.ru"
              className="font-ibm text-[18px] leading-[1.55] text-[var(--color-text-muted)] transition hover:text-[var(--color-accent)]"
            >
              terminal_useradmin@mail.ru
            </a>
            <div className="pt-6 font-ibm text-[16px] leading-[1.5] text-[var(--color-text-muted)]">
              © Терминал_Кода 2026
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {navigationLinks.map(renderFooterLink)}
          </div>

          <div className="flex flex-col gap-2.5">
            {policyLinks.map(renderFooterLink)}
          </div>

          <div className="flex flex-col items-center gap-3 text-center">
            <div className="font-ibm text-[18px] leading-[1.55] text-[var(--color-text-muted)]">
              Сменить тему
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="text-[var(--color-text-muted)] transition hover:text-[var(--color-accent)]"
              aria-label={`Переключить тему на ${nextThemeLabel}`}
              title={`Переключить тему на ${nextThemeLabel}`}
            >
              <span
                className="block h-[26px] w-[26px]"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: themeToggleIconMarkup }}
              />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
