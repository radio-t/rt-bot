(defproject rt-repl-bot "1.0.0"
  :description "Clojure REPL bot for Radio-T chat"
  :min-lein-version "2.0.0"
  :dependencies [[org.clojure/clojure "1.8.0"]
                 [org.clojure/tools.logging "0.3.1"]
                 [ch.qos.logback/logback-classic "1.2.3"]
                 [compojure "1.5.2"]
                 [ring/ring-json "0.4.0"]
                 [ring/ring-defaults "0.2.3"]
                 [clojail "1.0.6"]
                 [metrics-clojure "2.9.0"]
                 [metrics-clojure-ring "2.9.0"]]
  :jvm-opts ["-Djava.security.policy=.java.policy"]
  :plugins [[lein-ring "0.11.0"]]
  :ring {:handler rt-repl-bot.handler/app :port 8080}
  :profiles
  {:dev {:dependencies [[javax.servlet/servlet-api "2.5"]
                        [ring/ring-mock "0.3.0"]]}})
