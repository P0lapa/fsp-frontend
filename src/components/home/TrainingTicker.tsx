import { Link } from 'react-router-dom'

type ProgrammingLanguage = {
  label: string
  value: string
}

const programmingLanguages: ProgrammingLanguage[] = [
  { label: 'C++', value: 'cpp' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'C#', value: 'csharp' },
  { label: 'PHP', value: 'php' },
  { label: 'Java', value: 'java' },
  { label: 'Kotlin', value: 'kotlin' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
]

export function TrainingTicker() {
  return (
    <section className="border-y border-[#04CA37]/70 bg-[#050505]">
      <div className="mx-auto flex max-w-7xl items-center gap-8 overflow-hidden px-4 py-4 sm:px-6 md:px-8">
        <Link
          to="/training"
          className="shrink-0 rounded-[2px] bg-[#16D4D8] px-3 py-2 font-jetbrains text-sm font-bold uppercase tracking-[0.08em] text-[#050505] transition hover:bg-[#37F3F6] sm:px-4 sm:text-base"
        >
          ТРЕНИРОВАТЬСЯ:
        </Link>

        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="flex w-max animate-training-ticker items-center gap-7 whitespace-nowrap">
            {[...programmingLanguages, ...programmingLanguages].map(
              (language, index) => (
                <Link
                  key={`${language.value}-${index}`}
                  to={`/training?language=${language.value}`}
                  className="font-press-start text-base tracking-[0.12em] text-[#079918] transition hover:text-[#04CA37] sm:text-xl md:text-2xl"
                >
                  //{language.label}
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  )
}