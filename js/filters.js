'use strict';

/* Filters */

angular.module('boxcarFilters', []).filter('status', function() {
	return function(input) {
		switch(input) {
			case -1:
				return 'Round your flag';
				break;
			case 0:
				return 'Return to start';
				break;
			case 1:
				return 'FIN 1st';
				break;
			case 2:
				return 'FIN 2nd';
				break;
			case 3:
				return 'FIN 3rd';
				break;
			case 4:
				return 'FIN 4th';
				break;
			default:
				return input;
		}
	};
});

//second filter does not have: , []
angular.module('boxcarFilters').filter('flagClass', function() {
	return function(input,color) {
		switch(input) {
			case 0:
				return ' table-flag-'+color;
				break;
			default:
				return '';
		}
	};
});

//second filter does not have: , []
angular.module('boxcarFilters').filter('inTurn', function() {
	return function(input) {
		return input ? '\u25ba' : '';
	};
});