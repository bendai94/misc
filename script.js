// Simple HTML5 example Blackjack
// Code by Ben Dailey
// bendai94@gmail.com


var canvas, ctx;
var waitForAnimation;

var deck;
var discard;

var dealerHand;
var dealerAces;
var dealerTotal;
var dealerShowing;

var playerHand;
var playerAces;
var playerTotal;

var playerBank = 100;
var playerBet;
var chipZ;
var betTutorial;
var dealTutorial;

var surrenderAvail;


var turn;
// 0 = dealing
// # = place on table
// 6 = dealer again

var phase;
/*  0 = before deal
    1 = initial deal, side-rules avaiable, players turn
    2 = players turn, side-rules not available
    3 = player stands, dealers turn
    4 = dealer finished, need to evaluate
    5 = victory determined, need to move money
    6 = finished moving money
    7 = discard cards
*/
var outcome;

var backgroundImage;
var holeCardImage;
var textBackground;
var betBackground;

var AnimationQueue;

var ShowBetTutorial;

//  constants

var speed = 10; // milliseconds between redraws, lower number = faster;
var delta = 40; // frames for each card move, higher is smoother, but slower

var deckX = 50;
var deckY = 50; 

var discardX = 800;
var discardY = 50;

var dealerX = 380;
var dealerY = 100;

var playerX = 380;
var playerY = 250;

var cardSpacing = 50;

/*
 destinations
-2 = discard
-1 = deck

0 = dealer
1 = player


*/

// -------------------------------------------------------------

// objects :

InsuranceEnum = {
  Unavailable : 0,
  Available : 1,
  NotTaken : 3,
  Insured : 4
}

function Card(index) {
    this.index = index;
    this.number = index % 13
    this.value = this.number
    this.src = "classicCards/";

    // face cards
    if (this.number == 11) {
    	this.number = "J";
    	this.value = 10;
    }
    if (this.number == 12) {
    	this.number = "Q";
    	this.value = 10;
    }
    if (this.number == 0) {
    	this.number = "K";
    	this.value = 10;
    }
    if (this.number == 1) {
    	this.number = "A";
    	this.value = 11;
    }
    // suit needed for pictures
    if (this.index > 39) {
    	this.suit = "S";
    }
    else if (this.index > 26) {
    	this.suit = "H";
    }
    else if (this.index > 13) {
    	this.suit = "D";
    }
    else {
    	this.suit = "C";
    }
    
    this.src += this.number + this.suit + ".png";
    var backSrc = "classicCards/0B.png";
    this.image = new Image();    
    this.image.src = this.src;
    
    this.back = new Image();
    this.back.src = backSrc;
    
    
}

// animation array entry for a card
function aCard (card, faceUp, fromX, fromY, toX, toY, destination) {
  this.card = card;
  this.faceUp = faceUp;
  this.fromX = fromX;
  this.fromY = fromY;
  this.toX = toX;
  this.toY = toY;
  this.destination = destination;
  this.currX = fromX;
  this.currY = fromY;
  this.goRight = true;
  this.goDown = true;
  this.DX = ((this.toX - this.fromX) / delta);
  this.DY = ((this.toY - this.fromY) / delta);
  if (this.toX < this.fromX) {
    this.goRight = false;
    this.DX = (((this.fromX - this.toX) / delta)*-1);
  }
  if (this.toY < this.fromY) {
    this.goDown = false;
    this.DY = (((this.fromY - this.toY) / delta)*-1);
  }
}

// player


function playerHit() {
	if (phase < 3) {
          phase = 2;
          var cardOffset = (playerHand.length-1) * cardSpacing;
          AnimationQueue.push(new aCard(deck.shift(), true, deckX, deckY, playerX+cardOffset, playerY, 1));
          waitForAnimation = true;
          
	}
}

// utility functions

