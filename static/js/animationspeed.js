const speed_value = document.querySelector("#speed-value");
const speed_slider = document.querySelector("#sidebar-animationspeed-slider");

speed_slider.addEventListener("change", ()=>{
    speed_value.textContent = speed_slider.value/10;
    setAnimationSpeed(speed_slider.value);
});

speed_slider.addEventListener("input", function() {
    speed_value.textContent = speed_slider.value/10;
});

async function setAnimationSpeed(speed) {
    let response = await fetch("/animationspeed/set?speed="+(speed/10), {
        method: "POST",
    });
    if (response.status != 200) {
        console.log("failed to apply the speed");
    }
}

async function loadAnimationSpeed() {
    let response = await fetch("/animationspeed/load");
    if (response.status == 200) {
        res = await response.text();
        speed_value.textContent = res;
        speed_slider.setAttribute("value", res*10);
    } else {
        console.log("failed to load speed value from server");
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    await loadAnimationSpeed();
});