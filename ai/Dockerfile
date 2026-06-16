FROM golang:1.23-alpine AS build

WORKDIR /app

RUN apk add --no-cache git

COPY go.mod ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /ai-server ./cmd/server

FROM alpine:3.20

WORKDIR /app

RUN apk add --no-cache ca-certificates wget

COPY --from=build /ai-server /app/ai-server

EXPOSE 8081

CMD ["/app/ai-server"]
