angular.module('trello', ['firebase']);

angular.module('trello').controller('MainController', ['$scope', 'dataAccessFactory',
  function ($scope, dataAccessFactory) {
    $scope.list = dataAccessFactory.createNewList();
    $scope.list.title = "I'm a list!";
}]);;angular.module('trello')
  .factory('dataAccessFactory', ['$firebase', function($firebase){
    var ref = new Firebase("https://amber-heat-6761.firebaseio.com/");
    var sync = $firebase(ref);

    var daf = {};

    daf.createNewList = function(){
      var list =  sync.$asArray();
      return list;
    }

    daf.addCard = function (list, card) {
      list.$add(card);
    }

    daf.editCard = function (list, card) {
      list.$save(card);
    }

    daf.deleteCard = function (list, card) {
      list.$remove(card);
    }

    return daf;
  }]);;angular.module('trello').directive('card', function () {
  return {
    restrict: 'A',
    require: ['^ngModel'],
    scope: {
      ngModel: '=',
      delete: '&',
      edit: '&'
    },
    templateUrl: 'app/components/card/card.html',
    link: function (scope, ele, attr) {
      scope.readOnly = true;

      scope.editCard = function () {
        scope.edit(scope.ngModel);
        scope.flipReadOnly();
      }

      scope.flipReadOnly = function () {
        scope.readOnly = !scope.readOnly;
      }
    }
  }
});;angular.module('trello').directive('list', ['dataAccessFactory', function (dataAccessFactory) {
  return {
    restrict: 'A',
    require: ['^ngModel'],
    scope: {
      ngModel: '='
    },
    templateUrl: 'app/components/list/list.html',
    link: function (scope, ele, attr) {
      scope.newCard = {};
      scope.creatorVisible = false;

      scope.flipCreatorVisible = function(){
        scope.creatorVisible = !scope.creatorVisible;
      }

      scope.clear = function(){
        scope.newCard = {};
        scope.flipCreatorVisible();
      }

      scope.addCard = function () {
        if(scope.newCard.title === undefined && scope.newCard.description !== undefined){
          scope.newCard.title = 'Title'; //hardcoded default title :(
        }
        dataAccessFactory.addCard(scope.ngModel, scope.newCard);
        scope.clear();
      }

      scope.editCard = function (card) {
        dataAccessFactory.editCard(scope.ngModel, card);
      }

      scope.deleteCard = function (card) {
        dataAccessFactory.deleteCard(scope.ngModel, card);
      }
    }
  }
}]);