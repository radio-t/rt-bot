(ns rt-repl-bot.handler-test
  (:require [clojure.test :refer :all]
            [clojure.string :as str]
            [ring.mock.request :as mock]
            [rt-repl-bot.handler :refer :all]))

(deftest handler-test

  (testing "Test GET /info"
    (let [response (mock/request :get "/info" nil)]
      (is (= 200 (:status response)))
      (is (= "application/json; charset=utf8" (get-in (:headers response) "Content-Type")))
      (is (str/starts-with? (:body response) "{\"author\":\"Alex 'SimY4' Simkin\",\"info\":\"Clojure REPL bot\",\"commands\":"))))

  (testing "Test POST /event should skip random messages with 417 code"
    (let [response (mock/request :post "/event" "random body")]
      (is (= 417 (:status response)))
      (is (= "application/json; charset=utf8" (get-in (:headers response) "Content-Type"))))
    (let [response (mock/request :post "/event" {"text" "randon text"})]
      (is (= 417 (:status response)))
      (is (= "application/json; charset=utf8" (get-in (:headers response) "Content-Type")))))

  (testing "Test POST /event should evaluate clojure commands and respond with 201 code"
    (let [response (mock/request :post "/event" {"text" "clj> (+ 1 1)"})]
      (is (= 201 (:status response)))
      (is (= "application/json; charset=utf8" (get-in (:headers response) "Content-Type")))
      (is (= "{\"text\":\"```\\n2\\n```\",\"bot\":\"REPL-bot\"}" (:body response))))
    (let [response (mock/request :post "/event" {"text" "clj>"})]
      (is (= 201 (:status response)))
      (is (= "application/json; charset=utf8" (get-in (:headers response) "Content-Type")))
      (is (= "{\"text\":\"```\\nEOF while reading\\n```\",\"bot\":\"REPL-bot\"}" (:body response))))
    (let [response (mock/request :post "/event" {"text" "clj>(def var1 5)"})]
      (is (= 201 (:status response)))
      (is (= "application/json; charset=utf8" (get-in (:headers response) "Content-Type")))
      (is (re-matches #"\{\"text\":\"```\\n#'sandbox[0-9]{1,4}/var1\\n```\",\"bot\":\"REPL-bot\"\}" (:body response))))
    (let [response (mock/request :post "/event" {"text" "clj> (while true)"})]
      (is (= 201 (:status response)))
      (is (= "application/json; charset=utf8" (get-in (:headers response) "Content-Type")))
      (is (= "{\"text\":\"```\\nEvaluation timed out in 5 seconds\\n```\",\"bot\":\"REPL-bot\"}" (:body response))))
    (let [response (mock/request :post "/event" {"text" "clj> (+ var1 5)"})]
      (is (= 201 (:status response)))
      (is (= "application/json; charset=utf8" (get-in (:headers response) "Content-Type")))
      (is (= "{\"text\":\"```\\n10\\n```\",\"bot\":\"REPL-bot\"}" (:body response)))))

  (testing "Test 404"
    (is (= 404 (:status (mock/request :post "/info" nil))))
    (is (= 404 (:status (mock/request :post "/heathcheck" nil))))
    (is (= 404 (:status (mock/request :get "/event" {"text" "clj>(+1 1)"}))))
    (is (= 404 (:status (mock/request :get "/" nil))))
    (is (= 404 (:status (mock/request :get "/random" nil))))))