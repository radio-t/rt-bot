(ns rt-repl-bot.handler
  (:use compojure.core ring.middleware.json ring.middleware.session)
  (:import (java.util.concurrent TimeoutException)
           (java.io StringWriter))
  (:require [clojure.string :as str]
            [clojure.tools.logging :as log]
            [compojure.handler :as handler]
            [compojure.route :as route]
            [clojail.core :refer [sandbox]]
            [clojail.testers :refer [secure-tester-without-def]]
            [amalloy.ring-buffer :refer [ring-buffer]]))

(def most-recent-calls (atom (ring-buffer 50)))

(defn eval-command [sandbox command]
  (with-open [out (StringWriter.)]
    (try
      (let [form (binding [*read-eval* false] (read-string command))
            eval-result (sandbox form {#'*out* out})
            out-string (.toString out)]
        (if (.isEmpty out-string)
          eval-result
          (str out-string "\n" eval-result)))
      (catch TimeoutException _
        (print "Evaluation timed out in 5 seconds"))
      (catch Exception e
        (.getMessage e)))))

(defn handle-command [sandbox command]
  (let [eval-result (eval-command sandbox command)]
    (log/info "clj>" command " ~ " eval-result)
    {:status  201
     :body    {:text (str "```\n" eval-result "\n```")
               :bot  "REPL-bot"}
     :session {"sb" sandbox}
     }))

(defn create-sandbox []
  (sandbox
    secure-tester-without-def
    :timeout 5000
    :init '(do
             (require '[clojure.repl :refer [doc source]])
             (future
               (Thread/sleep 600000)
               (-> *ns*
                   .getName
                   remove-ns)))
    ))

(defn wrap-statistics [handler]
  (wrap-routes
    handler
    (fn [route-handler]
      (fn [request]
        (let [response (route-handler request)]
          (swap! most-recent-calls conj (str (:compojure/route request) " ~ " (:status response)))
          response
          )))))

(defroutes
  app-routes
  (GET "/healthcheck" []
    {:status 200
     :body   {:status     "OK"
              :statistics (sequence (deref most-recent-calls))}
     })
  (GET "/info" []
    {:status 200
     :body   {:author   "Alex 'SimY4' Simkin"
              :info     "Clojure REPL bot"
              :commands ["clj> (do\n  (prn \"Весь текст после префикса 'clj>' будет вычислен как форма Clojure. Например:)\n  (+ 5 5))\n```\n10\n```"]}
     })
  (POST "/event" {body :body session :session}
    (let [text (or (get body "text") "")]
      (cond
        (str/starts-with? text "clj>") (let [sandbox (get session "sb" (create-sandbox))]
                                         (handle-command sandbox (subs text 4)))
        :else {:status 417})))
  (route/not-found {:status 404}))

(def app
  (->
    (handler/site app-routes)
    (wrap-json-body)
    (wrap-session)
    (wrap-statistics)
    (wrap-json-response)))