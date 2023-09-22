const canvas = document.querySelector("canvas");
const delete_btn = document.querySelector("#sidebar-options-delete-btn");
const edit_btn = document.querySelector("#sidebar-options-edit-btn");
const apply_btn = document.querySelector("#sidebar-options-apply-btn");
const rename_image_inpt = document.querySelector("#sidebar-options-rename-image-name");
const rename_btn = document.querySelector("#sidebar-options-rename-btn");
const first_frame_btn = document.querySelector("#first-frame-btn");
const fast_backwards_btn = document.querySelector("#fast-backwards-btn");
const prev_frame_btn = document.querySelector("#prev-frame-btn");
const next_frame_btn = document.querySelector("#next-frame-btn");
const fast_forwards_btn = document.querySelector("#fast-forwards-btn");
const last_frame_btn = document.querySelector("#last-frame-btn");
const frameName = document.getElementById("image-name");
var canvasObject = new CanvasObject(canvas, FRAME_SIZE=800, PIXEL_SIZE=50, colorArray=[]);
var currentPos = 1;

delete_btn.addEventListener("click", async () => await deleteColorArrayFromServer(currentPos));
edit_btn.addEventListener("click", editSavedColorArray);
apply_btn.addEventListener("click", async () => await applyColorArrayByID(currentPos));
rename_btn.addEventListener("click", async () => await renameSavedColorArray(currentPos));
first_frame_btn.addEventListener("click", async () => await loadAndShow(null, "first"));
fast_backwards_btn.addEventListener("click", async () => await loadAndShow(currentPos, "fastbackwards"));
prev_frame_btn.addEventListener("click", async () => await loadAndShow(currentPos, "prev"));
next_frame_btn.addEventListener("click", async () => await loadAndShow(currentPos, "next"));
fast_forwards_btn.addEventListener("click", async () => await loadAndShow(currentPos, "fastforwards"));
last_frame_btn.addEventListener("click", async () => await loadAndShow(null, "last"));

async function loadAndShow(id=null, pos=null) {
    await canvasObject.loadColorArrayFromServer(id, pos);
    currentPos = canvasObject.currentPos;
    if (canvasObject.colorArray.length === 0) {
        frameName.textContent = "-";
        canvasObject.initializeColorArray();
    } else {
        frameName.textContent = canvasObject.imageName;
    }
    canvasObject.drawColorArrayToCanvas();
    canvasObject.drawGrid();
}

async function applyColorArrayByID(image_id) {
    let response = await fetch("/image/apply/id?image_id="+image_id, {
        method: "POST",
    });
    if (response.status != 200) {
        console.log("failed to apply colorArray");
    }
}

async function renameSavedColorArray(image_id) { // RELOAD???
    let name = ((rename_image_inpt.value) ? rename_image_inpt.value : null)
    let response = await fetch("/image/rename?image_id="+image_id+"&new_name="+name, {
        method: "POST",
    });
    if (response.status != 200) {
        console.log("failed to rename colorArray");
    } else {
        frameName.textContent = name
    }
}

async function deleteColorArrayFromServer(image_id) {
    let response = await fetch("/image/delete?image_id="+image_id, {
        method: "DELETE"
    });
    if (response.status == 200) {
        await loadAndShow(currentPos,"next")
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