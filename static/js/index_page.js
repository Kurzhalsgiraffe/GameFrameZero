const canvas = document.querySelector("canvas");
const colorCirlce = document.querySelectorAll(".color-circle");
const favcolor_field = document.querySelector("#favcolor");
const colorpicker_btn = document.querySelector("#colorpicker-btn");
const delete_btn = document.querySelector("#delete-btn");
const apply_btn = document.querySelector("#apply-btn");
const save_btn = document.querySelector("#save-btn");
const replace_btn = document.querySelector("#replace-btn");
const move_up = document.querySelector("#move-up");
const move_left = document.querySelector("#move-left");
const move_right = document.querySelector("#move-right");
const move_down = document.querySelector("#move-down");
const canvasObject = new CanvasObject(canvas, FRAME_SIZE=800, PIXEL_SIZE=50, colorArray=[]);
let isMouseDownCanvas;
let drawMode = true;
let loadedIDToEdit = null;

apply_btn.addEventListener("click", async () => await canvasObject.sendColorArrayToServer("/apply",null));
save_btn.addEventListener("click", async () => await canvasObject.sendColorArrayToServer("/save",null));
replace_btn.addEventListener("click", async () => await canvasObject.sendColorArrayToServer("/replace",loadedIDToEdit));

favcolor_field.addEventListener("change", () => setPickedColor(favcolor_field.value));
move_up.addEventListener("click", moveUp);
move_left.addEventListener("click", moveLeft);
move_right.addEventListener("click", moveRight);
move_down.addEventListener("click", moveDown);

// toggle the drawmode (colorpicker / drawing)
colorpicker_btn.addEventListener("click", function() {
    setDrawMode(!drawMode);
});

// set every pixel to black, initialize clean colorArray and draw the grid
delete_btn.addEventListener("click", function() {
    canvasObject.c.clearRect(0,0,canvasObject.FRAME_SIZE,canvasObject.FRAME_SIZE);
    canvasObject.initializeColorArray();
    canvasObject.drawGrid();
});

canvasObject.canvas.addEventListener("mousedown", (event)=>{
    isMouseDownCanvas = true;
    updateCell(event.offsetX, event.offsetY);
});

canvasObject.canvas.addEventListener("mouseup", ()=>{
    isMouseDownCanvas = false;
});

canvasObject.canvas.addEventListener("mouseleave", ()=>{
    isMouseDownCanvas = false;
});

canvasObject.canvas.addEventListener("mousemove",(event)=>{
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
            canvasObject.draw(x_start, y_start);
            canvasObject.updateGrid(x_start,y_start);
            canvasObject.colorArray[tileNumber] = canvasObject.c.fillStyle;
        }
        else {
            setPickedColor(canvasObject.colorArray[tileNumber]);
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

// change fillstyle to color and update frontend components
function setPickedColor(color) {
    setDrawMode(true);
    removeActiveCircleColor();
    canvasObject.c.fillStyle = color;
    favcolor_field.setAttribute("value", color);
    favcolor_field.value = color;
}

// remove active class from every circle
function removeActiveCircleColor() { 
    colorCirlce.forEach((circle) => {
        circle.classList.remove("active");
    });
}

// load the colorArray by id to the canvasObject and draw it to the canvas
async function loadAndShow(id=null,pos=null) {
    await canvasObject.loadColorArrayFromServer(id,pos);
    if (canvasObject.colorArray.length === 0) {
        canvasObject.initializeColorArray();
    }
    canvasObject.drawColorArrayToCanvas();
    canvasObject.drawGrid();
}

// move all pixels up by one row
function moveUp() {
    for (let i=0; i<256; i++) {
        if (i<240) {
            canvasObject.colorArray[i] = canvasObject.colorArray[i-(2*i)%32+31]
        } else {
            canvasObject.colorArray[i] = "#000000"
        }
    }
    canvasObject.drawColorArrayToCanvas();
    canvasObject.c.fillStyle = favcolor_field.value;
}

// move all pixels to the left by one column
function moveLeft() {
    let newArr = []
    for (let i=0; i<256; i++) {
        let y = Math.floor(i/16);
        if (y%2==0) {
            if ((15-i%16)==15) {
                newArr[i] = "#000000";
            } else {
                newArr[i] = canvasObject.colorArray[i-1];
            }

        } else {
            if ((i%16)==15) {
                newArr[i] = "#000000";
            } else {
                newArr[i] = canvasObject.colorArray[i+1];
            }
        }
    }
    canvasObject.colorArray = newArr;
    canvasObject.drawColorArrayToCanvas();
    canvasObject.c.fillStyle = favcolor_field.value;
}

// move all pixels to the right by one column
function moveRight() {
    let newArr = []
    for (let i=0; i<256; i++) {
        let y = Math.floor(i/16);
        if (y%2==0) {
            if ((15-i%16)==0) {
                newArr[i] = "#000000";
            } else {
                newArr[i] = canvasObject.colorArray[i+1];
            }

        } else {
            if ((i%16)==0) {
                newArr[i] = "#000000";
            } else {
                newArr[i] = canvasObject.colorArray[i-1];
            }
        }
    }
    canvasObject.colorArray = newArr;
    canvasObject.drawColorArrayToCanvas();
    canvasObject.c.fillStyle = favcolor_field.value;
}

// move all pixels down by one row
function moveDown() {
    for (let i=255; i>=0; i--) {
        if (i>15) {
            canvasObject.colorArray[i] = canvasObject.colorArray[i-(2*i)%32-1]
        } else {
            canvasObject.colorArray[i] = "#000000"
        }
    }
    canvasObject.drawColorArrayToCanvas();
    canvasObject.c.fillStyle = favcolor_field.value;
}


document.addEventListener("DOMContentLoaded", async function() {
    canvasObject.initializeColorArray();
    // if there is an id in the url, load it and draw it on the canvas, so it can be edited
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if(urlParams.has('id')) {
        replace_btn.setAttribute("style","display: block");
        loadedIDToEdit = urlParams.get('id');
        await loadAndShow(loadedIDToEdit, null);
    }
    canvasObject.drawGrid()
});