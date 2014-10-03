(defproject lighttable "0.1.0"
  :description "Light Table is a new interactive IDE that lets you modify running programs and embed anything from websites to games. It provides the real time feedback we need to not only answer questions about our code, but to understand how our programs really work."
  :url "http://www.lighttable.com/"
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [crate "0.2.5"]
                 [fetch "0.1.1" :exclusions [org.clojure/clojure]]
                 ;[core.async "0.1.0-SNAPSHOT"]
                 [org.clojure/clojurescript "0.0-2138"
                  :exclusions [org.apache.ant/ant]]
                 ]

  :profiles {:dev {:plugins [[com.cemerick/clojurescript.test "0.3.1"]]}}

  :jvm-opts ["-Xmx1g" "-XX:+UseConcMarkSweepGC"] ; cljsbuild eats memory
  :cljsbuild {:builds [{:id "simple"
                        :source-paths ["src"]
                        :compiler {:optimizations :simple
                                   :externs ["externs/jquery.js" "externs/throttle.js" "externs/codemirror.js"]
                                   :source-map "deploy/core/node_modules/lighttable/bootstrap.js.map"
                                   :output-to "deploy/core/node_modules/lighttable/bootstrap.js"
                                   :output-dir "deploy/core/node_modules/lighttable/cljs/"
                                   :pretty-print true}}
                        {:id "test"
                         :source-paths ["src" "test"]
                         :compiler {:optimizations :simple
                                    :externs ["externs/jquery.js" "externs/throttle.js" "externs/codemirror.js"]
                                    :output-to "target/cljs-test.js"
                                    :output-dir "target/out-cljs-test"
                                    :pretty-print true}}]
              :test-commands {"test" ["phantomjs" :runner
                                      "target/cljs-test.js"]}}
  :plugins [[lein-cljsbuild "1.0.1"]]
  :source-paths ["src/"]
  )






