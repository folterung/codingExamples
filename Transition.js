function Transition(el) {
    function __Transition(el) {
        this.element = el;
        this.style = el.style;
    }

    __Transition.prototype.fade = fade;
    __Transition.prototype.move = move;
    __Transition.prototype.opacity = opacity;
    __Transition.prototype.duration = duration;
    __Transition.prototype.timingFunction = timingFunction;
    __Transition.prototype.index = index;
    __Transition.prototype.translate = translate;
    __Transition.prototype.bezier = bezier;

    return new __Transition(el);

    function fade(endVal) {
        this.opacity(endVal);

        return this;
    }

    function move(x, y, z) {
        this.translate(x, y, z);

        return this;
    }

    function opacity(val) {
        this.style.opacity = val;
        this.style.filter = 'alpha(opacity='+val*100+')';

        return this;
    }

    function duration(val) {
        val = val + 'ms';

        this.style.webkitTransitionDuration = val;
        this.style.mozTransitionDuration = val;
        this.style.oTransitionDuration = val;
        this.style.transitionDuration = val;

        return this;
    }

    function timingFunction(val) {
        this.style.webkitTransitionTimingFunction = val;
        this.style.mozTransitionTimingFunction = val;
        this.style.oTransitionTimingFunction = val;
        this.style.transitionTimingFunction = val;

        return this;
    }

    function translate(x, y, z) {
        var val = 'translate3d('+x+'px, '+y+'px, '+z+'px)';

        this.style.webkitTransform = val;
        this.style.mozTransform = val;
        this.style.oTransform = val;
        this.style.transform = val;

        return this;
    }

    function index(val) {
        this.style.zIndex = val;

        return this;
    }

    function bezier(a, b, c, d) {
        this.timingFunction('cubic-bezier('+a+','+b+','+c+','+d+')');

        return this;
    }
}