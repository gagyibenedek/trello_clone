angular.module('trello').directive('contenteditable', function () {
  return {
    require: 'ngModel',
    scope: {
      ngModel: '=',
      placeholder: '@'
    },
    link: function (scope, element, attrs, ctrl) {
      // view -> model

      element.bind('blur', function () {
        var clean = element.html().replace(new RegExp(/\s/g),'')
          .replace(new RegExp("&nbsp;", "g"), "")
          .replace(new RegExp("<br>", "g"), "");
        if(!clean.length){
          element.html('');
        }

        scope.$apply(function () {
          ctrl.$setViewValue(element.html());
        });
      });

      element.bind('focus', function () {
        if(element.html() === ''){
          element.html('<br />');
        }
      });

      ctrl.$render = function () {
        element.html(ctrl.$viewValue || '');
      };

      ctrl.$render();
    }
  };
});