///Drawing Variables
var ctx;
var xsize = 20;
var ysize = 20;
var offy = 50;
//var pallet = ["#FF0000","#0000FF","#00C200","#FF8000","#FFFF00","#8A00B8"];
var pallet = ["#0000C7","#C700C7","#C70000","#C7C700","#00C700","#00C7C7"];
var drawQueue = [];

//Global Vars
var game = {
	board:null,
	players : [],
	floodQueue : [],
	oldColour:null,
	nextColour:null,
	workingPlayer:0,
	canMove : true,
	repeater : false
};
/* * * * * * * * * * * * * * *
 * Initialization functions  *
 * * * * * * * * * * * * * * */
function init() {
	var canvas = $('#canvas').get(0);
	if (!canvas.getContext){
		return;
	}
	ctx = canvas.getContext('2d');
	game.board = new Board(25,15);
	game.players[0] = new Player("Ryan",0);
	game.players[1] = new Player(null,1);
	display();
	//game.board.move(0);
}

/* * * * * * * * * * * *
 * Object Declarations *
 * * * * * * * * * * * */
function Coord (x,y) {
	this.x = x;
	this.y = y;
	this.valid = true;
	if (x < 0 || x >= game.board.sizex || y < 0 || y >= game.board.sizey){
		this.valid = false;
	}
}

function Square (colour, range) {
	if (!colour){
		this.colour = Math.floor(Math.random()*range);
	} else {
		this.colour = colour;
	}
	this.marked = false;
	this.owner = -1;
}

function Player (name, aiLevel) {
	if (!name){
		name = "ಠ_ಠ";
	}
	if (!aiLevel) {
	 aiLevel = 0;
	}
	this.name = name;
	this.aiLevel = aiLevel;
	this.x = 0;
	this.y = 0;
	if (game.players.length == 1) {
		this.x = game.board.sizex - 1;
		this.y = game.board.sizey - 1;
	}
	this.colour = game.board.grid[this.y][this.x].colour;
	game.board.grid[this.y][this.x].owner = game.players.length + 1;
	this.score = 1;
}

function Board (sizex, sizey, numColours){
	if (!numColours){
		numColours = pallet.length;
	}
	if (!sizex){
		sizex = 20;
	}
	if (!sizey){
		sizey = 20;
	}
	this.sizex = sizex;
	this.sizey = sizey;
	this.numColours = numColours;
	this.grid = [];
	for (var i = 0; i < sizey; i++){
		this.grid[i] = [];
		for (var j = 0; j < sizex; j++){
			this.grid[i][j] = new Square(null, numColours);
		}
	}
}

Board.prototype.unmarkAll = function () {
	for (var i = 0; i < this.sizey; i++){
		for (var j = 0; j < this.sizex; j++){
			this.grid[i][j].marked = false;
		}
	}
}

Board.prototype.ownMarked = function (playerNum) {
	game.players[playerNum].score = 0;	
	for (var i = 0; i < this.sizey; i++){
		for (var j = 0; j < this.sizex; j++){
			if (this.grid[i][j].marked == true) {
				game.players[playerNum].score++;
				this.grid[i][j].owner = playerNum;
			}
		}
	}
}

Board.prototype.takeNeutral = function (playerNum) {
	for (var i = 0; i < this.sizey; i++){
		for (var j = 0; j < this.sizex; j++){
			if (this.grid[i][j].owner == -1) {
				game.players[playerNum].score++;
				this.grid[i][j].owner = playerNum;
				this.grid[i][j].colour = game.players[playerNum].colour;
			}
		}
	}
	game.board.display();
	drawScoreBar();
}

Board.prototype.display = function () {
	for (var i = 0; i < this.sizey; i++){
		for (var j = 0; j < this.sizex; j++){
			ctx.fillStyle = pallet[this.grid[i][j].colour];
			ctx.fillRect(j*xsize,i*ysize + offy,xsize,ysize);
		}
	}
}

Board.prototype.drawSquare = function (x,y) {
			ctx.fillStyle = pallet[this.grid[y][x].colour];
			ctx.fillRect(x*xsize,y*ysize + offy,xsize,ysize);
}

Board.prototype.move = function (playerNum, colour) {
	console.log("move called",playerNum,colour);
	if (game.canMove == false){
		return;
	}
	if (colour == game.players[0].colour || colour == game.players[1].colour){
		return;
	}
	game.canMove = false;
	if (colour == null){
		colour = Math.floor(Math.random()*game.board.numColours);
		while (colour == game.players[0].colour || colour == game.players[1].colour){
			colour = Math.floor(Math.random()*game.board.numColours);
		}
	}
	game.board.unmarkAll();
	game.oldColour = game.players[playerNum].colour;
	newColour = colour;
	game.workingPlayer = playerNum;
	c = new Coord(game.players[playerNum].x,game.players[playerNum].y);
	addNode(c, true);
	flood();

}

/* * * * * * * * * * * * * * *
 * Additional business logic *
 * * * * * * * * * * * * * * */
function canChange (c, owned) {
	if (c.valid && 
		((owned && game.board.grid[c.y][c.x].colour == game.oldColour) || 
			game.board.grid[c.y][c.x].colour == newColour)){
		return true;

	}
	return false;
}

