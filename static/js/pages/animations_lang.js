const navlink_draw = document.querySelector("#navlink-draw");
const navlink_images = document.querySelector("#navlink-images");
const navlink_animations = document.querySelector("#navlink-animations");

const sidebar_options_collapse = document.querySelector("#sidebar-options-collapse");
const sidebar_options_start_animation_btn = document.querySelector("#sidebar-options-start-animation-btn");
const sidebar_options_stop_animation_btn = document.querySelector("#sidebar-options-stop-animation-btn");
const sidebar_options_edit_animation_btn = document.querySelector("#sidebar-options-edit-animation-btn");
const sidebar_options_delete_animation_btn = document.querySelector("#sidebar-options-delete-animation-btn");

const sidebar_create_animation_collapse = document.querySelector("#sidebar-create-animation-collapse");
const sidebar_create_animation_btn = document.querySelector("#sidebar-create-animation-btn");

const sidebar_brightness_collapse = document.querySelector("#sidebar-brightness-collapse");

const sidebar_animationspeed_collapse = document.querySelector("#sidebar-animationspeed-collapse");

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

        sidebar_create_animation_collapse.textContent = "NEW ANIMATION";
        sidebar_create_animation_btn.textContent = "CREATE";
        sidebar_create_animation_btn.title = "Create new animation";

        sidebar_brightness_collapse.textContent = "BRIGHTNESS";

        sidebar_animationspeed_collapse.textContent = "SPEED";

    } else if (lang == "de") {
        navlink_draw.textContent = "ZEICHNEN";
        navlink_images.textContent = "BILDER";
        navlink_animations.textContent = "ANIMATIONEN";

        sidebar_options_collapse.textContent = "OPTIONEN";
        sidebar_options_start_animation_btn.textContent = "START";
        sidebar_options_start_animation_btn.title = "Starte Animation auf der LED-Matrix";
        sidebar_options_stop_animation_btn.textContent = "STOP";
        sidebar_options_stop_animation_btn.title = "Stoppe Animation auf der LED-Matrix";
        sidebar_options_edit_animation_btn.textContent = "BEARBEITEN";
        sidebar_options_edit_animation_btn.title = "Bearbeite die ausgewählte Animation";
        sidebar_options_delete_animation_btn.textContent = "LÖSCHEN";
        sidebar_options_delete_animation_btn.title = "Lösche die ausgewählte Animation";

        sidebar_create_animation_collapse.textContent = "NEUE ANIMATION";
        sidebar_create_animation_btn.textContent = "ERSTELLEN";
        sidebar_create_animation_btn.title = "Erstelle eine neue Animation";

        sidebar_brightness_collapse.textContent = "HELLIGKEIT";

        sidebar_animationspeed_collapse.textContent = "GESCHWINDIGKEIT";
    }
}