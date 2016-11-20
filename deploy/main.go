package main

import (
	"bytes"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"time"
)

func main() {
	log.Printf("deployer")

	ch := make(chan struct{})
	go deploy(ch)

	http.HandleFunc("/deploy", auth(func(w http.ResponseWriter, r *http.Request) {
		st := time.Now()
		ch <- struct{}{}
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"status": "ok", "duration": %v}`, time.Since(st))
	}))

	if err := http.ListenAndServeTLS(":443", "/srv/rt-bot/etc/ssl/le-crt.pem", "/srv/rt-bot/etc/ssl/le-key.pem", nil); err != nil {
		log.Fatalf("failed to start server, %v", err)
	}
}

func auth(fn http.HandlerFunc) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		user, pass, _ := r.BasicAuth()
		if user != os.Getenv("DEPLOY_USER") || pass != os.Getenv("DEPLOY_PASSWD") {
			http.Error(w, "Unauthorized.", 401)
			return
		}
		fn(w, r)
	}
}

func deploy(ch <-chan struct{}) {
	for range ch {
		log.Print("deploy request")
		cmd := exec.Command("sh", "-c", "/srv/deploy.sh")
		var out, stderr bytes.Buffer
		cmd.Stdout = &out
		cmd.Stderr = &stderr
		err := cmd.Run()
		if err != nil {
			log.Printf("error %s", stderr.String())
			return
		}
		log.Printf("out: %s", out.String())
		log.Printf("err: %s", stderr.String())
	}
}
