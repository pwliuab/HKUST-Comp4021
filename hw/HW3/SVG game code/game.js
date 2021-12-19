// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}
//////////////////////////////////////////////
// The player class used in this program
///////////////////////////////////////////////
function Player() {
    this.node = document.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
    this.facingDir = faceDirection.RIGHT;
}

Player.prototype.isOnPlatform = function() {
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;
        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) {
              if(checkDisappearPlatform(platforms,node)){
                i--;
              }
              return true;
            }
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

Player.prototype.collidePlatform = function(position) {
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
}

Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}


//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 40);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 0);     // The initial position of the player

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 25;                     // The time interval of running the game


//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum
var faceDirection = {LEFT: 0, RIGHT: 1};
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var zoom = 1.0;                             // The zoom level of the screen

var BULLET_SIZE = new Size(10, 10); // The size of a bullet
var BULLET_SPEED = 10.0;            // The speed of a bullet
                                    //  = pixels it moves each game loop
var SHOOT_INTERVAL = 200.0;         // The period when shooting is disabled
var canShoot = true;                // A flag indicating whether the player can shoot a bullet
var BULLET_NUM = 8;
var MONSTER_SIZE = new Size(40, 40); // The size of a monster
var MONSTER_SPEED = 5;
var shootSound = null;
var killSound = null;
var winSound = null;
var loseSound = null;
var bgmTimer = null;
var gameEnd = true;
// generate random number for position
function getRandomInt(max) {
  return (Math.floor(Math.random() * max));
}
// Should be executed after the page is loaded
function load() {
  gameEnd = false;
  document.getElementById("highscoretable").style.setProperty("visibility", "hidden", null);
  shootSound = document.getElementById('shoot');
  killSound = document.getElementById('kill');
  winSound = document.getElementById('win');
  loseSound = document.getElementById('die');
  bgmSound = document.getElementById('bgm');
  // missSound = document.getElementById('boo');
    // Attach keyboard events
    document.addEventListener("keydown", keydown, false);
    document.addEventListener("keyup", keyup, false);
    // create platform
    // <rect style="fill:red" width="80" height="20" x="520" y="180"/>
    createSpecialPlatfrom(520,180,10,80,"vertical");
    // <rect style="fill:green" width="160" height="20" x="0" y="220"/>
    createSpecialPlatfrom(0,220,10,160,"disappearing");
    // <rect style="fill:blue" width="160" height="20" x="340" y="240"/>
    createSpecialPlatfrom(340,245,10,160,"disappearing");
    // <!-- <rect style="fill:blue" width="140" height="20" x="320" y="220"/> -->
    createSpecialPlatfrom(320,225,10,140,"disappearing");
    createPortal(0,10, "top");
    createPortal(SCREEN_SIZE.w-Portal_SIZE.w, SCREEN_SIZE.h - Portal_SIZE.h - 20, "bottom");
    // Create the player
    player = new Player();

    // Create the monsters
    //
    var difficulties = zoom;
    if(difficulties == 2){
      createMonster(getRandomInt(501) + 60, getRandomInt(380) + 120);
      createMonster(getRandomInt(501) + 60, getRandomInt(380) + 120);
      createMonster(getRandomInt(501) + 60, getRandomInt(380) + 120);
      createMonster(getRandomInt(501) + 60, getRandomInt(380) + 120);
    }
    createMonster(getRandomInt(501) + 60, getRandomInt(380) + 120);
    createMonster(getRandomInt(501) + 60, getRandomInt(380) + 120);
    createMonster(getRandomInt(501) + 60, getRandomInt(380) + 120);
    createMonster(getRandomInt(501) + 60, getRandomInt(380) + 120);
    createMonster(getRandomInt(501) + 60, getRandomInt(380) + 120);
    createMonster(getRandomInt(501) + 60, getRandomInt(380) + 120 , "special");

    // create goodthings
    createGoodthing(getRandomInt(491) + 60, getRandomInt(470) + 50);
    createGoodthing(getRandomInt(491) + 60, getRandomInt(470) + 50);
    createGoodthing(getRandomInt(491) + 60, getRandomInt(470) + 50);
    createGoodthing(getRandomInt(491) + 60, getRandomInt(470) + 50);
    createGoodthing(getRandomInt(491) + 60, getRandomInt(470) + 50);
    createGoodthing(getRandomInt(491) + 60, getRandomInt(470) + 50);
    createGoodthing(getRandomInt(491) + 60, getRandomInt(470) + 50);
    createGoodthing(getRandomInt(491) + 60, getRandomInt(470) + 50);
    createGoodthing(getRandomInt(491) + 60, getRandomInt(470) + 50);

    // create exit
    createExit(400,500);
    // Start the game interval
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
    gameTimer = setInterval("updateTimer()", 1000);
    playBGM();
}
/////////////////////////////////////
// timer setting
var gameTimer = null;
var secLeft = 60;
////////////////////////////////////
function playBGM(){
  bgmSound.currentTime = 0;
  bgmSound.play();
  clearInterval(bgmTimer);
  bgmTimer = setInterval("playBGM()", 28000);
}
function displayTimer(){
  var timer = document.getElementById("gameInfo");
  for(var i = 0; i < timer.childNodes.length; i++){
    var tag =timer.childNodes[i]
    var id = tag.id;
    if(id == "timeLeft"){
      tag.innerHTML = secLeft.toString();
    }
  }
}
function updateTimer(){

  if(secLeft == 0){
    clearInterval(gameInterval);
    clearInterval(SHOOT_INTERVAL);
    clearInterval(gameTimer);
    loseSound.currentTime = 0;
    loseSound.play();
    handleHighScoreTable();
    alert("Timeout! You Lose");
    endgame();
    return;
  }
  secLeft --;
  displayTimer();
  clearInterval(gameTimer);
  gameTimer = setInterval("updateTimer()", 1000);
}
function getUserID(restart=false){
  var name = prompt("Please enter your user ID");
  if(name == '' && !restart) name = 'Anonymous';

  var nameNode = document.getElementById("name");
  if(nameNode && name != '') {
    nameNode.childNodes[1].textContent = name;
  }
}
var timeLeftScore = 1;
function displayLevel(){
  var level = document.getElementById("gameInfo");
  for(var i = 0; i < level.childNodes.length; i++){
    var tag =level.childNodes[i]
    var id = tag.id;
    if(id == "level"){
      tag.innerHTML = zoom.toString();
    }
  }
}
function updateLevel(){

// re-filled bullet
  canShoot = true;
  BULLET_NUM = 8;
  monsterCanShoot = true;
// stop all timer
  if(gameInterval)  clearInterval(gameInterval);
  if(SHOOT_INTERVAL) clearInterval(SHOOT_INTERVAL);
  if(gameTimer) clearInterval(gameTimer);
  // update score -> 1* timeleft
  updateScore(secLeft * timeLeftScore + zoom*100);
  updateBulletNum();
  // reset time
  secLeft = 60;
  // clearScreen
  clearScreen();
  // level up
    zoom ++;
  if(zoom > 2){
    winSound.currentTime = 0;
    winSound.play();
    handleHighScoreTable();
    alert("All level Clear! Congratulations! Your boss 蟹老闆 decides to raise your salary");
    endGame();
    return;
  }
  alert("Congratulations! Let's go to Next Level!");


  // display level
  displayLevel();
  // call load() function
  load();
}
// suppose we have node name goodthings , monsters, bullets, special platform
// remove all the create element
function clearScreen(){
  var goodthings = document.getElementById("goodthings");
  while(goodthings.firstChild){
    goodthings.removeChild(goodthings.lastChild);
  }

  var monsters = document.getElementById("monsters");

  while(monsters.firstChild){

    monsters.removeChild(monsters.lastChild);
  }

  var bullets = document.getElementById("bullets");
  while(bullets.firstChild){
    console.log("remove bullets");
    bullets.removeChild(bullets.lastChild);
  }

  var platforms = document.getElementById("platforms");
  for(var i = 0; i < platforms.childNodes.length; i++){
    var node = platforms.childNodes[i];
    if(node.nodeName != "rect") continue;
    var type = node.getAttribute("type");
    if(type != "vertical" && type != "disappearing") continue;
    platforms.removeChild(node);
    i--;
  }
  var portals = document.getElementById("portals");
  while(portals.firstChild){
    portals.removeChild(portals.lastChild);
  }
  var exitDoors = document.getElementById("exitDoors");
  while(exitDoors.firstChild){
    exitDoors.removeChild(exitDoors.lastChild);
  }

}
function endGame(music = null){
  if(music){
    music.pause();
    music.play();
  }
  gameEnd = true;
  // clear score
  totalScore = 0;
  BULLET_NUM = 8;
  canShoot = true;
  secLeft = 60;
  zoom = 1;
  // clear all timer
  clearInterval(gameTimer);
  clearTimeout(shootingTimer);
  clearInterval(gameInterval);
  // clear screen
  clearScreen();
  // showGameOverscreen
}


