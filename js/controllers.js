'use strict';

/* Controllers */

var boxcarControllers = angular.module('boxcarControllers', ['ngSanitize']);

boxcarControllers.controller('GameCtrl', ['$scope', '$routeParams', '$http', '$timeout', '$location',
	function($scope, $routeParams, $http, $timeout, $location) {
		/*$http.get('phones/' + $routeParams.phoneId + '.json').success(function(data) {
			$scope.phone = data;
			$scope.mainImageUrl = data.images[0];
		});
		
		$scope.hello = function(name) {
			alert('Hello ' + (name || 'world') + '!');o
		}*/
		
		$scope.showAlert = false;
		$scope.alertText = 'Alert!';
		function showAlert(text) {
			$scope.alertText = text;
			$scope.showAlert = true;
		}
		$scope.hideAlert = function() {
			$scope.showAlert = false;
		}
		
		$scope.startFormSubmitted = false;
		$scope.startFormNbrOfPlayers = '2';
		$scope.startFormPlayerNames = ['Player 1','Player 2','Player 3','Player 4'];
		
		$scope.turnsPlayed = 0;
		$scope.nbrOfPlayers = 2;
		$scope.nbrOfPlayersFinished = 0;
		$scope.players = [];
		var colors = ['red', 'blue', 'green', 'yellow'];
		var startPositionsBoardRow = [1,4,5,0];
		var startPositionsBoardCol = [0,5,1,4];
		var startPositionsTile = [2,6,0,4];
		var flagPositionsBoardRow = [5,0,0,5];
		var flagPositionsBoardCol = [5,0,5,0];
		var goalPositionsBoardRow = [0,5,5,0];
		var goalPositionsBoardCol = [0,5,0,5];
		//Randomize the tiles
		var sortedTileTypes = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
		var randomIndex;
		var randomTileTypes = new Array(sortedTileTypes.length);
		var lastPlayerInTurn = 0;
		for (var i=0; i<randomTileTypes.length;i++) {
			randomIndex = Math.floor(Math.random()*sortedTileTypes.length);
			randomTileTypes[i] = sortedTileTypes[randomIndex];
			sortedTileTypes.splice(randomIndex,1);
		}
		$scope.playerInTurn = 0;
		$scope.turnAction = 0;//0:slide in, 1:drive, 2:all finished
		$scope.informationTextAfterName = [', rotate and slide in the free tile',', select the number of steps to drive',', now even you have finished'];
	
		$scope.onStartFormSubmit = function() {
			$scope.nbrOfPlayers = parseInt($scope.startFormNbrOfPlayers);
			for (var i = 0; i < $scope.nbrOfPlayers; i++) {
				$scope.players.push({
					'id': i,
					'color': colors[i],
					'name': $scope.startFormPlayerNames[i],
					'nbrOfEnergyBoxes': 0,
					'status': -1,
					'positionBoardRow': startPositionsBoardRow[i],
					'positionBoardCol': startPositionsBoardCol[i],
					'positionOnTile': startPositionsTile[i]
				});
			}
			$scope.startFormSubmitted = true;
		}
		
		var tempTile = {type: 0, rotation: 0}
		
		$scope.board = {
			freeTile: {type: randomTileTypes[16], rotation: 0},
			rows: [
				{cols: [{row: 0, col: 0, type: 18, rotation: 0},{row: 0, col: 1, type: 17, rotation: 0},{row: 0, col: 2, type: 17, rotation: 0},{row: 0, col: 3, type: 17, rotation: 0},{row: 0, col: 4,type: 17, rotation: 0},{row: 0, col: 5,type: 18, rotation: 1}]},
				{cols: [{row: 1, col: 0, type: 17, rotation: 3},{row: 1, col: 1, type: randomTileTypes[0], rotation: randomRotation()},{row: 1, col: 2, type: randomTileTypes[1], rotation: randomRotation()},{row: 1, col: 3, type: randomTileTypes[2], rotation: randomRotation()},{row: 1, col: 4, type: randomTileTypes[2], rotation: randomRotation()},{row: 1, col: 5, type: 17, rotation: 1}]},
				{cols: [{row: 2, col: 0, type: 17, rotation: 3},{row: 2, col: 1, type: randomTileTypes[4], rotation: randomRotation()},{row: 2, col: 2, type: randomTileTypes[5], rotation: randomRotation()},{row: 2, col: 3, type: randomTileTypes[6], rotation: randomRotation()},{row: 2, col: 4, type: randomTileTypes[7], rotation: randomRotation()},{row: 2, col: 5, type: 17, rotation: 1}]},
				{cols: [{row: 3, col: 0 ,type: 17, rotation: 3},{row: 3, col: 1, type: randomTileTypes[8], rotation: randomRotation()},{row: 3, col: 2, type: randomTileTypes[9], rotation: randomRotation()},{row: 3, col:3, type: randomTileTypes[10], rotation: randomRotation()},{row: 3, col:4, type: randomTileTypes[11], rotation: randomRotation()},{row: 3, col:5, type: 17, rotation: 1}]},
				{cols: [{row: 4, col: 0, type: 17, rotation: 3},{row: 4, col: 1, type: randomTileTypes[12], rotation: randomRotation()},{row: 4, col: 2, type: randomTileTypes[13], rotation: randomRotation()},{row: 4, col: 3, type: randomTileTypes[14], rotation: randomRotation()},{row: 4, col: 4, type: randomTileTypes[15], rotation: randomRotation()},{row: 4, col: 5, type: 17, rotation: 1}]},
				{cols: [{row: 5, col: 0, type: 18, rotation: 3},{row: 5, col: 1, type: 17, rotation: 2},{row: 5, col: 2, type: 17, rotation: 2},{row: 5, col: 3, type: 17, rotation: 2},{row: 5, col: 4, type: 17, rotation: 2},{row: 5, col: 5, type: 18, rotation: 2}]}
			],
			addClassIfCorner: function (row,col) {
				var colorClass = '';
				if (row==0 && col==0) {
					colorClass = " corner-background-red";
				}
				if (row==0 && col==5 && $scope.nbrOfPlayers>3) {
					colorClass = " corner-background-yellow";
				}
				if (row==5 && col==5 && $scope.nbrOfPlayers>1) {
					colorClass = " corner-background-blue";
				}
				if (row==5 && col==0 && $scope.nbrOfPlayers>2) {
					colorClass = " corner-background-green";
				}
				return colorClass;
			},
			addFlagIfCorner: function (row,col) {
				var flagClass = '';
				if (row==0 && col==0 && $scope.nbrOfPlayers>1) {
					colorClass = " corner-flag-blue";
				}
				if (row==0 && col==5 && $scope.nbrOfPlayers>2) {
					colorClass = " corner-flag-green";
				}
				if (row==5 && col==5) {
					colorClass = " corner-flag-red";
				}
				if (row==5 && col==0 && $scope.nbrOfPlayers>3) {
					colorClass = " corner-flag-yellow";
				}
				return flagClass;
			},
			addPlayersAndFlags: function (row,col,tileRotation) {
				var innerHtml = '';
				var nbrOfDivsTile = 0;
				var previousTotalRotation = tileRotation;
				var adjustedRotation;
				var nbrOfPlayersOnPosition = [0,0,0,0,0,0,0,0];
				var playerOnOppositeTile;
				//Check if flag on tile
				if (row==0 && col==0 && $scope.nbrOfPlayers>1) {
					nbrOfDivsTile = nbrOfDivsTile + 1;
					innerHtml = innerHtml + '<div class="board-tile corner-flag-blue">';
				}
				if (row==0 && col==5 && $scope.nbrOfPlayers>2) {
					nbrOfDivsTile = nbrOfDivsTile + 1;
					innerHtml = innerHtml + '<div class="board-tile corner-flag-green">';
				}
				if (row==5 && col==5) {
					nbrOfDivsTile = nbrOfDivsTile + 1;
					innerHtml = innerHtml + '<div class="board-tile corner-flag-red">';
				}
				if (row==5 && col==0 && $scope.nbrOfPlayers>3) {
					nbrOfDivsTile = nbrOfDivsTile + 1;
					innerHtml = innerHtml + '<div class="board-tile corner-flag-yellow">';
				}
				//Check if slide in button
				if ((row==0 || row==5) && col!=0 && col!=5 && $scope.turnAction==0) {
					//Check if any player on opposite tile
					playerOnOppositeTile = false;
					for (var i = 0; i < $scope.players.length; ++i) {
						if (((row==0 && $scope.players[i].positionBoardRow==4) || (row==5 && $scope.players[i].positionBoardRow==1)) && $scope.players[i].positionBoardCol==col) {
							playerOnOppositeTile = true;
							break;
						}
					}
					if (!playerOnOppositeTile) {
						nbrOfDivsTile = nbrOfDivsTile + 1;
						innerHtml = innerHtml + '<div class="board-tile slide-in-button">';
					}
				}
				if ((col==0 || col==5) && row!=0 && row!=5 && $scope.turnAction==0) {
					//Check if any player on opposite tile
					playerOnOppositeTile = false;
					for (var i = 0; i < $scope.players.length; ++i) {
						if (((col==0 && $scope.players[i].positionBoardCol==4) || (col==5 && $scope.players[i].positionBoardCol==1)) && $scope.players[i].positionBoardRow==row) {
							playerOnOppositeTile = true;
							break;
						}
					}
					if (!playerOnOppositeTile) {
						nbrOfDivsTile = nbrOfDivsTile + 1;
						innerHtml = innerHtml + '<div class="board-tile slide-in-button">';
					}
				}
				//TODO
				//Check if player on tile
				for (var i = 0; i < $scope.players.length; ++i) {
					if ($scope.players[i].positionBoardRow==row && $scope.players[i].positionBoardCol==col) {
						nbrOfDivsTile = nbrOfDivsTile + 1;
						nbrOfPlayersOnPosition[$scope.players[i].positionOnTile] = nbrOfPlayersOnPosition[$scope.players[i].positionOnTile] + 1;
						adjustedRotation = getPlayerPositionRotation($scope.players[i].positionOnTile)-previousTotalRotation;
						if (adjustedRotation<0) {
							adjustedRotation = adjustedRotation + 4;
						}
						previousTotalRotation = previousTotalRotation + adjustedRotation;
						if (previousTotalRotation>3) {
							previousTotalRotation = previousTotalRotation - 4;
						}
						innerHtml = innerHtml + '<div class="board-tile car-'+$scope.players[i].id+'-side-'+getPlayerPositionSide($scope.players[i].positionOnTile)+' rot-'+adjustedRotation;
						if (nbrOfPlayersOnPosition[$scope.players[i].positionOnTile]>1) {
							innerHtml = innerHtml + ' cars-on-same-position-'+nbrOfPlayersOnPosition[$scope.players[i].positionOnTile];
						}
						innerHtml = innerHtml + '">';
					}
				}
				for (var i = 0; i < nbrOfDivsTile; ++i) {
					innerHtml = innerHtml + '</div>';
				}
				return innerHtml;
			}
		};
		
		$scope.movableTiles = [
			{id: 0, exit: [7,2,1,4,3,6,5,0], corner: false},
			{id: 1, exit: [1,0,3,2,5,4,7,6], corner: false},
			{id: 2, exit: [1,0,7,4,3,6,5,2], corner: false},
			{id: 3, exit: [1,0,3,2,7,6,5,4], corner: false},
			{id: 4, exit: [3,2,1,0,7,6,5,4], corner: false},
			{id: 5, exit: [1,0,4,5,2,3,7,6], corner: false},
			{id: 6, exit: [3,2,1,0,6,7,4,5], corner: false},
			{id: 7, exit: [7,3,5,1,6,2,4,0], corner: false},
			{id: 8, exit: [7,2,1,5,6,3,4,0], corner: false},
			{id: 9, exit: [1,0,7,5,6,3,4,2], corner: false},
			{id: 10, exit: [2,7,0,5,6,3,4,1], corner: false},
			{id: 11, exit: [2,3,0,1,6,7,4,5], corner: false},
			{id: 12, exit: [5,7,3,2,6,0,4,1], corner: false},
			{id: 13, exit: [1,0,6,7,5,4,2,3], corner: false},
			{id: 14, exit: [5,4,3,2,1,0,7,6], corner: false},
			{id: 15, exit: [1,0,6,4,3,7,2,5], corner: false},
			{id: 16, exit: [1,0,4,7,2,6,5,3], corner: false},
			{id: 17, exit: [7,2,1,4,3,6,5,0], corner: false},
			{id: 18, exit: [7,2,1,4,3,6,5,0], corner: true},
			{id: 19, exit: [7,2,1,4,3,6,5,0], corner: true},
			{id: 20, exit: [7,2,1,4,3,6,5,0], corner: true},
			{id: 21, exit: [7,2,1,4,3,6,5,0], corner: true}
		];

		$scope.slideInTile = function(row, col) {
			var allowed = true;
			var actionDone = false;
			if ($scope.turnAction==0) {
				switch (row) {
					case 0:
						if (0<col && col<5) {
							for (var i = 0; i < $scope.players.length; ++i) {
								if ($scope.players[i].positionBoardRow==4 && $scope.players[i].positionBoardCol==col) {
									allowed = false;
									break;
								}
							}
							if (allowed) {
								tempTile.type = $scope.board.freeTile.type;
								tempTile.rotation = $scope.board.freeTile.rotation;
								$scope.board.freeTile.type = $scope.board.rows[4].cols[col].type;
								$scope.board.freeTile.rotation = $scope.board.rows[4].cols[col].rotation;
								for (var i = 4; i > 1; --i) {
									$scope.board.rows[i].cols[col].type = $scope.board.rows[i-1].cols[col].type;
									$scope.board.rows[i].cols[col].rotation = $scope.board.rows[i-1].cols[col].rotation;
									for (var j = 0; j < $scope.players.length; ++j) {
										if ($scope.players[j].positionBoardRow==i-1 && $scope.players[j].positionBoardCol==col) {
											$scope.players[j].positionBoardRow = i;
										}
									}
								}
								$scope.board.rows[1].cols[col].type = tempTile.type;
								$scope.board.rows[1].cols[col].rotation = tempTile.rotation;
								actionDone = true;
							}
						}
						break;
					case 5:
						if (0<col && col<5) {
							for (var i = 0; i < $scope.players.length; ++i) {
								if ($scope.players[i].positionBoardRow==1 && $scope.players[i].positionBoardCol==col) {
									allowed = false;
									break;
								}
							}
							if (allowed) {
								tempTile.type = $scope.board.freeTile.type;
								tempTile.rotation = $scope.board.freeTile.rotation;
								$scope.board.freeTile.type = $scope.board.rows[1].cols[col].type;
								$scope.board.freeTile.rotation = $scope.board.rows[1].cols[col].rotation;
								for (var i = 1; i < 4; ++i) {
									$scope.board.rows[i].cols[col].type = $scope.board.rows[i+1].cols[col].type;
									$scope.board.rows[i].cols[col].rotation = $scope.board.rows[i+1].cols[col].rotation;
									for (var j = 0; j < $scope.players.length; ++j) {
										if ($scope.players[j].positionBoardRow==i+1 && $scope.players[j].positionBoardCol==col) {
											$scope.players[j].positionBoardRow = i;
										}
									}
								}
								$scope.board.rows[4].cols[col].type = tempTile.type;
								$scope.board.rows[4].cols[col].rotation = tempTile.rotation;
								actionDone = true;
							}
						}
						break;
				}
				switch (col) {
					case 0:
						if (0<row && row<5) {
							for (var i = 0; i < $scope.players.length; ++i) {
								if ($scope.players[i].positionBoardCol==4 && $scope.players[i].positionBoardRow==row) {
									allowed = false;
									break;
								}
							}
							if (allowed) {
								tempTile.type = $scope.board.freeTile.type;
								tempTile.rotation = $scope.board.freeTile.rotation;
								$scope.board.freeTile.type = $scope.board.rows[row].cols[4].type;
								$scope.board.freeTile.rotation = $scope.board.rows[row].cols[4].rotation;
								for (var i = 4; i > 1; --i) {
									$scope.board.rows[row].cols[i].type = $scope.board.rows[row].cols[i-1].type;
									$scope.board.rows[row].cols[i].rotation = $scope.board.rows[row].cols[i-1].rotation;
									for (var j = 0; j < $scope.players.length; ++j) {
										if ($scope.players[j].positionBoardCol==i-1 && $scope.players[j].positionBoardRow==row) {
											$scope.players[j].positionBoardCol = i;
										}
									}
								}
								$scope.board.rows[row].cols[1].type = tempTile.type;
								$scope.board.rows[row].cols[1].rotation = tempTile.rotation;
								actionDone = true;
							}
						}
						break;
					case 5:
						if (0<row && row<5) {
							for (var i = 0; i < $scope.players.length; ++i) {
								if ($scope.players[i].positionBoardCol==1 && $scope.players[i].positionBoardRow==row) {
									allowed = false;
									break;
								}
							}
							if (allowed) {
								tempTile.type = $scope.board.freeTile.type;
								tempTile.rotation = $scope.board.freeTile.rotation;
								$scope.board.freeTile.type = $scope.board.rows[row].cols[1].type;
								$scope.board.freeTile.rotation = $scope.board.rows[row].cols[1].rotation;
								for (var i = 1; i < 4; ++i) {
									$scope.board.rows[row].cols[i].type = $scope.board.rows[row].cols[i+1].type;
									$scope.board.rows[row].cols[i].rotation = $scope.board.rows[row].cols[i+1].rotation;
									for (var j = 0; j < $scope.players.length; ++j) {
										if ($scope.players[j].positionBoardCol==i+1 && $scope.players[j].positionBoardRow==row) {
											$scope.players[j].positionBoardCol = i;
										}
									}
								}
								$scope.board.rows[row].cols[4].type = tempTile.type;
								$scope.board.rows[row].cols[4].rotation = tempTile.rotation;
								actionDone = true;
							}
						}
						break;
				}
			}
			if (actionDone) {
				$scope.turnAction = 1;
			}
		}

		$scope.drive = function(steps) {
			if ($scope.turnAction==1) {
				var tileRotation = 0;
				var entryPositionOnTile = 0;
				var rotatedEntryPositionOnTile = 0;
				var rotatedExitPositionOnTile = 0;
				var exitPositionOnTile = 0;
				var positionBoardRow = $scope.players[$scope.playerInTurn].positionBoardRow;
				var positionBoardCol = $scope.players[$scope.playerInTurn].positionBoardCol;
				var positionOnTile = $scope.players[$scope.playerInTurn].positionOnTile;
				var i = 0;
				while (i<steps) {
					switch (positionOnTile) {
						case 0:
							entryPositionOnTile = 5;
							positionBoardRow = positionBoardRow - 1;
							break;
						case 1:
							entryPositionOnTile = 4;
							positionBoardRow = positionBoardRow - 1;
							break;
						case 2:
							entryPositionOnTile = 7;
							positionBoardCol = positionBoardCol + 1;
							break;
						case 3:
							entryPositionOnTile = 6;
							positionBoardCol = positionBoardCol + 1;
							break;
						case 4:
							entryPositionOnTile = 1;
							positionBoardRow = positionBoardRow + 1;
							break;
						case 5:
							entryPositionOnTile = 0;
							positionBoardRow = positionBoardRow + 1;
							break;
						case 6:
							entryPositionOnTile = 3;
							positionBoardCol = positionBoardCol - 1;
							break;
						case 7:
							entryPositionOnTile = 2;
							positionBoardCol = positionBoardCol - 1;
							break;
					}
					//TODO Check if the next tile is a side tile
					if (positionBoardRow==0 && positionBoardCol!=0 && positionBoardCol!=5 &&(entryPositionOnTile==4 || entryPositionOnTile==5)) {
						if ((positionBoardCol==1 && entryPositionOnTile==5) || (positionBoardCol==4 && entryPositionOnTile==4)) {
							i = i - 2;
						}
						else {
							i = i - 1;
						}
					}
					if (positionBoardCol==5 && positionBoardRow!=0 && positionBoardRow!=5 && (entryPositionOnTile==6 || entryPositionOnTile==7)) {
						if ((positionBoardRow==1 && entryPositionOnTile==7) || (positionBoardRow==4 && entryPositionOnTile==6)) {
							i = i - 2;
						}
						else {
							i = i - 1;
						}
					}
					if (positionBoardRow==5 && positionBoardCol!=0 && positionBoardCol!=5 && (entryPositionOnTile==0 || entryPositionOnTile==1)) {
						if ((positionBoardCol==1 && entryPositionOnTile==0) || (positionBoardCol==4 && entryPositionOnTile==1)) {
							i = i - 2;
						}
						else {
							i = i - 1;
						}
					}
					if (positionBoardCol==0 && positionBoardRow!=0 && positionBoardRow!=5 && (entryPositionOnTile==2 || entryPositionOnTile==3)) {
						if ((positionBoardRow==1 && entryPositionOnTile==2) || (positionBoardRow==4 && entryPositionOnTile==3)) {
							i = i - 2;
						}
						else {
							i = i - 1;
						}
					}
					tileRotation = $scope.board.rows[positionBoardRow].cols[positionBoardCol].rotation;
					rotatedEntryPositionOnTile = entryPositionOnTile - 2*tileRotation;
					if (rotatedEntryPositionOnTile<0) {
						rotatedEntryPositionOnTile = rotatedEntryPositionOnTile + 8
					}
					rotatedExitPositionOnTile = $scope.movableTiles[$scope.board.rows[positionBoardRow].cols[positionBoardCol].type].exit[rotatedEntryPositionOnTile];
					exitPositionOnTile = rotatedExitPositionOnTile + 2*tileRotation;
					if (exitPositionOnTile > 7) {
						exitPositionOnTile = exitPositionOnTile-8;
					}
					positionOnTile = exitPositionOnTile;
					if (positionBoardRow==flagPositionsBoardRow[$scope.playerInTurn] && positionBoardCol==flagPositionsBoardCol[$scope.playerInTurn]) {
						//Player rounded flag
						$scope.players[$scope.playerInTurn].status = 0;
						showAlert($scope.players[$scope.playerInTurn].name+', you rounded your flag. Now, get back to your start area.');
					}
					if ($scope.players[$scope.playerInTurn].status==0) {
						if (positionBoardRow==goalPositionsBoardRow[$scope.playerInTurn] && positionBoardCol==goalPositionsBoardCol[$scope.playerInTurn]) {
							//Player finished
							$scope.nbrOfPlayersFinished = $scope.nbrOfPlayersFinished + 1;
							$scope.players[$scope.playerInTurn].status = $scope.nbrOfPlayersFinished;
							showAlert($scope.players[$scope.playerInTurn].name+', you finished as number '+$scope.nbrOfPlayersFinished);
						}
					}
					i++;
				}
				$scope.players[$scope.playerInTurn].positionBoardRow = positionBoardRow;
				$scope.players[$scope.playerInTurn].positionBoardCol = positionBoardCol;
				$scope.players[$scope.playerInTurn].positionOnTile = positionOnTile;
				if (steps==1) {
					$scope.players[$scope.playerInTurn].nbrOfEnergyBoxes = $scope.players[$scope.playerInTurn].nbrOfEnergyBoxes + 1;
				}
				else {
					$scope.players[$scope.playerInTurn].nbrOfEnergyBoxes = $scope.players[$scope.playerInTurn].nbrOfEnergyBoxes - (steps-1);
				}
				//If not all finished, change to next player
				if ($scope.nbrOfPlayers>$scope.nbrOfPlayersFinished) {
					for (var i=0; i<$scope.nbrOfPlayers; i++) {
						lastPlayerInTurn = $scope.playerInTurn;
						$scope.playerInTurn = addToNumber($scope.playerInTurn,1,$scope.nbrOfPlayers-1);
						if ($scope.players[$scope.playerInTurn].status<1) {
							if ($scope.playerInTurn<lastPlayerInTurn) {
								$scope.turnsPlayed = $scope.turnsPlayed+1;
							}
							break;
						}
					}
					$scope.turnAction = 0;
				}
				else {
					$scope.turnAction = 2;
				}
			}
		}
		
		$scope.range = function(min, max, step){
			step = (step === undefined) ? 1 : step;
			var input = [];
			for (var i = min; i <= max; i += step) input.push(i);
			return input;
		};
		
		$scope.energyBoxesOfPlayerInTurn = function(){
			var boxes = [];
			if ($scope.players[0]) {
				for (var i = 1; i <= $scope.players[$scope.playerInTurn].nbrOfEnergyBoxes; i++) {
					boxes.push(i);
				}
			}
			return boxes;
		};
			
		function addToNumber(inputValue,stepvalue,maxValue) {
			var returnValue = 0;
			returnValue = inputValue + stepvalue;
			if (returnValue > maxValue) {
				returnValue = 0;
			}
			if (returnValue < 0) {
				returnValue = maxValue;
			}
			return returnValue;
		}
		
		function getPlayerPositionRotation(playerPosition) {
			switch (playerPosition) {
				case 0:
				case 1:
					return 0;
					break;
				case 2:
				case 3:
					return 1;
					break;
				case 4:
				case 5:
					return 2;
					break;
				case 6:
				case 7:
					return 3;
					break;
			}
			return -1;
		}
		
		function getPlayerPositionSide(playerPosition) {
			var side = -1;
			switch (playerPosition) {
				case 0:
				case 2:
				case 4:
				case 6:
					side = 0;
					break;
				case 1:
				case 3:
				case 5:
				case 7:
					side = 1;
					break;
			}
			return side;
		}
		
		function randomRotation() {
			return Math.floor(Math.random()*4);
		}
		
		$scope.rotateFreeTile = function(direction) {
			if ($scope.turnAction==0) {
				switch (direction) {
					case 'cw':
						$scope.board.freeTile.rotation = addToNumber($scope.board.freeTile.rotation,1,3);
						break;
					case 'ccw':
						$scope.board.freeTile.rotation = addToNumber($scope.board.freeTile.rotation,-1,3);
						break;
				}
			}
		}
		
		$scope.addClassIfInactive = function (activeTurnAction) {
			if ($scope.turnAction!=activeTurnAction) {
				return ' button-inactive';
			}
			else {
				return '';
			}
		}
		
		function changeDisplayRotation() {
			var container = document.getElementById('outer-container');
			if (window.innerWidth > window.innerHeight) {
				container.classList.remove("narrow");
				container.classList.add("wide");
			} else {
				container.classList.remove("wide");
				container.classList.add("narrow");
			}
		}
		
		window.onresize = function() {
			changeDisplayRotation();
		};
		
		var init = function () {
			changeDisplayRotation();
		}
		
		init();
		
	}
]);