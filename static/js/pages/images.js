const delete_btn = document.querySelector("#sidebar-options-delete-btn");
const edit_btn = document.querySelector("#sidebar-options-edit-btn");
const apply_btn = document.querySelector("#sidebar-options-apply-btn");
const rename_image_inpt = document.querySelector("#sidebar-options-rename-image-name");
const rename_image_btn = document.querySelector("#sidebar-options-rename-image-btn");
const svg_img = document.querySelector("#svg-img");
const first_frame_btn = document.querySelector("#first-frame-btn");
const fast_backwards_btn = document.querySelector("#fast-backwards-btn");
const prev_frame_btn = document.querySelector("#prev-frame-btn");
const next_frame_btn = document.querySelector("#next-frame-btn");
const fast_forwards_btn = document.querySelector("#fast-forwards-btn");
const last_frame_btn = document.querySelector("#last-frame-btn");
const frameName = document.getElementById("image-name");
var currentPos = 1;

delete_btn.addEventListener("click", async () => await deleteColorArrayFromServer(currentPos));
edit_btn.addEventListener("click", editSavedColorArray);
apply_btn.addEventListener("click", async () => await applyColorArrayByID(currentPos));
rename_image_btn.addEventListener("click", async () => await renameSavedColorArray(currentPos));
first_frame_btn.addEventListener("click", async () => await loadSVG(null, "first"));
fast_backwards_btn.addEventListener("click", async () => await loadSVG(currentPos, "fastbackwards"));
prev_frame_btn.addEventListener("click", async () => await loadSVG(currentPos, "prev"));
next_frame_btn.addEventListener("click", async () => await loadSVG(currentPos, "next"));
fast_forwards_btn.addEventListener("click", async () => await loadSVG(currentPos, "fastforwards"));
last_frame_btn.addEventListener("click", async () => await loadSVG(null, "last"));

async function loadSVG(id=null, pos=null) {
    let response
    if (id!=null && pos!=null) {
        response = await fetch("/image/load/single/svg?image_id="+id+"&pos="+pos);
    } else if(id!=null && pos==null) {
        response = await fetch("/image/load/single/svg?image_id="+id);
    } else if(id==null && pos!=null) {
        response = await fetch("/image/load/single/svg?pos="+pos);
    }

    if (response.status == 200) {
        const imageID = response.headers.get('image_id');
        const imageName = response.headers.get('image_name');
        const svg = await response.text();

        currentPos = parseInt(imageID);

        svg_img.src = `data:image/svg+xml;base64,${btoa(svg)}`;
        frameName.textContent = imageName;
    } else {
        frameName.textContent = "-";
    }    
}

async function applyColorArrayByID(image_id) {
    let response = await fetch("/image/apply/id?image_id="+image_id, {
        method: "POST",
    });
    if (response.status != 200) {
        console.log("failed to apply colorArray");
    }
}

async function renameSavedColorArray(image_id) {
    let name = ((rename_image_inpt.value) ? rename_image_inpt.value : null)
    if (name != null) {
        let response = await fetch("/image/rename?image_id="+image_id+"&new_name="+name, {
            method: "POST",
        });
        if (response.status != 200) {
            console.log("failed to rename colorArray");
        } else {
            frameName.textContent = name
        }
    }
}

async function deleteColorArrayFromServer(image_id) {
    let response = await fetch("/image/delete?image_id="+image_id, {
        method: "DELETE"
    });
    if (response.status == 200) {
        await loadSVG(currentPos,"next")
    } else {
        console.log("failed to delete colorArray from server");
    }
}

function editSavedColorArray() {
    window.location.replace("/?edit_image_id="+currentPos);
}

document.addEventListener("DOMContentLoaded", async function() {
    await loadSVG(null, "first");
});