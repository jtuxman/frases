import { useState } from 'react'
import { useAudio } from './audio/useAudio'
import type { PlaceId } from './data/types'
import { allComplete, loadName } from './game/progress'
import { MapScreen } from './screens/MapScreen'
import { PlayScreen } from './screens/PlayScreen'
import { ResultScreen } from './screens/ResultScreen'
import { TitleScreen } from './screens/TitleScreen'

type Screen = 'title' | 'map' | 'play' | 'results'

export default function App() {
  const audio = useAudio()
  const [screen, setScreen] = useState<Screen>('title')
  const [placeId, setPlaceId] = useState<PlaceId | null>(null)
  const [name, setName] = useState<string>(loadName)

  function goPlace(place: PlaceId) {
    setPlaceId(place)
    setScreen('play')
  }

  function afterPlace() {
    if (allComplete()) {
      setScreen('results')
      return
    }
    setScreen('map')
  }

  return (
    <div className="h-full">
      {screen === 'title' && (
        <TitleScreen
          audio={audio}
          name={name}
          onPlay={(playerName) => {
            setName(playerName)
            void audio.unlock()
            setScreen('map')
          }}
        />
      )}
      {screen === 'map' && (
        <MapScreen
          audio={audio}
          onBack={() => setScreen('title')}
          onPlayPlace={goPlace}
          onReplayPlace={goPlace}
          onSeeResults={() => setScreen('results')}
        />
      )}
      {screen === 'play' && placeId && (
        <PlayScreen
          placeId={placeId}
          audio={audio}
          name={name}
          onBack={() => setScreen('map')}
          onPlaceDone={afterPlace}
        />
      )}
      {screen === 'results' && (
        <ResultScreen
          audio={audio}
          onMap={() => setScreen('map')}
          onReplay={() => setScreen('map')}
        />
      )}
    </div>
  )
}
