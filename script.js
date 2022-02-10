const colorCirlce = document.querySelectorAll(".color-circle")

let penSize = 10;
let isDrawing;
let x;
let y;

var canvas = document.querySelector("canvas");
c = canvas.getContext("2d");


canvas.addEventListener("mousedown", (e)=>{
    isDrawing = true;
    x = e.offsetX;
    y = e.offsetY;
})

canvas.addEventListener("mouseup", ()=>{
    isDrawing = false;
    x = undefined;
    y = undefined;
})

canvas.addEventListener("mousemove",(event)=>{
    draw(event.offsetX, event.offsetY)
})

c.fillStyle = "black";
c.strokeStyle = c.fillStyle;
  
function draw(x2, y2) {
    if(isDrawing) {
        c.beginPath();
        c.arc(x2, y2, penSize, 0, Math.PI*2);
        c.closePath();
        c.fill();
        drawLine(x, y, x2, y2);
    }

    x = x2;
    y = y2;
}

function drawLine(x1, y1, x2, y2) {
    c.beginPath();
    c.moveTo(x1,y1);
    c.lineTo(x2,y2);
    c.strokeStyle = c.fillStyle;
    c.lineWidth = penSize * 2;
    c.stroke();
}

document.querySelector(".fa-refresh").addEventListener("click", function() {
    c.clearRect(0,0,canvas.width,canvas.height);
});

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
}