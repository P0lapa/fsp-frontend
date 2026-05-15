type SectionFolderLabelProps = {
  path: string
}

export function SectionFolderLabel({ path }: SectionFolderLabelProps) {
  return (
    <div className="mb-8 font-jetbrains text-xs uppercase tracking-[0.18em] text-[#7F9F01] sm:text-sm">
      {path}
    </div>
  )
}