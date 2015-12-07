(function(win) {
    'use strict';

    function Transition(el) {
        this.element = el;
        this.style = el.style;
    }

    function __Transition(el) {
        return new Transition(el);
    }

    Transition.prototype.fade = fade;
    Transition.prototype.move = move;
    Transition.prototype.opacity = opacity;
    Transition.prototype.duration = duration;
    Transition.prototype.timingFunction = timingFunction;
    Transition.prototype.index = index;
    Transition.prototype.translate = translate;
    Transition.prototype.bezier = bezier;
    Transition.prototype.matrix = matrix;
    Transition.prototype.animations = animations;

    win.Transition = __Transition;

    if(win.angular !== undefined) {
        win.angular.Transition = win.Transition;
    }

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

    function matrix(w, r, s, h, x, y) {
        var matVal = 'matrix('+ w +', '+ r +', '+ s +', '+ h +', '+ x +', '+ y +')';
        var originVal = '0 0';

        this.style.webkitTransformOrigin = originVal;
        this.style.mozTransformOrigin = originVal;
        this.style.oTransformOrigin = originVal;
        this.style.transformOrigin = originVal;

        this.style.webkitTransform = matVal;
        this.style.mozTransform = matVal;
        this.style.oTransform = matVal;
        this.style.transform = matVal;
    }

    function animations() {
        var transition = this,
            animations = {
                reveal: reveal
            },
            originalDuration = transition.style.transitionDuration.replace('ms', '');

        function reveal(delay) {
            transition.duration(0).opacity(0);

            setTimeout(function() {
                transition.duration(originalDuration).opacity(1);
            }, delay);
        }

        return animations;
    }
})(window);

var IN = '-in',
    OUT = '-out',
    ACTIVE = '-active';

function applyCSSAnimations(el, classes) {
    for(var i = 0; i < classes.length; i++) {
        el.className += ' ' + classes[i];
    }
}

function cleanupAll(el, animationClass) {
    var identifiers = getClassIndentifiers(animationClass),
        space = ' ',
        empty = '';

    for(var i = 0; i < identifiers.length; i++) {
        el.className = el.className.replace(space + identifiers[i], empty);
        el.className = el.className.replace(identifiers[i], empty);
    }

    el.removeAttribute('style');
}

function removeClass(el, animationClass) {
    var space = ' ',
        empty = '';

    el.className = el.className.replace(space + animationClass, empty);
    el.className = el.className.replace(animationClass, empty);
}

function addClass(el, animationClass) {
    if(el.className.indexOf(animationClass) === -1) {
        el.className += ' ' + animationClass;
    }
}

function getClassIndentifiers(animationClass) {
    return [
        animationClass + IN,
        animationClass + OUT,
        animationClass + ACTIVE
    ];
}

function getDuration(el) {
    var style = window.getComputedStyle(el);

    return style.getPropertyValue('transition-duration');
}

function grabDuraton(el, animationClass) {
    var duration;

    addClass(el, animationClass);
    duration = getDuration(el);
    removeClass(el, animationClass);

    return duration;
}

function getDurationMS(durationVal) {
    return durationVal.replace('s', '') * 1000;
}

function preventAnimation(el, animationClass) {
    setDelay(el, '-' + getDuration(el, animationClass));
}

function clearInlineStyles(el) {
    el.removeAttribute('style', '');
}

function applyCSS(el, prop, val) {
    var prefixes = [
            'webkit',
            'moz',
            'ms',
            'o'
        ],
        capitalizedProp = prop.charAt(0).toUpperCase() + prop.substring(1);

    for(var i = 0; i < prefixes.length; i++) {
        var propName = prefixes[i] + capitalizedProp;

        el.style[propName] = val;
    }

    el.style[prop] = val;
}

function setDelay(el, delay) {
    applyCSS(el, 'transitionDelay', delay);
}