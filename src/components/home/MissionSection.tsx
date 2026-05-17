import missionBg from '../../assets/hero-terminal-bg2.png'
import { SectionFolderLabel } from './SectionFolderLabel'

const sectionClasses =
  'relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-surface)]'
const backgroundLayerClasses = 'absolute inset-0 overflow-hidden'
const backgroundBaseClasses = 'absolute inset-0 bg-[var(--color-bg)]'
const backgroundImageClasses =
  'absolute inset-0 scale-105 bg-cover bg-center blur-[3px]'
const overlayRightClasses =
  'absolute inset-0 bg-gradient-to-r from-[var(--color-bg)] via-[color:color-mix(in_srgb,var(--color-bg)_88%,transparent)] to-[color:color-mix(in_srgb,var(--color-bg)_42%,transparent)]'
const overlayBottomClasses =
  'absolute inset-0 bg-gradient-to-b from-[color:color-mix(in_srgb,var(--color-bg)_18%,transparent)] via-transparent to-[var(--color-bg)]'

export function MissionSection() {
  return (
    <section className={sectionClasses}>
      <div className={backgroundLayerClasses}>
        <div className={backgroundBaseClasses} />
        <div
          className={backgroundImageClasses}
          style={{ backgroundImage: `url(${missionBg})` }}
        />
        <div className={overlayRightClasses} />
        <div className={overlayBottomClasses} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:px-8 lg:px-12 lg:py-20">
        <div className="max-w-4xl">
          <SectionFolderLabel path={String.raw`C:\SYSTEM_DESCRIPTION\ROOT-EXECUTE PROTOCOL_V3.EXE`} />

          <div className="mb-8 font-press-start text-[18px] leading-[1.45] text-[var(--color-accent)] sm:text-[24px] md:text-[30px]">
            //КТО МЫ И НАША МИССИЯ
          </div>

          <div className="max-w-3xl space-y-7 font-ibm text-[18px] leading-[1.55] tracking-[0.02em] text-[var(--color-text)] sm:text-[22px]">
            <p>
              Терминал Кода — независимая площадка для алгоритмических битв. Мы
              считаем, что лучший способ научиться программировать — это
              практика в условиях реального соревнования.
            </p>

            <p>
              Наша цель объединить талантливых разработчиков на одной арене.
              Здесь не важен ваш возраст, стаж или диплом — только логика,
              скорость и чистота ваших решений.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
