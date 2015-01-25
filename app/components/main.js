angular.module('trello', ['firebase', 'pickadate']);

angular.module('trello').controller('MainController', ['$scope', 'dataAccessFactory',
  function ($scope, dataAccessFactory) {
    $scope.lists = dataAccessFactory.getLists();
    $scope.cards = dataAccessFactory.getCards();

    $scope.creatorVisible = false;
    $scope.newListTitle = '';

    $scope.flipCreatorVisible = function () {
      $scope.creatorVisible = !$scope.creatorVisible;
    }

    $scope.clear = function () {
      $scope.newListTitle = '';
      $scope.flipCreatorVisible();
    }

    $scope.addList = function () {
      if (!$scope.newListTitle) {
        $scope.newListTitle = "This is a default title!";
      }
      dataAccessFactory.addList($scope.newListTitle);
      $scope.clear();
    }
  }]);