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