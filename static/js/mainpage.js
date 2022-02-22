const colorCirlce = document.querySelectorAll(".color-circle")

const gridColor = 'rgba(255, 255, 255, 1.0)';
var isMouseDown;
var drawMode = true;
var colorArray = [];

var favcolor_field = document.getElementById("favcolor");
var colorpicker_btn = document.querySelector("#colorpicker-btn");
var delete_btn = document.querySelector("#delete-btn");
var apply_btn = document.querySelector("#apply-btn");
var save_btn = document.querySelector("#save-btn");
var canvas = document.querySelector("canvas");

c = canvas.getContext("2d");
c.fillStyle = "#ffffff";
c.strokeStyle = c.fillStyle;

colorpicker_btn.addEventListener("click", function() {
    setDrawMode(!drawMode);
});

// set every pixel to black and initialize clean colorArray
delete_btn.addEventListener("click", function() {
    c.clearRect(0,0,canvas.width,canvas.height);
    drawGrid();
    initializeColorArray();
});

// send colorArray to /apply route
apply_btn.addEventListener("click", async () => await sendColorArrayToServer("/apply"));

// send colorArray to /save route
save_btn.addEventListener("click", async () => await sendColorArrayToServer("/save"));

async function sendColorArrayToServer(route) {
    var response = await fetch(route, {
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
    updateCell(event.offsetX, event.offsetY);
});

// draw a single pixel and update the grid around it
function draw(x_start, y_start) {
    c.strokeStyle = c.fillStyle;
    c.beginPath();
    c.rect(x_start, y_start, 50, 50);
    c.fill();
    c.stroke();

    updateGrid(x_start,y_start);
}

// update the grid around a single pixel
function updateGrid(x,y) {
        c.strokeStyle = gridColor;
        c.beginPath();
        c.rect(x, y, 50, 50);
        c.stroke();
}

// draw the whole grid
function drawGrid() {
    for (var i=0; i<800;i+=50) {
        for (var j=0; j<800;j+=50) {
            updateGrid(i,j);
        }
    }
}

function updateCell(x,y) {
    // compute coordinates of top left pixel for the 50x50 area
    x_start = x-x%50;
    y_start = y-y%50;

    // compute the tileNumber from coordinates
    if ((y_start/50)%2 == 1) {
        tileNumber = 16*(y_start/50)+(x_start/50);
    } else {
        tileNumber = 16*(y_start/50)+(15-(x_start/50));
    }

    if (isMouseDown) {
        if(drawMode) {
            draw(x_start, y_start);
            colorArray[tileNumber] = c.fillStyle;
        }
        else {
            setPickedColor(colorArray[tileNumber]);
        }
    }
}

// switch the drawMode and update colorpicker-btn's background-color
function setDrawMode(d) {
    drawMode = d;
    if (drawMode) {
        colorpicker_btn.setAttribute("style","background-color: #212529");
    }
    else {
        colorpicker_btn.setAttribute("style","background-color: #32cd32");
    }
}

// fill the colorArray with black
function initializeColorArray() {
    for (var i=0; i<256;i++) {
        colorArray[i] = "#000000";
    }
}

// set color to one of the 8 standard colors
function standardColor(elem) {
    setPickedColor(elem.getAttribute("data-color"));
    elem.classList.add("active");
}

// select any other color
function favColor(elem) {
    setPickedColor(elem.value);
}

// change fillstyle to color and update frontend components
function setPickedColor(color) {
    setDrawMode(true);
    removeActiveCircleColor();
    c.fillStyle = color;
    favcolor_field.setAttribute("value", color);
    favcolor_field.value = color;
}

// remove active class from every circle
function removeActiveCircleColor() { 
    colorCirlce.forEach((circle) => {
        circle.classList.remove("active");
    });
}


// load colorArray from server relativ to the currently loaded Frame
async function loadColorArrayFromServer(id) {
    var response = await fetch("/load/"+id+"/same", {
        method: "GET"
    });
    if (response.status != 200) {
        console.log("failed to load colorArray from server")
    }
    res = await response.json()
    if (Object.keys(res).length === 0 && res.constructor === Object) {
        initializeColorArray();
    } else {
        colorArray = res.colorArray
    }
    drawColorArrayToCanvas();
}

// draw the loaded colorArray to the canvas
function drawColorArrayToCanvas() {
    for (var i=0; i<256; i++) {
        c.fillStyle = colorArray[i];

        y = Math.floor(i/16);
        if (y%2==0) {
            x = 15-i%16;
        } else {
            x = i%16;
        }
        draw(50*x,50*y);
    }
    drawGrid();
}

document.addEventListener("DOMContentLoaded", function() {
    drawGrid();
    initializeColorArray();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if(urlParams.has('id')) {
        const loadedIDToEdit = urlParams.get('id');
        loadColorArrayFromServer(loadedIDToEdit);
    }
});