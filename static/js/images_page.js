const canvas = document.querySelector("canvas");
const delete_btn = document.querySelector("#delete-btn");
const edit_btn = document.querySelector("#edit-btn");
const apply_btn = document.querySelector("#apply-btn");
const first_frame_btn = document.querySelector("#first-frame-btn");
const prev_frame_btn = document.querySelector("#prev-frame-btn");
const next_frame_btn = document.querySelector("#next-frame-btn");
const last_frame_btn = document.querySelector("#last-frame-btn");
const frameNumber = document.getElementById("framenumber");
var canvasObject = new CanvasObject(canvas, FRAME_SIZE=800, PIXEL_SIZE=50, colorArray=[]);
var currentPos = 1;

delete_btn.addEventListener("click", async () => await deleteColorArrayFromServer(currentPos));
edit_btn.addEventListener("click", editSavedColorArray);
apply_btn.addEventListener("click", async () => await canvasObject.sendColorArrayToServer("/apply"));
first_frame_btn.addEventListener("click", async () => await loadAndShow(null, "first"));
prev_frame_btn.addEventListener("click", async () => await loadAndShow(currentPos, "prev"));
next_frame_btn.addEventListener("click", async () => await loadAndShow(currentPos, "next"));
last_frame_btn.addEventListener("click", async () => await loadAndShow(null, "last"));

async function loadAndShow(id=null, pos=null) {
    await canvasObject.loadColorArrayFromServer(id, pos);
    currentPos = canvasObject.currentPos;
    if (canvasObject.colorArray.length === 0) {
        canvasObject.initializeColorArray();
        frameNumber.textContent = "KEIN BILD";
    } else {
        frameNumber.textContent = "BILD " + currentPos;
    }
    canvasObject.drawColorArrayToCanvas();
    canvasObject.drawGrid();
}

async function deleteColorArrayFromServer(id) {
    let response = await fetch("/delete/"+id, {
        method: "DELETE"
    });
    if (response.status == 200) {
        await loadAndShow(currentPos,null)
    } else {
        console.log("failed to delete colorArray from server");
    }
}

function editSavedColorArray() {
    window.location.replace("/?id="+currentPos);
}

document.addEventListener("DOMContentLoaded", async function() {
    await loadAndShow(null, "first");
});