import type { AudioApi } from '../audio/useAudio'
import { MuteButton } from '../components/MuteButton'
import { Sky } from '../components/Sky'
import { EXERCISES } from '../data/exercises'
import { loadProgress, resetAll } from '../game/progress'

type Props = {
  audio: AudioApi
  onReplay: () => void
  onMap: () => void
}

export function ResultScreen({ audio, onReplay, onMap }: Props) {
  const progress = loadProgress()
  const done = progress.completedIds.length

  return (
    <div className="sky-bg relative flex h-full flex-col items-center justify-center overflow-hidden px-6">
      <Sky />
      <div className="absolute right-5 top-5">
        <MuteButton audio={audio} />
      </div>
      <img
        src="/images/lolo.jpg"
        alt=""
        className="wiggle mb-3 h-32 w-32 rounded-full border-4 border-ink object-cover"
      />
      <h1 className="text-center text-5xl font-bold text-ink">¡Lo lograste!</h1>
      <p className="mt-2 text-2xl font-semibold">Armaste {done} de {EXERCISES.length} frases</p>
      <ul className="mt-6 space-y-2 text-center text-2xl font-semibold">
        <li>Aciertos: {progress.stats.correct}</li>
        <li>Intentos con tacha: {progress.stats.mistakes}</li>
        <li>Pistas: {progress.stats.hints}</li>
      </ul>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={onMap}
          className="min-h-14 rounded-full border-4 border-ink bg-white px-8 text-2xl font-bold shadow-[0_5px_0_#2a1848]"
        >
          Mapa
        </button>
        <button
          type="button"
          onClick={() => {
            resetAll()
            onReplay()
          }}
          className="min-h-14 rounded-full border-4 border-ink bg-sun px-8 text-2xl font-bold shadow-[0_5px_0_#2a1848]"
        >
          Empezar de nuevo
        </button>
      </div>
    </div>
  )
}
