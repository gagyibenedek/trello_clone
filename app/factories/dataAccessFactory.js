angular.module('trello')
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
  }]);