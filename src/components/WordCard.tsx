import { motion } from 'motion/react'
import type { Card } from '../data/types'

type Props = {
  card: Card
  onClick: () => void
  glow?: boolean
  shake?: boolean
  disabled?: boolean
  wide?: boolean
}

export function WordCard({ card, onClick, glow, shake, disabled, wide }: Props) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`wood-card min-h-16 rounded-2xl px-4 py-3 text-2xl font-bold text-ink ${wide ? 'w-full' : 'min-w-36'} ${glow ? 'glow' : ''} ${shake ? 'hint-shake' : ''}`}
      whileTap={disabled ? undefined : { scale: 0.96 }}
    >
      {card.text}
    </motion.button>
  )
}
