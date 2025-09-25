# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o calendar-backend .

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates wget sqlite

WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/calendar-backend .

# Copy environment file
COPY --from=builder /app/env.example .env

# Expose port
EXPOSE 8080

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/health || exit 1

# Run the application
CMD ["./calendar-backend"]
