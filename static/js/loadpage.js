const gridColor = 'rgba(255, 255, 255, 1.0)';
var colorArray = [];

var delete_btn = document.querySelector("#delete-btn")
var edit_btn = document.querySelector("#edit-btn")
var apply_btn = document.querySelector("#apply-btn")
var first_frame_btn = document.querySelector("#first-frame-btn")
var prev_frame_btn = document.querySelector("#prev-frame-btn")
var next_frame_btn = document.querySelector("#next-frame-btn")
var last_frame_btn = document.querySelector("#last-frame-btn")
var frameNumber = document.getElementById("framenumber")
var canvas = document.querySelector("canvas");

c = canvas.getContext("2d");
c.fillStyle = "#ffffff";
c.strokeStyle = c.fillStyle;

delete_btn.addEventListener("click", async () => await deleteColorArrayFromServer());
edit_btn.addEventListener("click", async () => await editSavedColorArray());
apply_btn.addEventListener("click", async () => await sendColorArrayToServer());
first_frame_btn.addEventListener("click", async () => await loadColorArrayFromServer("first"));
prev_frame_btn.addEventListener("click", async () => await loadColorArrayFromServer("prev"));
next_frame_btn.addEventListener("click", async () => await loadColorArrayFromServer("next"));
last_frame_btn.addEventListener("click", async () => await loadColorArrayFromServer("last"));

// delete current frame from server
async function deleteColorArrayFromServer() {
    var response = await fetch("/delete", {
        method: "DELETE"
    });
    if (response.status != 200) {
        console.log("failed to delete colorArray from server")
    }
    window.location.reload();
}

async function editSavedColorArray() {
    console.log("Noch nicht fertig");
}

// send colorArray to server
async function sendColorArrayToServer() {
    var response = await fetch("/apply", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(colorArray)
    });
    if (response.status != 200) {
        console.log("failed to send colorArray to server")
    }
}

// load colorArray from server relativ to the currently loaded Frame
async function loadColorArrayFromServer(pos) {
    var response = await fetch("/load/"+pos, {
        method: "GET"
    });
    if (response.status != 200) {
        console.log("failed to load colorArray from server")
    }
    res = await response.json()
    if (Object.keys(res).length === 0 && res.constructor === Object) {
        frameNumber.textContent="KEIN BILD";
    } else {
        colorArray = res.colorArray
        frameNumber.textContent="BILD "+res.frameID;
        drawColorArrayToCanvas();
    }
}

// draw a single pixel
function draw(x_start, y_start) {
    c.strokeStyle = c.fillStyle;
    c.beginPath();
    c.rect(x_start, y_start, 50, 50);
    c.fill();
    c.stroke();
}

// draw the whole grid
function drawGrid() {
    c.strokeStyle = gridColor;
    for (var i=0; i<800;i+=50) {
        for (var j=0; j<800;j+=50) {
            c.beginPath();
            c.rect(i, j, 50, 50);
            c.stroke();
        }
    }
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
    loadColorArrayFromServer("first")
});