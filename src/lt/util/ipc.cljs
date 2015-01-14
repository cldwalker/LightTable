(ns lt.util.ipc
  "Util functions for the ipc renderer - https://github.com/atom/atom-shell/blob/master/docs/api/ipc-renderer.md")

(def ipc (js/require "ipc"))

(defn send
  "Delegates to ipc.send which asynchronously sends args to the browser process's channel."
  [channel & args]
  (apply (.-send ipc) channel (clj->js args)))

(defn on
  "Delegates to ipc.on which defines a callback to fire for the given channel."
  [channel cb]
  (.on ipc channel cb))

;; Only for debugging ipc messages sent and received
(when (aget js/process.env "IPC_DEBUG")
  (let [old-send send
        old-on on]
    (def send (fn [& args]
                (prn "CLIENT->" args)
                (apply old-send args)))
    (def on (fn [channel cb]
              (old-on channel (fn [& args]
                                (prn "->CLIENT" channel args)
                                (apply cb args)))))))