function restartGame(){
  endGame();
  clearScreen();
  totalScore = 0;
  zoom = 1;
  BULLET_NUM = 8;
  secLeft = 60;
  monsterCanShoot = true;
  canShoot = true;
  displayLevel();
  displayTimer();
  updateBulletNum();
  updateScore(0);
  getUserID(true);
  load();
}

// append start screen to the game screen ;

function showStartscreen(){
  // openingBGM = document.getElementById("startSound");
  // openingBGM.play();
  // playOPSong();
  var startScreens = document.getElementById("startScreens");
  var startScreen = document.createElementNS("http://www.w3.org/2000/svg", "use");
  startScreen.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#startScreen");
  startScreens.appendChild(startScreen);
}
function removeStartscreen(){
  var startScreens = document.getElementById("startScreens");
  while(startScreens.firstChild){
    startScreens.removeChild(startScreens.lastChild);
  }
}
function startGame(){
  getUserID();
  removeStartscreen();
  // openingBGM.pause();
  // clearInterval(openingBGMTimer);
  load();
}
///////////////////////////////////////////////////////////////////
// good thing related function
//////////////////////////////////////////////////////////////////
var GOODTHING_SIZE = new Size(50,50);
var totalNumOfGoodThing = 0;
function isOnPlatform(px, py,objSize){
  var platforms = document.getElementById("platforms");
  for (var i = 0; i < platforms.childNodes.length; i++) {
      var node = platforms.childNodes.item(i);
      if (node.nodeName != "rect") continue;

      var x = parseFloat(node.getAttribute("x"));
      var y = parseFloat(node.getAttribute("y"));
      var w = parseFloat(node.getAttribute("width"));
      var h = parseFloat(node.getAttribute("height"));

      if (( (px + objSize.w > x && px < x + w) ) &&
          py + objSize.h == y) return true;
      }
  if (py + objSize.h == SCREEN_SIZE.h) return true;

  return false;
}

