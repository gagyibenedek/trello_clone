angular.module('trello', ['firebase']);

angular.module('trello').controller('MainController', ['$scope', '$firebase',
  function ($scope, $firebase) {
    var ref = new Firebase("https://amber-heat-6761.firebaseio.com/");
    var sync = $firebase(ref);

    $scope.messages = sync.$asArray();
    $scope.addMessage = function(text) {
      $scope.messages.$add({text: text});
    }
}]);