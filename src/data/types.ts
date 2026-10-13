export const PLACE_IDS = ['casa', 'escuela', 'calle', 'super', 'parque'] as const

export type PlaceId = (typeof PLACE_IDS)[number]

export type Exercise = {
  id: string
  place: PlaceId
  image: string
  correct: [string, string, string]
  distractors: string[]
  complementHint: string
}

export type Place = {
  id: PlaceId
  name: string
  icon: string
  color: string
}

export type Card = {
  id: string
  text: string
}

export type Feedback = 'idle' | 'wrong' | 'right'
