import type { AudioApi } from '../audio/useAudio'
import { MuteButton } from '../components/MuteButton'
import { Sky } from '../components/Sky'

type Props = {
  audio: AudioApi
  onPlay: () => void
}

export function TitleScreen({ audio, onPlay }: Props) {
  return (
    <div className="sky-bg relative flex h-full flex-col items-center justify-center overflow-hidden px-6">
      <Sky />
      <div className="absolute right-5 top-5">
        <MuteButton audio={audio} />
      </div>
      <img
        src="/images/lolo.jpg"
        alt=""
        className="wiggle mb-4 h-40 w-40 rounded-full border-4 border-ink object-cover shadow-xl"
      />
      <p className="text-xl font-semibold text-ink/80">Juego de palabras</p>
      <h1 className="mt-1 text-center text-5xl font-bold leading-tight text-ink drop-shadow md:text-7xl">
        Frases en acción
      </h1>
      <p className="mt-3 max-w-lg text-center text-2xl font-semibold text-ink/90">
        Mira la foto y arma la frase
      </p>
      <button
        type="button"
        onClick={onPlay}
        className="mt-8 min-h-16 rounded-full border-4 border-ink bg-sun px-12 text-3xl font-bold text-ink shadow-[0_6px_0_#2a1848] hover:translate-y-0.5"
      >
        Jugar
      </button>
    </div>
  )
}
