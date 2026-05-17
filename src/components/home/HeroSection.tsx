import { Link } from 'react-router-dom'
import { TerminalHero } from './TerminalHero'

const heroRightOverlayClasses =
  'absolute inset-0 bg-gradient-to-r from-[var(--color-bg)] via-[color:color-mix(in_srgb,var(--color-bg)_90%,transparent)] to-[color:color-mix(in_srgb,var(--color-bg)_50%,transparent)]'

const heroBottomOverlayClasses =
  'absolute inset-0 bg-gradient-to-b from-[color:color-mix(in_srgb,var(--color-bg)_20%,transparent)] via-transparent to-[var(--color-bg)]'

export function HeroSection() {
  return (
    <TerminalHero
      sectionClassName="max-w-full"
      folderPath={String.raw`C:\ZERO_BLOCK\SYSTEM\ROOT-EXECUTE PROTOCOL_V1.EXE`}
      primaryTitle=">БИТВА"
      secondaryTitle="АЛГОРИТМОВ_"
      description="Соревнуйся с тысячами разработчиков. Решай логические задачи на скорость и стань лидером сезона"
      descriptionClassName="leading-[1.6]"
      overlayRightClassName={heroRightOverlayClasses}
      overlayBottomClassName={heroBottomOverlayClasses}
      renderCta={(className) => (
        <Link to="/competitions" className={className}>
          [Принять участие]
        </Link>
      )}
    />
  )
}
