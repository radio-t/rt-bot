(ns rt-repl-bot.handler
  (:use compojure.core ring.middleware.json)
  (:require [clojure.string :as str]
            [compojure.handler :as handler]))

(defn eval-command [command]
  (with-out-str
    (try
      (print (eval (read-string command)))
      (catch Exception e (print (.getMessage e))))))

(defn handle-command [command]
  {:status 201
   :body   {:text (str "`" (eval-command command) "`")
            :bot  "REPL-bot"}
   })

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