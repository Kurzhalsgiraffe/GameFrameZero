const navlink_draw = document.querySelector("#navlink-draw");
const navlink_images = document.querySelector("#navlink-images");
const navlink_animations = document.querySelector("#navlink-animations");

const sidebar_options_collapse = document.querySelector("#sidebar-options-collapse");
const sidebar_options_start_animation_btn = document.querySelector("#sidebar-options-start-animation-btn");
const sidebar_options_stop_animation_btn = document.querySelector("#sidebar-options-stop-animation-btn");
const sidebar_options_edit_animation_btn = document.querySelector("#sidebar-options-edit-animation-btn");
const sidebar_options_delete_animation_btn = document.querySelector("#sidebar-options-delete-animation-btn");
const sidebar_options_rename_btn = document.querySelector("#sidebar-options-rename-animation-btn");

const sidebar_create_animation_collapse = document.querySelector("#sidebar-create-animation-collapse");
const sidebar_create_animation_btn = document.querySelector("#sidebar-create-animation-btn");

const sidebar_brightness_collapse = document.querySelector("#sidebar-brightness-collapse");

const sidebar_animationspeed_collapse = document.querySelector("#sidebar-animationspeed-collapse");

const power_switch_on = document.querySelector("#power-switch-on");
const power_switch_off = document.querySelector("#power-switch-off");

function setLanguage(lang) {
    if (lang == "en") {
        navlink_draw.textContent = "DRAW";
        navlink_images.textContent = "IMAGES";
        navlink_animations.textContent = "ANIMATIONS";

        sidebar_options_collapse.textContent = "OPTIONS";
        sidebar_options_start_animation_btn.textContent = "START";
        sidebar_options_start_animation_btn.title = "Start animation on the LED-Matrix";
        sidebar_options_stop_animation_btn.textContent = "STOP";
        sidebar_options_stop_animation_btn.title = "Stop animation on the LED-Matrix";
        sidebar_options_edit_animation_btn.textContent = "EDIT";
        sidebar_options_edit_animation_btn.title = "Edit the selected animation";
        sidebar_options_delete_animation_btn.textContent = "DELETE";
        sidebar_options_delete_animation_btn.title = "Delete the selected animation";
        sidebar_options_rename_btn.textContent = "RENAME"
        sidebar_options_rename_btn.title = "Rename the selected animation";

        sidebar_create_animation_collapse.textContent = "NEW ANIMATION";
        sidebar_create_animation_btn.textContent = "CREATE";
        sidebar_create_animation_btn.title = "Create new animation";

        sidebar_brightness_collapse.textContent = "BRIGHTNESS";

        sidebar_animationspeed_collapse.textContent = "SPEED";

        power_switch_on.textContent = "ON";
        power_switch_off.textContent = "OFF";

    } else if (lang == "de") {
        navlink_draw.textContent = "ZEICHNEN";
        navlink_images.textContent = "BILDER";
        navlink_animations.textContent = "ANIMATIONEN";

        sidebar_options_collapse.textContent = "OPTIONEN";
        sidebar_options_start_animation_btn.textContent = "START";
        sidebar_options_start_animation_btn.title = "Starte die ausgewählte Animation auf der LED-Matrix";
        sidebar_options_stop_animation_btn.textContent = "STOP";
        sidebar_options_stop_animation_btn.title = "Stoppe die laufende Animation auf der LED-Matrix";
        sidebar_options_edit_animation_btn.textContent = "BEARBEITEN";
        sidebar_options_edit_animation_btn.title = "Ausgewählte Animation bearbeiten";
        sidebar_options_delete_animation_btn.textContent = "LÖSCHEN";
        sidebar_options_delete_animation_btn.title = "Ausgewählte Animation löschen";
        sidebar_options_rename_btn.textContent = "UMBENENNEN"
        sidebar_options_rename_btn.title = "Ausgewählte Animation umbenennen";

        sidebar_create_animation_collapse.textContent = "NEUE ANIMATION";
        sidebar_create_animation_btn.textContent = "ERSTELLEN";
        sidebar_create_animation_btn.title = "Erstelle eine neue Animation";

        sidebar_brightness_collapse.textContent = "HELLIGKEIT";

        sidebar_animationspeed_collapse.textContent = "GESCHWINDIGKEIT";

        power_switch_on.textContent = "AN";
        power_switch_off.textContent = "AUS";
    }
}