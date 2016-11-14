package main

import (
	"errors"
	"fmt"
	"log"
	"net/http"
)

func sendSuccess(w http.ResponseWriter, text []byte) {

	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusCreated)
	fmt.Fprintf(w, "%s", text)
}

func sendError(w http.ResponseWriter, err error) {

	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusExpectationFailed)
	fmt.Fprintf(w, "%v", err)
}

func info(w http.ResponseWriter, r *http.Request) {

	if r.Method != "GET" {
		return
	}

	info := fmt.Sprintf(`{"author": "%v", "info": "%v", "commands": "%v"}`, BotAuthor, BotDescription, BotCommand)

	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "%s", info)
}

func handler(w http.ResponseWriter, r *http.Request) {

	if r.Method != "POST" {
		return
	}

	req := Request{}
	err := req.ParseData(r)
	if err != nil {
		sendError(w, err)
		return
	}

	command, err := req.ParseText()
	if err != nil {
		sendError(w, err)
		return
	}

	text := ""

	switch command {
	case "random":
		source := DevelopersLife{}
		text, err = source.Random()
		if err != nil {
			sendError(w, err)
		}
	default:
		sendError(w, errors.New("Uknown command"))
		return
	}

	resp := Response{Bot: BotId, Text: text}
	resTxt, err := resp.ToJson()
	if err != nil {
		sendError(w, err)
		return
	}

	sendSuccess(w, resTxt)
}

func panicRecover(f func(w http.ResponseWriter, r *http.Request)) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("Pamic:%s\n", r)
			}
		}()
		f(w, r)
	}
}

func main() {

	http.HandleFunc("/info", panicRecover(info))
	http.HandleFunc("/event", panicRecover(handler))

	fmt.Printf("Start listening server on port %v", Port)
	log.Fatal(http.ListenAndServe(":"+Port, nil))
}
