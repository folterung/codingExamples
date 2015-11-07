(function vbar() {
    "use strict";
    
    //TODO-ATIS: Move some of the functionality to a service for reusability
    //TODO-ATIS: Make animations smooth when transitioning between view changes
    //TODO-ATIS: Fix the issue of stacking cards of different lengths that allows the vbar to scroll down
    //TODO-ATIS: Implement a way to bind a click event to the back button
    
    var moduleName = "atis.module",
        directiveName = "atisVbar";
        
    angular.module(moduleName).directive(directiveName, ["VbarService", createDirective]);
    
    /**
    * @constructor
    * @description Creates the atisVbar directove
    * @param VbarService the Atis Vbar Service object
    */
    function createDirective(VbarService) {
        var AMS = VbarService,
            vbarObject = {
                restrict: "A",
                link: link
            };
        
        function link(scope, iElement, iAttrs) {
            AMS.setup(iElement, scope);
        }
        
        return vbarObject;
    }
})();