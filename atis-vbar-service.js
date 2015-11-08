(function vbar() {
    "use strict";
    
    var moduleName = "atis.module",
        serviceName = "VbarService";
        
    angular.module(moduleName).service(serviceName, ["$q", createService]);
    
    /**
    * @constructor
    * @description Creates the Vbar Service
    * @param {Object} $q Angular $q
    */
    function createService($q) {
        
        function AtisVbar(element, scope) {
            
            $(element).css({
                position: "fixed",
                overflowX: "hidden",
                overflowY: "auto"
            });

            var vbar = this;
            this.isOpen = true;
            this.animating = false;
            this.name = element.attr("atis-vbar");
            this.disabled = false;
            var keyMapping = {};
            var sections = element.find("[vbar-section]");
            var links = element.find("[vbar-link]"); 
            var cards = element.find("[vbar-card]");
            var backLinks = element.find("[vbar-back]");
            var start = {};
            var delta = {};
            var chart = [];
            var isScrolling;
            this.events = {
                handleEvent: function(event) {
                    event.touches = event.touches || [event];
                    switch (event.type) {
                        case 'touchstart': this.start(event); break;
                        case 'touchmove': this.move(event); break;
                        case 'touchend': this.end(event); break;
                        case 'MSPointerDown': this.start(event); break;
                        case 'MSPointerMove': this.move(event); break;
                        case 'MSPointerUp': this.end(event); break;
                    }
                },
                start: function(event) {
                    //event.preventDefault(); //Should prevent the default webpage dragging
                    var touches = event.touches[0];

                    start = {
                        x: touches.pageX,
                        y: touches.pageY,
                        prevX:0,
                        vbarX: ((vbar.el.css("transform")).split(", ")[4]).toInt(),
                        leftBoundary: -300,
                        rightBoundary: 0,
                        time: +new Date
                    };
                    chart = [];
                        

                    isScrolling = undefined;

                    delta = {};

                    document.body.addEventListener('touchmove', this, false);
                    document.body.addEventListener('touchend', this, false);
                    document.body.addEventListener('MSPointerMove', this, false);
                    document.body.addEventListener('MSPointerUp', this, false);
                },
                move: function(event) {
                    //event.preventDefault();
                    if ( event.touches.length > 1 || event.scale && event.scale !== 1) return;

                    var touches = event.touches[0];

                    delta = {
                      x: touches.pageX - start.x,
                      y: touches.pageY - start.y
                    };

                    if ( typeof isScrolling == 'undefined') {
                      isScrolling = !!( isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
                    }
                    if (!isScrolling) {
                        //TODO-ATIS: Write something that runs faster.
                        event.preventDefault();
                        var newX = start.vbarX + delta.x;
                        
                        var currentTime = (event.timeStamp / 1000);
                        var breakPoint;
                        chart.push([touches.pageX, currentTime]);
                        
                        for(var i = chart.length-1; i >= 0; i--) {
                            var interval = currentTime - chart[i][1];
                            if(interval > 30) { breakPoint = i; break; }
                        }
                        
                        chart = chart.slice(breakPoint, chart.length);
                        
                        if(newX >= start.leftBoundary && newX <= start.rightBoundary) {
                            start.newX = newX;
                            atis.move(element[0], newX, 0);
                        }
                    }

                },
                end: function(event) {
                    if(delta.x) {
                        var end = event.pageX;
                        var distance = Math.abs(end - chart[0][0]);
                        var flickDetected = false;
                        if(distance > 20) { flickDetected = true; }
                        var dir = delta.x > 0;
                        var vbarWidth = vbar.el.width();
                        if(flickDetected) {
                            if(dir) {
                                vbar.open(300);
                            } else {
                                vbar.close(300);
                            }
                        } else {
                            if(start.newX) {
                                if(dir) {
                                    if((vbarWidth - Math.abs(start.newX)) > (vbarWidth/2)) {
                                        vbar.open(300);
                                    } else {
                                        vbar.close(300);
                                    }
                                } else {
                                    if(Math.abs(start.newX) > (vbarWidth/2)) {
                                        vbar.close(300);
                                    } else {
                                        vbar.open(300);
                                    }
                                }
                            }
                        }
                    }
                    document.body.removeEventListener('touchmove', vbar.events, false);
                    document.body.removeEventListener('touchend', vbar.events, false);
                    document.body.removeEventListener('MSPointerMove', vbar.events, false);
                    document.body.removeEventListener('MSPointerUp', vbar.events, false);
                }
            };

            //document.body.addEventListener('touchstart', vbar.events, false);
            //TODO-ATIS: Change this implementation so that it doesn't auto bind the events
//            if(atis.browser.win8touch || atis.browser.touch) { 
////                $(document).on("touchstart", vbar.events);
////                $(document).on("MSPointerDown", vbar.events);
//                document.body.addEventListener('touchstart', vbar.events, false);
//                document.body.addEventListener('MSPointerDown', vbar.events, false); 
//            }
                
            var translateString = "translateX(" + (element.width() + 5) + "px)";
            $("[vbar-card]").css({
                transform: translateString,
                MsTransform: translateString,
                MozTransform: translateString,
                OTransform: translateString,
                WebkitTransform: 'translate(' + (element.width() + 5) + 'px ,0)' + 'translateZ(0)',
                overflowY: "auto",
                overflowX: "hidden",
                width: element.width() + "px"
            });

            for(var i = 0; i < backLinks.length; i++) {
                $(backLinks[i]).prepend("<i vbar-back-icon='' class='glyphicon glyphicon-chevron-left'></i> Back");
            }

            for(var i = 0; i < cards.length; i++) {
                setupCard($(cards[i]), element.attr("default"));
            }

            for(var i = 0; i < sections.length; i++) {
                $(sections[i]).prepend("<h1>" + $(sections[i]).attr("vbar-section") + "</h1>");
            }

            //Setup the link text and bind the links to show the created vbar card
            for(var i = 0; i < links.length; i++) {
                var curLink = $(links[i]),
                    arrow = curLink.attr("arrow") ? curLink.attr("arrow") : "",
                    classToAdd = arrow === "right" ? "vbar-link-icon-forward=''" : "vbar-link-icon-backward=''";

                if(arrow === "right") {
                    curLink.append("<i "+classToAdd+" class='glyphicon glyphicon-chevron-"+arrow+"'></i>&nbsp;");
                } else if(arrow === "left") {
                    curLink.prepend("<i "+classToAdd+" class='glyphicon glyphicon-chevron-"+arrow+"'></i>&nbsp;");
                }

                curLink.on('click', function(e) {
                    var vbarLink = $(e.currentTarget),
                        animate = vbarLink.attr("animate") ? vbarLink.attr("animate").toBool() : false;

                    vbar.goTo($(e.currentTarget).attr("vbar-link"), animate, vbarLink[0].hasAttribute('vbar-back'));
                });
            }
            
            //Set values for the vbar object
            this.el = element;
            this.vm = scope;
            this.keyMap = keyMapping;

            element.addClass('vbar-active');
            
            function setupCard(card, defaultCardId) {
                var id = card.attr("vbar-card");
            
                keyMapping[id] = {card:card};
                card.css({
                    position: "absolute",
                    top: "0px",
                    bottom:"0px"
                });
                var translateString = "translateX(0px)";
                if(defaultCardId === id) {
                    card.css({
                        transform: translateString,
                        MsTransform: translateString,
                        MozTransform: translateString,
                        OTransform: translateString,
                        WebkitTransform: 'translate(0px ,0)' + 'translateZ(0)',
                        zIndex: 1000
                    });
                    card.addClass("current-vbar-card");
                }
            }
        }

        AtisVbar.prototype = {
            disable: function() {
                this.disabled = true;
                this.el.css("display", "none");
            },
            setVisible: function(visible) {
                var vbar = this;
                if(vbar.disabled) return;

                if(visible === false) {
                    vbar.el.css("display", "none");
                } else {
                    vbar.el.css("display", "block");
                }
            },
            open: function(duration) {
                if(!duration) duration = 0;
                var vbar = this;
                var defer = $q.defer();
                atis.move(vbar.el[0], 0, duration, function() {
                    vbar.isOpen = true;
                    defer.resolve();
                    setTimeout(function() {
                        vbar.vm.$root.$apply();
                    }, 0);
                });

                return defer.promise;
            },
            close: function(duration) {
                if(!duration) duration = 0;
                var vbar = this;
                var defer = $q.defer();
                atis.move(vbar.el[0], -300, duration, function() {
                    vbar.isOpen = false;
                    defer.resolve();
                    setTimeout(function() {
                        vbar.vm.$root.$apply();
                    }, 0);
                });

                return defer.promise;
            },
            toggle: function(duration) {
                if(!duration) duration = 0;
                var vbar = this;

                if(vbar.isOpen) {
                    vbar.close(duration);
                } else {
                    vbar.open(duration);
                }
            },
            swipe: function() {
                var vbar = this;
                return {
                    enable: function() {
                        document.body.addEventListener('touchstart', vbar.events);
                        document.body.addEventListener('MSPointerDown', vbar.events);
                    },
                    disable: function() {
                        document.body.removeEventListener('touchstart', vbar.events);
                        document.body.removeEventListener('MSPointerDown', vbar.events);
                    }
                };
            },
            goTo: function(name, animate, isBack) {
                var vbar = this,
                    card = vbar.keyMap[name].card,
                    prevCard = $(".current-vbar-card"),
                    prevCardId = prevCard.attr("vbar-card"),
                    transition = Transition(card[0]),
                    duration = animate ? 250 : 0,
                    endPoint = isBack ? -300 : 300;

                if(prevCardId === name || vbar.animating) { return; }

                vbar.animating = true;
                prevCard.removeClass("current-vbar-card");
                card.addClass("current-vbar-card");

                transition.index(1000);
                resetCard(prevCard);

                transition.duration(0).duration(0).move(endPoint, 0, 0);

                setTimeout(function() {
                    transition.duration(duration).timingFunction('ease-out').fade(1).move(0, 0, 0);
                }, 0);

                setTimeout(function() {
                    vbar.animating = false;
                }, 350);

                function resetCard(prevCard) {
                    var vbarWidth = $("[atis-vbar]").width(),
                        transition = Transition(prevCard[0]),
                        endPoint = isBack ? (vbarWidth +5) : -(vbarWidth +5);

                    transition.duration(300).timingFunction('ease-out').fade(0).move(endPoint, 0, 0).index(0);

                    setTimeout(function() {
                        transition.duration(0).move(endPoint, 0, 0);
                    }, 300);
                }
            }
        };
        
        var atisVbar = {
            vbarMap: {},
            setup: function(vbarElement, vbarScope) {
                atisVbar.vbarMap[vbarElement.attr("atis-vbar")] = new AtisVbar(vbarElement, vbarScope);
            },
            get: function(name) {
                return atisVbar.vbarMap[name];
            }
        };
        
        return atisVbar;
    }

    var atis = {
        move: function(el, x, duration, cb) {
            var transition = Transition(el);

            transition.duration(duration).opacity(1).translate(x, 0, 0);

            if(angular.isDefined(cb) && angular.isFunction(cb)) {
                cb();
            }
        }
    };

    String.prototype.toBool = function() {
        var stringVal = this.toLowerCase();

        if(stringVal === 'true') {
            return true;
        } else if(stringVal === 'false') {
            return false;
        }

        return undefined;
    };
})();