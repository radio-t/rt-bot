(defproject rt-repl-bot "0.1.0-SNAPSHOT"
  :description "Clojure REPL bot for Radio-T chat"
  :dependencies [[org.clojure/clojure "1.8.0"]
                 [compojure "1.5.1"]
                 [ring/ring-json "0.4.0"]]
  :plugins [[lein-ring "0.9.7"]]
  :ring {:handler rt-repl-bot.handler/app})