function isCollidingPlatform(position){
  var platforms = document.getElementById("platforms");
  for (var i = 0; i < platforms.childNodes.length; i++) {
      var node = platforms.childNodes.item(i);
      if (node.nodeName != "rect") continue;
      var x = parseFloat(node.getAttribute("x"));
      var y = parseFloat(node.getAttribute("y"));
      var w = parseFloat(node.getAttribute("width"));
      var h = parseFloat(node.getAttribute("height"));
      var pos = new Point(x, y);
      var size = new Size(w, h);
      if (intersect(position, GOODTHING_SIZE, pos, size)) {
        return true;
      }
  }
  return false;
}

function isCollidingGoodthing(position){
  var goodthings = document.getElementById("goodthings");
  for (var i = 0; i < goodthings.childNodes.length; i++){
    var node = goodthings.childNodes[i];
    var x = parseFloat(node.getAttribute("x"));
    var y = parseFloat(node.getAttribute("y"));
    var w = GOODTHING_SIZE.w;
    var h = GOODTHING_SIZE.h;
    var pos = new Point(x, y);
    var size = new Size(w, h);
    if (intersect(position, GOODTHING_SIZE, pos, size)) {
      return true;
    }
  }
  return false;
}

function isCollidingScreen(position, size){
  if(position.x < 0 || position.y < 0) return true;
  if(position.x + size.w > SCREEN_SIZE.w) return true;
  if(position.y + size.h > SCREEN_SIZE.h) return true;
  return false;
}

