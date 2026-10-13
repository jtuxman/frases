import { PLACES } from '../data/places'
import type { PlaceId } from '../data/types'
import type { AudioApi } from '../audio/useAudio'
import { MuteButton } from '../components/MuteButton'
import { Sky } from '../components/Sky'
import { allComplete, completedInPlace, resetPlace, totalInPlace } from '../game/progress'

type Props = {
  audio: AudioApi
  onPlayPlace: (place: PlaceId) => void
  onReplayPlace: (place: PlaceId) => void
  onSeeResults: () => void
  onBack: () => void
}

export function MapScreen({ audio, onPlayPlace, onReplayPlace, onSeeResults, onBack }: Props) {
  const finished = allComplete()

  return (
    <div className="sky-bg relative flex h-full flex-col overflow-auto px-5 py-4">
      <Sky />
      <header className="relative z-10 mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border-4 border-ink bg-white px-4 py-2 text-xl font-bold shadow-[0_3px_0_#2a1848]"
        >
          ← Inicio
        </button>
        <h1 className="text-3xl font-bold text-ink drop-shadow md:text-4xl">Elige un lugar</h1>
        <MuteButton audio={audio} />
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-5xl grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {PLACES.map((place) => {
          const done = completedInPlace(place.id)
          const total = totalInPlace(place.id)
          const complete = done === total && total > 0
          return (
            <article
              key={place.id}
              className="flex flex-col items-center rounded-[2rem] border-4 border-ink bg-white/90 p-3 shadow-[0_6px_0_#2a1848]"
            >
              <img
                src={place.icon}
                alt=""
                className="mb-2 h-28 w-28 rounded-3xl border-4 border-ink object-cover"
              />
              <h2 className="text-2xl font-bold">{place.name}</h2>
              <p className="mb-3 text-lg font-semibold">
                {complete ? '¡Listo!' : `${done} / ${total}`}
              </p>
              {complete ? (
                <button
                  type="button"
                  onClick={() => {
                    resetPlace(place.id)
                    onReplayPlace(place.id)
                  }}
                  className="min-h-12 rounded-full border-4 border-ink bg-sun px-4 text-lg font-bold"
                >
                  Otra vez
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onPlayPlace(place.id)}
                  className="min-h-12 rounded-full border-4 border-ink bg-grass-deep px-4 text-lg font-bold text-white"
                >
                  Jugar
                </button>
              )}
            </article>
          )
        })}
      </div>

      {finished && (
        <div className="relative z-10 mt-6 flex justify-center">
          <button
            type="button"
            onClick={onSeeResults}
            className="min-h-14 rounded-full border-4 border-ink bg-sun px-8 text-2xl font-bold shadow-[0_5px_0_#2a1848]"
          >
            Ver estrellas
          </button>
        </div>
      )}
    </div>
  )
}
