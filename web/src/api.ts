import type { Breed, Place } from './types'

// Two ways to get data:
//  - default: the Go API (`/api/breeds`), used in local development
//  - VITE_STATIC_DATA=1: static JSON files exported by `go run . -export`,
//    used for the GitHub Pages build where there is no server
const STATIC = import.meta.env.VITE_STATIC_DATA === '1'

const url = (name: 'breeds' | 'places') =>
  STATIC ? `${import.meta.env.BASE_URL}data/${name}.json` : `/api/${name}`

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`${path}: ${res.status}`)
  return res.json() as Promise<T>
}

export const fetchBreeds = () => getJSON<Breed[]>(url('breeds'))
export const fetchPlaces = () => getJSON<Place[]>(url('places'))
