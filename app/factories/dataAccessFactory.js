angular.module('trello')
  .factory('dataAccessFactory', ['$firebase', function($firebase){
    var baseURL = "https://trello2.firebaseio.com/",
      lists = $firebase(new Firebase(baseURL + "lists")).$asArray(),
      cards = $firebase(new Firebase(baseURL + "cards")).$asArray(),
      daf = {};

    //Lists

    daf.getLists = function(){
      return lists;
    }

    daf.addList = function(){
      var list = {};
      list.title = '';
      lists.$add(list);
    }

    daf.editList = function(list){
      lists.$save(list);
    }

    daf.deleteList = function(list){
      //TODO: REMOVE ALL CARDS BEFORE REMOVING THE LIST
      lists.$remove(list);
    }

    //Cards

    daf.getCards = function(){
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