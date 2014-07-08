'use strict';

/* App Module */

var boxcarApp = angular.module('boxcarApp', [
  'ngRoute',
  'boxcarControllers',
  'boxcarFilters'
]);

boxcarApp.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
		when('/start', {
			templateUrl: 'partials/start.html',
			controller: 'GameCtrl'
		}).
		when('/game', {
			templateUrl: 'partials/game.html',
			controller: 'GameCtrl'
		}).
		when('/rules', {
			templateUrl: 'partials/rules.html',
			controller: 'GameCtrl'
		}).
		otherwise({
			redirectTo: '/start'
		});
	}
]);
