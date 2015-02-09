;(function(angular){
  'use strict';
  var indexOf = [].indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (i in this && this[i] === item) return i;
    }
    return -1;
  };

  angular.module('pickadate', [])

    .provider('pickadateI18n', function() {
      var defaults = {
        'prev': 'prev',
        'next': 'next'
      };

      this.translations = {};

      this.$get = function() {
        var translations = this.translations;

        return {
          t: function(key) {
            return translations[key] || defaults[key];
          }
        };
      };
    })

    .factory('pickadateUtils', ['$locale', function($locale) {
      return {
        isDate: function(obj) {
          return Object.prototype.toString.call(obj) === '[object Date]';
        },

        stringToDate: function(dateString) {
          if (this.isDate(dateString)) return new Date(dateString);
          var dateParts = dateString.split('-'),
            year  = dateParts[0],
            month = dateParts[1],
            day   = dateParts[2];

          // set hour to 3am to easily avoid DST change
          return new Date(year, month - 1, day, 3);
        },

        buildDates: function(date, options) {
          var dates = [],
            lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 3);

          options = options || {};
          date = new Date(date);

          while (date.getDay() !== options.weekStartsOn) {
            date.setDate(date.getDate() - 1);
          }

          for (var i = 0; i < 42; i++) {  // 42 == 6 rows of dates
            if (options.noExtraRows && date.getDay() === options.weekStartsOn && date > lastDate) break;

            dates.push(new Date(date));
            date.setDate(date.getDate() + 1);
          }

          return dates;
        },

        buildDayNames: function(weekStartsOn) {
          var dayNames = $locale.DATETIME_FORMATS.SHORTDAY;

          if (weekStartsOn) {
            dayNames = dayNames.slice(0);
            for (var i = 0; i < weekStartsOn; i++) {
              dayNames.push(dayNames.shift());
            }
          }
          return dayNames;
        }
      };
    }])

    .directive('pickadate', ['$locale', '$sce', 'pickadateUtils', 'pickadateI18n', 'dateFilter', function($locale, $sce, dateUtils, i18n, dateFilter) {
      return {
        require: 'ngModel',
        scope: {
          date: '=ngModel',
          defaultDate: '=',
          minDate: '=',
          maxDate: '=',
          disabledDates: '=',
          weekStartsOn: '='
        },
        template:
          '<div class="pickadate">' +
          '<div class="pickadate-header">' +
          '<div class="pickadate-controls">' +
          '<a href="" class="pickadate-prev" ng-click="changeMonth(-1)" ng-show="allowPrevMonth">' +
          $sce.trustAsHtml(i18n.t('prev')) +
          '</a>' +
          '<a href="" class="pickadate-next" ng-click="changeMonth(1)" ng-show="allowNextMonth">' +
          $sce.trustAsHtml(i18n.t('next')) +
          '</a>' +
          '</div>'+
          '<h3 class="pickadate-centered-heading">' +
          '{{currentDate | date:"MMMM yyyy"}}' +
          '</h3>' +
          '</div>' +
          '<div class="pickadate-body">' +
          '<div class="pickadate-main">' +
          '<ul class="pickadate-cell">' +
          '<li class="pickadate-head" ng-repeat="dayName in dayNames">' +
          '{{dayName}}' +
          '</li>' +
          '</ul>' +
          '<ul class="pickadate-cell">' +
          '<li ng-repeat="d in dates" ng-click="setDate(d)" ng-class="classesFor(d)">' +
          '{{d.dateObj | date:"d"}}' +
          '</li>' +
          '</ul>' +
          '</div>' +
          '</div>' +
          '</div>',

        link: function(scope, element, attrs, ngModel)  {
          var noExtraRows   = attrs.hasOwnProperty('noExtraRows'),
            allowMultiple = attrs.hasOwnProperty('multiple'),
            weekStartsOn  = scope.weekStartsOn,
            selectedDates = [],
            minDate, maxDate;

          scope.currentDate = scope.defaultDate && dateUtils.stringToDate(scope.defaultDate);

          if (!angular.isNumber(weekStartsOn) || weekStartsOn < 0 || weekStartsOn > 6) {
            weekStartsOn = 0;
          }

          scope.setDate = function(dateObj) {
            if (isOutOfRange(dateObj.dateObj) || isDateDisabled(dateObj.date)) return;
            selectedDates = allowMultiple ? toggleDate(dateObj.date, selectedDates) : [dateObj.date];
            setViewValue(selectedDates);
          };

          ngModel.$render = function() {
            var firstSelectedDate;

            if (angular.isArray(ngModel.$modelValue)) {
              selectedDates = ngModel.$modelValue;
            } else if (ngModel.$modelValue) {
              selectedDates = [ngModel.$modelValue];
            }

            firstSelectedDate = selectedDates[0] && dateUtils.stringToDate(selectedDates[0]);
            scope.currentDate = scope.currentDate || firstSelectedDate || new Date();

            minDate = scope.minDate && dateUtils.stringToDate(scope.minDate) || new Date(0);
            maxDate = scope.maxDate && dateUtils.stringToDate(scope.maxDate) || new Date(99999999999999);

            // if some of the initial dates set by the user is in the disabled dates list, remove them
            selectedDates = enabledDatesOf(selectedDates);

            setViewValue(selectedDates);

            render();
          };

          scope.classesFor = function(date) {
            var extraClasses = indexOf.call(selectedDates, date.date) >= 0 ? 'pickadate-active' : null;
            return date.classNames.concat(extraClasses);
          };

          scope.changeMonth = function(offset) {
            // If the current date is January 31th, setting the month to date.getMonth() + 1
            // sets the date to March the 3rd, since the date object adds 30 days to the current
            // date. Settings the date to the 2nd day of the month is a workaround to prevent this
            // behaviour
            scope.currentDate.setDate(1);
            scope.currentDate.setMonth(scope.currentDate.getMonth() + offset);
            render();
          };

          // Workaround to watch multiple properties. XXX use $scope.$watchGroup in angular 1.3
          scope.$watch(function(){
            return angular.toJson([scope.minDate, scope.maxDate, scope.disabledDates]);
          }, ngModel.$render);

          function render() {
            var initialDate   = new Date(scope.currentDate.getFullYear(), scope.currentDate.getMonth(), 1, 3),
              currentMonth  = initialDate.getMonth() + 1,
              allDates      = dateUtils.buildDates(initialDate, { weekStartsOn: weekStartsOn, noExtraRows: noExtraRows }),
              dates         = [],
              today         = dateFilter(new Date(), 'yyyy-MM-dd');

            var nextMonthInitialDate = new Date(initialDate);
            nextMonthInitialDate.setMonth(currentMonth);

            scope.allowPrevMonth = !minDate || initialDate > minDate;
            scope.allowNextMonth = !maxDate || nextMonthInitialDate <= maxDate;
            scope.dayNames       = dateUtils.buildDayNames(weekStartsOn);

            for (var i = 0; i < allDates.length; i++) {
              var classNames = [],
                dateObj    = allDates[i],
                date       = dateFilter(dateObj, 'yyyy-MM-dd'),
                isDisabled = isDateDisabled(date);

              if (isOutOfRange(dateObj) || isDisabled) {
                classNames.push('pickadate-disabled');
              } else {
                classNames.push('pickadate-enabled');
              }

              if (isDisabled)     classNames.push('pickadate-unavailable');
              if (date === today) classNames.push('pickadate-today');

              dates.push({date: date, dateObj: dateObj, classNames: classNames});
            }

            scope.dates = dates;
          }

          function setViewValue(value) {
            if (allowMultiple) {
              ngModel.$setViewValue(value);
            } else {
              ngModel.$setViewValue(value[0]);
            }
          }

          function enabledDatesOf(dateArray) {
            var resultArray = [];

            for (var i = 0; i < dateArray.length; i++) {
              var date = dateArray[i];

              if (!isDateDisabled(date) && !isOutOfRange(dateUtils.stringToDate(date))) {
                resultArray.push(date);
              }
            }

            return resultArray;
          }

          function isOutOfRange(date) {
            return date < minDate || date > maxDate || dateFilter(date, 'M') !== dateFilter(scope.currentDate, 'M');
          }

          function isDateDisabled(date) {
            return indexOf.call(scope.disabledDates || [], date) >= 0;
          }

          function toggleDate(date, dateArray) {
            var index = indexOf.call(dateArray, date);
            if (index === -1) {
              dateArray.push(date);
            }
            else {
              dateArray.splice(index, 1);
            }
            return dateArray;
          }
        }
      };
    }]);
})(window.angular);
;angular.module('trello', ['firebase', 'pickadate']);

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

      scope.startEditing = function(){
        scope.oldTitle = scope.ngModel.title;
        scope.oldDesc = scope.ngModel.description;
        scope.flipReadOnly();
      }

      scope.editCard = function () {
        scope.edit(scope.ngModel);
        scope.flipReadOnly();
      }

      scope.cancelEditing = function(){
        scope.ngModel.title = scope.oldTitle;
        scope.ngModel.description = scope.oldDesc;
        scope.flipReadOnly();
      }

      scope.flipReadOnly = function () {
        scope.readOnly = !scope.readOnly;
      }

      scope.specifyDueDate = function () {
        var d = new Date(),
          today = d.getFullYear() + ' - ' + (d.getMonth() + 1) + ' - ' + d.getDate();

        scope.minDate = today;
        scope.ngModel.dueDate = today;
      }

      scope.isOverdue = function () {
        if (scope.ngModel.dueDate) {
          var d = new Date(),
            due = scope.ngModel.dueDate.split('-');

          if (due[1][0] === '0') {
            due[1] = due[1][1];
          }

          if (d.getFullYear() < due[0]) {
            return false;
          }
          if (d.getFullYear() == due[0] && (d.getMonth() + 1) < due[1]) {
            return false;
          }
          if (d.getFullYear() == due[0] && (d.getMonth() + 1) == due[1] && d.getDate() < due[2]) {
            return false;
          }
          return true;
        }
        return false;
      };

    }
  }
});;angular.module('trello').directive('contenteditable', function () {
  return {
    require: 'ngModel',
    scope: {
      ngModel: '=',
      placeholder: '@'
    },
    link: function (scope, element, attrs, ctrl) {
      // view -> model

      element.bind('blur', function () {
        var clean = element.html().replace(new RegExp(/\s/g),'')
          .replace(new RegExp("&nbsp;", "g"), "")
          .replace(new RegExp("<br>", "g"), "");
        if(!clean.length){
          element.html('');
        }

        scope.$apply(function () {
          ctrl.$setViewValue(element.html());
        });
      });

      element.bind('focus', function () {
        if(element.html() === ''){
          element.html('<br />');
        }
      });

      ctrl.$render = function () {
        element.html(ctrl.$viewValue || '');
      };

      ctrl.$render();
    }
  };
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