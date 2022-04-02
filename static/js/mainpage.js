const colorCirlce = document.querySelectorAll(".color-circle")
const gridColor = 'rgba(255, 255, 255, 1.0)';
const PIXEL_SIZE = 50;
const FRAME_SIZE = 800;
const favcolor_field = document.getElementById("favcolor");
const colorpicker_btn = document.querySelector("#colorpicker-btn");
const delete_btn = document.querySelector("#delete-btn");
const save_btn = document.querySelector("#save-btn");
const apply_btn = document.querySelector("#apply-btn");
const canvas = document.querySelector("canvas");
var isMouseDownCanvas;
var drawMode = true;
var colorArray = [];

save_btn.addEventListener("click", async () => await sendColorArrayToServer("/save"));
apply_btn.addEventListener("click", async () => await sendColorArrayToServer("/apply"));

colorpicker_btn.addEventListener("click", function() {
    setDrawMode(!drawMode);
});

// set every pixel to black and initialize clean colorArray
delete_btn.addEventListener("click", function() {
    c.clearRect(0,0,canvas.width,canvas.height);
    drawGrid();
    initializeColorArray();
});

canvas.addEventListener("mousedown", (event)=>{
    isMouseDownCanvas = true;
    updateCell(event.offsetX, event.offsetY);
});

canvas.addEventListener("mouseup", ()=>{
    isMouseDownCanvas = false;
});

canvas.addEventListener("mouseleave", ()=>{
    isMouseDownCanvas = false;
});

canvas.addEventListener("mousemove",(event)=>{
    updateCell(event.offsetX, event.offsetY);
});

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

    if (isMouseDownCanvas) {
        if(drawMode) {
            draw(x_start, y_start);
            updateGrid(x_start,y_start);
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
    let response = await fetch("/load/"+id+"/same");
    if (response.status == 200) {
        res = await response.json()
        if (!res.colorArray) {
            initializeColorArray();
        } else {
            colorArray = res.colorArray
        }
        drawColorArrayToCanvas();  
    } else {
        console.log("failed to load colorArray from server")
    }
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