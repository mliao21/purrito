import { useEffect, useMemo, useState } from 'react'
import { fetchBreeds, fetchPlaces } from './api'
import { Stage } from './game/Stage'
import { worlds } from './places'
import type { Breed, Place } from './types'

type Step = 'intro' | 'place' | 'play'

const STORAGE_KEY = 'purrito:profile'

function loadSaved(): { name?: string; breedId?: string } {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function save(name: string, breedId: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, breedId }))
  } catch {
    /* storage unavailable — fine */
  }
}

const isPlayable = (p: Place) => p.playable && p.id in worlds

export default function App() {
  const [breeds, setBreeds] = useState<Breed[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  const [error, setError] = useState<string | null>(null)

  const saved = useMemo(loadSaved, [])
  const [step, setStep] = useState<Step>('intro')
  const [name, setName] = useState(saved.name ?? '')
  const [breedId, setBreedId] = useState<string | undefined>(saved.breedId)
  const [placeId, setPlaceId] = useState<string | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)

  // A random place for the intro background, picked once per visit.
  const [introPlace] = useState(() => {
    const ids = Object.keys(worlds)
    return ids[Math.floor(Math.random() * ids.length)]
  })

  useEffect(() => {
    Promise.all([fetchBreeds(), fetchPlaces()])
      .then(([b, p]) => {
        setBreeds(b)
        setPlaces(p)
        setBreedId((id) => (id && b.some((x) => x.id === id) ? id : b[0]?.id))

        // Deep link: ?name=Mochi&breed=siamese&place=garden jumps straight in.
        const q = new URLSearchParams(window.location.search)
        const qName = q.get('name')?.trim().slice(0, 20)
        const qBreed = b.find((x) => x.id === q.get('breed'))
        const qPlace = p.find((x) => x.id === q.get('place'))
        if (qName) setName(qName)
        if (qBreed) setBreedId(qBreed.id)
        if (qName && qPlace && isPlayable(qPlace)) {
          setPlaceId(qPlace.id)
          setStep('play')
        }
      })
      .catch((e) => setError(String(e)))
  }, [])

  const breed = breeds.find((b) => b.id === breedId)
  const place = places.find((p) => p.id === placeId)
  const stagePlace = (step === 'play' && placeId) || (step === 'place' && previewId) || introPlace
  const world = worlds[stagePlace]

  const trimmed = name.trim()
  const canContinue = trimmed.length > 0 && !!breed

  const goToPlaces = () => {
    if (!canContinue || !breed) return
    save(trimmed, breed.id)
    setStep('place')
  }

  const enterPlace = (p: Place) => {
    if (!isPlayable(p)) return
    setPlaceId(p.id)
    setStep('play')
  }

  return (
    <div className="app">
      <Stage
        placeId={stagePlace}
        world={world}
        breed={breed}
        name={trimmed}
        playing={step === 'play'}
        framing={step === 'intro' ? 'right' : step === 'place' ? 'top' : 'center'}
      />

      {error && (
        <div className="overlay center">
          <div className="card">
            <h2>🙀 Can't reach the Purrito server</h2>
            <p className="muted">
              Start the Go API with <code>go run .</code> inside <code>server/</code>, then refresh.
            </p>
          </div>
        </div>
      )}

      {!error && step === 'intro' && (
        <div className="overlay side">
          <div className="card intro">
            <h1 className="logo">
              Purrito <span aria-hidden>🐾</span>
            </h1>
            <p className="muted">Become a cat. Wander somewhere cozy.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                goToPlaces()
              }}
            >
              <label className="field">
                <span>What's your cat's name?</span>
                <input
                  autoFocus
                  maxLength={20}
                  value={name}
                  placeholder="e.g. Mochi"
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <span className="label">Pick a breed</span>
              <div className="breeds">
                {breeds.map((b) => (
                  <button
                    type="button"
                    key={b.id}
                    className={'breed' + (b.id === breedId ? ' selected' : '')}
                    onClick={() => setBreedId(b.id)}
                  >
                    <span
                      className="swatch"
                      style={{
                        background: `radial-gradient(circle at 70% 70%, ${b.coat.belly} 0 28%, transparent 30%),
                                     radial-gradient(circle at 30% 30%, ${b.coat.patch ?? b.coat.accent} 0 26%, transparent 28%),
                                     ${b.coat.base}`,
                      }}
                    />
                    <span>{b.name}</span>
                  </button>
                ))}
              </div>
              {breed && <p className="muted small breed-desc">{breed.description}</p>}

              <button className="primary" disabled={!canContinue}>
                Choose a place →
              </button>
            </form>
          </div>
        </div>
      )}

      {!error && step === 'place' && (
        <div className="overlay bottom">
          <div className="card wide">
            <div className="row">
              <button className="ghost" onClick={() => setStep('intro')}>
                ← Back
              </button>
              <h2>Where would {trimmed} like to roam?</h2>
            </div>
            <div className="places">
              {places.map((p) => {
                const playable = isPlayable(p)
                return (
                  <button
                    key={p.id}
                    className="place"
                    disabled={!playable}
                    onMouseEnter={() => playable && setPreviewId(p.id)}
                    onFocus={() => playable && setPreviewId(p.id)}
                    onClick={() => enterPlace(p)}
                  >
                    <span className="emoji">{p.emoji}</span>
                    <strong>{p.name}</strong>
                    <span className="muted small">{p.description}</span>
                    <span className={'tag ' + p.setting}>{playable ? p.setting : 'coming soon'}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {step === 'play' && place && (
        <>
          <div className="hud top">
            <span className="pill">
              {place.emoji} {trimmed} the {breed?.name} · {place.name}
            </span>
            <div className="row">
              <button className="pill button" onClick={() => setStep('place')}>
                Change place
              </button>
              <button className="pill button" onClick={() => setStep('intro')}>
                Change cat
              </button>
            </div>
          </div>
          <div className="hud bottom-hint">
            <span className="pill small">
              <kbd>W</kbd>
              <kbd>S</kbd> walk · <kbd>A</kbd>
              <kbd>D</kbd> turn · <kbd>Shift</kbd> run · <kbd>Space</kbd> jump · click to walk · scroll to zoom
            </span>
          </div>
        </>
      )}
    </div>
  )
}
