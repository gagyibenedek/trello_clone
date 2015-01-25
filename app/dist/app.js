angular.module('trello', ['firebase']);

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
  }]);;angular.module('trello')
  .factory('dataAccessFactory', ['$firebase', function ($firebase) {
    var baseURL = "https://trello2.firebaseio.com/",
      lists = $firebase(new Firebase(baseURL + "lists")).$asArray(),
      cards = $firebase(new Firebase(baseURL + "cards")).$asArray(),
      daf = {};

    //Lists

    daf.getLists = function () {
      return lists;
    }

    daf.addList = function (title) {
      var list = {};
      list.title = title;
      lists.$add(list);
    }

    daf.editList = function (list) {
      lists.$save(list);
    }

    daf.deleteList = function (list) {
      lists.$remove(list).then(function () {
        //when the list was successfully deleted, remove it's cards also
        var i;
        for (i = cards.length; i--; i >= 0) {
          if(cards[i].parent === list.$id){
            cards.$remove(i);
          }
        }
      });
    }

    //Cards

    daf.getCards = function () {
      return cards;
    }

    daf.addCard = function (list, card) {
      card.parent = list.$id;
      cards.$add(card);
    }

    daf.editCard = function (card) {
      cards.$save(card);
    }

    daf.deleteCard = function (card) {
      cards.$remove(card);
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
      ngModel: '=',
      cards: '='
    },
    templateUrl: 'app/components/list/list.html',
    link: function (scope, ele, attr) {
      scope.newCard = {};
      scope.creatorVisible = false;
      scope.titleEditable = false;
      scope.editedTitle = scope.ngModel.title;

      scope.flipCreatorVisible = function(){
        scope.creatorVisible = !scope.creatorVisible;
      }

      scope.flipTitleEditable = function(){
        scope.editedTitle = scope.ngModel.title;
        scope.titleEditable = !scope.titleEditable;
      }

      scope.clear = function(){
        scope.newCard = {};
        scope.flipCreatorVisible();
      }

      scope.editTitle = function(){
        scope.ngModel.title = scope.editedTitle;
        dataAccessFactory.editList(scope.ngModel);
        scope.flipTitleEditable();
      }

      scope.addCard = function () {
        if(scope.newCard.title === undefined && scope.newCard.description !== undefined){
          scope.newCard.title = 'Title'; //hardcoded default title :(
        }
        dataAccessFactory.addCard(scope.ngModel, scope.newCard);
        scope.clear();
      }

      scope.editCard = function (card) {
        dataAccessFactory.editCard(card);
      }

      scope.deleteCard = function (card) {
        dataAccessFactory.deleteCard(card);
      }

      scope.deleteList = function () {
        dataAccessFactory.deleteList(scope.ngModel);
      }
    }
  }
}]);