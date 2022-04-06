const apply_btn = document.querySelector("#apply-animation-btn");
const stop_animation_btn = document.querySelector("#stop-animation-btn");
const animations_body = document.querySelector("#animations-body");

var canvasObject = new CanvasObject(canvas=null, FRAME_SIZE=256, PIXEL_SIZE=16, colorArray=[], gridColor='rgba(0, 0, 0, 1.0)');

apply_btn.addEventListener("click", applyAnimation);
stop_animation_btn.addEventListener("click", stopAnimation);

async function applyAnimation() {
    let response = await fetch("/animation/apply", {
        method: "POST"
    });
    if (response.status != 200) {
        console.log("failed to apply Animation");
    }
}

async function stopAnimation() {
    let response = await fetch("/animation/stop", {
        method: "POST"
    });
    if (response.status != 200) {
        console.log("failed to stop Animation");
    }
}

async function loadMultipleArraysFromServer(ids) {
    let response = await fetch("/loadlist", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(ids)
    });
    
    if (response.status == 200) {
        let res = await response.json();
        return res
    } else {
        console.log("failed to load colorArray from server");
    }
}

async function initializeAnimationThumbnails(animations, ids) {
    let blobs = await loadMultipleArraysFromServer(ids)

    for (let x=0; x<animations.length; x++) {
        title = animations[x]
        id = ids[x]
        // create elements
        const wrap = document.createElement("div");
        const tile = document.createElement("div");
        const canvas = document.createElement("canvas");
        const cardbody = document.createElement("div");
        const head = document.createElement("h5");
        const text = document.createElement("p");

        // add attributes
        wrap.classList.add("col")
        wrap.classList.add("col-lg-3")
        tile.classList.add("card");
        tile.classList.add("h-80");
        tile.classList.add("bg-dark");
        canvas.classList.add("card-img-top");
        canvas.setAttribute("width", "256px");
        canvas.setAttribute("height", "256px");
        canvas.setAttribute("id", "canvas-"+id);
        cardbody.classList.add("card-body");
        head.classList.add("card-title");

        // add text
        head.innerHTML = `Animation ${id}`;
        text.innerHTML = `${title}`;

        // add elements to tr and tr to dom
        cardbody.appendChild(head);
        cardbody.appendChild(text);
        tile.appendChild(canvas);
        tile.appendChild(cardbody);
        wrap.appendChild(tile);
        animations_body.appendChild(wrap);
    }
    await drawThumbnails(blobs);
}

async function drawThumbnails(blobs) {
    for (let blob of blobs) {
        id = blob[0]
        let c = document.querySelector("#canvas-"+id);
        canvasObject.setCanvas(c);
        canvasObject.setColorArray(blob[1])
        
        if (canvasObject.colorArray.length === 0) {
            canvasObject.initializeColorArray();
        }
        canvasObject.drawColorArrayToCanvas();
        canvasObject.drawGrid()
    }
    
}

initializeAnimationThumbnails(["text 1", "text 12","text 13","text 14","text 15","text 16","text 17","text 18"],[1,12,13,14,15,16,17,18])