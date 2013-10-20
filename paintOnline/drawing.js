window.onload = work;

var isDrawingLine = false;
var initialPos = null;

var action = "";//to initiate draw
var shape = "";//choosen shape to draw

var stroke = 2;//stroke weight
var strColor = 'black';//Stroke color

var fill    = 'transparent';// Fill in color

var newLine = null; //choosenLine
var myLines;
var ctx;
var canvas;

//Change the border/stroke weight of the shape
function strkWeight(value) {
    console.log(value);
    stroke = value;
    
    if (newLine){
        newLine.strweight = value; 
        recreateCanvas(myLines, ctx);
        newLine.highlight(ctx);
    
    };
    
    
};

//Change the border/stroke color of the shape
function strkColor(value, button) {
    enableDiv("stroke");
    button.disabled = true;
    console.log(button);
    strColor = value;
    
    if (newLine){
        newLine.strcolor = value; 
        recreateCanvas(myLines, ctx);
        newLine.highlight(ctx);
    
    };
    
    
};

//Change the fill in color of the shape
function fillColor(value, button) {
    enableDiv("fill");
    button.disabled = true;
    console.log(button);
    fill = value;
    
    if (newLine){
        newLine.fill = value; 
        recreateCanvas(myLines, ctx);
        newLine.highlight(ctx);
    
    };
    
};

//disable all the element with id name and its children
function disableDiv(value){
    console.log(value);
    var nodes = document.getElementById(value).getElementsByTagName('*');
        for(var i = 0; i < nodes.length; i++){

            nodes[i].disabled = true;
        }
};

//enable all the element with id name and its children
function enableDiv(value){
    var nodes = document.getElementById(value).getElementsByTagName('*');
        for(var i = 0; i < nodes.length; i++){

            nodes[i].disabled = false;
        }
}

//chooses the shape that will drawn on the canvas
function drawShape(radioAction, button) {
    action = "draw";
    shape = radioAction;
    button.disabled = true;

};

//Return position of mouse relative to canvas
function getMousePos(canvas, evt) {
    var x = evt.pageX;
    var y = evt.pageY;

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    return {
        x: x,
        y: y
    };
};

//Return distance between point p and point q
function distance(pX, pY, qX, qY) {

    var xValue = qX - pX;
    var yValue = qY - pY;

    xValue = xValue * xValue;
    yValue = yValue * yValue;

    return Math.sqrt(xValue + yValue);

};

//-----------------------CIRCLE-------------------//

//Circle class
function Circle(x,y) {
    
    this.x = x;
    this.y = y;
    
};

//Return true if mousePos is inside the circle; false otherwise;
Circle.prototype.choosen = function(mousePos){
    var relDist = distance(mousePos.x, mousePos.y, this.x, this.y);
    if (relDist <= 10){
        return true;
    };
    return false;
};

//--------------END CIRCLE------------------------//


//----------------LINE----------------------------//
//Line class    
function Line(initial, final, color, stroke) {

    this.difX;
    this.difY;
    this.iniY = initial.y;
    this.finalY = final.y;
    this.iniX = initial.x;
    this.finalX = final.x;
    this.chooseV;
    this.strcolor = color;
    
    this.fill;
    
    this.strweight =stroke;
};

//make sure initial point always on top of final point
Line.prototype.readjust = function() {

    if (this.iniY > this.finalY) {
        var initialX = this.iniX;
        var initialY = this.iniY;

        this.iniY = this.finalY;
        this.finalY = initialY;
        this.iniX = this.finalX;
        this.finalX = initialX;
    }

};

