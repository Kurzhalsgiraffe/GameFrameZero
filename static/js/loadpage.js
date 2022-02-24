const gridColor = 'rgba(255, 255, 255, 1.0)';
const PIXEL_SIZE = 50;
const FRAME_SIZE = 800;
var colorArray = [];
var currentPos = 1;

var delete_btn = document.querySelector("#delete-btn")
var edit_btn = document.querySelector("#edit-btn")
var apply_btn = document.querySelector("#apply-btn");
var animation_btn = document.querySelector("#animation-btn");
var first_frame_btn = document.querySelector("#first-frame-btn")
var prev_frame_btn = document.querySelector("#prev-frame-btn")
var next_frame_btn = document.querySelector("#next-frame-btn")
var last_frame_btn = document.querySelector("#last-frame-btn")
var frameNumber = document.getElementById("framenumber")
var canvas = document.querySelector("canvas");

delete_btn.addEventListener("click", async () => await deleteColorArrayFromServer(currentPos));
edit_btn.addEventListener("click", editSavedColorArray);
apply_btn.addEventListener("click", async () => await sendColorArrayToServer("/apply"));
animation_btn.addEventListener("click", async () => await addFrameToAnimation());
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

async function addFrameToAnimation() {
    var response = await fetch("/addanimationframe/"+currentPos, {
        method: "POST"
    });
    if (response.status != 200) {
        console.log("failed to add Frame to Animationlist");
    }
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
    loadColorArrayFromServer(currentPos, "first");
});