(defproject rt-repl-bot "0.1.0-SNAPSHOT"
  :description "Clojure REPL bot for RT chat"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.8.0"]
                 [compojure "1.5.1"]
                 [ring/ring-json "0.1.2"]]
  :plugins [[lein-ring "0.7.3"]]
  :ring {:handler rt-repl-bot.handler/app})
