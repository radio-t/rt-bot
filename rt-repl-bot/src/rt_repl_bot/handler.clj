(ns rt-repl-bot.handler
  (:use compojure.core ring.middleware.json)
  (:require [clojure.string :as str]
            [compojure.handler :as handler]
            [ring.util.response :refer [response]]))

(defn handle-command [command]
  (try
    {:status 401
     :body (eval (read-string command))}
    (catch Exception e {:status 401
                        :body e})))

(defroutes app-routes
  (POST "/event" request
    (let [text (or (get-in request [:body "text"]) "")]
      (cond
        (str/starts-with? text "clj>")  (handle-command (subs text 4))
        :else {:status 417}))))

(def app
  (->
    (handler/site app-routes)
    (wrap-json-body)
    (wrap-json-response)))