function addNode (c, owned) {
	if (canChange(c, owned) && game.board.grid[c.y][c.x].marked == false){
		game.floodQueue.push(c);
		drawQueue.push(c);
		game.board.grid[c.y][c.x].marked = true;
	}
}

function flood () {
	while (game.floodQueue.length > 0) {
		var count = game.floodQueue.length;
		while (count > 0){
			var current = game.floodQueue.shift();
			var c;
			game.board.grid[current.y][current.x].colour = newColour;
			game.board.grid[current.y][current.x].marked = true;
			//game.board.drawSquare(current.x,current.y);
			var owned = false;
			if (game.board.grid[current.y][current.x].owner == game.workingPlayer){
				owned = true;
			}
			c = new Coord(current.x+1,current.y);
			addNode(c, owned);
			c = new Coord(current.x,current.y+1);
			addNode(c, owned);
			c = new Coord(current.x-1,current.y);
			addNode(c, owned);
			c = new Coord(current.x,current.y-1);
			addNode(c, owned);
			count--;
		}
		//set the draw loop to stop drawing that wave for a delay
		drawQueue.push(null);
	}
	drawLoop();
}

function aftermath() {
	game.players[game.workingPlayer].colour = newColour;
	game.board.ownMarked(game.workingPlayer);
	drawScoreBar();
	game.canMove = true;
	if (game.workingPlayer == 1){
		game.workingPlayer = 0;
	} else {
		game.workingPlayer = 1;
	}
	if (game.repeater || game.workingPlayer == 1){
		setTimeout(function() { game.board.move(game.workingPlayer); }, 10);
	}else {
		displayBottom();
	}
	var winner = whoWon();
	if (winner != -1) { 
		drawWin(winner);
	}
}

function whoWon() {
	if (game.players[0].score + game.players[1].score >= game.board.sizex * game.board.sizey ||
			game.players[0].score > (game.board.sizex * game.board.sizey)/2 ||
			game.players[1].score > (game.board.sizex * game.board.sizey)/2) {
		if (game.players[0].score > game.players[1].score) {
			var winner = 0;
		} else {
			var winner = 1;
		}
		return winner;
	}
	else { 
		return -1;
	}
}

/* * * * * * * * * * *
 * Display Functions *
 * * * * * * * * * * */

function display() {
	drawScoreBar();
	game.board.display();
	displayBottom();
}

function drawLoop() {
	while (drawQueue.length > 0) {
		var current = drawQueue.shift();
		if (current != null) {
			game.board.drawSquare(current.x,current.y);
		} else {
			break;
		}
	}
	if (drawQueue.length > 0) {
		setTimeout(drawLoop,20);
	} else {
		aftermath();
		if (game.repeater) {
			setTimeout(function() { game.board.move(game.workingPlayer); }, 10);
		}
	}
	return;
}

function displayBottom() {
	for (var i = 0; i < game.board.numColours; i++) {
		ctx.fillStyle = pallet[i];
		ctx.fillRect(15+60*i, ysize*game.board.sizey + offy + 20, 40, 40);
		if (i == game.players[0].colour || i == game.players[1].colour) {
			ctx.lineWidth = 5;
			ctx.lineCap = "round";
			ctx.strokeStyle = "#CCC";
			drawCrossOut(i);
			ctx.lineWidth = 2;
			ctx.lineCap = "round";
			ctx.strokeStyle = "black";
			drawCrossOut(i);
		}
	}
}

function drawCrossOut (i) {
	ctx.beginPath();
	ctx.moveTo(25+60*i, ysize*game.board.sizey + offy + 30);
	ctx.lineTo(45+60*i, ysize*game.board.sizey + offy + 50);
	ctx.stroke();
	ctx.arc(35+60*i, ysize*game.board.sizey + offy + 40, 15, Math.PI/4, Math.PI/4 + 2*Math.PI, true);
	ctx.stroke();
}

function drawScoreBar() {
	ctx.fillStyle = "grey";
	ctx.fillRect(10,10,480,30);
	var leftWidth =  Math.ceil((game.players[0].score/(game.board.sizex * game.board.sizey)) * 480);
	var rightWidth = Math.floor((game.players[1].score/(game.board.sizex * game.board.sizey)) * 480);
	ctx.fillStyle = pallet[game.players[0].colour];
	ctx.fillRect(10,10,leftWidth,30);
	ctx.fillStyle = pallet[game.players[1].colour];
	ctx.fillRect(490 - rightWidth,10,rightWidth,30);
}

function drawWin(winner) {
	game.canMove = false;
	game.board.takeNeutral(winner);
	ctx.fillStyle = "black";
	ctx.font = "24pt Impact";
	ctx.fillText("PLAYER " + (winner+1) + " WINS!", 50, 450);
}

/* * * * * * * * * * *
 * Action Listeners  *
 * * * * * * * * * * */

$(document).ready(function() {
	$('#canvas').click(function (e) {
		var y = e.offsetY;
		var x = e.offsetX;
		if (y > ysize*game.board.sizey + offy + 20 && y < ysize*game.board.sizey + offy + 60) {
			var pos = x - 15;
			if (pos % 60 > 40) {
				return;
			}
			pos = Math.floor(pos / 60);
			if (pos < game.board.numColours) {
				console.log(pallet,pos);
				game.board.move(game.workingPlayer,pos);
			}
		}
	});
});
