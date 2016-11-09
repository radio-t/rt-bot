(ns rt-repl-bot.handler-test
  (:require [clojure.test :refer :all]
            [rt-repl-bot.handler :refer :all]))

(defn request [resource body]
  (app {:request-method :post :uri resource :body body}))

(deftest handler-test
  (testing "Should handle random messages"
    (is (= 417 (:status (request "/event" "random body"))))
    (is (= 417 (:status (request "/event" {"text" "randon text"}))))
    (is (= 201 (:status (request "/event" {"text" "clj>(+1 1)"}))))))
