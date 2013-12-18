var Viewer = function(options){
  options = options || {};
  this.eleList = document.getElementsByClassName('ele');
  this.position = new MatrixUtil([[1,0,0,0],
                               [0,1,0,0],
                               [0,0,1,0],
                               [0,0,0,1]]);
  this.modX = 0;
  this.modY = 0;
  this.positionCoords = {x:0, y:0};
  this.contentCardPositions = [];
  this.contentCards = [];
  this.scrollSpeed = options.scrollSpeed || 30;
  this.friction = options.friction || .05;
  this.cardWidth = options.cardWidth || 280;
  this.cardHeight = options.cardHeight || 280;
  this.margin = options.margin || 30;
  this.numRows = options.numRows || 3;
  this.numColumns = options.numColumns || 4;
  this.reOrgRL = new MatrixUtil([[1,0,0,0],[0,1,0,0],[0,0,1,0],[this.numColumns*this.cardWidth,0,0,1]]);
  this.reOrgLR = new MatrixUtil([[1,0,0,0],[0,1,0,0],[0,0,1,0],[-this.numColumns*this.cardWidth,0,0,1]]);
  this.reOrgTB = new MatrixUtil([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,this.numRows*this.cardHeight,0,1]]);
  this.reOrgBT = new MatrixUtil([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,-this.numRows*this.cardHeight,0,1]]);
  this.backgroundMatrix
  this.counter = 0;
  this.contentStack = options.content;
}


Viewer.prototype.setupKeys = function(){
  //WASD controls
  var keypress = function(e){
     if(e.keyCode === 68){
      // this.lastDir = left;
      this.modX = -this.scrollSpeed;
     } else if(e.keyCode ===65){
      // this.lastDir = right;
      this.modX = this.scrollSpeed;
     } else if(e.keyCode ===83){
      // this.lastDir = up;
      this.modY = -this.scrollSpeed;
     } else if(e.keyCode ===87){
      // this.lastDir = down;
      this.modY = this.scrollSpeed;
     }
  }.bind(this);
  window.onkeydown = keypress;

  //window scroller
  var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x
  $(window).bind(mousewheelevt, function(e){
      e.preventDefault();
      var evt = window.event || e //equalize event object     
      evt = evt.originalEvent ? evt.originalEvent : evt; //convert to originalEvent if possible               
      var delta = evt.detail ? evt.detail*(-40) : evt.wheelDelta //check for detail first, because it is used by Opera and FF
      if(delta > 0) {
          this.modY = this.scrollSpeed;
      }
      else{
          this.modY = -this.scrollSpeed;
      }   
  }.bind(this));

  //leap motion controls
  var controller = new Leap.Controller({enableGestures: true});
  controller.connect();
  controller.on('frame', function (data) {
    this.handPos(data)
  }.bind(this));

};

Viewer.prototype.render = function(){
  this.counter++;
  // if(this.counter > 4){
  //   this.counter = 0;
  //   return
  // }
  var position = new MatrixUtil([[1,0,0,0],
                               [0,1,0,0],
                               [0,0,1,0],
                               [0,0,0,1]]);

  this.gridRebalance();

  if(this.modX <= .1 && this.modX >= -.1){
    this.modX = 0;
  } else if(this.modX > .1){
    this.modX = this.modX*.95 - this.friction
    position.translateX(this.modX)
  } else if(this.modX < .1){
    this.modX = this.modX*.95 + this.friction
    position.translateX(this.modX)
  } 

  if(this.modY <= .1 && this.modY >= -.1){
    this.modY = 0;
  } else if(this.modY > .1){
    this.modY = this.modY*.95 - this.friction
    position.translateY(this.modY)
  } else if(this.modY < .1){
    this.modY = this.modY*.95 + this.friction
    position.translateY(this.modY)
  }
  this.positionCoords.x += this.modX;
  this.positionCoords.y += this.modY;

  // this.backgroundMatrix.translateX(this.modX/20);
  // this.backgroundMatrix.translateY(this.modY/20);
  // var s1 = "matrix3d("+ this.backgroundMatrix.toString()+")";
  // this.backgroundImg.style['-webkit-transform'] = s1;

  var s = "matrix3d("+ this.position.toString()+")";
  for(var i = 0; i < this.numColumns*this.numRows; i++){
    var positionCopy = new MatrixUtil(position.copyMatrix());
    positionCopy.multiply(this.contentCardPositions[i])
    this.contentCardPositions[i] = positionCopy;
    var s = "matrix3d("+ this.contentCardPositions[i].toString()+")";
    this.contentCards[i].style['-webkit-transform'] = s;
  }
}

