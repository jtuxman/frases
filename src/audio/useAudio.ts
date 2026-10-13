import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const MUTE_KEY = 'frases-en-accion-mute'

function loadMute() {
  return localStorage.getItem(MUTE_KEY) === '1'
}

function tone(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  type: OscillatorType,
  gainValue: number,
) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = type
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.02)
}

export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null)
  const musicTimer = useRef<number | null>(null)
  const started = useRef(false)
  const [muted, setMuted] = useState(loadMute)

  const getCtx = useCallback(async () => {
    const existing = ctxRef.current
    if (existing) {
      if (existing.state === 'suspended') await existing.resume()
      return existing
    }
    const ctx = new AudioContext()
    ctxRef.current = ctx
    if (ctx.state === 'suspended') await ctx.resume()
    return ctx
  }, [])

  const stopMusic = useCallback(() => {
    if (musicTimer.current !== null) {
      window.clearInterval(musicTimer.current)
      musicTimer.current = null
    }
  }, [])

  const playMusic = useCallback(async () => {
    if (muted) return
    const ctx = await getCtx()
    stopMusic()
    const melody = [392, 440, 494, 523, 494, 440, 392, 330]
    let step = 0
    const tick = () => {
      if (muted || !ctxRef.current) return
      const now = ctx.currentTime
      const note = melody[step % melody.length] ?? 392
      tone(ctx, note, now, 0.28, 'triangle', 0.045)
      tone(ctx, note / 2, now, 0.28, 'sine', 0.02)
      step += 1
    }
    tick()
    musicTimer.current = window.setInterval(tick, 380)
  }, [getCtx, muted, stopMusic])

  const unlock = useCallback(async () => {
    started.current = true
    await getCtx()
    if (!muted) await playMusic()
  }, [getCtx, muted, playMusic])

  const playClick = useCallback(async () => {
    if (muted) return
    const ctx = await getCtx()
    tone(ctx, 620, ctx.currentTime, 0.08, 'square', 0.06)
  }, [getCtx, muted])

  const playSuccess = useCallback(async () => {
    if (muted) return
    const ctx = await getCtx()
    const now = ctx.currentTime
    tone(ctx, 523, now, 0.15, 'triangle', 0.08)
    tone(ctx, 659, now + 0.12, 0.15, 'triangle', 0.08)
    tone(ctx, 784, now + 0.24, 0.28, 'triangle', 0.1)
  }, [getCtx, muted])

  const playCelebration = useCallback(async () => {
    if (muted) return
    const ctx = await getCtx()
    stopMusic()
    const now = ctx.currentTime

    // Arpegio ascendente alegre (do-mi-sol-do-mi-sol agudos)
    const arpeggio = [523, 659, 784, 1047, 1319, 1568]
    arpeggio.forEach((freq, i) => {
      const start = now + i * 0.1
      tone(ctx, freq, start, 0.18, 'triangle', 0.09)
      tone(ctx, freq / 2, start, 0.18, 'sine', 0.03)
    })

    // Acorde final sostenido (do mayor)
    const chordAt = now + arpeggio.length * 0.1 + 0.05
    tone(ctx, 523, chordAt, 0.7, 'triangle', 0.08)
    tone(ctx, 659, chordAt, 0.7, 'triangle', 0.07)
    tone(ctx, 784, chordAt, 0.7, 'triangle', 0.07)
    tone(ctx, 1047, chordAt, 0.7, 'sine', 0.06)

    // Brillos agudos encadenados
    const sparkles = [1760, 2093, 1760, 2349, 2093, 2637]
    sparkles.forEach((freq, i) => {
      tone(ctx, freq, chordAt + 0.15 + i * 0.09, 0.1, 'sine', 0.05)
    })

    // Reanudar la música de fondo cuando termina la fanfarria
    window.setTimeout(() => {
      if (!muted && started.current) void playMusic()
    }, 2200)
  }, [getCtx, muted, playMusic, stopMusic])

  const playError = useCallback(async () => {
    if (muted) return
    const ctx = await getCtx()
    stopMusic()
    const now = ctx.currentTime
    tone(ctx, 392, now, 0.22, 'square', 0.12)
    tone(ctx, 311, now + 0.18, 0.22, 'square', 0.12)
    tone(ctx, 247, now + 0.38, 0.35, 'triangle', 0.14)
    window.setTimeout(() => {
      if (!muted && started.current) void playMusic()
    }, 900)
  }, [getCtx, muted, playMusic, stopMusic])

  const speak = useCallback(
    (text: string) => {
      if (muted || !('speechSynthesis' in window)) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'es-MX'
      utterance.rate = 0.9
      const voices = window.speechSynthesis.getVoices()
      const spanish =
        voices.find((voice) => voice.lang.startsWith('es-MX')) ??
        voices.find((voice) => voice.lang.startsWith('es'))
      if (spanish) utterance.voice = spanish
      window.speechSynthesis.speak(utterance)
    },
    [muted],
  )

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      const next = !current
      localStorage.setItem(MUTE_KEY, next ? '1' : '0')
      if (next) {
        window.speechSynthesis?.cancel()
        stopMusic()
      }
      return next
    })
  }, [stopMusic])

  useEffect(() => {
    if (!started.current) return
    if (!muted) {
      void playMusic()
    } else {
      stopMusic()
    }
  }, [muted, playMusic, stopMusic])

  useEffect(() => () => {
    stopMusic()
    window.speechSynthesis?.cancel()
  }, [stopMusic])

  return useMemo(
    () => ({
      muted,
      toggleMute,
      unlock,
      playClick,
      playSuccess,
      playCelebration,
      playError,
      speak,
    }),
    [muted, toggleMute, unlock, playClick, playSuccess, playCelebration, playError, speak],
  )
}

export type AudioApi = ReturnType<typeof useAudio>
