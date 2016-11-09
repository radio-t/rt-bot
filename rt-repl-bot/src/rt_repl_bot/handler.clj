(ns rt-repl-bot.handler
  (:use compojure.core ring.middleware.json)
  (:require [clojure.string :as str]
            [compojure.handler :as handler]
            [ring.util.response :refer [response]]))

(defn handle-command [command]
  (try
    (let [result (eval (read-string command))]
      {:status 201
       :body   {:text (str "<span>" (prn-str result) "</span>")
                :bot  "REPL-bot"}})
    (catch Exception e
      (let [message (.getMessage e) stacktrace (str/join "\n\t" (map str (.getStackTrace e)))]
        {:status 400
         :body   {:text (str "<span>" message "\n" stacktrace "</span>")
                  :bot  "REPL-bot"}}))))

(defroutes app-routes
           (POST "/event" request
             (let [text (or (get-in request [:body "text"]) "")]
               (cond
                 (str/starts-with? text "clj>") (handle-command (subs text 4))
                 :else {:status 417}))))

(def app
  (->
    (handler/site app-routes)
    (wrap-json-body)
    (wrap-json-response)))