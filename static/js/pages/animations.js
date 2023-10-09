const start_animation_btn = document.querySelector("#sidebar-options-start-animation-btn");
const stop_animation_btn = document.querySelector("#sidebar-options-stop-animation-btn");
const edit_animation_btn = document.querySelector("#sidebar-options-edit-animation-btn");
const delete_animation_btn = document.querySelector("#sidebar-options-delete-animation-btn");
const rename_animation_inpt = document.querySelector("#sidebar-options-rename-animation-name");
const rename_animation_btn = document.querySelector("#sidebar-options-rename-animation-btn");
const create_animation_btn = document.querySelector("#sidebar-create-animation-btn");
const animation_name = document.querySelector("#sidebar-create-animation-name");

start_animation_btn.addEventListener("click", startAnimation);
stop_animation_btn.addEventListener("click", stopAnimation);
create_animation_btn.addEventListener("click", createAnimation);
edit_animation_btn.addEventListener("click", editAnimation);
delete_animation_btn.addEventListener("click", deleteAnimation);
rename_animation_btn.addEventListener("click", renameAnimation);

async function startAnimation() {
    if (activeTile) {
        let animation_id = activeTile.id.slice(5,);
        let response = await fetch("/animation/start?animation_id="+animation_id, {
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
    let response = await fetch("/animation/create?name="+((animation_name.value) ? animation_name.value : null), {
        method: "POST"
    });
    if (response.status == 200) {
        initializeAnimationThumbnails();
    } else {
        console.log("failed to create Animation");
    }
}

async function editAnimation() {
    if (activeTile != null) {
        let animation_id = activeTile.id.slice(5,);
        window.location.replace("/animation/editor?id="+animation_id);
    }
}

async function deleteAnimation() {
    if (activeTile) {
        let animation_id = activeTile.id.slice(5,)
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

async function renameAnimation() {
    let name = ((rename_animation_inpt.value) ? rename_animation_inpt.value : null)
    if (activeTile && name != null) {
        let animation_id = activeTile.id.slice(5,)
        let response = await fetch("/animation/rename?animation_id="+animation_id+"&new_name="+name, {
            method: "POST",
        });
        if (response.status != 200) {
            console.log("failed to rename Animation");
        } else {
            let cardbody = document.querySelector("#card-body-"+animation_id);
            let htag = cardbody.querySelector("h5");
            htag.textContent = name
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

async function addContentToThumbnails(animation_ids, names) {
    for (let x=0; x<animation_ids.length; x++) {
        text = names[x]
        let animation_id = animation_ids[x]

        let cardbody = document.querySelector("#card-body-"+animation_id);

        const htag = document.createElement("h5");
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

    await createAnimationTiles(animation_ids,thumbnail_ids);
    await addContentToThumbnails(animation_ids, animation_names);
    await attachHandlers(animation_ids);
}

document.addEventListener("DOMContentLoaded", async function() {
    initializeAnimationThumbnails();
});