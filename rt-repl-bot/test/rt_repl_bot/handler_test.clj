(ns rt-repl-bot.handler-test
  (:require [clojure.test :refer :all]
            [clojure.string :as str]
            [ring.mock.request :as mock]
            [rt-repl-bot.handler :refer :all]))

(deftest handler-test

  (testing "Test GET /info"
    (let [response (app (mock/request :get "/info"))]
      (is (= 200 (:status response)))
      (is (= "application/json; charset=utf-8" (get-in response [:headers "Content-Type"])))
      (is (str/starts-with? (:body response) "{\"author\":\"Alex 'SimY4' Simkin\",\"info\":\"Clojure REPL bot\",\"commands\":"))))

  (testing "Test POST /event should skip malformed JSON requests with 400 code"
    (let [request (-> (mock/request :post "/event" "random body")
                      (mock/content-type "application/json"))
          response (app request)]
      (is (= 400 (:status response)))))

  (testing "Test POST /event should skip random messages with 417 code"
    (let [request (-> (mock/request :post "/event" "{\"text\": \"randon text\"}")
                      (mock/content-type "application/json"))
          response (app request)]
      (is (= 417 (:status response)))
      (is (= "application/json; charset=utf-8" (get-in response [:headers "Content-Type"])))))

  (testing "Test POST /event should evaluate clojure commands and respond with 201 code"
    (let [request (-> (mock/request :post "/event" "{\"text\": \"clj> (+ 1 1)\"}")
                      (mock/content-type "application/json"))
          response (app request)]
      (is (= 201 (:status response)))
      (is (= "application/json; charset=utf-8" (get-in response [:headers "Content-Type"])))
      (is (= "{\"text\":\"```\\n2\\n```\",\"bot\":\"REPL-bot\"}" (:body response))))
    (let [request (-> (mock/request :post "/event" "{\"text\": \"clj>\"}")
                      (mock/content-type "application/json"))
          response (app request)]
      (is (= 201 (:status response)))
      (is (= "application/json; charset=utf-8" (get-in response [:headers "Content-Type"])))
      (is (= "{\"text\":\"```\\nEOF while reading\\n```\",\"bot\":\"REPL-bot\"}" (:body response))))
    (let [request (-> (mock/request :post "/event" "{\"text\": \"clj>(def var1 5)\"}")
                      (mock/content-type "application/json"))
          response (app request)]
      (is (= 201 (:status response)))
      (is (= "application/json; charset=utf-8" (get-in response [:headers "Content-Type"])))
      (is (re-matches #"\{\"text\":\"```\\n#'sandbox[0-9]{1,4}/var1\\n```\",\"bot\":\"REPL-bot\"\}" (:body response))))
    (let [request (-> (mock/request :post "/event" "{\"text\": \"clj> (while true)\"}")
                      (mock/content-type "application/json"))
          response (app request)]
      (is (= 201 (:status response)))
      (is (= "application/json; charset=utf-8" (get-in response [:headers "Content-Type"])))
      (is (= "{\"text\":\"```\\nEvaluation timed out in 5 seconds\\n```\",\"bot\":\"REPL-bot\"}" (:body response))))
    (let [request (-> (mock/request :post "/event" "{\"text\": \"clj> (+ var1 5)\"}")
                      (mock/content-type "application/json"))
          response (app request)]
      (is (= 201 (:status response)))
      (is (= "application/json; charset=utf-8" (get-in response [:headers "Content-Type"])))
      (is (= "{\"text\":\"```\\n10\\n```\",\"bot\":\"REPL-bot\"}" (:body response)))))

  (testing "Test 404"
    (is (= 404 (:status (app (mock/request :post "/info")))))
    (is (= 404 (:status (app (mock/request :post "/heathcheck")))))
    (is (= 404 (:status (app (mock/request :get "/event" "{\"text\": \"clj> (+1 1)\"}")))))
    (is (= 404 (:status (app (mock/request :get "/")))))
    (is (= 404 (:status (app (mock/request :get "/random")))))))