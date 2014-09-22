var _ = require('./utils');

function bindToComponent(callback, component) {
    if (typeof callback === 'undefined') {
        return undefined;
    }

    return function() {
        if (component.isMounted()) {
            callback.apply(null, arguments);
        }
    };
}

module.exports = {
    /**
     * Set up the mixin before the initial rendering occurs. Event listeners
     * and callbacks should be registered once the component successfully
     * mounted (as described in the React docs).
     */
    componentWillMount: function() {
        this.subscriptions = [];
    },


    /**
     * Subscribes the given callback for action triggered
     *
     * @param {Action|Store} listenable An Action or Store that should be
     *  listened to.
     * @param {Function} success The callback to register as event handler
     * @param {Function} [optional] pending The callback to register as pending handler if the listenable supports it
     * @param {Function} [optional] failure The callback to register as failure handler if the listenable supports it
     */
    listenTo: function(listenable, success, failure, pending) {
        var unsubscribe = listenable.listen(
            bindToComponent(success, this),
            null,
            bindToComponent(failure, this),
            bindToComponent(pending, this)
        );

        this.subscriptions.push(unsubscribe);

        _.handleDefaultCallback(this, listenable, success);
    },

    componentWillUnmount: function() {
        this.subscriptions.forEach(function(unsubscribe) {
            unsubscribe();
        });
        this.subscriptions = [];
    }
};