//Highlight the line by drawing circles on its end points
Line.prototype.highlight = function(ctx) {
    
    this.redraw(ctx);
    
    ctx.beginPath();
    ctx.arc(this.iniX,this.iniY,10,0,2*Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();
    console.log("drawing circle\n");
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(this.finalX,this.finalY,10,0,2*Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.stroke();
    
    var circle = new Array();
    var circleOne = new Circle(this.iniX,this.iniY);
    var circleTwo = new Circle(this.finalX, this.finalY);
    circle.push(circleOne);
    circle.push(circleTwo);
    return circle;
};

//Determine which side is  choosen to resize
Line.prototype.choosenV = function(circle){
    
    if (circle.x === this.iniX){
        this.chooseV = 1;
    }
    else{
        this.chooseV = 2;
    }
    
};

//Draw the line on canvas
Line.prototype.redraw = function(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.iniX, this.iniY);
    ctx.lineTo(this.finalX, this.finalY);
    ctx.strokeStyle = this.strcolor;
    ctx.lineWidth = this.strweight  ;
    ctx.closePath();
    ctx.stroke();

};

//Adjust the positions of initial and final points according chooseV and point
Line.prototype.resize = function(ctx, point, circle) {

    if (circle === 1){
        this.finalX = point.x;
        this.finalY = point.y;
    }
    
    else{
        if( this.chooseV === 1){
            this.iniX = point.x;
            this.iniY = point.y;
        }
        else{
            this.finalX = point.x;
            this.finalY = point.y;
        }
    };

    //this.readjust();
    this.redraw(ctx);

};

//Move the line to point coordinate
Line.prototype.move = function(ctx, point) {
    var distX = this.finalX - this.iniX;
    var distY = this.finalY - this.iniY;

    this.iniX = point.x - this.difX;
    this.iniY = point.y - this.difY;
    this.finalX = this.iniX + distX;
    this.finalY = this.iniY + distY;

    this.redraw(ctx);
    /*alert("iniX : " + this.iniX +"\nfinalX :" + this.finalX + 
     "\niniY : " + this.iniY +"\nfinalY :" + this.finalY);*/
};

//Create an exact copy of the line
Line.prototype.createCopy = function(mousePos){
    var newLine = new Line(mousePos, mousePos, 'white');
    newLine.iniX = this.iniX + 10;
    newLine.iniY = this.iniY + 10;
    newLine.finalX = this.finalX +10;
    newLine.finalY = this.finalY + 10;
    newLine.color = this.color;
    newLine.stroke = this.stroke;
    return newLine;
    
};

//Return gradient and y-intercept of the line
Line.prototype.mc = function() {
    //y = mx + c
    var m = (this.iniY - this.finalY) / (this.iniX - this.finalX);
    var c = this.iniY - (m * this.iniX);
    return {
        m: m,
        c: c
    };

};

//Return true in the point is inside the line; false otherwise
Line.prototype.inLine = function(point) {

    var mc = this.mc();
    var relative = this.strweight;

    if ((point.y <= this.finalY + relative) && (point.y >= this.iniY - relative)) {

        var relX = (point.y - mc.c) / (mc.m);
        if (Math.abs(mc.m) < 0.1) {
            if ((point.x <= Math.max(this.iniX, this.finalX)) && (point.x >= Math.min(this.iniX, this.finalX))) {
                this.difY = point.y - this.iniY;
                this.difX = point.x - this.iniX;
                return true;
            };
        }
        else if ((point.x <= (relX + 5) + relative) && (point.x >= (relX - 5) - relative)) {
            // Set the different between point and inital point,
            //So when moving the object, we can draw initial and final point relative to the given point
            this.difY = point.y - this.iniY;
            this.difX = point.x - this.iniX;
            console.log(point.x + " relX :" + relX);
            return true;
        };
        console.log(point.x + " relX :" + relX);
    };
    return false;
};

//-----------------LINE END---------------------------//


//-----------------TRIANGLE-------------------------//
//Helper function used in determining whether point p1 is in triangle
function sign(p1x, p1y,p2x, p2y, p3x, p3y){
  var bay =  ((p1x - p3x) * (p2y - p3y)) - ((p2x - p3x) * (p1y - p3y));
  return (bay < 0.0);
}

//Triangle class
function Triangle(point1, point2, point3, strcolor, stroke, fillColor){
    
    //point 1 (left corner)
    this.oneX =point1.x;
    this.oneY = point1.y;
    
    //point 2 (height)
    this.twoX = point2.x;
    this.twoY = point2.y;
    
    //point 3 (right)
    this.threeX = point3.x;
    this.threeY = point3.y;
    
    //difference with 
    this.ratioX;
    this.ratioY;
    
    //chooseVertex
    this.chooseV;
    
   
    this.strweight = stroke;
    this.strcolor = strcolor;
    
    this.fill = fillColor;  
   
    console.log(this.fill + "  " + this.strcolor);
    
};

//Draw triangle on canvas
Triangle.prototype.redraw = function(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.oneX, this.oneY);
    ctx.lineTo(this.twoX, this.twoY);
    ctx.lineTo(this.threeX, this.threeY);
    ctx.strokeStyle = this.strcolor;
    ctx.fillStyle = this.fill;
    ctx.lineWidth = this.strweight;
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

};

