(function hbar() {
    "use strict";
    
    var moduleName = "atis.module",
    typeName = "HbarService";
    
    angular.module(moduleName).service(typeName, [HbarService]);
    
   /**
    * @constructor
    * @description Creates the Hbar Service
    */
    function HbarService() {
        
        function AtisHbar(element, scope) {

        checkContainer();

            var overflow = {
                button: {
                    exists: function() { return element.children("[hbar-overflow]")[0] !== undefined; },
                    create: function(){
                        element.append("<div hbar-overflow=''></div>");
                    }
                },
                icon: {
                    exists: function() { return element.children("[hbar-overflow]").children("i")[0] !== undefined; },
                    create: function() {
                        element.children("[hbar-overflow]").prepend("<div class='testit glyphicon glyphicon-align-justify'>X</div>");
                    }
                },
                container: {
                    exists: function() { return element.find("[hbar-overflow-container]")[0] !== undefined; },
                    create: function() {
                        element.children("[hbar-overflow]").append("<div hbar-overflow-container=''></div>");
                    },
                    setup: function() {
                        var sections = element.children("[hbar-section]"),
                            overflowContainer = element.find("[hbar-overflow-container]");

                        for(var i = 0; i < sections.length; i++) {
                            var cur = $(sections[i]),
                                curIndex = cur.attr("hbar-section");
                            if(overflowContainer.children("[hbar-section="+curIndex+"]")[0] === undefined) {
                                cur.clone(true).appendTo(overflowContainer);
                            } else {
                                overflowContainer.children("[hbar-section="+curIndex+"]").appendTo(overflowContainer);
                            }
                        }
                    }
                }
            };

            //Check for missing pieces of the overflow and create what is necessary for the hbar to work.
            if(!overflow.button.exists()) { overflow.button.create(); }
            if(!overflow.icon.exists()) { overflow.icon.create(); }
            if(!overflow.container.exists()) { overflow.container.create(); }
            overflow.container.setup();

            //Setup internal values for later reference.
            this.zurück = "back";
            this.element = element;
            this.scope = scope;
            this.name = element.attr("atis-hbar");
            this.getReferences = getReferences;
            this.refresh = refresh;
            this.setWidth = setWidth;

            //Set the initial width of the hbar.
            setWidth();

            //WAR-TODO: Get rid of the need for the internal hbar object and just store the values on the AtisHbar instead.
            this.hbar = {
                    element: element,
                    width: element.width(),
                    left: element.offset().left,
                    top: element.offset().top,
                    sections: this.getReferences(element.children("[hbar-section]")),
                    overflowContainer: element.find("[hbar-overflow-container]"),
                    overflow: {
                        element: element.children("[hbar-overflow]"),
                        width: element.children("[hbar-overflow]").outerWidth(true)
                    },
                    name: this.name,
                    overflowVisible: overflowVisible
                };

            //Setup the hbar for the first time.
            var hbar = this.hbar;
            var transition = Transition(hbar.element[0]);
            checkOverflowItems(hbar, hbar.overflowVisible());
            transition.duration(0).opacity(0);
            hbar.element.css("visibility", "visible"); //Show the hbar once it sets up for the first time so that you don't see weird behavior.

            setTimeout(function() {
                transition.timingFunction('ease-out').duration(300).opacity(1).matrix(1, 0, 0.5, 1, 0, 0);
            }, 0);

            setTimeout(function() {
                transition.opacity(0.5).matrix(1, 0, -0.5, 1, 0, 0);
            }, 300);

            setTimeout(function() {
                transition.opacity(1).matrix(1, 0, 0, 1, 0, 0);
            }, 600);

            setTimeout(function() {
                transition.element.removeAttribute('style');
                hbar.element.css("visibility", "visible");
            }, 900);

            //Refresh the hbar on window resize.
            $(window).resize(function() { refresh(); });

            //Bind the onclick event to the overflow button.
            hbar.overflow.element.on("click.hbar-overflow-click", function(e) {
                var overflowContainer = $(e.target).attr("hbar-overflow-container") ? $(e.target) : $(e.target).parents("[hbar-overflow-container]");
                if(overflowContainer[0] === undefined) element.find("[hbar-overflow-container]").toggle();

                e.stopPropagation(); //Necessary to prevent the document onclick event from firing immediately.

                $(document).off("click.overflow-"+hbar.name);
                $(document).on("click.overflow-"+hbar.name, function(e) {
                    var target = $(e.target),
                        overflowButton = target.attr("hbar-overflow") ? target : target.parents("[hbar-overflow]"),
                        overflowContainer = target.attr("hbar-overflow-container") ? target : target.parents("[hbar-overflow-container]");

                    if(overflowButton[0] === undefined) {
                        if(overflowContainer[0] === undefined) {
                            element.find("[hbar-overflow-container]").hide();
                            $(document).off("click.overflow-"+hbar.name);
                        }
                    }
                });
            });

            /**
             * @name buildContainer
             * @description Creates a wrapper around the atis-hbar to ensure that it has white-space:nowrap applied to it.
             * @function
             */
            function checkContainer() {
                var parentContainer = element.parent();
                if(parentContainer.css("white-space") === "normal") parentContainer.css("white-space", "nowrap");
            }

            /**
             * @name refresh
             * @description Refreshes the hbar on the page.
             * @function
             */
            function refresh() {
                hbar.width = element.width();
                hbar.left = element.offset().left;
                hbar.top = element.offset().top;
                
                hbar.element.children("[hbar-section]").removeClass("hide");
                hbar.sections = getReferences(hbar.element.children("[hbar-section]"));
                
                setWidth();
                checkOverflowItems(hbar, hbar.overflowVisible());
            }
            
            /**
             * @name overflowVisible
             * @description Returns a boolean value that tells whether the overflow should be visible or not.
             * @function
             * 
             * @returns {Boolean}
             */
            function overflowVisible() {
                var compoundedThreshold = 0,
                    availableSpace = element.innerWidth() - 30;
                
                for(var i = 0; i < hbar.sections.length; i++) {
                    var cur;
                    
                    cur = hbar.sections[i];
                    compoundedThreshold += hbar.sections[i].width;
                    
                    if(compoundedThreshold >= availableSpace) {
                        overflowVisible = true;
                        break;
                    } else {
                        overflowVisible = false;
                    }
                }
                
                return overflowVisible;
            }
            
            /**
             * @name checkOverflow
             * @description Checks for elements that should be overflowed into the overflow container.
             * @function
             * 
             * @param {Object} hbar
             * @param {Boolean} overflow
             */
            function checkOverflowItems(hbar, overflow) {
                var compoundedThreshold = 0,
                    availableSpace = hbar.element.innerWidth() - 30,
                    overflowWidth = hbar.overflow.width;
                
                if(overflow) {
                    hbar.element.children("[hbar-overflow]").css("display", "inline-block");
                    availableSpace -= overflowWidth;
                } else {
                    hbar.element.children("[hbar-overflow]").css("display", "none");
                }
                
                for(var i = 0; i < hbar.sections.length; i++) {
                    var cur = hbar.sections[i], 
                        curOverflow = hbar.element.find("[hbar-overflow] [hbar-section="+ hbar.sections[i].element.attr("hbar-section") +"]");
                        
                    compoundedThreshold += hbar.sections[i].width;
                    
                    if(compoundedThreshold < availableSpace) {
                        cur.element.css("display", "inline-block");
                        curOverflow.hide();
                    } else {
                        cur.element.hide();
                        curOverflow.show();
                    }
                }
            }
            
            /**
             * @name getReferences
             * @description Gets the initial size of all of the hbar sections so that it knows how to restore them.
             * @function
             * 
             * @param {Array} array
             * @returns {Array}
             */
            function getReferences(array) {
                var refArray = [];
                
                for(var i = 0; i < array.length; i++) {
                    var cur = $(array[i]);
                    if(scope.$eval(cur.attr("ng-show")) !== false) {
                        cur.removeClass("ng-hide");
                        element.find("[hbar-overflow] [hbar-section="+ cur.attr("hbar-section") +"]").removeClass("ng-hide");
                        cur.attr("index", i);
                        refArray.push({
                            element:cur,
                            width:cur.outerWidth(true)
                        });
                    } else {
                        element.find("[hbar-overflow] [hbar-section="+ cur.attr("hbar-section") +"]").hide();
                    }
                }
                
                return refArray;
            }
            
            /**
             * @name setWidth
             * @description Sets the width of the hbar.
             * @function
             */
            function setWidth() {
                var winWidth = $(window).width();
                element.width(winWidth - element.offset().left);
            }
        }
        
        AtisHbar.prototype = {
            refresh: function() {
                //this.element.children("[hbar-section]").removeClass("hide");
                //this.hbar.sections = this.getReferences(this.element.children("[hbar-section]"));
                //window.console.log(this.hbar.sections);
                this.setWidth();
                this.refresh();
            },
            setWidth: function() {
                this.setWidth();
            },
            overflow: function(){
                var hbar = this.hbar;
                
                return {
                    close: function() { hbar.overflowContainer.hide(); },
                    open: function() { hbar.overflowContainer.show(); }
                };
            }
        };
        
        var HbarService = {
            map: {},
            setup: function(menuElement, menuScope) {
                HbarService.map[menuElement.attr("atis-hbar")] = new AtisHbar(menuElement, menuScope);
            },
            get: function(name) {
                return name === undefined ? HbarService.map : HbarService.map[name];
            }
        };
        
        return HbarService;
    }
})();