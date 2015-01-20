angular.module('trello', ['firebase']);


angular.module('trello').controller('MainController', ['$scope', '$firebase',
  function ($scope, $firebase) {
    var ref = new Firebase("https://amber-heat-6761.firebaseio.com/");
    var sync = $firebase(ref);

    $scope.cards = sync.$asArray();
    $scope.addMessage = function(text) {
      $scope.cards.$add({text: text});
    }

    $scope.editCard = function(card){
      $scope.cards.$save(card);
    }

    $scope.deleteCard = function(card){
      $scope.cards.$remove(card);
    }
}]);

angular.module('trello').directive('card', function(){
  return {
    restrict: 'A',
    require: ['^ngModel'],
    scope: {
      ngModel: '=',
      delete: '&',
      edit: '&'
    },
    templateUrl: 'app/scripts/card/card.html',
    link: function(scope, ele, attr){
      console.log(scope.ngModel.text);
    }
  }
});