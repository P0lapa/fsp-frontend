import { TerminalHero } from '../home/TerminalHero'

const competitionsRightOverlayClasses =
  'absolute inset-0 bg-gradient-to-r from-[var(--color-bg)] via-[color:color-mix(in_srgb,var(--color-bg)_90%,transparent)] to-[color:color-mix(in_srgb,var(--color-bg)_55%,transparent)]'

const competitionsBottomOverlayClasses =
  'absolute inset-0 bg-gradient-to-b from-[color:color-mix(in_srgb,var(--color-bg)_15%,transparent)] via-transparent to-[var(--color-bg)]'

export function CompetitionsHero() {
  return (
    <TerminalHero
      folderPath={String.raw`C:\SYSTEM_COMPETITIONS\ROOT-EXECUTE PROTOCOL_V2.EXE`}
      primaryTitle=">РАСПИСАНИЕ"
      secondaryTitle="СОРЕВНОВАНИЙ_"
      description="Прокачивай навыки на задачах из прошлых сезонов, практикуйся, исправляй ошибки и становись лучшим в своем деле."
      descriptionClassName="leading-[1.65]"
      overlayRightClassName={competitionsRightOverlayClasses}
      overlayBottomClassName={competitionsBottomOverlayClasses}
      renderCta={(className) => (
        <a href="#competitions-list" className={className}>
          [К соревнованиям]
        </a>
      )}
    />
  )
}
