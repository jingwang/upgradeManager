'use strict';

/* Directives */

angular.module('upgradeManager.directives', [])
.directive('compareTo', [function() {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var firstPassword = '#' + attrs.compareTo;
            elem.add(firstPassword).on('keyup', function () {
                scope.$apply(function () {

                    var v = elem.val()===$(firstPassword).val();
                    ctrl.$setValidity('compareto', v);
                });
            });
        }
    };
}])
;

