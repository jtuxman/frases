import { EXERCISES, exercisesByPlace } from '../data/exercises'
import type { PlaceId } from '../data/types'

const KEY = 'frases-en-accion-v1'

export type Stats = {
  correct: number
  mistakes: number
  hints: number
}

export type Progress = {
  completedIds: string[]
  stats: Stats
}

const empty: Progress = {
  completedIds: [],
  stats: { correct: 0, mistakes: 0, hints: 0 },
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...empty, stats: { ...empty.stats }, completedIds: [] }
    const parsed = JSON.parse(raw) as Partial<Progress>
    return {
      completedIds: Array.isArray(parsed.completedIds) ? parsed.completedIds : [],
      stats: {
        correct: parsed.stats?.correct ?? 0,
        mistakes: parsed.stats?.mistakes ?? 0,
        hints: parsed.stats?.hints ?? 0,
      },
    }
  } catch {
    return { ...empty, stats: { ...empty.stats }, completedIds: [] }
  }
}

function save(progress: Progress) {
  localStorage.setItem(KEY, JSON.stringify(progress))
}

export function markCompleted(id: string) {
  const progress = loadProgress()
  if (!progress.completedIds.includes(id)) {
    progress.completedIds.push(id)
  }
  progress.stats.correct += 1
  save(progress)
}

export function bumpMistakes() {
  const progress = loadProgress()
  progress.stats.mistakes += 1
  save(progress)
}

export function bumpHints() {
  const progress = loadProgress()
  progress.stats.hints += 1
  save(progress)
}

export function resetPlace(placeId: PlaceId) {
  const progress = loadProgress()
  const ids = new Set(exercisesByPlace(placeId).map((exercise) => exercise.id))
  progress.completedIds = progress.completedIds.filter((id) => !ids.has(id))
  save(progress)
}

export function resetAll() {
  save({ completedIds: [], stats: { correct: 0, mistakes: 0, hints: 0 } })
}

export function completedInPlace(placeId: PlaceId): number {
  const done = new Set(loadProgress().completedIds)
  return exercisesByPlace(placeId).filter((exercise) => done.has(exercise.id)).length
}

export function totalInPlace(placeId: PlaceId): number {
  return exercisesByPlace(placeId).length
}

export function allComplete(): boolean {
  const done = new Set(loadProgress().completedIds)
  return EXERCISES.every((exercise) => done.has(exercise.id))
}