function createGoodthing(x, y){
  var goodthing = document.createElementNS("http://www.w3.org/2000/svg", "use");
  var position = new Point(x,y);
  // createSpecialPlatfrom(520,180,10,80,"vertical");
  // // <rect style="fill:green" width="160" height="20" x="0" y="220"/>
  // createSpecialPlatfrom(0,220,10,160,"disappearing");
  // prevent goodthing float on the air
  // prevent goodthing intersect with platforms
  // prevent goodthing coollided with each other
  // prevent goodthing generated on the special platform.
  while(!isOnPlatform(x,y, GOODTHING_SIZE) || isCollidingPlatform(position) || isCollidingScreen(position, GOODTHING_SIZE)
        || isCollidingGoodthing(position) || ObjIsOnSpecialPlatform(position.x,position.y, GOODTHING_SIZE)
        || ObjIsOnSpecialPlatform(position.x,position.y,GOODTHING_SIZE, "disappearing")
        || intersect(position, GOODTHING_SIZE, new Point(520,0), new Size(80, 180))){
    x = getRandomInt(491) + 60;
    y = getRandomInt(471) + 50;
    position.x = x;
    position.y = y;
  }

  goodthing.setAttribute("x", x);
  goodthing.setAttribute("y", y);
  goodthing.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#good_thing");
  totalNumOfGoodThing++;
  document.getElementById("goodthings").appendChild(goodthing);

}



//////////////////////////////////////////////////////////////////////////////////
/// monster related functions
////////////////////////////////////////////////////////////////////////////////
//
// This function creates the monsters in the game
//
var monsterCanShoot = true;
// create monster with different types
function createMonster(x, y, monType="normal") {
    var monster = document.createElementNS("http://www.w3.org/2000/svg", "use");
    monster.setAttribute("x", x);
    monster.setAttribute("y", y);
    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monsterss");
    monster.setAttribute("type", monType);
    monster.setAttribute("dir", "left");
    monster.setAttribute("currMovement", "0");
    document.getElementById("monsters").appendChild(monster);
}
// type == special monster can shoot only if the bullet is destroyed
function shootMonster(){
  // Create the bullet using the use node
  var bullet = document.createElementNS("http://www.w3.org/2000/svg", "use");
  // shoot to the right and play sound
  var monsters = document.getElementById("monsters");
  for(var i = 0; i < monsters.childNodes.length; i++){
    var monster = monsters.childNodes[i];
    if(monster.getAttribute("type") == "special" && monsterCanShoot == true){
      var facingDir = monster.getAttribute("dir");
      var mx = parseInt(monster.getAttribute("x"));
      var my = parseInt(monster.getAttribute("y"));
      if(facingDir == "right"){
        // shootSound.pause();
        // shootSound.play();
        bullet.setAttribute("x", mx + MONSTER_SIZE.w / 2 - BULLET_SIZE.w / 2);
        bullet.setAttribute("id", "right");
        bullet.setAttribute("type", "specialMonster");
      } else {
        // shootSound.pause();
        // shootSound.play();
        bullet.setAttribute("x", mx - MONSTER_SIZE.w / 2 + BULLET_SIZE.w / 2);
        bullet.setAttribute("id", "left");
        bullet.setAttribute("type", "specialMonster");
      }

      bullet.setAttribute("y", my + MONSTER_SIZE.h / 2 - MONSTER_SIZE.h / 2);
      bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
      document.getElementById("bullets").appendChild(bullet);
      monsterCanShoot = false;
    }
  }

}

