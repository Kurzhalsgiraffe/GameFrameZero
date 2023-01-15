const speed_value = document.querySelector("#speed-value");
const speed_slider = document.querySelector("#speed-slider");

speed_slider.addEventListener("change", ()=>{
    speed_value.textContent = speed_slider.value;
    applySpeed(speed_slider.value);
});

speed_slider.addEventListener("input", function() {
    speed_value.textContent = speed_slider.value;
});

async function applySpeed(speed) {
    let response = await fetch("/speed/apply/"+speed, {
        method: "POST",
    });
    if (response.status != 200) {
        console.log("failed to apply the speed");
    }
}

async function loadSpeed() {
    let response = await fetch("/speed/load");
    if (response.status == 200) {
        res = await response.text();
        speed_value.textContent = res;
        speed_slider.setAttribute("value", res);
    } else {
        console.log("failed to load speed value from server");
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    await loadSpeed();
});