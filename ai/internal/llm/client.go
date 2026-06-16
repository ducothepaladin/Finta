package llm

import (
	"context"

	"github.com/tmc/langchaingo/llms"
	"github.com/tmc/langchaingo/llms/openai"
)

type Message struct {
	Role    string
	Content string
}

type GenerateOptions struct {
	Model       string
	Temperature float64
	MaxTokens   int
	Stream      bool
	OnChunk     func(chunk string) error
}

type GenerateResult struct {
	Content      string
	Model        string
	InputTokens  int
	OutputTokens int
}

type Client struct {
	llm          llms.Model
	defaultModel string
}

func NewClient(apiKey, defaultModel string) (*Client, error) {
	llm, err := openai.New(openai.WithToken(apiKey))
	if err != nil {
		return nil, err
	}

	return &Client{
		llm:          llm,
		defaultModel: defaultModel,
	}, nil
}

func (c *Client) Generate(
	ctx context.Context,
	messages []Message,
	opts GenerateOptions,
) (*GenerateResult, error) {
	model := opts.Model
	if model == "" {
		model = c.defaultModel
	}

	content := toMessageContent(messages)
	callOpts := []llms.CallOption{
		llms.WithModel(model),
		llms.WithTemperature(opts.Temperature),
	}

	if opts.MaxTokens > 0 {
		callOpts = append(callOpts, llms.WithMaxTokens(opts.MaxTokens))
	}

	var streamed stringsBuilder
	if opts.Stream && opts.OnChunk != nil {
		callOpts = append(callOpts, llms.WithStreamingFunc(func(ctx context.Context, chunk []byte) error {
			text := string(chunk)
			streamed.WriteString(text)
			return opts.OnChunk(text)
		}))
	}

	resp, err := c.llm.GenerateContent(ctx, content, callOpts...)
	if err != nil {
		return nil, err
	}

	result := &GenerateResult{Model: model}
	if streamed.Len() > 0 {
		result.Content = streamed.String()
	} else if resp != nil && len(resp.Choices) > 0 {
		result.Content = resp.Choices[0].Content
	}

	return result, nil
}

func toMessageContent(messages []Message) []llms.MessageContent {
	out := make([]llms.MessageContent, 0, len(messages))
	for _, message := range messages {
		var role llms.ChatMessageType
		switch message.Role {
		case "system":
			role = llms.ChatMessageTypeSystem
		case "assistant":
			role = llms.ChatMessageTypeAI
		default:
			role = llms.ChatMessageTypeHuman
		}
		out = append(out, llms.TextParts(role, message.Content))
	}
	return out
}

type stringsBuilder struct {
	parts []string
}

func (b *stringsBuilder) WriteString(s string) {
	if s != "" {
		b.parts = append(b.parts, s)
	}
}

func (b *stringsBuilder) Len() int {
	total := 0
	for _, part := range b.parts {
		total += len(part)
	}
	return total
}

func (b *stringsBuilder) String() string {
	if len(b.parts) == 0 {
		return ""
	}
	if len(b.parts) == 1 {
		return b.parts[0]
	}
	total := 0
	for _, part := range b.parts {
		total += len(part)
	}
	buf := make([]byte, 0, total)
	for _, part := range b.parts {
		buf = append(buf, part...)
	}
	return string(buf)
}
