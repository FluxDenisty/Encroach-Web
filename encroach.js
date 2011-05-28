///Drawing Variables
var ctx;
var xsize = 20;
var ysize = 20;
var offy = 0;
var pallet = ["red","blue","green","orange","yellow","purple"];

//Global Vars
var board;
var players = [];
var check = [];
var oldColour;
var nextColour;
var workingPlayer;
var canMove = true;
var repeater = true;

function Coord (x,y) {
	this.x = x;
	this.y = y;
	this.valid = true;
	if (x < 0 || x >= board.sizex || y < 0 || y >= board.sizey){
		this.valid = false;
	}
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
	if (players.length == 1) {
		this.x = board.sizex - 1;
		this.y = board.sizey - 1;
	}
	this.colour = board.grid[this.y][this.x];
	board.grid[this.y][this.x].owner = players.length + 1;
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

function Board (sizex, sizey, colourNum){
	if (!colourNum){
		colourNum = 6;
	}
	if (!sizex){
		sizex = 20;
	}
	if (!sizey){
		sizey = 20;
	}
	this.sizex = sizex;
	this.sizey = sizey;
	this.colourNum = colourNum;
	this.grid = [];
	for (var i = 0; i < sizey; i++){
		this.grid[i] = [];
		for (var j = 0; j < sizex; j++){
			this.grid[i][j] = new Square(null, colourNum);
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
	for (var i = 0; i < this.sizey; i++){
		for (var j = 0; j < this.sizex; j++){
			if (this.grid[i][j].marked == true) {
				this.grid[i][j].owner = playerNum;
			}
		}
	}
}

Board.prototype.display = function () {
	for (var i = 0; i < this.sizey; i++){
		for (var j = 0; j < this.sizex; j++){
			ctx.fillStyle = pallet[this.grid[i][j].colour];
			ctx.fillRect(j*xsize,i*ysize + offy,xsize,ysize);
		}
	}
}

Board.prototype.move = function (playerNum, colour) {
	if (canMove == false){
		return;
	}
	canMove =false;
	if (colour == null){
		colour = Math.floor(Math.random()*6);
		while (colour == players[0].colour && colour == players[1].colour){
			colour = Math.floor(Math.random()*6);
		}
	}
	board.unmarkAll();
	oldColour = players[playerNum].colour;
	newColour = colour;
	workingPlayer = playerNum;
	check.push(new Coord(players[playerNum].x,players[playerNum].y));

	console.log('inside move', check);
	temp();			

}

function init() {
	var canvas = $('#canvas').get(0);
	if (!canvas.getContext){
		return;
	}
	ctx = canvas.getContext('2d');
	board = new Board(68,31);
	players[0] = new Player("Ryan",0);
	players[1] = new Player(null,1);
	display();
	board.move(0);
}

function display() {
	board.display();
	displayBottom();
}

function displayBottom() {

}

function canChange (c, owned) {
	if (c.valid && board.grid[c.y][c.x].marked == false 
	&& ((owned && board.grid[c.y][c.x].colour == oldColour) || board.grid[c.y][c.x].colour == newColour)){
		return true;

	}
	return false;
}

function temp () {
	console.log("temp has been called", check);
	var count = check.length;
	while (count > 0){
		var current = check.shift();
		var c;
		board.grid[current.y][current.x].colour = newColour;
		board.grid[current.y][current.x].marked = true;
		var owned = false;
		if (board.grid[current.y][current.x].owner == workingPlayer){
			owned = true;
		}
		c = new Coord(current.x+1,current.y);
		if (canChange(c, owned)){
			check.push(c);
			board.grid[c.y][c.x].marked = true;
		}
		c = new Coord(current.x,current.y+1);
		if (canChange(c, owned)){
			check.push(c);
			board.grid[c.y][c.x].marked = true;
		}
		c = new Coord(current.x-1,current.y);
		if (canChange(c, owned)){
			check.push(c);
			board.grid[c.y][c.x].marked = true;
		}
		c = new Coord(current.x,current.y-1);
		if (canChange(c, owned)){
			check.push(c);
			board.grid[c.y][c.x].marked = true;
		}
		count--;
	}
	board.display();
	if (check.length > 0){
		console.log('setTimeout called', check);
		setTimeout(temp,25);
	}else{
		console.log('temp2', check, 'length', check.length);
		temp2();
	}
}

function temp2() {
	players[workingPlayer].colour = newColour;
	board.ownMarked(workingPlayer);
	canMove = true;
	if (repeater){
		if (workingPlayer == 1){
			workingPlayer = 0;
		} else {
			workingPlayer = 1;
		}
		setTimeout(function() { board.move(workingPlayer); }, 50);
	}
}