/**
  1.move monster in a random way, flipping them if necessary
  2.randomly assign vertical movement to monster.
**/
var MONSTER_VerticalSpeed = 20;
function moveMonster(){

  var verDir = (getRandomInt(2) == 0) ? "upward" : "downward";
  var numOfMon = document.getElementById("monsters").childNodes.length;
  var monsters = document.getElementById("monsters");
  for(var i = 0; i < numOfMon; i ++){
    let x = parseInt(monsters.childNodes[i].getAttribute("x"));
    let y = parseInt(monsters.childNodes[i].getAttribute("y"));
    var currMovement = monsters.childNodes[i].getAttribute("currMovement");
    if(currMovement == "0"){
      verDir = (getRandomInt(2) == 0) ? "upward" : "downward";
      currMovement = verDir;
      monsters.childNodes[i].setAttribute("currMovement", currMovement);
    } else {
      verDir = currMovement;
    }
    var movingDir = monsters.childNodes[i].getAttribute("dir");
    // if the direction is move rightward, x coordinate keep incraesing
    if((x + MONSTER_SPEED) <= (SCREEN_SIZE.w - MONSTER_SIZE.w) && movingDir == "right"){
        monsters.childNodes[i].setAttribute("x", x + MONSTER_SPEED);
        // the flipping direction and displaying in a correct position.
        var e = 2 * x + MONSTER_SIZE.w;
        monsters.childNodes[i].setAttribute("transform","translate(" + e + "," + 0 + ")" + "scale(-1,1)");
    } else if((x + MONSTER_SPEED) > (SCREEN_SIZE.w - MONSTER_SIZE.w) && movingDir == "right"){
      // change direction
      // remove flipping direction
      monsters.childNodes[i].setAttribute("transform", "");
      monsters.childNodes[i].setAttribute("dir", "left");
      y = (verDir == "upward" && (y - MONSTER_VerticalSpeed) >= 0)? (y - MONSTER_VerticalSpeed) : ((verDir == "downward" && (y + MONSTER_VerticalSpeed + MONSTER_SIZE.h) <= SCREEN_SIZE.h)? (y + MONSTER_VerticalSpeed) : y);
      monsters.childNodes[i].setAttribute("y", y);
      var yy = (verDir == "upward" && (y - MONSTER_VerticalSpeed) >= 0)? (y - MONSTER_VerticalSpeed) : ((verDir == "downward" && (y + MONSTER_VerticalSpeed + MONSTER_SIZE.h) <= SCREEN_SIZE.h)? (4) : 5)
    }
    // if the monster moves leftward, the coordintae of x keep decreasing
    if((x - MONSTER_SPEED) >= 0 && movingDir == "left"){
      monsters.childNodes[i].setAttribute("x", x - MONSTER_SPEED);
    } else if((x - MONSTER_SPEED) < 0 && movingDir == "left") {
      //change horizontal directions
      monsters.childNodes[i].setAttribute("dir", "right");
      // change vertical motion
      y = (verDir == "upward" && (y - MONSTER_VerticalSpeed) >= 0)? (y - MONSTER_VerticalSpeed) : ((verDir == "downward" && (y + MONSTER_VerticalSpeed + MONSTER_SIZE.h) <= SCREEN_SIZE.h)? (y + MONSTER_VerticalSpeed) : y);

      // flipping
      //var e = x + MONSTER_SIZE.w;
      //monsters.childNodes[i].setAttribute("transform","translate(" + MONSTER_SIZE.w + "," + 0 + ")" +  "scale(-1,1)");
      monsters.childNodes[i].setAttribute("y", y);
      var e = 2 * x + MONSTER_SIZE.w;
      monsters.childNodes[i].setAttribute("transform","translate(" + e + "," + 0 + ")" + "scale(-1,1)");
    }

    if((y - MONSTER_VerticalSpeed) < 0 && verDir == "upward") monsters.childNodes[i].setAttribute("currMovement", "downward");
    if((y + MONSTER_VerticalSpeed + MONSTER_SIZE.h) > SCREEN_SIZE.h && verDir == "downward") monsters.childNodes[i].setAttribute("currMovement", "upward");


  }
}
//////////////////////////////////////////////////////////////////////
//  platform related function
//
//
var platformSpeed = 5;
var Portal_SIZE = new Size(50,50);
/////////////////////////////////////////////////////////////////////
// check any object is on the special platform including vertical moving one and the disappearing one.
function ObjIsOnSpecialPlatform(px, py, objSize, typeOfPlatform="vertical"){
  var platforms = document.getElementById("platforms");
  for (var i = 0; i < platforms.childNodes.length; i++) {
      var node = platforms.childNodes.item(i);
      if (node.nodeName != "rect") continue;
      if (node.getAttribute("type") != typeOfPlatform){
        continue;
      }
      var x = parseFloat(node.getAttribute("x"));
      var y = parseFloat(node.getAttribute("y"));
      var w = parseFloat(node.getAttribute("width"));
      var h = parseFloat(node.getAttribute("height"));

      if (( (px + objSize.w > x && px < x + w) ) &&
          py + objSize.h == y) return true;

  }
  return false;
}
// check whether the diappearing platform is triggered.
function checkDisappearPlatform(platforms, node){
    if(node.getAttribute("type")!="disappearing") return false;
    var platformOpacity  = parseFloat(node.style.getPropertyValue("opacity"));
    platformOpacity -= 0.1;
    node.style.setProperty("opacity", platformOpacity, null);
    if(platformOpacity == 0){
      platforms.removeChild(node);
      return true;
    }
    return false;
}

