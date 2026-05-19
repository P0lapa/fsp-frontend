import type { ReactNode } from 'react'
import heroBg from '../../assets/hero-terminal-bg.png'
import { SectionFolderLabel } from './SectionFolderLabel'

const sectionClasses =
  'relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-surface)]'
const backgroundLayerClasses = 'absolute inset-0 overflow-hidden'
const backgroundBaseClasses = 'absolute inset-0 bg-[var(--color-bg)]'
const backgroundImageClasses =
  'absolute inset-0 scale-105 bg-cover bg-center blur-[3px]'
const contentWrapperClasses =
  'relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:px-8 lg:px-12 lg:py-20'
const contentColumnClasses = 'max-w-3xl'
const titleStackClasses = 'space-y-1 sm:space-y-4 md:space-y-5'
const titleLeadClasses =
  'font-press-start text-[22px] leading-[1.45] text-[var(--color-accent)] min-[380px]:text-[24px] sm:text-[32px] md:text-[36px]'
const titleTrailingClasses =
  'pl-[27px] font-press-start text-[22px] leading-[1.55] text-[var(--color-text)] min-[380px]:pl-[30px] min-[380px]:text-[24px] sm:pl-[39px] sm:text-[32px] md:pl-[44px] md:text-[36px]'
const descriptionBaseClasses =
  'mt-6 max-w-2xl font-ibm text-base text-[var(--color-text)] sm:mt-8 sm:text-lg md:text-xl'
const ctaWrapperClasses = 'mt-7 sm:mt-8'
const ctaClasses =
  'inline-flex max-w-full items-center border border-[var(--color-button-active-border)] bg-[var(--color-button-active-bg)] px-3 py-2.5 font-jetbrains text-sm font-bold text-[var(--color-button-active-text)] transition hover:translate-y-[-1px] hover:bg-[var(--color-button-active-hover-bg)] hover:text-[var(--color-button-active-hover-text)] hover:shadow-[var(--shadow-acid)] sm:px-4 sm:py-3 sm:text-lg'

type TerminalHeroProps = {
  sectionClassName?: string
  folderPath: string
  primaryTitle: ReactNode
  secondaryTitle: ReactNode
  description: ReactNode
  descriptionClassName: string
  overlayRightClassName: string
  overlayBottomClassName: string
  renderCta: (className: string) => ReactNode
}

export function TerminalHero({
  sectionClassName,
  folderPath,
  primaryTitle,
  secondaryTitle,
  description,
  descriptionClassName,
  overlayRightClassName,
  overlayBottomClassName,
  renderCta,
}: TerminalHeroProps) {
  return (
    <section className={[sectionClasses, sectionClassName].filter(Boolean).join(' ')}>
      <div className={backgroundLayerClasses}>
        <div className={backgroundBaseClasses} />
        <div
          className={backgroundImageClasses}
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className={overlayRightClassName} />
        <div className={overlayBottomClassName} />
      </div>

      <div className={contentWrapperClasses}>
        <div className={contentColumnClasses}>
          <SectionFolderLabel path={folderPath} />

          <div className={titleStackClasses}>
            <div className={titleLeadClasses}>{primaryTitle}</div>
            <div className={titleTrailingClasses}>{secondaryTitle}</div>
          </div>

          <p className={[descriptionBaseClasses, descriptionClassName].join(' ')}>
            {description}
          </p>

          <div className={ctaWrapperClasses}>
            {renderCta(ctaClasses)}
          </div>
        </div>
      </div>
    </section>
  )
}
