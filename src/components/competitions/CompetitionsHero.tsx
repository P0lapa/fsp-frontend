import heroBg from '../../assets/hero-terminal-bg.png'
import { SectionFolderLabel } from '../home/SectionFolderLabel'

export function CompetitionsHero() {
  return (
    <section className="relative overflow-hidden border-b border-[#04CA37]/30 bg-[#0a0a0a]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#050505]" />
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center blur-[3px]"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-[#0a0a0a]/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/15 via-transparent to-[#0a0a0a]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:px-8 lg:px-12 lg:py-20">
        <div className="max-w-3xl">
          <SectionFolderLabel path={String.raw`C:\SYSTEM_COMPETITIONS\ROOT-EXECUTE PROTOCOL_V2.EXE`} />

          <div className="space-y-3 sm:space-y-4 md:space-y-5">
            <div className="font-press-start text-[22px] leading-[1.45] text-[#04CA37] min-[380px]:text-[24px] sm:text-[32px] md:text-[36px]">
              &gt;РАСПИСАНИЕ
            </div>

            <div className="pl-[27px] font-press-start text-[22px] leading-[1.55] text-[#D9EAF0] min-[380px]:pl-[30px] min-[380px]:text-[24px] sm:pl-[39px] sm:text-[32px] md:pl-[44px] md:text-[36px]">
              СОРЕВНОВАНИЙ_
            </div>
          </div>

          <p className="mt-6 max-w-2xl font-ibm text-base leading-[1.65] text-[#04CA37] sm:mt-8 sm:text-lg md:text-xl">
            Прокачивай навыки на задачах из прошлых сезонов, практикуйся, исправляй
            ошибки и становись лучшим в своем деле.
          </p>

          <div className="mt-7 sm:mt-8">
            <a
              href="#competitions-list"
              className="inline-flex max-w-full items-center border border-[#7F9F01] bg-[#C0F000] px-3 py-2.5 font-jetbrains text-sm font-bold text-[#111111] transition hover:translate-y-[-1px] hover:shadow-[0_0_24px_rgba(127,159,1,0.35)] sm:px-4 sm:py-3 sm:text-lg"
            >
              [К соревнованиям]
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
