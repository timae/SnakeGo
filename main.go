package main

import (
	"bytes"
	"embed"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

// Embed static files.
//
//go:embed static/*
var staticFiles embed.FS

type HighScoreEntry struct {
	Name  string `json:"name"`
	Score int    `json:"score"`
}

var (
	mutex      = sync.Mutex{}
	highScores = []HighScoreEntry{}
)

const (
	bucketName = "your-s3-bucket-name"
	region     = "your-region"
)

func main() {
	http.Handle("/", http.FileServer(http.FS(staticFiles)))
	http.HandleFunc("/highscore", highScoreHandler)

	fmt.Println("Server started on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		panic(err)
	}
}

func highScoreHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		var scoreData HighScoreEntry
		err := json.NewDecoder(r.Body).Decode(&scoreData)
		if err != nil {
			http.Error(w, "Invalid data", http.StatusBadRequest)
			return
		}

		mutex.Lock()
		highScores = append(highScores, scoreData)
		mutex.Unlock()

		saveScoresToS3()
		w.WriteHeader(http.StatusOK)
	} else if r.Method == http.MethodGet {
		scores, err := fetchScoresFromS3()
		if err != nil {
			http.Error(w, "Failed to fetch scores", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(scores)
	}
}

func saveScoresToS3() {
	sess := session.Must(session.NewSession(&aws.Config{Region: aws.String(region)}))
	svc := s3.New(sess)

	data, _ := json.Marshal(highScores)
	_, err := svc.PutObject(&s3.PutObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String("highscores.json"),
		Body:   aws.ReadSeekCloser(bytes.NewReader(data)),
	})
	if err != nil {
		fmt.Println("Error saving scores:", err)
	}
}

func fetchScoresFromS3() ([]HighScoreEntry, error) {
	sess := session.Must(session.NewSession(&aws.Config{Region: aws.String(region)}))
	svc := s3.New(sess)

	resp, err := svc.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String("highscores.json"),
	})
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var scores []HighScoreEntry
	err = json.NewDecoder(resp.Body).Decode(&scores)
	return scores, err
}
