package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestBreedsEndpoint(t *testing.T) {
	var got []Breed
	get(t, "/api/breeds", &got)
	if len(got) != len(breeds) {
		t.Fatalf("got %d breeds, want %d", len(got), len(breeds))
	}
	for _, b := range got {
		if b.ID == "" || b.Coat.Base == "" || b.Pattern == "" {
			t.Errorf("breed missing fields: %+v", b)
		}
	}
}

func TestPlacesEndpoint(t *testing.T) {
	var got []Place
	get(t, "/api/places", &got)
	playable := 0
	for _, p := range got {
		if p.Playable {
			playable++
		}
	}
	if playable == 0 {
		t.Fatal("expected at least one playable place")
	}
}

func TestExportJSON(t *testing.T) {
	dir := t.TempDir()
	if err := exportJSON(dir); err != nil {
		t.Fatal(err)
	}
	for _, name := range []string{"breeds.json", "places.json"} {
		b, err := os.ReadFile(filepath.Join(dir, name))
		if err != nil {
			t.Fatal(err)
		}
		var v []map[string]any
		if err := json.Unmarshal(b, &v); err != nil || len(v) == 0 {
			t.Fatalf("%s: bad contents (%v)", name, err)
		}
	}
}

func get(t *testing.T, path string, out any) {
	t.Helper()
	rec := httptest.NewRecorder()
	newRouter(t.TempDir()).ServeHTTP(rec, httptest.NewRequest(http.MethodGet, path, nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("%s: status %d", path, rec.Code)
	}
	if err := json.Unmarshal(rec.Body.Bytes(), out); err != nil {
		t.Fatalf("%s: decode: %v", path, err)
	}
}
