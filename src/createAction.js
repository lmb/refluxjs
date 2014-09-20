var _ = require('./utils');

function alwaysSucceed() {
    this.success.apply(null, arguments);
}

/**
 * Creates an action functor object
 */
module.exports = function(action) {
    var emitter = new _.EventEmitter(),
        functor;

    var events = {
        pending: function() {
            emitter.emit("pending", arguments);
        },
        success: function() {
            emitter.emit("success", arguments);
        },
        failure: function() {
            emitter.emit("failure", arguments);
        }
    };

    if (typeof action === "undefined") {
        action = alwaysSucceed;
    }

    functor = function() {
        var args = arguments;
        _.nextTick(function() {
            functor.preEmit.apply(functor, args);
            if (functor.shouldEmit.apply(functor, args)) {
                action.apply(events, args);
            }
        });
    };

    /**
     * Subscribes the given callback for action triggered
     *
     * @param {Function} success The callback to register as event handler
     * @param {Mixed} [optional] bindContext The context to bind the callback with
     * @param {Function} [optional] pending The pending callback for actions that emit such events
     * @param {Function} [optional] failure The failure callback for actions that emit such events
     * @returns {Function} Callback that unsubscribes the registered event handler
     */
    functor.listen = function(success, bindContext, failure, pending) {
        var handlers = {
            success: _.bindCallback(success, bindContext)
        };

        if (typeof pending !== "undefined") {
            handlers.pending = _.bindCallback(success, bindContext);
        }

        if (typeof failure !== "undefined") {
            handlers.failure = _.bindCallback(failure, bindContext);
        }

        for (var key in handlers) {
            if (handlers.hasOwnProperty(key)) {
                emitter.addListener(key, handlers[key]);
            }
        }

        return function() {
            for (var key in handlers) {
                if (handlers.hasOwnProperty(key)) {
                    emitter.removeListener(key, handlers[key]);
                }
            }
        };
    };

    /**
     * Hook used by the action functor that is invoked before emitting
     * and before `shouldEmit`. The arguments are the ones that the action
     * is invoked with.
     */
    functor.preEmit = function() {};

    /**
     * Hook used by the action functor after `preEmit` to determine if the
     * event should be emitted with given arguments. This may be overridden
     * in your application, default implementation always returns true.
     *
     * @returns {Boolean} true if event should be emitted
     */
    functor.shouldEmit = function() { return true; };

    return functor;

};