var Exit_SIZE = new Size(50,50);
// create exit door - remember to remove the door when go to next level before creating the new one
function createExit(x, y){
  var exitDoors = document.getElementById("exitDoors");
  var exitDoor = document.createElementNS("http://www.w3.org/2000/svg", "use");
  exitDoor.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#exit");
  exitDoor.setAttribute("x", x);
  exitDoor.setAttribute("y", y);
  exitDoors.appendChild(exitDoor);
}
// check whether player can go to the next level
function enterExit(){
  if(gameEnd) return;
  var goodthings = document.getElementById("goodthings");
  if(goodthings.firstChild) return;
  if(intersect(player.position, PLAYER_SIZE, new Point(400,500), Exit_SIZE)){
    winSound.currentTime = 0;
    winSound.play();
    updateLevel();
  }
}

function createPortal(x,y,corner){
  var portals = document.getElementById("portals");
  var portal = document.createElementNS("http://www.w3.org/2000/svg", "use");
  portal.setAttribute("x", x);
  portal.setAttribute("y",y);
  portal.setAttribute("type", corner);
  portal.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#portal");
  portals.appendChild(portal);
}

function transmitPlayer(corner){
  var portals = document.getElementById("portals");
  var tx = player.position.x;
  var ty = player.position.y;
  var enterPortal = false;
  for(var i = 0; i < portals.childNodes.length; i++){
    var x = parseInt(portals.childNodes[i].getAttribute("x"));
    var y = parseInt(portals.childNodes[i].getAttribute("y"));
    var typeCorner = portals.childNodes[i].getAttribute("type");
    if(corner != typeCorner) {
      ty = y;
      tx = x;
      continue;
    }
    if(intersect(new Point(x,y), Portal_SIZE, player.position, PLAYER_SIZE)){
      enterPortal = true;
    }
  }
  if(enterPortal){
    player.position.x = tx;
    player.position.y = ty;
  }
}

function createSpecialPlatfrom(x,y,h,w,type="disappearing"){
  var platforms = document.getElementById("platforms");
  var newPlatform = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  newPlatform.setAttribute("x", x);
  newPlatform.setAttribute("y", y);
  newPlatform.setAttribute("width", w);
  newPlatform.setAttribute("height", h);
  newPlatform.setAttribute("type", type);
  newPlatform.setAttribute("opacity",1, null);
  newPlatform.style.setProperty("opacity", 1, null);
  newPlatform.style.setProperty("stroke", "black", null);
  newPlatform.style.setProperty("stroke-width",10,null);
  if(type == "vertical"){
    newPlatform.setAttribute("dir", "upward");
    newPlatform.style.setProperty("stroke", "red", null);
  }
  platforms.appendChild(newPlatform);

}

function moveVericalPlatform(){
  var platforms = document.getElementById("platforms");
  var platforms = document.getElementById("platforms");
  for(var i = 0; i < platforms.childNodes.length; i++){
    // if(platforms.childNodes[i].nodeName != "rect") continue;
    var platform = platforms.childNodes[i];
    if (platform.nodeName != "rect") continue;
    var typeOfPlatform = platform.getAttribute("type");
    // if this is moving platform, move it...
    if(typeOfPlatform == "vertical"){
        var dir = platform.getAttribute("dir");
        var y = parseFloat(platform.getAttribute("y"));
        var combined_y = y;
        var x = parseFloat(platform.getAttribute("x"));
        var h = parseFloat(platform.getAttribute("height"));
        var w = parseFloat(platform.getAttribute("width"));
        // if player is on the platform and it is moving upward, the y coordinate should be player's one
        if(dir == "upward"){
          combined_y = (ObjIsOnSpecialPlatform(player.position.x,player.position.y, PLAYER_SIZE) == true) ? player.position.y: y;
        }
        // check the moving direction
        if(dir == "upward" && (combined_y - platformSpeed) >= 0){
          platform.setAttribute("y", y - platformSpeed);
          // if player is on the platform, move along with the platform
          if(combined_y != y) {player.position.y -= platformSpeed;}
        } else if(dir == "upward"){
          platform.setAttribute("dir", "downward");
        }

        if( (dir == "downward") &&  ((y + platformSpeed) <= (SCREEN_SIZE.h - h)) && !collideObj(new Point(x,y + platformSpeed), new Size(w,h), platform)){
          // if player is on the platform, move along with the platform
          if((ObjIsOnSpecialPlatform(player.position.x,player.position.y, PLAYER_SIZE) == true)){
              player.position.y += platformSpeed;
          }
            platform.setAttribute("y", y + platformSpeed);

        } else if(dir == "downward"){
            platform.setAttribute("dir", "upward");
        }
    } else {
      continue;
    }

  }
}