//Determine which vertex is  choosen to resize
Triangle.prototype.choosenV = function(circle){
    
    if ((circle.x === this.oneX)&& (circle.y === this.oneY)){
        this.chooseV = 1;
    }
    
    else if (circle.x === this.twoX){
        this.chooseV = 2;
    }
    else {
        this.chooseV = 3;
    };
    
};

//Highlight triangle by drawing circles on its 
Triangle.prototype.highlight = function(ctx) {
    
    this.redraw(ctx);
    
    ctx.beginPath();
    ctx.arc(this.oneX,this.oneY,10,0,2*Math.PI);
    ctx.fillStyle = 'black';
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(this.twoX,this.twoY,10,0,2*Math.PI);
    ctx.fillStyle = 'black';
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(this.threeX,this.threeY,10,0,2*Math.PI);
    ctx.fillStyle = 'black';
    ctx.closePath();
    ctx.fill();
    
    var circle = new Array();
    var circleOne = new Circle(this.oneX,this.oneY);
    var circleTwo = new Circle(this.twoX, this.twoY);
    var circleThree = new Circle(this.threeX, this.threeY);
    
    circle.push(circleOne);
    circle.push(circleTwo);
    circle.push(circleThree);
    return circle;
};

//Move the choosen vertex to the point
Triangle.prototype.resize = function(ctx, point, circle) {

    if (circle === 1){
        this.threeX = point.x;
        this.threeY = point.y;
        
        this.twoX = this.oneX + ((this.threeX - this.oneX)/2);
        this.twoY = this.oneY - Math.abs(this.twoX - this.oneX);
        if (this.twoY < 5){
            this.twoY = 5;
        }
        
        /*console.log("point 1:" + this.oneX + "," + this.oneY);
        console.log("point 2:" + this.twoX + "," + this.twoY);
        console.log("point 3:" + this.threeX + "," + this.threeY);
        console.log("point :" + point.x + "," + point.y);*/
    }
    else{
        if (this.chooseV === 1){
            this.oneX = point.x;
            this.oneY = point.y;
        }
        
        else if (this.chooseV === 2){
            this.twoX = point.x;
            this.twoY = point.y;
        }
        
        else{
            this.threeX = point.x;
            this.threeY = point.y;
        }
    }
    
    
    
    this.redraw(ctx);
};

//Return true in the point is inside the triangle; false otherwise
//Follows same principle as line
Triangle.prototype.inLine = function(point){
    var b1, b2, b3;
    
    b1 = sign(point.x, point.y, this.oneX, this.oneY, this.twoX, this.twoY);
    b2 = sign(point.x, point.y, this.twoX, this.twoY, this.threeX, this.threeY);
    b3 = sign(point.x, point.y, this.threeX, this.threeY, this.oneX, this.oneY);
    
    if ((b1 === b2) &&(b2 === b3)){
        this.ratioX = this.oneX - point.x;
        this.ratioY = this.oneY - point.y;
        return true;
    }
    
    return false;
};

