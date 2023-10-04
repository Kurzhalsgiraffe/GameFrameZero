const canvas = document.querySelector("canvas");
const color_cirlces = document.querySelectorAll(".color-circle");
const color_selector = document.querySelector("#sidebar-colors-color-selector");
const colorpicker_btn = document.querySelector("#sidebar-colors-colorpicker-btn");
const delete_btn = document.querySelector("#sidebar-options-delete-btn");
const apply_btn = document.querySelector("#sidebar-options-apply-btn");
const save_image_inpt = document.querySelector("#sidebar-options-save-image-name");
const save_btn = document.querySelector("#sidebar-options-save-btn");
const replace_btn = document.querySelector("#sidebar-options-replace-btn");
const move_up_btn = document.querySelector("#move-up");
const move_left_btn = document.querySelector("#move-left");
const move_rightbtn = document.querySelector("#move-right");
const move_down_btn = document.querySelector("#move-down");

const upload_inpt = document.querySelector("#upload-image-inpt");
upload_inpt.setAttribute("title", "Choose an image");

const canvasObject = new CanvasObject(canvas, FRAME_SIZE=800, PIXEL_SIZE=50, colorArray=[]);
let isMouseDownCanvas;
let drawMode = true;
let loadedIDToEdit = null;

apply_btn.addEventListener("click", async () => await canvasObject.sendColorArrayToServer("/image/apply/colorarray"));
save_btn.addEventListener("click", async () => await canvasObject.sendColorArrayToServer("/image/save?image_name="+((save_image_inpt.value) ? save_image_inpt.value : null)));
replace_btn.addEventListener("click", async () => await canvasObject.replaceColorArrayOnServer(loadedIDToEdit));

color_selector.addEventListener("change", () => setPickedColor(color_selector.value));
move_up_btn.addEventListener("click", moveUp);
move_left_btn.addEventListener("click", moveLeft);
move_rightbtn.addEventListener("click", moveRight);
move_down_btn.addEventListener("click", moveDown);

upload_inpt.addEventListener("change", uploadImage);

color_cirlces.forEach((circle) => {
    circle.addEventListener('click', colorCircelSelected);
});

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
function colorCircelSelected() {
    setPickedColor(this.getAttribute("data-color"));
    this.classList.add("active");
}

// change fillstyle to color and update frontend components
function setPickedColor(color) {
    setDrawMode(true);
    removeActiveCircleColor();
    canvasObject.c.fillStyle = color;
    color_selector.setAttribute("value", color);
    color_selector.value = color;
}

// remove active class from every circle
function removeActiveCircleColor() { 
    color_cirlces.forEach((circle) => {
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
    canvasObject.c.fillStyle = color_selector.value;
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
    canvasObject.c.fillStyle = color_selector.value;
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
    canvasObject.c.fillStyle = color_selector.value;
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
    canvasObject.c.fillStyle = color_selector.value;
}

async function uploadImage() {
    const selectedFile = upload_inpt.files[0];
    if (selectedFile) {
        const allowedExtensions = ["jpg", "jpeg", "png"];
        const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

        if (allowedExtensions.includes(fileExtension)) {
            const formData = new FormData();
            formData.append("file", selectedFile);

            let response = await fetch("/image/upload", {
                method: "POST",
                body: formData,
            })
            if (response.status == 200) {
                let res = await response.json();
                canvasObject.colorArray = res.colorArray
                canvasObject.drawColorArrayToCanvas()
            } else {
                console.log("failed to upload image");
            }
        } else {
            console.log("invalid file extension");
        }
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    canvasObject.initializeColorArray();

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if(urlParams.has('edit_image_id')) {
        replace_btn.setAttribute("style","display: block");
        loadedIDToEdit = urlParams.get('edit_image_id');
        console.log(loadedIDToEdit)
        await loadAndShow(loadedIDToEdit, null);
    }
    canvasObject.drawGrid()
});