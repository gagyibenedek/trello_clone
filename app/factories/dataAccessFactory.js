angular.module('trello')
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
  }]);