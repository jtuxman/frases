import { motion } from 'motion/react'
import type { Card } from '../data/types'
import { WordCard } from './WordCard'

const LABELS = ['quién', 'hace', 'qué']

type Props = {
  slots: (Card | null)[]
  onReturn: (index: number) => void
  glowingSlot: number
  hintWave?: number
  shake?: boolean
  locked?: boolean
}

export function SentenceSlots({ slots, onReturn, glowingSlot, hintWave = 0, shake, locked }: Props) {
  return (
    <div className={`relative isolate mx-auto flex max-w-3xl flex-wrap justify-center gap-4 px-4 py-6 ${shake ? 'wrong-frame shake' : ''}`}>
      {slots.map((card, index) => (
        <div key={LABELS[index]} className="relative z-0 flex w-48 flex-col items-center gap-2">
          <span className="text-base font-semibold uppercase tracking-wide text-ink/70">
            {LABELS[index]}
          </span>
          {card ? (
            <WordCard card={card} onClick={() => onReturn(index)} disabled={locked} wide />
          ) : (
            <motion.div
              key={glowingSlot === index ? `slot-hint-${index}-${hintWave}` : `slot-${index}`}
              className={`slot-empty flex min-h-16 w-full items-center justify-center rounded-2xl text-3xl text-wood-edge/50 ${
                glowingSlot === index ? 'glow hint-shake' : ''
              }`}
            >
              {index + 1}
            </motion.div>
          )}
        </div>
      ))}
      {shake && (
        <div
          className="pointer-events-none absolute inset-0 z-50 grid place-items-center"
          aria-hidden
        >
          <div className="stamp-in flex h-40 w-40 items-center justify-center rounded-full bg-coral shadow-[0_10px_24px_rgba(42,24,72,0.4)]">
            <span className="text-8xl font-black leading-none text-white">✖</span>
          </div>
        </div>
      )}
    </div>
  )
}
