const PIXEL_SIZE = 16;
const FRAME_SIZE = 256;
const apply_btn = document.querySelector("#apply-animation-btn");
const stop_animation_btn = document.querySelector("#stop-animation-btn");
const animations_body = document.querySelector("#animations-body");

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

// load colorArray from server relativ to the currently loaded Frame
async function loadColorArrayFromServer(id) {
    let response = await fetch("/load/"+id+"/same");
    if (response.status == 200) {
        res = await response.json();
        if (!res.colorArray) {
            initializeColorArray();
        } else {
            colorArray = res.colorArray;
        }
        drawColorArrayToCanvas();
    } else {
        console.log("failed to load colorArray from server");
    }
}

function initializeAnimationThumbnails(animations) {
    let x = 0;

    for (let animation of animations) {
        
        // create elements
        const wrap = document.createElement("div");
        const tile = document.createElement("div");
        const canvas = document.createElement("canvas");
        const cardbody = document.createElement("div");
        const head = document.createElement("h5");
        const text = document.createElement("p");

        // add attributes
        tile.setAttribute("id", "animation-"+x);

        wrap.classList.add("col")
        wrap.classList.add("col-lg-3")
        tile.classList.add("card");
        tile.classList.add("h-80");
        tile.classList.add("bg-dark");
        canvas.classList.add("card-img-top");
        canvas.setAttribute("width", "256px");
        canvas.setAttribute("height", "256px");
        cardbody.classList.add("card-body");
        head.classList.add("card-title");

        // add text
        head.innerHTML = `Animation ${x}`;
        text.innerHTML = `${animation}`;

        // add elements to tr and tr to dom
        cardbody.appendChild(head);
        cardbody.appendChild(text);
        tile.appendChild(canvas);
        tile.appendChild(cardbody);
        wrap.appendChild(tile);
        animations_body.appendChild(wrap);

        x++;
    }
}

initializeAnimationThumbnails(["ani1","ani2","ani3","ani4","ani5","ani6"])