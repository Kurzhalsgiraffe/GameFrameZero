const apply_animation_btn = document.querySelector("#apply-animation-btn");
const stop_animation_btn = document.querySelector("#stop-animation-btn");
const create_animation_btn = document.querySelector("#create-animation-btn");
const edit_animation_btn = document.querySelector("#edit-animation-btn");
const delete_animation_btn = document.querySelector("#delete-animation-btn");
const animation_name = document.querySelector("#animation-name");

apply_animation_btn.addEventListener("click", applyAnimation);
stop_animation_btn.addEventListener("click", stopAnimation);
create_animation_btn.addEventListener("click", createAnimation);
edit_animation_btn.addEventListener("click", editAnimation);
//delete_animation_btn.addEventListener("click", deleteAnimation);

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

async function createAnimation() {
    let name = animation_name.value
    if (!name) {
        name = null
    }
    let response = await fetch("/animation/create/"+name, {
        method: "POST"
    });
    if (response.status != 200) {
        console.log("failed to create Animation");
    }
}

async function editAnimation() {
    if (activeTile != null) {
        id = activeTile.id.slice(5,)
        window.location.replace("/animation/editor?id="+id);
    }
}

async function loadAllAnimationsFromServer() {
    let response = await fetch("/animation/load/all");
    let res = await response.json();
    if (response.status == 200) {
        return [res.animationIDs, res.animationNames, res.thumbnailIDs]
    } else {
        console.log("failed to load AnimationIDs from server");
    }
}

async function addContentToThumbnails(ids, names) {
    for (let x=0; x<ids.length; x++) {
        text = names[x]
        id = ids[x]
        const htag = document.createElement("h5");
        let cardbody = document.querySelector("#card-body-"+id);

        htag.classList.add("card-title");
        htag.innerHTML = `${text}`;

        cardbody.appendChild(htag);
    }
}

function attachHandlers(ids) {
    for (let id of ids) {
        let tile = document.querySelector("#tile-"+id);
        tile.addEventListener('click', (e) => {
            unselectTile()
            selectTile(e.currentTarget)
        });
    }
}

async function initializeAnimationThumbnails(animation_ids, animation_names, thumbnail_ids) {
    await initializeCanvasTiles(animation_ids,thumbnail_ids)
    await addContentToThumbnails(animation_ids, animation_names)
    attachHandlers(animation_ids)
}

document.addEventListener("DOMContentLoaded", async function() {
    let animations = await loadAllAnimationsFromServer()
    let animation_ids = animations[0]
    let animation_names = animations[1]
    let thumbnail_ids = animations[2]
    initializeAnimationThumbnails(animation_ids, animation_names, thumbnail_ids)
});