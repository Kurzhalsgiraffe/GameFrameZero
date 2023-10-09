const canv = document.querySelector("canvas");
const remove_animation_frame_btn = document.querySelector("#sidebar-options-remove-animation-frame-btn");
const update_time_on_frame_btn = document.querySelector("#sidebar-time-update-time-on-frame-btn");
const first_frame_btn = document.querySelector("#first-frame-btn");
const fast_backwards_btn = document.querySelector("#fast-backwards-btn");
const prev_frame_btn = document.querySelector("#prev-frame-btn");
const selector_svg_img = document.querySelector("#selector-svg-img");
const next_frame_btn = document.querySelector("#next-frame-btn");
const fast_forwards_btn = document.querySelector("#fast-forwards-btn");
const last_frame_btn = document.querySelector("#last-frame-btn");
const frameName = document.getElementById("image-name");
const animation_time_all_checkbox = document.querySelector("#sidebar-time-set-time-for-all-checkbox");
const animation_time = document.querySelector("#sidebar-time-input");
const add_to_animation_btn = document.querySelector("#add-to-animation-btn");

let currentPos = 1;
let animation_id;
let dragStartPosition;

remove_animation_frame_btn.addEventListener("click", async () => await RemoveFrameFromAnimation());
update_time_on_frame_btn.addEventListener("click", async () => await UpdateTime());
first_frame_btn.addEventListener("click", async () => await SelectorLoadSVG(null, "first"));
fast_backwards_btn.addEventListener("click", async () => await SelectorLoadSVG(currentPos, "fastbackwards"));
prev_frame_btn.addEventListener("click", async () => await SelectorLoadSVG(currentPos, "prev"));
next_frame_btn.addEventListener("click", async () => await SelectorLoadSVG(currentPos, "next"));
fast_forwards_btn.addEventListener("click", async () => await SelectorLoadSVG(currentPos, "fastforwards"));
last_frame_btn.addEventListener("click", async () => await SelectorLoadSVG(null, "last"));
add_to_animation_btn.addEventListener("click", async () => await addFrameToAnimation());

async function SelectorLoadSVG(id=null, pos=null) {
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

        selector_svg_img.src = `data:image/svg+xml;base64,${btoa(svg)}`;
        frameName.textContent = imageName;
    } else {
        frameName.textContent = "-";
    }    
}

async function RemoveFrameFromAnimation() {
    let active_frame_id;
    let response;
    if (activeTile != null) {
        active_frame_id = activeTile.id.slice(5,);
        response = await fetch("/animation/removeframe?animation_id="+animation_id+"&pos="+active_frame_id, {
            method: "DELETE"
        });
        if (response.status == 200) {
            removeTileFromBody(activeTile.parentElement);
        } else {
            console.log("failed to remove frame number " + active_frame_id + " from the Animation");
        }
    }
}

async function UpdateTime() {
    let position = null;
    let response;
    let time = animation_time.value;

    if (animation_time_all_checkbox.checked) {
        position = "all"
    } else if (activeTile != null) {
        position = activeTile.id.slice(5,);
    }

    if (time.length>0 && position != null) {
        response = await fetch("/animation/updatetime?animation_id="+animation_id+"&position="+position+"&time="+time, {
            method: "POST"
        }); 
        if (response.status == 200) {
            initializeAnimationTiles();
        } else {
            console.log("failed to update time of frame number " + position);
        }
    }
}

async function loadDefaultAnimationTime() {
    let response = await fetch("/animationtime/load");
    if (response.status == 200) {
        res = await response.text();
        return parseInt(res)
    } else {
        console.log("failed to load default animationtime value from server");
    }
}

async function getImageNameById(image_id) {
    let response = await fetch("/image/getname?image_id="+image_id);
    if (response.status == 200) {
        res = await response.text();
        return res
    } else {
        console.log("failed to load image name from server");
    }
}

async function addFrameToAnimation() {
    let response = await fetch("/animation/addframe?animation_id="+animation_id+"&image_id="+currentPos, {        
        method: "POST"
    });
    if (response.status == 200) {
        let default_animationtime = await loadDefaultAnimationTime()
        let image_name = await getImageNameById(currentPos);
        pos = parseInt(getLastTileID()) + 1;
        initializeSingleAnimationTile(pos, currentPos, image_name, default_animationtime);
    } else {
        console.log("failed to add frame number " + currentPos + " to the Animation");
    }
}

async function loadAnimationListFromServer() {
    let response = await fetch("/animation/info/load/single?animation_id="+animation_id);
    let res = await response.json();
    if (response.status == 200) {
        return [res.imageIDs, res.imageNames, res.positions, res.times];
    } else {
        console.log("failed to load AnimationList from server");
    }
}

async function switchFramePositions(target_id) {
    let response;
    let source_id = dragStartPosition
    if (dragStartPosition != target_id) {
        response = await fetch("/animation/switchframepositions?animation_id="+animation_id+"&source_id="+source_id+"&target_id="+target_id, {
            method: "POST"
        });
        if (response.status == 200) {
            initializeAnimationTiles();
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

async function addContentToTiles(image_names, positions, image_times) {
    for (let x=0; x<image_names.length; x++) {
        let image_name = image_names[x]
        let pos = positions[x]
        let time = image_times[x]

        let cardbody = document.querySelector("#card-body-"+pos);
        let tile = document.querySelector("#tile-"+pos);

        const image_name_tag = document.createElement("h4");
        const time_tag = document.createElement("h5");

        tile.setAttribute("draggable", "true");
        image_name_tag.classList.add("card-title");
        time_tag.classList.add("card-title");

        image_name_tag.innerHTML = `${image_name}`;

        if (document.documentElement.lang == "en") {
            time_tag.innerHTML = `${time/1000} Seconds`;
        } else if (document.documentElement.lang == "de") {
            time_tag.innerHTML = `${time/1000} Sekunden`;
        }

        cardbody.appendChild(image_name_tag);
        cardbody.appendChild(time_tag);
    }
}

async function initializeAnimationTiles() {
    clearTileBody();

    let animation_list = await loadAnimationListFromServer();
    let image_ids = animation_list[0];
    let image_names = animation_list[1];
    let positions = animation_list[2];
    let times = animation_list[3];

    await createAnimationTiles(positions, image_ids);
    await addContentToTiles(image_names, positions, times);
    await attachHandlers(positions);
}

async function initializeSingleAnimationTile(position, image_id, image_name, time) {
    let positions = [position];
    let image_ids = [image_id];
    let image_names = [image_name];
    let times = [time];
    await createAnimationTiles(positions, image_ids);
    await addContentToTiles(image_names, positions, times);
    await attachHandlers(positions);
}

document.addEventListener("DOMContentLoaded", async function() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if(urlParams.has('id')) {
        animation_id = urlParams.get('id');
        initializeAnimationTiles();
        SelectorLoadSVG(null, "first");
    } else {
        console.log("Didn't find the Animation ID");
    }
});