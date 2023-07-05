const start_animation_btn = document.querySelector("#sidebar-options-start-animation-btn");
const stop_animation_btn = document.querySelector("#sidebar-options-stop-animation-btn");
const edit_animation_btn = document.querySelector("#sidebar-options-edit-animation-btn");
const delete_animation_btn = document.querySelector("#sidebar-options-delete-animation-btn");
const create_animation_btn = document.querySelector("#sidebar-create-animation-btn");
const animation_name = document.querySelector("#sidebar-create-animation-name");

start_animation_btn.addEventListener("click", startAnimation);
stop_animation_btn.addEventListener("click", stopAnimation);
create_animation_btn.addEventListener("click", createAnimation);
edit_animation_btn.addEventListener("click", editAnimation);
delete_animation_btn.addEventListener("click", deleteAnimation);

async function startAnimation() {
    let animation_id;
    let response;
    if (activeTile) {
        animation_id = activeTile.id.slice(5,);
        response = await fetch("/animation/start?animation_id="+animation_id, {
            method: "POST"
        });
        if (response.status != 200) {
            console.log("failed to apply Animation");
        }
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
    let name = animation_name.value;
    if (!name) {
        name = null;
    }
    let response = await fetch("/animation/create?name="+name, {
        method: "POST"
    });
    if (response.status == 200) {
        initializeAnimationThumbnails();
    } else {
        console.log("failed to create Animation");
    }
    
}

async function editAnimation() {
    let id;
    if (activeTile != null) {
        id = activeTile.id.slice(5,);
        window.location.replace("/animation/editor?id="+id);
    }
}

async function deleteAnimation() {
    let animation_id;
    if (activeTile) {
        animation_id = activeTile.id.slice(5,)
        let response = await fetch("/animation/delete?animation_id="+animation_id, {
            method: "DELETE"
        });
        if (response.status == 200) {
            removeTileFromBody(activeTile.parentElement);
        } else {
            console.log("failed to create Animation");
        }
    }
}

async function loadAllAnimationsFromServer() {
    let response = await fetch("/animation/info/load/all");
    let res = await response.json();
    if (response.status == 200) {
        return [res.animationIDs, res.animationNames, res.thumbnailIDs];
    } else {
        console.log("failed to load AnimationIDs from server");
    }
}

async function addContentToThumbnails(ids, names) {
    for (let x=0; x<ids.length; x++) {
        text = names[x]
        let id = ids[x]
        const htag = document.createElement("h5");
        let cardbody = document.querySelector("#card-body-"+id);

        htag.classList.add("card-title");
        htag.innerHTML = `${text}`;

        cardbody.appendChild(htag);
    }
}

async function attachHandlers(ids) {
    for (let id of ids) {
        let tile = document.querySelector("#tile-"+id);
        tile.addEventListener('click', (e) => {
            unselectTile();
            selectTile(e.currentTarget);
        });
    }
}

async function initializeAnimationThumbnails() {
    clearTileBody();

    let animations = await loadAllAnimationsFromServer();
    let animation_ids = animations[0];
    let animation_names = animations[1];
    let thumbnail_ids = animations[2];

    await createCanvasTiles(animation_ids,thumbnail_ids);
    await addContentToThumbnails(animation_ids, animation_names);
    await attachHandlers(animation_ids);
}

document.addEventListener("DOMContentLoaded", async function() {
    initializeAnimationThumbnails();
});