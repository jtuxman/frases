import type { AudioApi } from '../audio/useAudio'

export function MuteButton({ audio }: { audio: AudioApi }) {
  return (
    <button
      type="button"
      onClick={audio.toggleMute}
      className="grid h-14 w-14 place-items-center rounded-full border-4 border-ink bg-white text-2xl shadow-[0_4px_0_#2a1848]"
      aria-label={audio.muted ? 'Activar sonido' : 'Silenciar sonido'}
    >
      {audio.muted ? '🔇' : '🔊'}
    </button>
  )
}
