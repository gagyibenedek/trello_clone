angular.module('trello').directive('list', ['dataAccessFactory', function (dataAccessFactory) {
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

      console.log(scope.ngModel);

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