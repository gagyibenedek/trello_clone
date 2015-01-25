angular.module('trello').directive('list', ['dataAccessFactory', function (dataAccessFactory) {
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