//Does nothing, just comply with line class
Triangle.prototype.readjust = function(){};

//Move the triangle to point coordinate
Triangle.prototype.move = function(ctx, point){
    
    var oneTotwoX = this.twoX - this.oneX;
    var oneTotwoY = this.twoY - this.oneY;
    
    var oneTothreeX = this.threeX - this.oneX;
    var oneTothreeY = this.threeY - this.oneY;
    
    this.oneX = point.x + this.ratioX ;
    this.oneY = point.y + this.ratioY ;
    
    this.twoX = oneTotwoX + this.oneX ;
    this.twoY = oneTotwoY + this.oneY ;
    
    this.threeX = oneTothreeX + this.oneX ;
    this.threeY = oneTothreeY + this.oneY ;
    
    this.redraw(ctx);
    
};

//Create exact same copy as this triangle
Triangle.prototype.createCopy = function(mousePos){
    var newLine = new Triangle(mousePos, mousePos,  mousePos, 'white', 2, 'white');
    newLine.oneX = this.oneX + 10;
    newLine.oneY = this.oneY + 10;
    newLine.twoX = this.twoX +10;
    newLine.twoY = this.twoY + 10;
    newLine.threeX = this.threeX +10;
    newLine.threeY = this.threeY + 10;
    newLine.strcolor = this.strcolor;
    newLine.fill = this.fill;
    newLine.strweight = this.strweight;
    return newLine;
    
};

//-------------------END TRIANGLE------------------//



//------------------RECTANGLE-------------------//
//Rectangle class
function Rectangle (initial, final, strcolor, stroke, fillColor){
    
    this.iniX = initial.x;
    this.iniY = initial.y;
    
    this.width = final.x - this.iniX;
    this.height = final.y - this.iniY;
    
    this.finalX = final.x;
    this.finalY = final.y;
    
    this.ratioX;
    this.ratioY;
    
    this.chooseV;
    
    this.strcolor = strcolor;
    this.strweight = stroke;
    
    this.fill = fillColor;

    console.log(this.fill + "  " + this.strcolor);
    
}

//Draw rectanle on canvas
Rectangle.prototype.redraw = function(ctx) {
    
   ctx.fillStyle = this.fill;
   ctx.fillRect(this.iniX, this.iniY, this.width, this.height);

    ctx.strokeStyle = this.strcolor;
    ctx.lineWidth = this.strweight;
    ctx.strokeRect(this.iniX, this.iniY, this.width, this.height);
   

};

//Determine which vertex is  choosen to resize
Rectangle.prototype.choosenV = function(circle){  
  if (circle.x === this.iniX){
      if(circle.y === this.iniY){
          this.chooseV = 1;
      }
      else{
        this.chooseV = 2;  
      };
  }
  else{
     if(circle.y === this.iniY){
          this.chooseV = 4;
      }
      else{
        this.chooseV = 3;  
      };  
  };
};  
    
 //Highlight rectangle by drawing circles on its vertex   
Rectangle.prototype.highlight = function(ctx) {
    
    this.redraw(ctx);
    
    ctx.beginPath();
    ctx.arc(this.iniX,this.iniY,10,0,2*Math.PI);
    ctx.fillStyle = 'black';
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(this.iniX,this.finalY,10,0,2*Math.PI);
    ctx.fillStyle = 'black';
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(this.finalX,this.iniY,10,0,2*Math.PI);
    ctx.fillStyle = 'black';
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(this.finalX, this.finalY,10,0,2*Math.PI);
    ctx.fillStyle = 'black';
    ctx.closePath();
    ctx.fill();
    
    var circle = new Array();
    var circleOne = new Circle(this.iniX,this.iniY);
    var circleTwo = new Circle(this.iniX,this.finalY);
    var circleThree = new Circle(this.finalX,this.iniY);
    var circleFour = new Circle(this.finalX, this.finalY);
    
    circle.push(circleOne);
    circle.push(circleTwo);
    circle.push(circleThree);
    circle.push(circleFour);
    return circle;
};

