angular.module('trello').directive('card', function () {
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

      scope.specifyDueDate = function() {
        var d = new Date(),
          today = d.getFullYear() + ' - ' + (d.getMonth() + 1) + ' - ' + d.getDate();

        scope.minDate = today;
        scope.ngModel.dueDate = today;
      }

      scope.isOverdue = function(){
        if(scope.ngModel.dueDate){
          var d = new Date(),
            due = scope.ngModel.dueDate.split('-');

          if(due[1][0] === '0'){
            due[1] = due[1][1];
          }

          if(d.getFullYear() < due[0]){
            return false;
          }
          if(d.getFullYear() == due[0] && (d.getMonth() + 1) < due[1]){
            return false;
          }
          if(d.getFullYear() == due[0] && (d.getMonth() + 1) == due[1] && d.getDate() < due[2]){
            return false;
          }
          return true;
        }
        return false;
      };
    }
  }
});