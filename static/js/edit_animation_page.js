const canv = document.querySelector("canvas");
const number_tile = document.querySelectorAll(".number-tile");
const assume_btn = document.querySelector("#assume-btn");
const add_to_animation_btn = document.querySelector("#add-to-animation-btn");
const first_frame_btn = document.querySelector("#first-frame-btn");
const prev_frame_btn = document.querySelector("#prev-frame-btn");
const next_frame_btn = document.querySelector("#next-frame-btn");
const last_frame_btn = document.querySelector("#last-frame-btn");
const animationlist_body = document.querySelector("#animationlist-body");
const frameNumber = document.getElementById("framenumber");

let selectorCanvasObject = new CanvasObject(canv, FRAME_SIZE=480, PIXEL_SIZE=30, colorArray=[]);
let currentPos = 1;
let animation_list = [];

assume_btn.addEventListener("click", async () => await sendAnimationToServer());
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

async function loadAnimationListFromServer(animation_id) {
    let response = await fetch("/animation/load/"+animation_id);
    let res = await response.json();
    if (response.status == 200) {
        return [res.imageIDs, res.positions, res.times]
    } else {
        console.log("failed to load AnimationList from server");
    }
}

// function getAnimationList() {
//     arr = [];
//     rows = animationlist_body.rows;
//     for(let i=0; i< rows.length; i++){
//         tds = rows[i].getElementsByTagName("td");
//         frameid = tds[0].getAttribute('value').slice(6,);
//         time = tds[1].getElementsByTagName("input")[0].value;
//         arr.push([frameid,time]);
//     }
//     return arr;
// }

function drag(event) {
    event.dataTransfer.setData('src', event.currentTarget.id);
}

function drop(event) {
    event.preventDefault();
    let src = document.getElementById(event.dataTransfer.getData('src'));
    let target = event.currentTarget;
    if (src == target) return false;

    let srcHolder = document.createElement('div');
    let targetHolder = document.createElement('div');

    animationlist_body.replaceChild(srcHolder, src);
    animationlist_body.replaceChild(targetHolder, target);

    animationlist_body.replaceChild(target, srcHolder);
    animationlist_body.replaceChild(src, targetHolder);
}

function attachHandlers() {
    let rows = animationlist_body.children;
    for (let row of rows) {
        row.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        row.addEventListener('dragstart', (e) => {
            drag(e);
        });

        row.addEventListener('drop', (e) => {
            drop(e);
        });

        row.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) {
                e.currentTarget.remove();
            } 
            else if (e.target.classList.contains('number-tile')) {
                let id = e.target.getAttribute('value').slice(6,)
                loadAndShow(id,null);
            }
        });
    }
}

async function addContentToThumbnails(image_ids, image_times) {
    for (let x=0; x<image_ids.length; x++) {
        time = image_times[x]
        id = image_ids[x]
        const htag = document.createElement("h5");
        let cardbody = document.querySelector("#card-body-"+id);

        htag.classList.add("card-title");
        htag.innerHTML = `${time/1000} Sekunden`;

        cardbody.appendChild(htag);
    }
}

async function initializeAnimationTiles(image_ids, positions, image_times) {
    await initializeCanvasTiles(positions, image_ids)
    await addContentToThumbnails(positions, image_times)
    //attachHandlers()
}

document.addEventListener("DOMContentLoaded", async function() {
    // if there is an id in the url, load it and draw it on the canvas, so it can be edited
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if(urlParams.has('id')) {
        const animation_id = urlParams.get('id');
        animation_list = await loadAnimationListFromServer(animation_id);
    } else {
        console.log("Didn't find the Animation ID")
    }
    let image_ids = animation_list[0]
    let positions = animation_list[1]
    let times = animation_list[2]
    initializeAnimationTiles(image_ids, positions, times)
    loadAndShow(null, "first")
});