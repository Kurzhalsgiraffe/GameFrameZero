const gridColor = 'rgba(255, 255, 255, 1.0)';
const canvas = document.querySelector("canvas");

c = canvas.getContext("2d");
c.fillStyle = "#ffffff";
c.strokeStyle = c.fillStyle;

var colorArray = [];

async function sendColorArrayToServer(route) {
    let response = await fetch(route, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(colorArray)
    });
    if (response.status != 200) {
        console.log("failed to send colorArray to server");
    }
}

// draw the loaded colorArray to the canvas
function drawColorArrayToCanvas() {
    for (let i=0; i<256; i++) {
        c.fillStyle = colorArray[i];

        y = Math.floor(i/16);
        if (y%2==0) {
            x = 15-i%16;
        } else {
            x = i%16;
        }
        draw(PIXEL_SIZE*x,PIXEL_SIZE*y);
    }
    drawGrid();
}

// fill the colorArray with black
function initializeColorArray() {
    for (let i=0; i<256;i++) {
        colorArray[i] = "#000000";
    }
}

// update the grid around a single pixel
function updateGrid(x,y) {
    c.strokeStyle = gridColor;
    c.beginPath();
    c.rect(x, y, PIXEL_SIZE, PIXEL_SIZE);
    c.stroke();
}

// draw the whole grid
function drawGrid() {
    for (let i=0; i<FRAME_SIZE;i+=PIXEL_SIZE) {
        for (let j=0; j<FRAME_SIZE;j+=PIXEL_SIZE) {
            updateGrid(i,j);
        }
    }
}

// draw a single pixel
function draw(x_start, y_start) {
    c.strokeStyle = c.fillStyle;
    c.beginPath();
    c.rect(x_start, y_start, PIXEL_SIZE, PIXEL_SIZE);
    c.fill();
    c.stroke();
}

document.addEventListener("DOMContentLoaded", async function() {
    drawGrid();
});