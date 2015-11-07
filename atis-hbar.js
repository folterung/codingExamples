(function hbar() {
    "use strict";
    
    var moduleName = "atis.module",
    typeName = "atisHbar";
    
    angular.module(moduleName).directive(typeName, ["$timeout", "HbarService", atisHbar]);
    
   /**
    * @constructor
    * @description Creates the atisHbar directive
    * @param {Object} timeout Angular $timeout
    * @param {Object} hbar HbarService
    */
    function atisHbar(timeout, hbar) {
        return {
            replace:false,
            link: linkFn
        };
        
        function linkFn(scope, element, attrs) {
            timeout(function() { hbar.setup(element, scope); });
        }
    }
})();