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

const canvas = document.querySelector("canvas");
const canvas_context = canvas.getContext("2d");
const canvas_frame_size = 800;
const canvas_pixel_size = 50;
const canvas_grid_color = "rgba(255, 255, 255, 1.0)";

const upload_inpt = document.querySelector("#upload-image-inpt");
upload_inpt.setAttribute("title", "Choose an image");

let isMouseDown;
let drawMode = true;
let loadedIDToEdit = null;
let colorArray = []

apply_btn.addEventListener("click", async () => await sendColorArrayToServer("/image/apply/colorarray"));
save_btn.addEventListener("click", async () => await sendColorArrayToServer("/image/save?image_name="+((save_image_inpt.value) ? save_image_inpt.value : null)));
replace_btn.addEventListener("click", async () => await replaceColorArrayOnServer(loadedIDToEdit));

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

delete_btn.addEventListener("click", function() {
    canvas_context.clearRect(0, 0, canvas_frame_size, canvas_frame_size);
    initializeColorArray();
    drawGrid();
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
    updateCell(event.offsetX, event.offsetY);
});

function initializeColorArray() {
    for (let i=0; i<256;i++) {
        colorArray[i] = "#000000";
    }
}

function draw(x_start, y_start) {
    canvas_context.strokeStyle = canvas_context.fillStyle;
    canvas_context.beginPath();
    canvas_context.rect(x_start, y_start, canvas_pixel_size, canvas_pixel_size);
    canvas_context.fill();
    canvas_context.stroke();
}

function drawColorArrayToCanvas() {
    for (let i=0; i<256; i++) {
        canvas_context.fillStyle = colorArray[i];
        let y = Math.floor(i/16);
        let x;

        if (y%2==0) {
            x = 15-i%16;
        } else {
            x = i%16;
        }
        draw(canvas_pixel_size * x, canvas_pixel_size * y);
    }
    drawGrid();
}

function drawGrid() {
    for (let x = 0; x < canvas_frame_size; x += canvas_pixel_size) {
        for (let y = 0; y < canvas_frame_size; y += canvas_pixel_size) {
            updateGrid(x, y);
        }
    }
}

function updateGrid(x,y) {
    canvas_context.strokeStyle = canvas_grid_color;
    canvas_context.beginPath();
    canvas_context.rect(x, y, canvas_pixel_size, canvas_pixel_size);
    canvas_context.stroke();
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
            updateGrid(x_start,y_start);
            colorArray[tileNumber] = canvas_context.fillStyle;
        }
        else {
            setPickedColor(colorArray[tileNumber]);
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
    canvas_context.fillStyle = color;
    color_selector.setAttribute("value", color);
    color_selector.value = color;
}

// remove active class from every circle
function removeActiveCircleColor() { 
    color_cirlces.forEach((circle) => {
        circle.classList.remove("active");
    });
}

// load the colorArray by id and draw it to the canvas
async function loadAndShow(id) {
    await loadColorArrayFromServer(id);
    if (colorArray.length === 0) {
        initializeColorArray();
    }
    drawColorArrayToCanvas();
    drawGrid();
}

// move all pixels up by one row
function moveUp() {
    for (let i=0; i<256; i++) {
        if (i<240) {
            colorArray[i] = colorArray[i-(2*i)%32+31];
        } else {
            colorArray[i] = "#000000";
        }
    }
    drawColorArrayToCanvas();
    canvas_context.fillStyle = color_selector.value;
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
                newArr[i] = colorArray[i-1];
            }

        } else {
            if ((i%16)==15) {
                newArr[i] = "#000000";
            } else {
                newArr[i] = colorArray[i+1];
            }
        }
    }
    colorArray = newArr;
    drawColorArrayToCanvas();
    canvas_context.fillStyle = color_selector.value;
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
                newArr[i] = colorArray[i+1];
            }

        } else {
            if ((i%16)==0) {
                newArr[i] = "#000000";
            } else {
                newArr[i] = colorArray[i-1];
            }
        }
    }
    colorArray = newArr;
    drawColorArrayToCanvas();
    canvas_context.fillStyle = color_selector.value;
}

// move all pixels down by one row
function moveDown() {
    for (let i=255; i>=0; i--) {
        if (i>15) {
            colorArray[i] = colorArray[i-(2*i)%32-1]
        } else {
            colorArray[i] = "#000000"
        }
    }
    drawColorArrayToCanvas();
    canvas_context.fillStyle = color_selector.value;
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
                colorArray = res.colorArray
                drawColorArrayToCanvas();
            } else {
                console.log("failed to upload image");
            }
        } else {
            console.log("invalid file extension");
        }
    }
}

async function loadColorArrayFromServer(id) {
    let response = await fetch("/image/load/single?image_id="+id);
    let res = await response.json();

    if (response.status == 200) {
        if (res) {
            colorArray = res;
        } else {
            colorArray = []
        }       
    } else {
        console.log("failed to load colorArray from server");
    }
}

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

async function replaceColorArrayOnServer(image_id) {
    let response = await fetch("/image/replace?image_id="+image_id, {
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

document.addEventListener("DOMContentLoaded", async function() {
    initializeColorArray();

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if(urlParams.has('edit_image_id')) {
        replace_btn.setAttribute("style","display: block");
        loadedIDToEdit = urlParams.get('edit_image_id');
        await loadAndShow(loadedIDToEdit);
    }
    drawGrid()
});