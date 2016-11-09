(ns rt-repl-bot.handler
  (:use compojure.core ring.middleware.json)
  (:import (java.util.concurrent TimeUnit TimeoutException FutureTask))
  (:require [clojure.string :as str]
            [clojure.tools.logging :as log]
            [compojure.handler :as handler]
            [compojure.route :as route]))

(defmacro with-timeout [millis & body]
  `(let [task# (FutureTask. (fn [] ~@body))
         thread# (Thread. task# "repl-thread")]
     (.setDaemon thread# true)
     (try
       (.start thread#)
       (.get task# ~millis TimeUnit/MILLISECONDS)
       (catch TimeoutException _#
         (log/warn "Evaluation timed out in 5 seconds")
         (.cancel task# true)
         "Evaluation timed out in 5 seconds")
       (finally
         (.stop thread#)))))

(defn eval-command [command]
  (with-out-str
    (try
      (print (eval (read-string command)))
      (catch Exception e (print (.getMessage e))))))

(defn handle-command [command]
  (let [eval-result (with-timeout 5000 (eval-command command))]
    (log/info "clj>" command " ~ " eval-result)
    {:status 201
     :body   {:text (str "`" eval-result "`")
              :bot  "REPL-bot"}
     }))

(defroutes app-routes
           (POST "/event" request
             (let [text (or (get-in request [:body "text"]) "")]
               (cond
                 (str/starts-with? text "clj>") (handle-command (subs text 4))
                 :else {:status 417})))
           (route/not-found {:status 404}))

(def app
  (->
    (handler/site app-routes)
    (wrap-json-body)
    (wrap-json-response)))