function collideObj(position,pltsize, selfNode) {
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;
        // ignore if the node is itself
        if (node == selfNode) continue;
        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, pltsize, pos, size)) return true;
    }
    // if(intersect(position, pltsize, player.position, PLAYER_SIZE)) return true;

    return false;
}


var shootingTimer = null;
////////////////////////////////////////////////////////////////////////////
// bullet related function
/////////////////////////////////////////////////////////////////////////
//
// This function shoots a bullet from the player
//
function shootBullet() {
    // Disable shooting for a short period of time
    canShoot = false;
    BULLET_NUM --;
    shootingTimer = setTimeout("canShoot = true", SHOOT_INTERVAL);
    // Create the bullet using the use node
    var bullet = document.createElementNS("http://www.w3.org/2000/svg", "use");
    // shoot to the right and play sound
    if(player.facingDir == faceDirection.RIGHT){
      shootSound.currentTime = 0;
      shootSound.play();
      bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2);
      bullet.setAttribute("id", "right");
    } else {
      shootSound.currentTime = 0;
      shootSound.play();
      bullet.setAttribute("x", player.position.x - PLAYER_SIZE.w / 2 + BULLET_SIZE.w / 2);
      bullet.setAttribute("id", "left");
    }

    bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
    document.getElementById("bullets").appendChild(bullet);
}


//
// This function updates the position of the bullets
//
function moveBullets() {
    // Go through all bullets
    var bullets = document.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);
        var bullType = node.getAttribute("type");
        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        if (x > SCREEN_SIZE.w || x < 0) {
            if(bullType == "specialMonster"){
              monsterCanShoot = true;
            }
            bullets.removeChild(node);
            i--;
        } else {
            if(node.getAttribute('id') == "right"){
              node.setAttribute("x", x + BULLET_SPEED);
            } else if(node.getAttribute('id') == 'left') {
              node.setAttribute("x", x - BULLET_SPEED);
            }
          }
        // If the bullet is not inside the screen delete it from the group

    }
}
function checkBulletNum(){
  if(BULLET_NUM == 0){
    canShoot = false;
    clearTimeout(shootingTimer);
  }
}
//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            player.motion = motionType.LEFT;
            player.facingDir = faceDirection.LEFT;
            transmitPlayer("top");
             enterExit();
            break;

        case "D".charCodeAt(0):
            player.motion = motionType.RIGHT;
            player.facingDir = faceDirection.RIGHT;
            transmitPlayer("bottom");
            enterExit();
            break;

// jumpping key
        case "W".charCodeAt(0):
            if (player.isOnPlatform()) {
                player.verticalSpeed = JUMP_SPEED;
            }
            break;
  // shooting key
  		case "H".charCodeAt(0): // spacebar = shoot
  			if (canShoot) {
          shootBullet();
          updateBulletNum();
          checkBulletNum();
        };
  			break;
    }
}


//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            transmitPlayer('top');
            enterExit();
            break;

        case "D".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            transmitPlayer('bottom');
            enterExit();
            break;
    }
}
///////////////////////////////
//Score and bullet interface//
//                          //
var totalScore = 0;
//////////////////////////////
function updateScore(mark){
  totalScore += mark;
  var score = document.getElementById("gameInfo");
  for(var i = 0; i < score.childNodes.length; i++){
    var tag =score.childNodes[i]
    var id = tag.id;
    if(id == "score"){
      tag.innerHTML = totalScore.toString();
    }
  }

}
function updateBulletNum(){
  var bullet = document.getElementById("gameInfo");
  for(var i = 0; i < bullet.childNodes.length; i++){
    var tag =bullet.childNodes[i]
    var id = tag.id;
    if(id == "bullet"){
      tag.innerHTML = BULLET_NUM.toString();
    }
  }
}

