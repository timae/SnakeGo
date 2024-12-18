package main

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	_ "embed" // Required for embedding files
)

type Position struct {
	X int `json:"x"`
	Y int `json:"y"`
}

type GameState struct {
	Snake   []Position `json:"snake"`
	Food    Position   `json:"food"`
	Running bool       `json:"running"`
}

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
	// Serve the index.html from the root
	http.HandleFunc("/", serveIndex)

	// Serve static files (js, css, etc.) from the "static" folder
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))

	fmt.Println("Server started on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		panic(err)
	}
}

// Serve the index.html file at the root path
func serveIndex(w http.ResponseWriter, r *http.Request) {
	// Get the absolute path to the static directory
	indexFilePath := filepath.Join("static", "index.html")

	// Open the index.html file
	file, err := os.Open(indexFilePath)
	if err != nil {
		http.Error(w, "Error opening index.html", http.StatusInternalServerError)
		return
	}
	defer file.Close()

	// Serve the index.html file to the client
	http.ServeContent(w, r, "index.html", time.Now(), file)
}

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
