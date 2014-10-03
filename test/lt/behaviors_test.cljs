(ns lt.behaviors-test
  (:require [lt.object :as object]))

(enable-console-print!)

(println "Running tests...")

(assert (= 2 (inc 1)))

(assert (seq @lt.object/behaviors))