//if circle is one, move final vertex to the point;
//Move the choosen vertex to the point otherwise
Rectangle.prototype.resize = function(ctx, point, circle) {
    
    if (circle === 1){
        this.finalX = point.x;
        this.finalY = point.y;
        
        /*console.log("point 1:" + this.oneX + "," + this.oneY);
        console.log("point 2:" + this.twoX + "," + this.twoY);
        console.log("point 3:" + this.threeX + "," + this.threeY);
        console.log("point :" + point.x + "," + point.y);*/
    }
    else{
        if (this.chooseV === 1){
            this.iniX = point.x;
            this.iniY = point.y;
        }
        
        else if (this.chooseV === 2){
             this.iniX = point.x;
             this.finalY = point.y;
        }
        
        else if (this.chooseV === 3){
            this.finalX = point.x;
            this.finalY = point.y;
        }
        
        else if (this.chooseV === 4){
            this.finalX = point.x;
            this.iniY = point.y;
        };
    }
    
    
    this.width = this.finalX - this.iniX;
    this.height = this.finalY -this.iniY;
    this.redraw(ctx);
};

//Check if the point is inside the triangle
Rectangle.prototype.inLine = function(point){
    if (inBetween(this.iniX, this.finalX, point.x)){
        if(inBetween(this.iniY, this.finalY, point.y)){
            this.ratioX = this.iniX - point.x;
            this.ratioY = this.iniY - point.y;
            return true;
        }
    }
    return false;
};

//Just to comply line class
Rectangle.prototype.readjust = function(){};

//Move the rectangle relative to the canvas
Rectangle.prototype.move = function(ctx, point){
    
    this.iniX = this.ratioX + point.x;
    this.iniY = this.ratioY + point.y;
    
    this.finalX = this.iniX + this.width;
    this.finalY = this.iniY + this.height;
    
    this.width = this.finalX - this.iniX;
    this.height = this.finalY -this.iniY;
    this.redraw(ctx);
    
};

//Create new exact copy of rectangle
Rectangle.prototype.createCopy = function(mousePos){
    var newLine = new Rectangle(mousePos, mousePos, 'white', 0, 'white');
    newLine.iniX = this.iniX + 10;
    newLine.iniY = this.iniY + 10;
    newLine.finalX = this.finalX +10;
    newLine.finalY = this.finalY + 10;
    newLine.height = this.height;
    newLine.width = this.width;
    
    newLine.strcolor = this.strcolor;
    newLine.strweight = this.strweight;
    newLine.fill = this.fill;
    return newLine;
    
};

//Return true if p3 is in between p1 and p2; false other
function inBetween(p1,p2,p3){
    if (p3 <= Math.max(p1,p2)){
        if (p3 >= Math.min(p1,p2)){
            return true;
        };
    };
        
    return false;
}

//--------------------RECTANGLE END----------------//

//Clear the canvas and redraw all the shapes in myLines
function recreateCanvas(myLines, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < myLines.length; i++) {
        myLines[i].redraw(ctx);
    }
}

