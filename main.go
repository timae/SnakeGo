package main

import (
	"embed"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Position represents a coordinate on the game grid.
type Position struct {
	X int `json:"x"`
	Y int `json:"y"`
}

// GameState represents the current state of the game.
type GameState struct {
	Snake   []Position `json:"snake"`
	Food    Position   `json:"food"`
	Running bool       `json:"running"`
}

// Embed the static folder.
//
//go:embed static/*
var staticFiles embed.FS

var (
	upgrader  = websocket.Upgrader{}
	gameState = GameState{
		Snake:   []Position{{X: 5, Y: 5}},
		Food:    Position{X: 10, Y: 10},
		Running: true,
	}
	mutex = sync.Mutex{}
)

func main() {
	// Serve embedded static files.
	http.Handle("/", http.FileServer(http.FS(staticFiles)))

	// WebSocket endpoint for game updates.
	http.HandleFunc("/ws", handleWebSocket)

	fmt.Println("Server started on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		panic(err)
	}
}

// handleWebSocket upgrades the connection to a WebSocket.
func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Could not open websocket connection", http.StatusBadRequest)
		return
	}
	defer conn.Close()

	go gameLoop(conn)
}

// gameLoop sends the game state to the client periodically.
func gameLoop(conn *websocket.Conn) {
	ticker := time.NewTicker(200 * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			mutex.Lock()
			updateGameState()
			err := conn.WriteJSON(gameState)
			mutex.Unlock()
			if err != nil {
				fmt.Println("Connection error:", err)
				return
			}
		}
	}
}

// updateGameState updates the position of the snake and handles food consumption.
func updateGameState() {
	head := gameState.Snake[0]
	head.X++
	gameState.Snake = append([]Position{head}, gameState.Snake...)
	gameState.Snake = gameState.Snake[:len(gameState.Snake)-1]

	if head == gameState.Food {
		gameState.Food = Position{X: head.X + 3, Y: head.Y + 3}
		gameState.Snake = append(gameState.Snake, Position{})
	}
}