Viewer.prototype.setupCards = function(){
  var counter = 0;
  for(var i = 0; i < this.numRows; i++){
    for(var j = 0; j < this.numColumns; j++){
      var newCard = this.contentStack.pop();
      var anchorDiv = document.createElement('a');
      anchorDiv.href = newCard.url;
      anchorDiv.className = 'ele';
      var img = document.createElement('img');
      img.className = 'small-img';
      img.src = newCard.image_url;
      var name = document.createElement('div');
      name.innerHTML = newCard.name;
      name.className = 'name';
      anchorDiv.appendChild(img);
      anchorDiv.appendChild(name);
      document.getElementsByTagName('body')[0].appendChild(anchorDiv)

      var setupMatrix = new MatrixUtil([[1,0,0,0],
                                        [0,1,0,0],
                                        [0,0,1,0],
                                        [j*this.cardWidth+this.margin,i*this.cardHeight+this.margin,0,1]])
      var s = "matrix3d("+ setupMatrix.toString()+")";
      anchorDiv.style['-webkit-transform'] = s;
      this.contentCards.push(anchorDiv);
      this.contentCardPositions.push(setupMatrix);
      counter++
    }
  }

  // var img = document.createElement('img');
  // img.className = 'background-img';
  // img.src = '/background.jpg';
  // this.backgroundImg = img;
  // var imgdiv = document.createElement('div');
  // this.backgroundMatrix = new MatrixUtil([[1,0,0,0],
  //                                   [0,1,0,0],
  //                                   [0,0,1,0],
  //                                   [0,0,-20,1]])
  // // var s = "matrix3d("+ this.backgroundMatrix.toString()+")";
  // // imgdiv.style['-webkit-transform'] = s;
  // // img.style['-webkit-transform'] = s;
  // imgdiv.appendChild(img);
  // document.body.appendChild(imgdiv);
}


Viewer.prototype.initialize = function(){
  var self = this;
  this.setupKeys();
  this.setupCards();
  window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame
    })();

  (function animloop(){
    self.render()
    requestAnimFrame(animloop);
  })();
};

Viewer.prototype.gridRebalance = function(){
  var position = new MatrixUtil([[1,0,0,0],
                                 [0,1,0,0],
                                 [0,0,1,0],
                                 [0,0,0,1]]);
  var changedCards = [];
  for(var i = 0 ; i < this.contentCardPositions.length; i++){
    if(this.contentCardPositions[i].getMatrix()[3][0] < -400){
      //left to right
      var positionCopy = new MatrixUtil(this.reOrgRL.copyMatrix());
      positionCopy.multiply(this.contentCardPositions[i])
      this.contentCardPositions[i] = positionCopy;
      var s = "matrix3d("+ this.contentCardPositions[i].toString()+")";
      this.contentCards[i].style['-webkit-transform'] = s;
      changedCards.push(i);
    } else if(this.contentCardPositions[i].getMatrix()[3][0] > (520 + window.innerWidth)){
     //right to left
      var positionCopy = new MatrixUtil(this.reOrgLR.copyMatrix());
      positionCopy.multiply(this.contentCardPositions[i])
      this.contentCardPositions[i] = positionCopy;
      var s = "matrix3d("+ this.contentCardPositions[i].toString()+")";
      this.contentCards[i].style['-webkit-transform'] = s;
      changedCards.push(i);
    } else if(this.contentCardPositions[i].getMatrix()[3][1] < -600){
      //top to bottom
      var positionCopy = new MatrixUtil(this.reOrgTB.copyMatrix());
      positionCopy.multiply(this.contentCardPositions[i])
      this.contentCardPositions[i] = positionCopy;
      var s = "matrix3d("+ this.contentCardPositions[i].toString()+")";
      this.contentCards[i].style['-webkit-transform'] = s;
      changedCards.push(i);
    } else if(this.contentCardPositions[i].getMatrix()[3][1] > (200+window.innerHeight)){
      var positionCopy = new MatrixUtil(this.reOrgBT.copyMatrix());
      positionCopy.multiply(this.contentCardPositions[i])
      this.contentCardPositions[i] = positionCopy;
      var s = "matrix3d("+ this.contentCardPositions[i].toString()+")";
      this.contentCards[i].style['-webkit-transform'] = s;
      changedCards.push(i);
    }
  }
  this.updateContent(changedCards);
  this.contentStack.getContent();
};

Viewer.prototype.updateContent = function(changedCards){
  for(var i = 0 ; i < changedCards.length; i++){
    var newCard = this.contentStack.pop()
    if(newCard){
      this.contentCards[changedCards[i]].innerHTML = "";
      var anchorDiv = document.createElement('a');
      anchorDiv.href = newCard.url;
      var img = document.createElement('img');
      img.className = 'small-img';
      img.src = newCard.image_url;
      var name = document.createElement('div');
      name.innerHTML = newCard.name;
      name.className = 'name';
      anchorDiv.appendChild(img);
      anchorDiv.appendChild(name);
      this.contentCards[changedCards[i]].appendChild(anchorDiv)
    }
  }
}

Viewer.prototype.handPos = function (frame) {
  var hands = frame.hands
    if(hands[0]){
      if(hands[0].palmNormal[0] < -.4){
        this.modX = -this.scrollSpeed;
      } 
      if(hands[0].palmNormal[0] > .4){
        this.modX = this.scrollSpeed;
      } 
      if(hands[0].palmNormal[2] > .4){
        this.modY = this.scrollSpeed;
      } 
      if(hands[0].palmNormal[2] < -.4){
        this.modY = -this.scrollSpeed;
      } 
    }
};



