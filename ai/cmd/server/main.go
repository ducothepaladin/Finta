package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/finta/ai/internal/config"
	"github.com/finta/ai/internal/handler"
	"github.com/finta/ai/internal/llm"
	"github.com/finta/ai/internal/middleware"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	client, err := llm.NewClient(cfg.OpenAIAPIKey, cfg.DefaultModel)
	if err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", handler.Health)
	mux.Handle("POST /v1/generate", middleware.InternalAuth(cfg.InternalToken)(
		handler.NewGenerateHandler(client),
	))

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("AI service listening on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
