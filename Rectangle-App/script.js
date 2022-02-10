//https://www.youtube.com/watch?v=jkg7T7jlIzU

const colorCirlce = document.querySelectorAll(".color-circle")

const gridColor = 'rgba(0, 0, 0, 1.0)';
var isMouseDown;
var colorArray = [];

var canvas = document.querySelector("canvas");
c = canvas.getContext("2d");

document.querySelector(".fa-refresh").addEventListener("click", function() {
    c.clearRect(0,0,canvas.width,canvas.height);
    drawGrid();
    initializeColorArray()
});

canvas.addEventListener("mousedown", (event)=>{
    isMouseDown = true;
    updateCell(event.offsetX, event.offsetY);
});

canvas.addEventListener("mouseup", ()=>{
    isMouseDown = false;
});

canvas.addEventListener("mouseleave", ()=>{
    isMouseDown = false;
});

canvas.addEventListener("mousemove",(event)=>{
    updateCell(event.offsetX, event.offsetY)
});

c.fillStyle = "black";
c.strokeStyle = c.fillStyle;
  
function draw(x_start, y_start) {
    c.strokeStyle = c.fillStyle;
    c.beginPath();
    c.rect(x_start, y_start, 50, 50);
    c.fill();
    c.stroke();

    updateGrid(x_start,y_start);
}

function updateGrid(x,y) {
        c.strokeStyle = gridColor;
        c.beginPath();
        c.rect(x, y, 50, 50);
        c.stroke();
}

function drawGrid() {
    for (var i=0; i<800;i+=50) {
        for (var j=0; j<800;j+=50) {
            updateGrid(i,j);
        }
    }
}

function updateCell(x,y) {
    if(isMouseDown) {
        x_start = x-x%50;
        y_start = y-y%50;
        tileNumber = 16*(y_start/50)+(x_start/50);

        draw(x_start, y_start);
        colorArray[tileNumber] = c.fillStyle;
    }
}

function initializeColorArray() {
    for (var i=0; i<256;i++) {
        colorArray[i] = "#ffffff";
    }
}

const selectColor = (elem) => {
    removeActiveCircleColor();
    c.fillStyle = elem.getAttribute("data-color");
    elem.classList.add("active");
}

const removeActiveCircleColor = () => {
    colorCirlce.forEach((circle) => {
        circle.classList.remove("active");
    });
}

const favColor = (elem) => {
    removeActiveCircleColor();
    c.fillStyle = elem.value;

    circle = document.getElementById("lastcolor");
    circle.setAttribute("data-color", elem.value);
    circle.setAttribute("style", "background-color: "+elem.value);
    circle.classList.add("active");
}

document.addEventListener("DOMContentLoaded", function() {
    drawGrid();
    initializeColorArray();
});