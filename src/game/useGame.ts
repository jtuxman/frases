import { useEffect, useMemo, useState } from 'react'
import { exercisesByPlace } from '../data/exercises'
import type { Card, Feedback, PlaceId } from '../data/types'
import {
  bumpHints,
  bumpMistakes,
  loadProgress,
  markCompleted,
} from './progress'
import { shuffle } from './shuffle'

function cardsFor(id: string, correct: [string, string, string], distractors: string[]): Card[] {
  const correctCards = correct.map((text, index) => ({
    id: `${id}-c${index}`,
    text,
  }))
  const extra = distractors.map((text, index) => ({
    id: `${id}-d${index}`,
    text,
  }))
  return shuffle([...correctCards, ...extra])
}

export function useGame(placeId: PlaceId) {
  const pending = useMemo(() => {
    const done = new Set(loadProgress().completedIds)
    return shuffle(exercisesByPlace(placeId).filter((exercise) => !done.has(exercise.id)))
  }, [placeId])

  const [index, setIndex] = useState(0)
  const exercise = pending[index] ?? null
  const [bank, setBank] = useState<Card[]>([])
  const [slots, setSlots] = useState<(Card | null)[]>([null, null, null])
  const [hintLevel, setHintLevel] = useState(0)
  const [hintWave, setHintWave] = useState(0)
  const [feedback, setFeedback] = useState<Feedback>('idle')

  useEffect(() => {
    setIndex(0)
  }, [placeId])

  useEffect(() => {
    if (!exercise) {
      setBank([])
      setSlots([null, null, null])
      return
    }
    setBank(cardsFor(exercise.id, exercise.correct, exercise.distractors))
    setSlots([null, null, null])
    setHintLevel(0)
    setHintWave(0)
    setFeedback('idle')
  }, [exercise])

  const filled = slots.every(Boolean)
  const nextNeeded = slots.findIndex((slot) => slot === null)
  const glowingText =
    hintLevel >= 1 && exercise && nextNeeded !== -1 ? exercise.correct[nextNeeded] : null
  const glowingSlot = hintLevel >= 3 && nextNeeded !== -1 ? nextNeeded : -1

  const locked = feedback === 'right' || feedback === 'wrong'

  useEffect(() => {
    if (feedback !== 'wrong' || !exercise) return
    const placed = slots
    const correct = exercise.correct
    const timer = window.setTimeout(() => {
      const returned: Card[] = []
      const kept = placed.map((card, i) => {
        if (card && card.text === correct[i]) return card
        if (card) returned.push(card)
        return null
      })
      setSlots(kept)
      if (returned.length > 0) {
        setBank((current) => [...current, ...returned])
      }
      setFeedback('idle')
    }, 3000)
    return () => window.clearTimeout(timer)
  }, [exercise, feedback])

  function pickFromBank(card: Card) {
    if (locked) return
    const empty = slots.findIndex((slot) => slot === null)
    if (empty === -1) return
    setSlots((current) => {
      const next = [...current]
      next[empty] = card
      return next
    })
    setBank((current) => current.filter((item) => item.id !== card.id))
    setFeedback('idle')
  }

  function returnSlot(slotIndex: number) {
    if (locked) return
    const card = slots[slotIndex]
    if (!card) return
    setSlots((current) => {
      const next = [...current]
      next[slotIndex] = null
      return next
    })
    setBank((current) => [...current, card])
    setFeedback('idle')
  }

  function check(): boolean {
    if (locked || !exercise || slots.some((slot) => !slot)) return false
    const ok = slots.every((slot, i) => slot?.text === exercise.correct[i])
    if (ok) {
      setFeedback('right')
      markCompleted(exercise.id)
    } else {
      setFeedback('wrong')
      bumpMistakes()
    }
    return ok
  }

  function next(): 'continue' | 'place-done' {
    if (index + 1 >= pending.length) return 'place-done'
    setIndex((current) => current + 1)
    return 'continue'
  }

  function hint() {
    if (locked) return
    if (hintLevel < 3) {
      setHintLevel((current) => Math.min(3, current + 1))
      bumpHints()
    }
    setHintWave((current) => current + 1)
  }

  const hintQuestion =
    !exercise || nextNeeded === -1
      ? '¡Ya está la frase! Pulsa Listo.'
      : nextNeeded === 0
        ? '¿Quién está en la foto?'
        : nextNeeded === 1
          ? '¿Qué hace?'
          : exercise.complementHint

  return {
    exercise,
    bank,
    slots,
    hintLevel,
    hintWave,
    hintQuestion,
    feedback,
    filled,
    locked,
    glowingText,
    glowingSlot,
    pickFromBank,
    returnSlot,
    check,
    next,
    hint,
  }
}
