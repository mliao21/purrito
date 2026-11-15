import type { Breed, Place } from './types'

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`${path}: ${res.status}`)
  return res.json() as Promise<T>
}

export const fetchBreeds = () => getJSON<Breed[]>('/api/breeds')
export const fetchPlaces = () => getJSON<Place[]>('/api/places')
