const gridColor = 'rgba(255, 255, 255, 1.0)';
var colorArray = [];
var currentPos = 1;

var delete_btn = document.querySelector("#delete-btn")
var edit_btn = document.querySelector("#edit-btn")
var first_frame_btn = document.querySelector("#first-frame-btn")
var prev_frame_btn = document.querySelector("#prev-frame-btn")
var next_frame_btn = document.querySelector("#next-frame-btn")
var last_frame_btn = document.querySelector("#last-frame-btn")
var frameNumber = document.getElementById("framenumber")
var canvas = document.querySelector("canvas");

c = canvas.getContext("2d");
c.fillStyle = "#ffffff";
c.strokeStyle = c.fillStyle;

delete_btn.addEventListener("click", async () => await deleteColorArrayFromServer(currentPos));
edit_btn.addEventListener("click", editSavedColorArray);
first_frame_btn.addEventListener("click", async () => await loadColorArrayFromServer(currentPos, "first"));
prev_frame_btn.addEventListener("click", async () => await loadColorArrayFromServer(currentPos, "prev"));
next_frame_btn.addEventListener("click", async () => await loadColorArrayFromServer(currentPos, "next"));
last_frame_btn.addEventListener("click", async () => await loadColorArrayFromServer(currentPos, "last"));

// delete current frame from server
async function deleteColorArrayFromServer(id) {
    var response = await fetch("/delete/"+id, {
        method: "DELETE"
    });
    if (response.status != 200) {
        console.log("failed to delete colorArray from server")
    }
    await loadColorArrayFromServer(currentPos,"same")
}

function editSavedColorArray() {
    window.location.replace("/?id="+currentPos);
}

// load colorArray from server relativ to the currently loaded Frame
async function loadColorArrayFromServer(id,pos) {
    var response = await fetch("/load/"+id+"/"+pos, {
        method: "GET"
    });
    if (response.status != 200) {
        console.log("failed to load colorArray from server")
    }
    res = await response.json()
    if (Object.keys(res).length === 0 && res.constructor === Object) {
        currentPos = 1;
        frameNumber.textContent="KEIN BILD";
        initializeColorArray();
    } else {
        colorArray = res.colorArray
        currentPos = res.frameID
        frameNumber.textContent="BILD "+currentPos;
    }
    drawColorArrayToCanvas();
}

document.addEventListener("DOMContentLoaded", function() {
    drawGrid();
    loadColorArrayFromServer(currentPos, "first")
});