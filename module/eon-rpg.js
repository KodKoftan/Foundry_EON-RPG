import { eon } from "./config.js";
import * as Templates from "./templates.js";
import { EonActorSheet } from "./actor-sheet.js";

/* ------------------------------------ */
/* 1. Init system						*/
/* ------------------------------------ */
Hooks.once("init", async function() {
    CONFIG.EON = eon;

    Actors.unregisterSheet("core", ActorSheet);

    Actors.registerSheet("EON", EonActorSheet, { types: ["Rollperson"], makeDefault: true });

    //Items.unregisterSheet("core", ItemSheet);

    Templates.PreloadHandlebarsTemplates();
    Templates.RegisterHandlebarsHelpers();
    game.EON = await Templates.Setup();
});

/* ------------------------------------ */
/* 2. Setup system						*/
/* ------------------------------------ */
Hooks.once("setup", function () {
    // Do anything after initialization but before
    // ready
});

/* ------------------------------------ */
/* 3. When ready						*/
/* ------------------------------------ */
Hooks.once("ready", function () {
});

Hooks.on("renderActorSheet", (sheet) => { 
});

Hooks.on("renderItemSheet", (sheet) => { 
});

/* ------------------------------------ */
/* When rendered a sheet    			*/
/* ------------------------------------ */
Hooks.on("renderFormApplication", (sheet) => { 
});