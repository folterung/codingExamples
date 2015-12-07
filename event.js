(function(window) {
    'use strict';

    var prefixes = [
        'webkit',
        'moz',
        'MS',
        'o',
        ''
    ];

    function Event() {}

    Event.prototype.listen = listen;
    Event.prototype.dispatch = dispatch;
    Event.prototype.remove = remove;
    Event.prototype.bind = bind;
    Event.prototype.unbind = unbind;

    if(_undefined(window.kw)) { window.kw = {}; }

    window.kw.Event = new Event();

    function listen(eventName, handler) {
        var e = this;

        if(!_exists(e, eventName)) { e[eventName] = []; }

        e[eventName].push(handler);
    }

    function dispatch(eventName, data, options) {
        var e = this;
        var handlers = e[eventName];

        if(_undefined(handlers)) {
            throw new ReferenceError('Event to dispatch not found');
        } else {
            for(var i = 0; i < handlers.length; i++) {
                handlers[i](data);

                if(_defined(options) && _isTrue(options.cancel)) { break; }
            }
        }
    }

    function remove(eventName) {
        delete this[eventName];
    }

    function bind(el, event, cb) {
        if(_undefined(el)) { throw new ReferenceError('No matching element found to bind to'); }

        for(var i = 0; i < prefixes.length; i++) {
            if(!prefixes[i]) { event = event.toLowerCase(); }
            el.addEventListener(prefixes[i] + event, cb);
        }
    }

    function unbind(el, event, cb) {
        for(var i = 0; i < prefixes.length; i++) {
            if(!prefixes[i]) { event = event.toLowerCase(); }
            el.removeEventListener(prefixes + event, cb);
        }
    }

    function _isTrue(val) {
        return (val === true);
    }

    function _defined(obj) {
        return (obj !== undefined && obj !== null);
    }

    function _undefined(obj) {
        return (obj === undefined || obj === null);
    }

    function _exists(obj, prop) {
        return obj.hasOwnProperty(prop);
    }
})(window);