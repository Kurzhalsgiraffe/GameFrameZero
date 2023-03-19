const navlink_draw = document.querySelector("#navlink-draw");
const navlink_images = document.querySelector("#navlink-images");
const navlink_animations = document.querySelector("#navlink-animations");

const sidebar_colors_collapse = document.querySelector("#sidebar-colors-collapse");
const sidebar_colors_color_selector = document.querySelector("#sidebar-colors-color-selector");
const sidebar_colors_colorpicker_btn = document.querySelector("#sidebar-colors-colorpicker-btn");

const sidebar_options_collapse = document.querySelector("#sidebar-options-collapse");
const sidebar_options_delete_btn = document.querySelector("#sidebar-options-delete-btn");
const sidebar_options_apply_btn = document.querySelector("#sidebar-options-apply-btn");
const sidebar_options_save_btn = document.querySelector("#sidebar-options-save-btn");
const sidebar_options_replace_btn = document.querySelector("#sidebar-options-replace-btn");

const sidebar_brightness_collapse = document.querySelector("#sidebar-brightness-collapse");

const sidebar_move_collapse = document.querySelector("#sidebar-move-collapse");

function setLanguage(lang) {
    if (lang == "en") {
        navlink_draw.textContent = "DRAW";
        navlink_images.textContent = "IMAGES";
        navlink_animations.textContent = "ANIMATIONS";
        
        sidebar_colors_collapse.textContent = "COLORS";
        sidebar_colors_color_selector.title = "Color Selector"
        sidebar_colors_colorpicker_btn.title = "Color Picker"

        sidebar_options_collapse.textContent = "OPTIONS";
        sidebar_options_delete_btn.textContent = "DELETE";
        sidebar_options_delete_btn.title = "Clear the canvas";
        sidebar_options_apply_btn.textContent = "APPLY";
        sidebar_options_apply_btn.title = "Apply the drawing on the LED-Matrix";
        sidebar_options_save_btn.textContent = "SAVE";
        sidebar_options_save_btn.title = "Save the drawing to the database";
        sidebar_options_replace_btn.textContent = "REPLACE";
        sidebar_options_replace_btn.title = "Override the drawing in the database";


        sidebar_brightness_collapse.textContent = "BRIGHTNESS";

        sidebar_move_collapse.textContent = "MOVE";

    } else if (lang == "de") {       
        navlink_draw.textContent = "ZEICHNEN";
        navlink_images.textContent = "BILDER";
        navlink_animations.textContent = "ANIMATIONEN";
        
        sidebar_colors_collapse.textContent = "FARBEN";
        sidebar_colors_color_selector.title = "Farbauswahl"
        sidebar_colors_colorpicker_btn.title = "Pipette"

        sidebar_options_collapse.textContent = "OPTIONEN";
        sidebar_options_delete_btn.textContent = "LÖSCHEN";
        sidebar_options_delete_btn.title = "Verwerfe die Zeichnung";
        sidebar_options_apply_btn.textContent = "ANWENDEN";
        sidebar_options_apply_btn.title = "Wende die Zeichnung auf der LED-Matrix an";
        sidebar_options_save_btn.textContent = "SPEICHERN";
        sidebar_options_save_btn.title = "Speichere die Zeichnung auf der Datenbank";
        sidebar_options_replace_btn.textContent = "ERSETZEN";
        sidebar_options_replace_btn.title = "Überschreibe die bearbeitete Zeichnung in der Datenbank";

        sidebar_brightness_collapse.textContent = "HELLIGKEIT";

        sidebar_move_collapse.textContent = "VERSCHIEBEN";
    }
}