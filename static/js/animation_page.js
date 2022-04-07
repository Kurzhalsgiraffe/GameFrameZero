const apply_btn = document.querySelector("#apply-animation-btn");
const stop_animation_btn = document.querySelector("#stop-animation-btn");

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

async function addContentToThumbnails(animations, ids) {
    for (let x=0; x<animations.length; x++) {
        text = animations[x]
        id = ids[x]
        const htag = document.createElement("h5");
        const ptag = document.createElement("p");
        let cardbody = document.querySelector("#card-body-"+id);

        htag.classList.add("card-title");
        htag.innerHTML = `Animation ${id}`;
        ptag.innerHTML = `${text}`;

        cardbody.appendChild(htag);
        cardbody.appendChild(ptag);
    }
}

async function initializeAnimationThumbnails(animations, ids) {
    await initializeCanvasTiles(ids)
    await addContentToThumbnails(animations, ids)
}

initializeAnimationThumbnails(["text 1", "text 12","text 13","text 14","text 15","text 16","text 17","text 18"],[1,12,13,14,15,16,17,18])