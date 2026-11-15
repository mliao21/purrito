// Mirrors the Go API types in server/data.go.

export type Pattern = 'solid' | 'tabby' | 'points' | 'tuxedo' | 'calico'

export interface Coat {
  base: string
  accent: string
  belly: string
  patch?: string
  eyes: string
}

export interface Breed {
  id: string
  name: string
  description: string
  pattern: Pattern
  coat: Coat
}

export interface Place {
  id: string
  name: string
  description: string
  setting: 'indoor' | 'outdoor'
  emoji: string
  playable: boolean
}

export interface Profile {
  name: string
  breed: Breed
}
