import confetti from 'canvas-confetti'
import { useEffect, useMemo } from 'react'
import type { AudioApi } from '../audio/useAudio'
import { Mascot } from '../components/Mascot'
import { MuteButton } from '../components/MuteButton'
import { SentenceSlots } from '../components/SentenceSlots'
import { Sky } from '../components/Sky'
import { WordCard } from '../components/WordCard'
import { PLACES } from '../data/places'
import type { PlaceId } from '../data/types'
import { completedInPlace, totalInPlace } from '../game/progress'
import { useGame } from '../game/useGame'

type Props = {
  placeId: PlaceId
  audio: AudioApi
  onBack: () => void
  onPlaceDone: () => void
}

export function PlayScreen({ placeId, audio, onBack, onPlaceDone }: Props) {
  const game = useGame(placeId)
  const place = PLACES.find((item) => item.id === placeId)
  const done = completedInPlace(placeId)
  const total = totalInPlace(placeId)

  const mascotLine = useMemo(() => {
    if (!game.exercise) return '¡Ya terminaste este lugar!'
    if (game.feedback === 'right') return `¡Muy bien! ${game.exercise.correct.join(' ')}.`
    if (game.feedback === 'wrong') return 'Casi. Mira la tacha. Las que sí van se quedan.'
    if (game.hintLevel >= 1) return game.hintQuestion
    if (game.slots.some(Boolean)) return 'Esas sí van. Completa las que faltan.'
    return 'Mira la foto y elige las palabras.'
  }, [game.exercise, game.feedback, game.hintLevel, game.hintQuestion, game.slots])

  const mascotMood =
    game.feedback === 'right' ? 'happy' : game.feedback === 'wrong' ? 'oops' : game.hintLevel ? 'hint' : 'idle'

  useEffect(() => {
    if (game.feedback !== 'right' || !game.exercise) return
    audio.playSuccess()
    audio.speak(game.exercise.correct.join(' '))
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduce) {
      void confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.45 },
        colors: ['#ff6b57', '#ffd56a', '#63c070', '#7b9cff'],
      })
    }
    return () => {
      confetti.reset()
    }
  }, [audio, game.exercise, game.feedback])

  if (!game.exercise) {
    return (
      <div className="sky-bg relative flex h-full flex-col items-center justify-center gap-6 px-6">
        <Sky />
        <Mascot line="¡Completaste este lugar!" mood="happy" />
        <button
          type="button"
          onClick={onPlaceDone}
          className="min-h-14 rounded-full border-4 border-ink bg-sun px-8 text-2xl font-bold"
        >
          Volver al mapa
        </button>
      </div>
    )
  }

  function onCheck() {
    const ok = game.check()
    if (!ok) {
      audio.playError()
      audio.speak('Casi. Las que sí van se quedan.')
    }
  }

  return (
    <div className="sky-bg relative flex h-full flex-col overflow-auto px-4 py-3">
      <Sky />
      <header className="relative z-10 mb-3 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border-4 border-ink bg-white px-4 py-2 text-xl font-bold shadow-[0_3px_0_#2a1848]"
        >
          ← Mapa
        </button>
        <p className="flex items-center gap-3 text-2xl font-bold text-ink">
          <span>
            {place?.name} · {done} / {total}
          </span>
          <span className="hidden h-4 w-28 overflow-hidden rounded-full border-4 border-ink bg-white sm:block">
            <span
              className="block h-full bg-sun"
              style={{ width: `${total ? (done / total) * 100 : 0}%` }}
            />
          </span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              game.hint()
              audio.speak(game.hintQuestion)
            }}
            className="min-h-14 rounded-full border-4 border-ink bg-sun px-4 text-xl font-bold shadow-[0_3px_0_#2a1848]"
          >
            💡 Pista
          </button>
          <MuteButton audio={audio} />
        </div>
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="overflow-hidden rounded-[2rem] border-4 border-ink bg-white shadow-[0_8px_0_#2a1848]">
          <img
            src={game.exercise.image}
            alt="Escena de la frase"
            className="h-[42vh] min-h-56 w-full object-cover object-center lg:h-[48vh]"
          />
        </div>
        <div className="flex flex-col justify-between gap-4">
          <Mascot line={mascotLine} mood={mascotMood} />
        </div>
      </div>

      <div className="relative z-10 mt-5">
        <SentenceSlots
          slots={game.slots}
          onReturn={(index) => {
            game.returnSlot(index)
            audio.playClick()
          }}
          glowingSlot={game.glowingSlot}
          hintWave={game.hintWave}
          shake={game.feedback === 'wrong'}
          locked={game.locked}
        />
      </div>

      <div className="relative z-10 mt-5 flex flex-wrap justify-center gap-3">
        {game.bank.map((card) => (
          <WordCard
            key={game.glowingText === card.text ? `${card.id}-hint-${game.hintWave}` : card.id}
            card={card}
            glow={game.glowingText === card.text}
            shake={game.glowingText === card.text && game.hintWave > 0}
            disabled={game.locked}
            onClick={() => {
              game.pickFromBank(card)
              audio.playClick()
              audio.speak(card.text)
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mt-6 flex justify-center pb-6">
        {game.feedback === 'right' ? (
          <button
            type="button"
            onClick={() => {
              const result = game.next()
              if (result === 'place-done') onPlaceDone()
            }}
            className="min-h-16 rounded-full border-4 border-ink bg-grass-deep px-10 text-3xl font-bold text-white shadow-[0_6px_0_#2a1848]"
          >
            Siguiente
          </button>
        ) : (
          <button
            type="button"
            disabled={!game.filled || game.locked}
            onClick={onCheck}
            className="min-h-16 rounded-full border-4 border-ink bg-sun px-10 text-3xl font-bold text-ink shadow-[0_6px_0_#2a1848] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ¡Listo!
          </button>
        )}
      </div>
    </div>
  )
}
