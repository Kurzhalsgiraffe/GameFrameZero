const power_switch_handle = document.querySelector("#power-switch");
let power;

power_switch_handle.addEventListener("click", togglePower);

function togglePower() {
    if (power == "on") {
      power = "off";
    } else {
      power = "on";
    }
    movePowerSlider(power)
    applyPowerStatus(power)
}

function movePowerSlider(power) {
    if (power == "on") {
        power_switch_handle.style.transform = "translateX(40px)";
    } else if (power == "off") {       
        power_switch_handle.style.transform = "translateX(0px)";
    }
}

async function loadPowerStatus() {
    let response = await fetch("/power/load");
    let power = "";
    if (response.status == 200) {
        power = await response.text();
    } else {
        console.log("failed to load power status from server");
    }
    return power;
}

async function applyPowerStatus(power) {
    let response = await fetch("/power/apply/"+power, {
        method: "POST",
    });
    if (response.status != 200) {
        console.log("failed to apply the power status");
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    power = await loadPowerStatus();
    movePowerSlider(power)
});