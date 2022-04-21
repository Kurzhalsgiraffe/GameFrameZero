const canv = document.querySelector("canvas");
const remove_animation_frame_btn = document.querySelector("#remove-animation-frame-btn");
const first_frame_btn = document.querySelector("#first-frame-btn");
const prev_frame_btn = document.querySelector("#prev-frame-btn");
const next_frame_btn = document.querySelector("#next-frame-btn");
const last_frame_btn = document.querySelector("#last-frame-btn");
const frameNumber = document.getElementById("framenumber");
const add_to_animation_btn = document.querySelector("#add-to-animation-btn");

let selectorCanvasObject = new CanvasObject(canv, FRAME_SIZE=480, PIXEL_SIZE=30, colorArray=[]);
let currentPos = 1;
let animation_id;
let animation_list = [];

remove_animation_frame_btn.addEventListener("click", async () => await RemoveFrameFromAnimation());
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
            console.log("failed to remove frame number " + currentPos + " from the Animation");
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

async function loadAnimationListFromServer(animation_id) {
    let response = await fetch("/animation/load/"+animation_id);
    let res = await response.json();
    if (response.status == 200) {
        return [res.imageIDs, res.positions, res.times];
    } else {
        console.log("failed to load AnimationList from server");
    }
}

// function getAnimationList() {
//     arr = [];
//     rows = tile_body.rows;
//     for(let i=0; i< rows.length; i++){
//         tds = rows[i].getElementsByTagName("td");
//         frameid = tds[0].getAttribute('value').slice(6,);
//         time = tds[1].getElementsByTagName("input")[0].value;
//         arr.push([frameid,time]);
//     }
//     return arr;
// }

function dragstart(event) {
    event.dataTransfer.setData("Text", event.target.id);
    console.log(event);
}

function drop(event) {
    event.preventDefault();
    console.log(event);
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
            dragstart(e);
        });
            
        tile.addEventListener('drop', (e) => {
            drop(e);
        });
    }
}

async function addContentToTiles(image_ids, image_times) {
    for (let x=0; x<image_ids.length; x++) {
        id = image_ids[x]
        time = image_times[x]

        let cardbody = document.querySelector("#card-body-"+id);
        let wrap = document.querySelector("#wrap-"+id);

        const htag = document.createElement("h5");

        wrap.setAttribute("draggable", "true");
        htag.classList.add("card-title");
        htag.innerHTML = `${time/1000} Sekunden`;

        cardbody.appendChild(htag);
    }
}

async function initializeAnimationTiles(image_ids, positions, image_times) {
    await createCanvasTiles(positions, image_ids)
    await addContentToTiles(positions, image_times)
    await attachHandlers(positions)
}

document.addEventListener("DOMContentLoaded", async function() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if(urlParams.has('id')) {
        animation_id = urlParams.get('id');
        animation_list = await loadAnimationListFromServer(animation_id);
    } else {
        console.log("Didn't find the Animation ID");
    }
    let image_ids = animation_list[0];
    let positions = animation_list[1];
    let times = animation_list[2];
    initializeAnimationTiles(image_ids, positions, times);
    loadAndShow(null, "first");
});