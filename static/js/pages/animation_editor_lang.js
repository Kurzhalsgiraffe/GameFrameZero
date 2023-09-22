const navlink_draw = document.querySelector("#navlink-draw");
const navlink_images = document.querySelector("#navlink-images");
const navlink_animations = document.querySelector("#navlink-animations");

const sidebar_options_collapse = document.querySelector("#sidebar-options-collapse");
const sidebar_options_remove_animation_frame_btn = document.querySelector("#sidebar-options-remove-animation-frame-btn");

const sidebar_time_collapse = document.querySelector("#sidebar-time-collapse");
const sidebar_time_input = document.querySelector("#sidebar-time-input");
const sidebar_time_label_change_all = document.querySelector("#sidebar-time-label-change-all");
const sidebar_time_update_time_on_frame_btn = document.querySelector("#sidebar-time-update-time-on-frame-btn");

const sidebar_brightness_collapse = document.querySelector("#sidebar-brightness-collapse");

const sidebar_animationspeed_collapse = document.querySelector("#sidebar-animationspeed-collapse");

const power_switch_on = document.querySelector("#power-switch-on");
const power_switch_off = document.querySelector("#power-switch-off");

const amimation_frame_selection = document.querySelector("#amimation-frame-selection");
const add_to_animation_label = document.querySelector("#add-to-animation-label");

function setLanguage(lang) {
    if (lang == "en") {
        navlink_draw.textContent = "DRAW";
        navlink_images.textContent = "IMAGES";
        navlink_animations.textContent = "ANIMATIONS";

        sidebar_options_collapse.textContent = "OPTIONS";
        sidebar_options_remove_animation_frame_btn.textContent = "REMOVE";
        sidebar_options_remove_animation_frame_btn.title = "Remove selected frame from animation";

        sidebar_time_collapse.textContent = "TIME";
        sidebar_time_input.placeholder = "TIME (ms)";
        sidebar_time_label_change_all.textContent = "CHANGE ALL";
        sidebar_time_update_time_on_frame_btn.textContent = "APPLY";

        sidebar_brightness_collapse.textContent = "BRIGHTNESS";

        sidebar_animationspeed_collapse.textContent = "SPEED";

        power_switch_on.textContent = "ON";
        power_switch_off.textContent = "OFF";

        amimation_frame_selection.textContent = "SELECTION";
        add_to_animation_label.textContent = "ADD";

    } else if (lang == "de") {
        navlink_draw.textContent = "ZEICHNEN";
        navlink_images.textContent = "BILDER";
        navlink_animations.textContent = "ANIMATIONEN";

        sidebar_options_collapse.textContent = "OPTIONEN";
        sidebar_options_remove_animation_frame_btn.textContent = "ENTFERNEN";
        sidebar_options_remove_animation_frame_btn.title = "Entferne ausgewähltes Bild von Animation";

        sidebar_time_collapse.textContent = "ZEIT";
        sidebar_time_input.placeholder = "ZEIT (ms)";
        sidebar_time_label_change_all.textContent = "ALLE ÄNDERN";
        sidebar_time_update_time_on_frame_btn.textContent = "ANWENDEN";

        sidebar_brightness_collapse.textContent = "HELLIGKEIT";

        sidebar_animationspeed_collapse.textContent = "GESCHWINDIGKEIT";

        power_switch_on.textContent = "AN";
        power_switch_off.textContent = "AUS";

        amimation_frame_selection.textContent = "AUSWAHL";
        add_to_animation_label.textContent = "HINZUFÜGEN";
    }
}