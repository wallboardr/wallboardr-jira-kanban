define([], function () {
  'use strict';
  var kanbanController = function ($scope) {
    $scope.reset = function () {
      $scope.columnCount = undefined;
      if ($scope.activeScreenEdit && $scope.activeScreenEdit.data && $scope.activeScreenEdit.data.columns) {
        $scope.columnCount = $scope.activeScreenEdit.data.columns.length;
      }
      $scope.columns = [];
      $scope.currentStep = 0;
    };
    $scope.showStep = function (step) {
      return step === $scope.currentStep;
    };
    $scope.saveColumns = function (form, active) {
      var dataLocation = active || form;
      if (form.$valid) {
        dataLocation.data.columns = $scope.columns;
        if (active) {
          $scope.updateActiveScreen(form);
        } else {
          $scope.addScreen(form);
        }
        $scope.reset();
      }
    };
    $scope.showColumns = function (form) {
      var colDiff, nc;
      if (form.$valid) {
        if ($scope.activeScreenEdit && $scope.activeScreenEdit.data && $scope.activeScreenEdit.data.columns) {
          $scope.columns = $scope.activeScreenEdit.data.columns;
        } else {
          $scope.columns = [];
        }
        if ($scope.columnCount > $scope.columns.length) {
          colDiff = $scope.columnCount - $scope.columns.length;
          for (nc = 0; nc < colDiff; nc += 1) {
            $scope.columns.push({
              name: undefined,
              statuses: undefined,
              max: undefined,
              min: undefined
            });
          }
        } else if ($scope.columnCount < $scope.columns.length) {
          $scope.columns.splice($scope.columnCount - 1, 9007199254740991);
        }
        
        $scope.currentStep = 1;
      }
    };
    $scope.cancelEditScreen = function () {
      $scope.reset();
      $scope.$parent.cancelEditScreen();
    };
    $scope.reset();

  };
  kanbanController.$inject = ['$scope'];
  kanbanController.config = {
    name: 'jira-kanban',
    humanName: 'Jira Kanban',
    controller: 'JiraKanbanController',
    centered: true,
    pollInterval: 240
  };

  return kanbanController;
});