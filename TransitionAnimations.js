(function(win) {
    'use strict';

    win.Transition.stagger = stagger;

    function stagger(elements, delay, interval, duration, timingFunction, x, y, z) {
        for(var i = 0; i < elements.length; i++) {
            var transition = Transition(elements[i]);

            transition.duration(0).opacity(0).move(x, y, z);
            _createTimeout(transition, delay + (interval * i));
        }

        function _createTimeout(transition, delay) {
            setTimeout(function() {
                transition.duration(duration).timingFunction(timingFunction).opacity(1).move(0, 0, 0);
            }, delay);
        }
    }
})(window);