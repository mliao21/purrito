package main

// Coat describes the colours used to build a cat out of simple 3D shapes.
type Coat struct {
	Base   string `json:"base"`            // main fur colour
	Accent string `json:"accent"`          // stripes / points / patches
	Belly  string `json:"belly"`           // chest, muzzle, paws
	Patch  string `json:"patch,omitempty"` // optional second patch colour (calico)
	Eyes   string `json:"eyes"`
}

type Breed struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	// Pattern tells the frontend where to place accent colours:
	// solid | tabby | points | tuxedo | calico
	Pattern string `json:"pattern"`
	Coat    Coat   `json:"coat"`
}

type Place struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Setting     string `json:"setting"` // indoor | outdoor
	Emoji       string `json:"emoji"`
	Playable    bool   `json:"playable"` // false = "coming soon"
}

var breeds = []Breed{
	{
		ID: "orange-tabby", Name: "Orange Tabby", Pattern: "tabby",
		Description: "Sunny, food-motivated and always up for a nap in the warmest spot.",
		Coat:        Coat{Base: "#f6b97a", Accent: "#e4945a", Belly: "#fff3e4", Eyes: "#8fcf8a"},
	},
	{
		ID: "siamese", Name: "Siamese", Pattern: "points",
		Description: "Chatty, elegant and very opinionated about breakfast time.",
		Coat:        Coat{Base: "#f6ebdd", Accent: "#9b7b6b", Belly: "#fffaf2", Eyes: "#86bff2"},
	},
	{
		ID: "tuxedo", Name: "Tuxedo", Pattern: "tuxedo",
		Description: "Dressed for a gala at all times. Mischief is their middle name.",
		Coat:        Coat{Base: "#55546a", Accent: "#55546a", Belly: "#ffffff", Eyes: "#f4d77a"},
	},
	{
		ID: "british-shorthair", Name: "British Shorthair", Pattern: "solid",
		Description: "A plush blue-grey teddy bear with a calm, dignified soul.",
		Coat:        Coat{Base: "#b8c2d8", Accent: "#a4afc8", Belly: "#c9d1e3", Eyes: "#f2ae62"},
	},
	{
		ID: "calico", Name: "Calico", Pattern: "calico",
		Description: "A patchwork of cream, ginger and cocoa — and full of surprises.",
		Coat:        Coat{Base: "#fff8ee", Accent: "#f2a970", Belly: "#fffdf8", Patch: "#6e6272", Eyes: "#c6d77a"},
	},
}

var places = []Place{
	{
		ID: "living-room", Name: "Cozy Living Room", Setting: "indoor", Emoji: "🛋️", Playable: true,
		Description: "A sofa to knead, a rug to roll on and a sunny window to watch the birds.",
	},
	{
		ID: "garden", Name: "Sunny Garden", Setting: "outdoor", Emoji: "🌷", Playable: true,
		Description: "Soft grass, flower beds, a little pond and butterflies to chase.",
	},
	{
		ID: "rooftop", Name: "Rooftop at Dusk", Setting: "outdoor", Emoji: "🌆", Playable: false,
		Description: "Warm tiles, chimney pots and a pink sunset over the city.",
	},
	{
		ID: "cat-cafe", Name: "Cat Café", Setting: "indoor", Emoji: "☕", Playable: false,
		Description: "Shelves to climb, cushions everywhere and the smell of fresh pastries.",
	},
}
