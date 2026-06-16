package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	Port          string
	OpenAIAPIKey  string
	DefaultModel  string
	InternalToken string
}

func Load() (Config, error) {
	port := getenv("PORT", "8081")
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return Config{}, fmt.Errorf("OPENAI_API_KEY is required")
	}

	return Config{
		Port:          port,
		OpenAIAPIKey:  apiKey,
		DefaultModel:  getenv("AI_DEFAULT_MODEL", "gpt-4o-mini"),
		InternalToken: os.Getenv("AI_INTERNAL_TOKEN"),
	}, nil
}

func getenv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func ParsePort(port string) (int, error) {
	return strconv.Atoi(port)
}