//
// This function checks collision
//
var monsterScore = 8;
var goodThingScore = 10;
var openingBGMTimer = null;
var openingBGM = null;
function playOPSong(){
  openingBGM.currentTime = 0;
  openingBGM.play();
  openingBGMTimer = setInterval(playOPSong(), 4400);
}
function handleHighScoreTable(){
  // openingBGM = document.getElementById("startSound");
  // playOPSong();
  var highScoreTable = getHighScoreTable();
  var nameNode = document.getElementById("name");
  var playerName = 'Anonymous';
  if(nameNode) {
    playerName = nameNode.childNodes[1].textContent;
  }
  var record = new ScoreRecord(playerName, totalScore);

  // Insert the new score record;
  var position = 0;
  while (position < highScoreTable.length) {
      var curPositionScore = highScoreTable[position].score;
      if (curPositionScore < totalScore)
          break;

      position++;
  }
  if (position < 10)
      highScoreTable.splice(position, 0, record);
  // claer existing value in the table
  var svgTableText = document.getElementById('highscoretext');

  while(svgTableText.firstChild){
    svgTableText.removeChild(svgTableText.lastChild);
  }
  // Store the new high score table
  setHighScoreTable(highScoreTable);

  // Show the high score table
  showHighScoreTable(highScoreTable);
}

function collisionDetection() {
    // Check whether the player collides with a monster
    var monsters = document.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        var x = parseInt(monster.getAttribute("x"));
        var y = parseInt(monster.getAttribute("y"));

        if (intersect(new Point(x, y), MONSTER_SIZE, player.position, PLAYER_SIZE)) {
            clearInterval(gameTimer);
            clearTimeout(shootingTimer);
            clearInterval(gameInterval);
            loseSound.currentTime = 0;
            loseSound.play();
            handleHighScoreTable();
            alert(" You Lose! You collided with monster!");
            endGame();

        }

    }

    // Check whether a bullet hits a monster
    var bullets = document.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));
        var bullType = bullet.getAttribute("type");
        if(bullType == "specialMonster" && intersect(player.position, PLAYER_SIZE, new Point(x,y), BULLET_SIZE)){
          clearInterval(gameTimer);
          clearTimeout(shootingTimer);
          clearInterval(gameInterval);
          loseSound.currentTime = 0;
          loseSound.play();
          handleHighScoreTable();
          alert("You Lose! You were shot by monster!");
          endGame();
        }
        for (var j = 0; j < monsters.childNodes.length; j++) {
            var monster = monsters.childNodes.item(j);
            var mx = parseInt(monster.getAttribute("x"));
            var my = parseInt(monster.getAttribute("y"));
            if (intersect(new Point(x, y), BULLET_SIZE, new Point(mx, my), MONSTER_SIZE) && bullType != "specialMonster") {
              killSound.currentTime = 0;
              killSound.play();
                monsters.removeChild(monster);
                j--;
                bullets.removeChild(bullet);
                i--;
                updateScore(monsterScore);
            }
        }
    }
    //Check whether goodthings collected by player
    var goodthings = document.getElementById("goodthings");
    for(var i = 0; i < goodthings.childNodes.length; i++){
      goodthing = goodthings.childNodes[i];
      var x = parseInt(goodthing.getAttribute("x"));
      var y = parseInt(goodthing.getAttribute("y"));
      if(intersect(new Point(x, y), GOODTHING_SIZE, player.position, PLAYER_SIZE)){
        goodthings.removeChild(goodthing);
        i --;
        updateScore(goodThingScore);
      };
    }
}

//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
    // Check collisions
    collisionDetection();

    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();

    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT)
        displacement.x = -MOVE_DISPLACEMENT;
    if (player.motion == motionType.RIGHT)
        displacement.x = MOVE_DISPLACEMENT;

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;
    shootMonster();
    moveBullets();
    moveMonster();
    moveVericalPlatform();
    updateScreen();
}


//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
/////////////////////////////////
//  variable for update screen
///////////////////////////////
currentDir = faceDirection.RIGHT;
xcor = 0;
scaling ='';
function updateScreen() {
  console.log(currentDir);
  console.log(xcor);
  console.log(scaling);

  var name= document.getElementById('name');
    // player change direction from left -> right or right -> left
    if(currentDir != player.facingDir){
      currentDir = player.facingDir;
    }
    // if Left do the transformation of scaling
    // else do not perform any special scaling
    if(currentDir == faceDirection.LEFT){
       xcor = player.position.x + PLAYER_SIZE.w;
       scaling = "scale(-1,1)";
    } else {
       xcor = player.position.x;
       scaling = "";
    }
    // x = player.position.x + PLAYER_SIZE.w;
    player.node.setAttribute("transform", "translate(" + xcor + "," + player.position.y + ")" + scaling);
    var namePosition = player.position.y - 5;

    name.setAttribute("transform", "translate(" + player.position.x + "," + namePosition + ")")

    // Add your code here

}
