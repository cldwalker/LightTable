(ns lt.behaviors-test
  (:require-macros [cemerick.cljs.test :refer [is deftest testing]])
  (:require [cemerick.cljs.test :as t]
            ;; Adding this only causes more failure as "ReferenceError: Can't find variable: global"
            ;; occurs earlier and thus prevents cemerick from being defined
            #_[lt.object]))

(deftest passing-test
  (is (= 2 (inc 1))))

(deftest failing-test
  (is (seq @lt.object/behaviors)))