//mouse and keyboard events
function work() {
    isDrawingLine = false;
    initialPos = null;

    action = "";
    shape = "";

    enableDiv("shape");

    canvas = document.getElementById("MyCanvas");
    ctx = canvas.getContext("2d");
    
    var mousePos;
    var cpyLine;
    
    myLines = new Array();
    var circles = new Array();
    
    var moveLine = false;
    var resizeLine = false;
    var drawLine = false;

    
    var choosenCircle;

    document.onkeydown = function(evt){
        if (evt.keyCode === 67) {
            //if c is pressed
            if (newLine) {
                mousePos = getMousePos(canvas, evt);
                cpyLine = newLine.createCopy(mousePos);
            }
            ;
        }
        else if (evt.keyCode === 86) {
            //if v is pressed
            if (cpyLine) {
                newLine.readjust();
                myLines.push(newLine);
                newLine = cpyLine;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                recreateCanvas(myLines, ctx);
                circles = newLine.highlight(ctx);
                cpyLine = null;
            }
            ;

        }
        else if (evt.keyCode === 46) {
            //if delete is pressed
            if (newLine) {
                newLine = null;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                recreateCanvas(myLines, ctx);
                enableDiv("shape");
            }
        }
    };  
    
    canvas.onmousedown = function(evt){
        mousePos = getMousePos(canvas, evt);
        
        ifstmt:
        if ((action === "draw")) {
            //draw the shape
            if (shape === "line"){
                newLine = new Line(mousePos, mousePos, strColor, stroke);
            }
            else if (shape === "tri"){
                newLine = new Triangle(mousePos, mousePos, mousePos, strColor, stroke, fill ); // strokeBol, strcolor, stroke, fillBol, fillColor)
            }
            else if (shape === "rect"){
                newLine = new Rectangle(mousePos, mousePos, strColor, stroke, fill );//strokeBol, strcolor, stroke, fillBol, fillColor
            }
            drawLine = true;
         }
        
        else if((action !== "draw") && (!newLine)){
            //if there is no shape choosen then search if there is any shape at mousePos  
            for (var i = myLines.length - 1; i > -1; i--) {
                if (myLines[i].inLine(mousePos)) {
                    newLine = myLines[i];
                    myLines.splice(i, 1);
                    recreateCanvas(myLines, ctx);
                    circles = newLine.highlight(ctx);
                    disableDiv("shape");
                    break;
                }
            }
        }
        
       else if (newLine){
                // if the is a line choose, check whether the mousePos is at vertices  or not
                for(var i=0; i < circles.length ; i++){  
                      if(circles[i].choosen(mousePos)){
                                choosenCircle = circles[i];
                                resizeLine = true;
                                newLine.choosenV(choosenCircle);
                                break ifstmt;   
                    };           
                };
               
                if (newLine.inLine(mousePos)){
                    moveLine = true;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    recreateCanvas(myLines, ctx);
                    newLine.move(ctx, mousePos);
                    circles = newLine.highlight(ctx);
                    
                };
            };
           //
        
    };
       
    canvas.onmouseup = function(evt){
       if (action === "draw") {
           //insert the newly produced shape into array
            action = "";
            newLine.readjust();
            myLines.push(newLine);
            drawLine = false;
            newLine = null;
            enableDiv("shape");
       };    
   
       if (newLine){
            newLine.readjust();
            
            if(moveLine){
                moveLine = false;
            };
            
            drawLine = false;
            resizeLine = false;
        };  
    };
    
    canvas.ondblclick = function(evt){
        //unfocus on shape and put the focused shape back into array
        if (newLine) {
            newLine.readjust();
            myLines.push(newLine);
        };
        
        newLine = null;
        drawLine = false;
        moveLine = false;
        resizeLine = false;
        
        recreateCanvas(myLines, ctx);
        enableDiv("shape");
    };
    
    canvas.onmousemove = function(evt) {
        if (moveLine) {
            recreateCanvas(myLines, ctx);
            mousePos = getMousePos(canvas, evt);
            newLine.move(ctx, mousePos);
            circles = newLine.highlight(ctx);
        }

        if (resizeLine) {
            recreateCanvas(myLines, ctx);
            mousePos = getMousePos(canvas, evt);
            newLine.resize(ctx, mousePos, choosenCircle);
            circles = newLine.highlight(ctx);
        }

        if (drawLine) {
            recreateCanvas(myLines, ctx);
            mousePos = getMousePos(canvas, evt);
            newLine.resize(ctx, mousePos, 1);
        }
    };
};


       