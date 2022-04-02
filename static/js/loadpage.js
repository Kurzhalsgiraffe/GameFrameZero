const gridColor = 'rgba(255, 255, 255, 1.0)';
const PIXEL_SIZE = 50;
const FRAME_SIZE = 800;
const delete_btn = document.querySelector("#delete-btn");
const edit_btn = document.querySelector("#edit-btn");
const apply_btn = document.querySelector("#apply-btn");
const animation_btn = document.querySelector("#animation-btn");
const first_frame_btn = document.querySelector("#first-frame-btn");
const prev_frame_btn = document.querySelector("#prev-frame-btn");
const next_frame_btn = document.querySelector("#next-frame-btn");
const last_frame_btn = document.querySelector("#last-frame-btn");
const frameNumber = document.getElementById("framenumber");
var currentPos = 1;

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
    let response = await fetch("/delete/"+id, {
        method: "DELETE"
    });
    if (response.status == 200) {
        await loadColorArrayFromServer(currentPos,"same");
    } else {
        console.log("failed to delete colorArray from server");
    }
}

function editSavedColorArray() {
    window.location.replace("/?id="+currentPos);
}

async function addFrameToAnimation() {
    let response = await fetch("/animationlist/add/"+currentPos, {
        method: "POST"
    });
    if (response.status != 200) {
        console.log("failed to add Frame to Animationlist");
    }
}

// load colorArray from server relativ to the currently loaded Frame
async function loadColorArrayFromServer(id,pos) {
    let response = await fetch("/load/"+id+"/"+pos);
    res = await response.json();
    if (response.status == 200) {
        if (!res.colorArray) {
            currentPos = 1;
            frameNumber.textContent="KEIN BILD";
            initializeColorArray();
        } else {
            colorArray = res.colorArray;
            currentPos = res.frameID;
            frameNumber.textContent="BILD "+currentPos;
        }
        drawColorArrayToCanvas();
    } else {
        console.log("failed to load colorArray from server");
    }
}

document.addEventListener("DOMContentLoaded", function() {
    loadColorArrayFromServer(currentPos, "first");
});