function shuffle(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

function newDeal() {
  deck = new Array();
  for (var i=1;i<=52;i++) {
      deck.push(new Card(i));
  }
  shuffle(deck);
  
  while (discard.length > 1) {
  	discard.shift();
  }
  
  // init hands
  playerHand = new Array();
  
  dealerHand = new Array();
  
  if (playerBet > 0) {
  	phase = 1;
  }
  else {
  	phase = 0;
  }
  turn = 0;  
  
  outcome = "";

}

// adds up the dealers cards and fills the variables
function dealerLook() {
  dealerAces = 0;
  dealerTotal = 0;
  dealerShowing = 0;
  var holeCard = true;

  for (var i=0; i < dealerHand.length; i++) {
    if (dealerHand[i].card.number == "A") {
      dealerAces++;
    }
    dealerTotal += dealerHand[i].card.value;
    if (holeCard) {
    	holeCard = false;
    }
    else {
        dealerShowing += dealerHand[i].card.value;
    }
  }
  
  while (dealerTotal > 21 && dealerAces > 0) {
    dealerTotal -= 10;
    dealerAces -= 1;
  }
}

function playerLook() {
  playerAces = 0;
  playerTotal = 0;
  for (var i=0; i < playerHand.length; i++) {
      if (playerHand[i].card.number == "A") {
          playerAces++;
      }
      playerTotal += playerHand[i].card.value;
  }

  while (playerTotal > 21 && playerAces > 0) {
      playerTotal -= 10;
      playerAces -= 1;
  }
}


function victoryCheck() {
  
  dealerLook();
  playerLook();
  
  // player blackjack on draw
  if (phase == 1 && playerTotal == 21) {
    if (dealerTotal != 21) {
      outcome = "Blackjack! You win ";
      turn = 6;
      phase = 5;
      payout(3);
      
    }
    else {
      outcome = "PUSH";
      turn = 6;
      phase = 5;
      payout(1);
    }
  }
  
  // bust check, dealer auto-wins in 1v1
  if (phase == 2 || phase == 3) {
    if (playerTotal > 21) {
      outcome = "You Bust";
      turn = 6;
      phase = 5;
      payout(0);
    }
  }
  
  if (phase == 4) {
    // sanity check, player busted
    if (playerTotal > 21) {
      outcome = "You Bust";
      turn = 6;
      phase = 5;
      payout(0);
    }
    // dealer busts
    else if (dealerTotal > 21) {
      outcome = "Dealer Busts, you win ";
      turn = 6;
      phase = 5;
      payout(2);
    }
    // end with less than the dealer
    else if (playerTotal < dealerTotal) {
      outcome = "You Lose";
      turn = 6;
      phase = 5;
      payout(0);
    }
    // end with more than the dealer
    else if (playerTotal > dealerTotal) {
      outcome = "Win ";
      turn = 6;
      phase = 5;
      payout(2);
    }
    // tie
    else if (playerTotal == dealerTotal) {
      outcome = "Push, keep your bet";
      turn = 6;
      phase = 5;
      payout(1);
    }
  }
}

// 0=loss, 1=push 2=win, 3=blackjack
function payout(outcome) {
	if (outcome == 0) {

		playerBet = 0;
	}
	else if (outcome == 1) {
		playerBank += playerBet;
		playerBet = 0;
	}
	else if (outcome == 2) {
		playerBank += (playerBet *2);
		outcome += "$ " + (playerBet *2);
		playerBet = 0;
	}
	else if (outcome == 3) {
		var profit =  parseInt((playerBet *2.5));
		playerBank += profit;
		outcome += "$ " + profit;
		playerBet = 0;
	}
	
	document.getElementById("BtnDealMask").style.visibility = "visible";
	document.getElementById("BtnStandMask").style.visibility = "visible";
	document.getElementById("BtnHitMask").style.visibility = "visible";
	
	var betchips = document.getElementById("betSquare").childNodes;
	while (betchips.length > 0) {
		document.getElementById("betSquare").removeChild(document.getElementById("betSquare").firstChild);
	}
	// to allow betting again
	document.getElementById("betBankZone").style.zIndex = "-1";
	chipCheck();
	
	if (ShowTutorial > 0) {
		ShowTutorial -= 1;
	}
}

// -------------------------------------------------------------

// draw functions :

function clear() { // clear canvas function
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawScene() { // main drawScene function
	clear(); // clear canvas
	
	// background
	ctx.drawImage(backgroundImage, 0,0 );
	//ctx.fillText("Turn " + turn + " Phase " + phase, 10, 15);
	
	// environment
	
	// deck
    	var imgDeck = new Image();    
    	imgDeck.src = "classicCards/0B.png";
    	ctx.drawImage(imgDeck, deckX, deckY);
    	
    	if (discard.length > 0) {
    		ctx.drawImage(discard[discard.length-1].card.image, discardX, discardY );
    	}
    
	if (!waitForAnimation) {
		if (turn == 0 && phase == 2) {
			// dealer
			var newCard = deck.shift();
			AnimationQueue.push(new aCard(newCard, false, deckX, deckY, dealerX, dealerY, 0));
			
			newCard = deck.shift();
			newCard.faceUp = true;
			AnimationQueue.push(new aCard(newCard, true, deckX, deckY, dealerX+cardSpacing, dealerY, 0));
			
			// player
			
			newCard = deck.shift();
			newCard.faceUp = true;
			AnimationQueue.push(new aCard(newCard, true, deckX, deckY, playerX, playerY, 1));
			newCard = deck.shift();
			newCard.faceUp = true;
			AnimationQueue.push(new aCard(newCard, true, deckX, deckY, playerX+cardSpacing, playerY, 1));
			
			waitForAnimation = true;
			turn = 1;
			phase = 1;
			document.getElementById("BtnStandMask").style.visibility = "hidden";
			document.getElementById("BtnHitMask").style.visibility = "hidden";
			document.getElementById("betBankZone").style.zIndex = "5";
			document.getElementById("betDropZone").style.zIndex = "1000";
    
	    	}
	    	else if (turn == 1) { // players Turn
	    		if (phase == 1) { // check for side options
	    			
	    			if (dealerHand[1].card.number == "A") {
	    				insuranceAvail = true;
	    			}
	    			surrenderAvail = true;
	    			document.getElementById("BtnSurrender").style.visibility = "visible";

	    			
	    			// await player input to switch to phase 2 or higher
	    			victoryCheck(); // check for player blackjack
	    		}
	    		if (phase == 2) { // player made a decision, check for bust
	    			document.getElementById("BtnDealMask").style.visibility = "visible";
	    			victoryCheck();
	    		}
	    		if (phase == 3) { // player stands, dealers turn
	    			turn = 6;
	    		}
	    		
	    	
	    	}
	    	else if (turn == 6) {
	    		if (phase < 5) {
		    		dealerLook();
		    		
				if (dealerTotal < 17) {
					var freshCard = deck.shift()
					var cardOffset = (dealerHand.length-1) * cardSpacing;
					AnimationQueue.push(new aCard(freshCard, true, deckX, deckY, dealerX+cardOffset, dealerY, 0));
					waitForAnimation = true;
				}
				else if (dealerTotal >= 17) {
					phase = 4;
					victoryCheck();
				}
	    		}
		    	if (phase == 5 ) {
		    		for (var i=0; i < dealerHand.length; i++) {
					dealerHand[i].faceUp = true;
					phase = 6;
					document.getElementById("BtnSurrender").style.visibility = "hidden";
				}
			}
			if (phase == 6) {
				document.getElementById("betBankZone").style.zIndex = "-1";
			}
			if (phase == 7) {
				if (dealerHand.length > 0) {
					var oldCard = dealerHand.pop();
					AnimationQueue.push(new aCard(oldCard.card, true, oldCard.currX, oldCard.currY, discardX, discardY, -2));
				}
				else if (playerHand.length > 0)  {
					var oldCard = playerHand.pop();
					AnimationQueue.push(new aCard(oldCard.card, true, oldCard.currX, oldCard.currY, discardX, discardY, -2));
				}
				else {
					turn = -2;
					phase = 0;
				}
				waitForAnimation = true;
			}
			
	    	}
	}
	// animate any cards that need to be animated
	if (waitForAnimation) {
		
		if (AnimationQueue.length > 0) {
			
			//console.log(AnimationQueue.length +" | "+ AnimationQueue[0].currY +"|"+ AnimationQueue[0].toY);
			if (AnimationQueue[0].currX == AnimationQueue[0].toX && AnimationQueue[0].currY == AnimationQueue[0].currY) {
				switch (AnimationQueue[0].destination) {
					case 0:
						dealerHand.push(AnimationQueue.shift());
						break;
					case 1: 
						playerHand.push(AnimationQueue.shift());
						break;
					case -2:
						discard.push(AnimationQueue.shift());
						break;
				}
			}
			else {
				AnimationQueue[0].currX += AnimationQueue[0].DX;
				AnimationQueue[0].currY += AnimationQueue[0].DY;
				
				if ( AnimationQueue[0].currX > AnimationQueue[0].toX ) {
					AnimationQueue[0].currX == AnimationQueue[0].toX;
				}
				
				if ( AnimationQueue[0].goDown) {
					if ( AnimationQueue[0].currY > AnimationQueue[0].toY ) {
						AnimationQueue[0].currY == AnimationQueue[0].toY;
					}
				}
				else {
					if ( AnimationQueue[0].currY < AnimationQueue[0].toY ) {
						AnimationQueue[0].currY == AnimationQueue[0].toY;
					}
				}
				
				if (AnimationQueue[0].faceUp == false) {
					ctx.drawImage(AnimationQueue[0].card.back, AnimationQueue[0].currX, AnimationQueue[0].currY );
				}
				else {
					ctx.drawImage(AnimationQueue[0].card.image, AnimationQueue[0].currX, AnimationQueue[0].currY );
				}
			}
			
		}
		else {
			
			waitForAnimation = false;
			if (turn == -2) {
				newDeal();
			}
			
		}
	}
	
	
	// draw cards
	
	// dealer
	ctx.drawImage(textBackground, dealerX-10, dealerY-45);
	ctx.fillText("Dealer", dealerX, dealerY-20);
	
	// deck
    	var imgDeck = new Image();    
    	imgDeck.src = "classicCards/0B.png";
    	
    	ctx.drawImage(imgDeck, deckX, deckY);
	
	
	// dealer cards
	for (var i=0; i < dealerHand.length; i++) {
		if (!dealerHand[i].faceUp) {
		    ctx.drawImage(dealerHand[i].card.back, dealerX+(i*cardSpacing), dealerY );
		}
		else {
		    ctx.drawImage(dealerHand[i].card.image, dealerX+(i*cardSpacing), dealerY );
		}
	}
	
	dealerLook();
	ctx.textAlign = 'right';
	if (phase < 5) {
		ctx.fillText("Showing " + dealerShowing, dealerX+260, dealerY-20);
	}
	else {
		ctx.fillText("has " + dealerTotal, dealerX+260, dealerY-20);
	}
	ctx.textAlign = 'left';
	
	// player cards
	for (var i=0; i < playerHand.length; i++) {
		ctx.drawImage(playerHand[i].card.image, playerX+(i*cardSpacing), playerY );
	}
	
	// player
	ctx.drawImage(textBackground, playerX-10, playerY-45);
	ctx.fillText("Player", playerX, playerY-20);
	
	playerLook();
	
	ctx.textAlign = 'right';
	ctx.fillText(playerTotal, playerX+260, playerY-20);
	ctx.textAlign = 'left';
	
	ctx.drawImage(textBackground, playerX-10, 600);
	ctx.fillText("Your Chips", playerX, 625);
	ctx.textAlign = 'right';
	ctx.fillText("$ " + playerBank, playerX+260, 625);
	ctx.textAlign = 'left';

	// betting pot
	ctx.drawImage(betBackground, 580, 430);
	ctx.textAlign = 'center';
	ctx.fillText("Bet", 625, 460);
	ctx.fillText("$ " + playerBet, 625, 480);
	ctx.textAlign = 'left';

	// outcome
	if (outcome != "") {
		ctx.drawImage(textBackground, 580, 375);
	}
	ctx.fillText(outcome, 590, 400);
	
	if (ShowTutorial > 0) {
		if ((turn==0 && phase==0) || outcome != "") {
			ctx.drawImage(betTutorial,  80, 650);
		}
		if (turn==0 && phase==1 && playerBet > 0) {
			ctx.drawImage(dealTutorial, 80, 540);
		}
	}
}

// -------------------------------------------------------------

// initialization

$(function(){
    canvas = document.getElementById('scene');
    ctx = canvas.getContext('2d');
    waitForAnimation = false;

    var width = canvas.width;
    var height = canvas.height;

    backgroundImage = new Image();
    backgroundImage.src = 'images/table.png';

    holeCardImage = new Image();
    holeCardImage.src = 'classicCards/0B.png';
    
    betTutorial = new Image();
    betTutorial.src = "images/button_tut2.png";
    
    dealTutorial = new Image();
    dealTutorial.src = "images/button_tut1.png";
    
    textBackground = new Image();
    textBackground.src = "images/dark_bg.png";
    
    betBackground = new Image();
    betBackground.src = "images/square_dark_bg.png";
    
    CardLoc = new Array();
    DeckLoc = (50,50); 
    CardLoc[0] = (400, 50); // dealer
    CardLoc[1] = (400, 300); // player;
    
    insuraceAvail = false;
    surrenderAvail = false;
    doubleAvail = false;
    
    AnimationQueue = new Array();
    
    playerBet = 0;
    chipZ = 0;
    
    // inialize deck
    turn = 0;
    discard = new Array();
    newDeal();

    // UI
    ctx.font = "Bold 18px Garamond";
    ctx.fillStyle = "white";
    
    ShowTutorial = 2;

    setInterval(drawScene, speed); // loop drawScene
});

function BtnDeal_Click() {
	if (turn == 0 && phase == 1) {
		turn = 0;
		phase = 2;
	}
	else if (phase == 6 || turn == -1) {
		turn = 6;
		phase = 7;
		document.getElementById("BtnStandMask").style.visibility = "hidden";
		document.getElementById("BtnHitMask").style.visibility = "hidden";
	}
}

function BtnHit_Click() {
	if (phase < 3) {
          phase = 2;
          playerHit();
        }
}

function BtnStand_Click() {
	if (phase < 3) {
          phase = 3;
        }
}

function BtnSurrender_Click() {
	console.log(turn +"|"+ phase);
	payout(1);
	outcome = "Surrendered, keep your bet";
	turn = 6;
	phase = 5;
	document.getElementById("BtnSurrender").style.visibility = "hidden";
}

// Chip manipulation

function chipCheck() {
	if (playerBank >= 1) {
		document.getElementById("chip1").style.visibility = "visible";
	}
	else {
		document.getElementById("chip1").style.visibility = "hidden";
	}
	
	if (playerBank >= 5) {
		document.getElementById("chip5").style.visibility = "visible";
	}
	else {
		document.getElementById("chip5").style.visibility = "hidden";
	}
	
	if (playerBank >= 10) {
		document.getElementById("chip10").style.visibility = "visible";
	}
	else {
		document.getElementById("chip10").style.visibility = "hidden";
	}
	
	if (playerBank >= 20) {
		document.getElementById("chip20").style.visibility = "visible";
	}
	else {
		document.getElementById("chip20").style.visibility = "hidden";
	}
	
}
function betCheck() {
	
	if (playerBet > 0) {
		if (turn == 6 && phase == 6) {
			waitForAnimation = true;
			phase = 7;
			document.getElementById("BtnDealMask").style.visibility = "hidden";
			
		}
		
		if (phase == 0) {
			phase = 1;
			document.getElementById("BtnDealMask").style.visibility = "hidden";
			ctx.drawImage(dealTutorial, 80, 600);
		}
	}
	else {
		document.getElementById("BtnDealMask").style.visibility = "visible";
		phase = 0;
	}
}

function bet(val) {
	var node;
	switch (val) {
		case 1:
			node=document.getElementById("Chp01bet").cloneNode(true);
			break;
		case 5:
			node=document.getElementById("Chp05bet").cloneNode(true);
			break;
		case 10:
			node=document.getElementById("Chp10bet").cloneNode(true);
			break;
		case 20:
			node=document.getElementById("Chp20bet").cloneNode(true);
			break;
			
	}
	document.getElementById("betSquare").appendChild(node);
	node.style.zIndex = ++chipZ;
	var cX = Math.floor((Math.random()*60)-15);
	var cY = Math.floor((Math.random()*110)-15);
	node.style.left = cX + "px";
	node.style.top = cY + "px";
	
	document.getElementById("betDropZone").style.zIndex = "-1";
	
	playerBet += Number(val);
	playerBank -= Number(val);
	
	chipCheck();
	betCheck();
}

function take(event, val) {

	var node = event.target;
	
	document.getElementById("betSquare").removeChild(node);
	document.getElementById("betBankZone").style.zIndex = "-1";
	

	playerBet -= Number(val);
	playerBank += Number(val);
	
	chipCheck();
	betCheck();
	
}

// Drag & Drop code

function allowDrop(ev)
{
	ev.preventDefault();
}

function drag1(ev)
{
	
	ev.dataTransfer.setData("chip",ev.target.id);
	document.getElementById("betBankZone").style.zIndex = "-1";
	document.getElementById("betDropZone").style.zIndex = "1000";
	
}

function drag2(ev)
{
	
	ev.dataTransfer.setData("chip2",ev.target.id);
	document.getElementById("betDropZone").style.zIndex = "-1";
	document.getElementById("betBankZone").style.zIndex = "1000";
	
}

function drop1(ev)
{
	
	ev.preventDefault();
	var data=ev.dataTransfer.getData("chip");
	data = data + "bet";
	
	var node=document.getElementById(data).cloneNode(true);
	
	document.getElementById("betSquare").appendChild(node);
	var cX = event.pageX-505;
	var cY = event.pageY-410;
	document.getElementById(data).style.left = cX + "px";
	document.getElementById(data).style.top = cY + "px";
	document.getElementById(data).style.zIndex = ++chipZ;
	document.getElementById("betDropZone").style.zIndex = "-10";
	

	playerBet += Number(data.substring(3,5));
	playerBank -= Number(data.substring(3,5));
	
	chipCheck();
	betCheck();
}

function drop2(ev)
{
	
	ev.preventDefault();
	var data=ev.dataTransfer.getData("chip2");

	document.getElementById("betSquare").removeChild(document.getElementById(data));
	
	
	document.getElementById("betBankZone").style.zIndex = "-1";
	

	playerBet -= Number(data.substring(3,5));
	playerBank += Number(data.substring(3,5));
	
	chipCheck();
	betCheck();
}
