// Command server runs the Purrito API and (optionally) serves the built frontend.
package main

import (
	"encoding/json"
	"flag"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

func main() {
	addr := flag.String("addr", envOr("ADDR", ":8080"), "address to listen on")
	static := flag.String("static", envOr("STATIC_DIR", "../web/dist"), "directory of the built frontend")
	flag.Parse()

	srv := &http.Server{
		Addr:              *addr,
		Handler:           logRequests(newRouter(*static)),
		ReadHeaderTimeout: 5 * time.Second,
	}
	log.Printf("🐾 purrito server listening on %s (static: %s)", *addr, *static)
	log.Fatal(srv.ListenAndServe())
}

func newRouter(staticDir string) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, map[string]string{"status": "ok"})
	})
	mux.HandleFunc("GET /api/breeds", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, breeds)
	})
	mux.HandleFunc("GET /api/places", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, places)
	})
	mux.Handle("/", spaHandler(staticDir))
	return mux
}

// spaHandler serves files from dir, falling back to index.html so the
// single-page app can handle its own routes.
func spaHandler(dir string) http.Handler {
	files := http.FileServer(http.Dir(dir))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := filepath.Join(dir, filepath.Clean("/"+r.URL.Path))
		if info, err := os.Stat(path); err != nil || info.IsDir() {
			index := filepath.Join(dir, "index.html")
			if _, err := os.Stat(index); err != nil {
				http.Error(w, "frontend not built yet — run `npm run build` in web/ or use the Vite dev server", http.StatusNotFound)
				return
			}
			http.ServeFile(w, r, index)
			return
		}
		files.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("encode response: %v", err)
	}
}

func logRequests(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start).Round(time.Microsecond))
	})
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
