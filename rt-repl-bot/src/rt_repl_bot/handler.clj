(ns rt-repl-bot.handler
  (:use compojure.core ring.middleware.json ring.middleware.session)
  (:import (java.util.concurrent TimeoutException)
           (java.io StringWriter))
  (:require [clojure.string :as str]
            [clojure.tools.logging :as log]
            [compojure.handler :as handler]
            [compojure.route :as route]
            [clojail.core :refer [sandbox]]
            [clojail.testers :refer [secure-tester-without-def]]))

(defn eval-command [sandbox command]
  (with-open [out (StringWriter.)]
    (try
      (let [form (binding [*read-eval* false] (read-string command))
            eval-result (sandbox form {#'*out* out})]
        (str/join "\n" [out eval-result]))
      (catch TimeoutException _
        (print "Evaluation timed out in 5 seconds"))
      (catch Exception e
        (.getMessage e)))))

(defn handle-command [sandbox command]
  (let [eval-result (eval-command sandbox command)]
    (log/info "clj>" command " ~ " eval-result)
    {:status  201
     :body    {:text (str "`" eval-result "`")
               :bot  "REPL-bot"}
     :session {"sb" sandbox}
     }))

(defn create-sandbox []
  (sandbox secure-tester-without-def
           :timeout 5000
           :init '(do (require '[clojure.repl :refer [doc source]])
                      (future (Thread/sleep 600000)
                              (-> *ns*
                                  .getName
                                  remove-ns)))))

(defroutes app-routes
           (GET "/info" []
             {:status 200
              :body   {:author   "SimY4",
                       :info     "Clojure REPL bot",
                       :commands ["clj> (do\n\t(prn \"Весь текст после префикса 'clj>' будет вычислен как форма Clojure. Например:\")\n\t(+ 5 5))"]}})
           (POST "/event" request
             (let [text (or (get-in request [:body "text"]) "")]
               (cond
                 (str/starts-with? text "clj>") (let [sandbox (get-in request [:session "sb"] (create-sandbox))]
                                                  (handle-command sandbox (subs text 4)))
                 :else {:status 417})))
           (route/not-found {:status 404}))

(def app
  (->
    (handler/site app-routes)
    (wrap-json-body)
    (wrap-session)
    (wrap-json-response)))