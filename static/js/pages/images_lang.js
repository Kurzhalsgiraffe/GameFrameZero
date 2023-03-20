const navlink_draw = document.querySelector("#navlink-draw");
const navlink_images = document.querySelector("#navlink-images");
const navlink_animations = document.querySelector("#navlink-animations");

const sidebar_options_collapse = document.querySelector("#sidebar-options-collapse");
const sidebar_options_delete_btn = document.querySelector("#sidebar-options-delete-btn");
const sidebar_options_edit_btn = document.querySelector("#sidebar-options-edit-btn");
const sidebar_options_apply_btn = document.querySelector("#sidebar-options-apply-btn");

const sidebar_brightness_collapse = document.querySelector("#sidebar-brightness-collapse");

const framenumber_label = document.querySelector("#framenumber-label");

function setLanguage(lang) {
    if (lang == "en") {
        navlink_draw.textContent = "DRAW";
        navlink_images.textContent = "IMAGES";
        navlink_animations.textContent = "ANIMATIONS";

        sidebar_options_collapse.textContent = "OPTIONS";
        sidebar_options_delete_btn.textContent = "DELETE";
        sidebar_options_delete_btn.title = "Delete the drawing from the database";
        sidebar_options_edit_btn.textContent = "EDIT";
        sidebar_options_edit_btn.title = "Edit a copy of the drawing";
        sidebar_options_apply_btn.textContent = "APPLY";
        sidebar_options_apply_btn.title = "Apply the drawing on the LED-Matrix";

        sidebar_brightness_collapse.textContent = "BRIGHTNESS";

        framenumber_label.textContent = "IMAGE: "

    } else if (lang == "de") {       
        navlink_draw.textContent = "ZEICHNEN";
        navlink_images.textContent = "BILDER";
        navlink_animations.textContent = "ANIMATIONEN";
        
        sidebar_options_collapse.textContent = "OPTIONEN";
        sidebar_options_delete_btn.textContent = "LÖSCHEN";
        sidebar_options_delete_btn.title = "Lösche die Zeichnung aus der Datenbank";
        sidebar_options_edit_btn.textContent = "BEARBEITEN";
        sidebar_options_edit_btn.title = "Bearbeite eine Kopie der Zeichnung";
        sidebar_options_apply_btn.textContent = "APPLY";
        sidebar_options_apply_btn.title = "Wende die Zeichnung auf der LED-Matrix an";

        sidebar_brightness_collapse.textContent = "HELLIGKEIT";

        framenumber_label.textContent = "BILD: "
    }
}