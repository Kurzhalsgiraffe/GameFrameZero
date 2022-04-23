const canv = document.querySelector("canvas");
const remove_animation_frame_btn = document.querySelector("#remove-animation-frame-btn");
const update_time_on_frame_btn = document.querySelector("#update-time-on-frame-btn");
const first_frame_btn = document.querySelector("#first-frame-btn");
const prev_frame_btn = document.querySelector("#prev-frame-btn");
const next_frame_btn = document.querySelector("#next-frame-btn");
const last_frame_btn = document.querySelector("#last-frame-btn");
const frameNumber = document.getElementById("framenumber");
const animation_time = document.querySelector("#animation-time");
const add_to_animation_btn = document.querySelector("#add-to-animation-btn");

let selectorCanvasObject = new CanvasObject(canv, FRAME_SIZE=480, PIXEL_SIZE=30, colorArray=[], gridColor='rgba(0, 0, 0, 1.0)');
let currentPos = 1;
let animation_list = [];
let animation_id;
let dragStartPosition;

remove_animation_frame_btn.addEventListener("click", async () => await RemoveFrameFromAnimation());
update_time_on_frame_btn.addEventListener("click", async () => await UpdateTime());
first_frame_btn.addEventListener("click", async () => await loadAndShow(null, "first"));
prev_frame_btn.addEventListener("click", async () => await loadAndShow(currentPos, "prev"));
next_frame_btn.addEventListener("click", async () => await loadAndShow(currentPos, "next"));
last_frame_btn.addEventListener("click", async () => await loadAndShow(null, "last"));
add_to_animation_btn.addEventListener("click", async () => await addFrameToAnimation());

async function loadAndShow(id=null,pos=null) {
    await selectorCanvasObject.loadColorArrayFromServer(id,pos);
    currentPos = selectorCanvasObject.currentPos;
    if (selectorCanvasObject.colorArray.length === 0) {
        selectorCanvasObject.initializeColorArray();
        frameNumber.textContent = "KEIN BILD";
    } else {
        frameNumber.textContent = "BILD " + currentPos;
    }
    selectorCanvasObject.drawColorArrayToCanvas();
    selectorCanvasObject.drawGrid();
}

async function RemoveFrameFromAnimation() {
    let active_frame_id;
    let response;
    if (activeTile != null) {
        active_frame_id = activeTile.id.slice(5,);
        response = await fetch("/animation/frame/remove/"+animation_id+"/"+active_frame_id, {
            method: "POST"
        });
        if (response.status == 200) {
            window.location.reload(true);
        } else {
            console.log("failed to remove frame number " + active_frame_id + " from the Animation");
        }
    }
}

async function UpdateTime() {
    let active_frame_id;
    let response;
    let time = animation_time.value
    if (activeTile != null && time-length>0) {
        active_frame_id = activeTile.id.slice(5,);
        response = await fetch("/animation/frame/updatetime/"+animation_id+"/"+active_frame_id+"/"+time, {
            method: "POST"
        });
        if (response.status == 200) {
            window.location.reload(true);
        } else {
            console.log("failed to update time of frame number " + active_frame_id);
        }
    }
}

async function addFrameToAnimation() {
    let response = await fetch("/animation/frame/add/"+animation_id+"/"+currentPos, {
        method: "POST"
    });
    if (response.status == 200) {
        window.location.reload(true);
    } else {
        console.log("failed to add frame number " + currentPos + " to the Animation");
    }
}

async function loadAnimationListFromServer() {
    let response = await fetch("/animation/load/"+animation_id);
    let res = await response.json();
    if (response.status == 200) {
        return [res.imageIDs, res.positions, res.times];
    } else {
        console.log("failed to load AnimationList from server");
    }
}

async function switchFramePositions(target_id) {
    let response;
    console.log(dragStartPosition, target_id)
    if (dragStartPosition != target_id) {
        response = await fetch("/animation/frame/switchpositions/"+animation_id+"/"+dragStartPosition+"/"+target_id, {
            method: "POST"
        });
        if (response.status == 200) {
            window.location.reload(true);
        } else {
            console.log("failed to switch frames " + dragStartPosition + " and " + target_id);
        }
    }
}

async function attachHandlers(ids) {
    for (let id of ids) {
        let tile = document.querySelector("#tile-"+id);

        tile.addEventListener('click', (e) => {
            unselectTile();
            selectTile(e.currentTarget)
        });

        tile.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        tile.addEventListener('dragstart', (e) => {
            dragStartPosition = e.currentTarget.id.slice(5,);
        });

        tile.addEventListener('drop', (e) => {
            switchFramePositions(e.currentTarget.id.slice(5,));
        });
    }
}

async function addContentToTiles(image_ids, positions, image_times) {
    for (let x=0; x<image_ids.length; x++) {
        image_id = image_ids[x]
        pos = positions[x]
        time = image_times[x]

        let cardbody = document.querySelector("#card-body-"+pos);
        let tile = document.querySelector("#tile-"+pos);

        const image_id_tag = document.createElement("h4");
        const time_tag = document.createElement("h5");

        tile.setAttribute("draggable", "true");
        image_id_tag.classList.add("card-title");
        image_id_tag.innerHTML = `BILD ${image_id}`;
        time_tag.classList.add("card-title");
        time_tag.innerHTML = `${time/1000} Sekunden`;

        cardbody.appendChild(image_id_tag);
        cardbody.appendChild(time_tag);
    }
}

async function initializeAnimationTiles(image_ids, positions, image_times) {
    await createCanvasTiles(positions, image_ids)
    await addContentToTiles(image_ids, positions, image_times)
    await attachHandlers(positions)
}

document.addEventListener("DOMContentLoaded", async function() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if(urlParams.has('id')) {
        animation_id = urlParams.get('id');
        animation_list = await loadAnimationListFromServer();
    } else {
        console.log("Didn't find the Animation ID");
    }
    let image_ids = animation_list[0];
    let positions = animation_list[1];
    let times = animation_list[2];
    initializeAnimationTiles(image_ids, positions, times);
    loadAndShow(null, "first");
});