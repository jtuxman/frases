type Props = {
  line: string
  mood?: 'idle' | 'happy' | 'hint' | 'oops'
}

export function Mascot({ line, mood = 'idle' }: Props) {
  const pose = mood === 'happy' ? 'wiggle' : 'floaty'
  const bubble =
    mood === 'oops'
      ? 'border-coral bg-[#fff1ee] text-2xl'
      : mood === 'happy'
        ? 'border-grass-deep bg-[#f3fff4] text-2xl'
        : 'border-ink bg-white text-lg'
  return (
    <div className="flex max-w-sm items-start gap-3">
      <img
        src="/images/lolo.jpg"
        alt="Lolo el loro"
        className={`${pose} h-28 w-28 shrink-0 rounded-full border-4 border-ink bg-white object-cover shadow-lg`}
      />
      <p
        role="status"
        aria-live="polite"
        className={`relative rounded-3xl border-4 px-4 py-3 text-left font-semibold leading-snug text-ink ${bubble}`}
      >
        {line}
      </p>
    </div>
  )
}
