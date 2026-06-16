package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/finta/ai/internal/llm"
)

type GenerateHandler struct {
	client *llm.Client
}

func NewGenerateHandler(client *llm.Client) *GenerateHandler {
	return &GenerateHandler{client: client}
}

type generateMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type generateRequest struct {
	Messages    []generateMessage `json:"messages"`
	Model       string            `json:"model"`
	Temperature *float64          `json:"temperature"`
	MaxTokens   *int              `json:"max_tokens"`
	Stream      bool              `json:"stream"`
}

type generateResponse struct {
	Content string        `json:"content"`
	Model   string        `json:"model"`
	Usage   *usagePayload `json:"usage,omitempty"`
}

type usagePayload struct {
	InputTokens  int `json:"input_tokens"`
	OutputTokens int `json:"output_tokens"`
}

type streamChunk struct {
	Delta string `json:"delta"`
	Done  bool   `json:"done"`
}

func (h *GenerateHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	var req generateRequest
	if err := json.Unmarshal(body, &req); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid json")
		return
	}

	if len(req.Messages) == 0 {
		writeJSONError(w, http.StatusBadRequest, "messages is required")
		return
	}

	messages := make([]llm.Message, 0, len(req.Messages))
	for _, message := range req.Messages {
		if message.Role == "" || message.Content == "" {
			writeJSONError(w, http.StatusBadRequest, "each message requires role and content")
			return
		}
		messages = append(messages, llm.Message{
			Role:    message.Role,
			Content: message.Content,
		})
	}

	temperature := 0.7
	if req.Temperature != nil {
		temperature = *req.Temperature
	}

	maxTokens := 2048
	if req.MaxTokens != nil {
		maxTokens = *req.MaxTokens
	}

	opts := llm.GenerateOptions{
		Model:       req.Model,
		Temperature: temperature,
		MaxTokens:   maxTokens,
		Stream:      req.Stream,
	}

	if req.Stream {
		h.streamGenerate(w, r, messages, opts)
		return
	}

	result, err := h.client.Generate(r.Context(), messages, opts)
	if err != nil {
		writeJSONError(w, http.StatusBadGateway, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, generateResponse{
		Content: result.Content,
		Model:   result.Model,
		Usage: &usagePayload{
			InputTokens:  result.InputTokens,
			OutputTokens: result.OutputTokens,
		},
	})
}

func (h *GenerateHandler) streamGenerate(
	w http.ResponseWriter,
	r *http.Request,
	messages []llm.Message,
	opts llm.GenerateOptions,
) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		writeJSONError(w, http.StatusInternalServerError, "streaming unsupported")
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.WriteHeader(http.StatusOK)

	opts.OnChunk = func(chunk string) error {
		payload, err := json.Marshal(streamChunk{Delta: chunk, Done: false})
		if err != nil {
			return err
		}
		if _, err := fmt.Fprintf(w, "data: %s\n\n", payload); err != nil {
			return err
		}
		flusher.Flush()
		return nil
	}

	result, err := h.client.Generate(r.Context(), messages, opts)
	if err != nil {
		payload, _ := json.Marshal(map[string]string{"error": err.Error()})
		fmt.Fprintf(w, "data: %s\n\n", payload)
		flusher.Flush()
		return
	}

	donePayload, _ := json.Marshal(streamChunk{Delta: "", Done: true})
	fmt.Fprintf(w, "data: %s\n\n", donePayload)
	flusher.Flush()

	metaPayload, _ := json.Marshal(generateResponse{
		Content: result.Content,
		Model:   result.Model,
	})
	fmt.Fprintf(w, "event: meta\ndata: %s\n\n", metaPayload)
	flusher.Flush()
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeJSONError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
