import DiceHelper from "./dice-helper.js";
import CreateHelper from "./create-helper.js";

export class EonActorSheet extends ActorSheet {

    /** @override */
    static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["rollperson"],
            tabs: [{
                    navSelector: ".sheet-tabs",
                    contentSelector: ".sheet-body",
                    initial: "skill",
			    },
                {
                    navSelector: ".sheet-mystic-tabs",
                    contentSelector: ".sheet-mystic-body",
                    initial: "magic",
                }
            ]
		});
	}
  
    /** @override */
	constructor(actor, options) {
        super(actor, options);

        this.locked = false;
		this.isCharacter = true;	
		this.isGM = game.user.isGM;	
    }

    /** @override */
	get template() {
        let sheet = "rollperson";

        if ((this.actor.system?.type != undefined)&&(this.actor.system?.type == "")){
            sheet = this.actor.system.type;
        }

		sheet = sheet.toLowerCase().replace(" ", "");
		return `systems/eon-rpg/templates/actors/${sheet}-sheet.html`;
	}

    /** @override */
    async getData() {
        const actorData = duplicate(this.actor);		

		if (!actorData.system.installningar.skapad) {
            const version = game.data.system.version;

            await CreateHelper.SkapaFardigheter(this.actor, CONFIG.EON, version);

            actorData.system.installningar.skapad = true;
            actorData.system.installningar.version = version;
            await this.actor.update(actorData);
		}
		else {
			
		}	

        const data = await super.getData();	

        data.EON = game.EON;
        data.EON.CONFIG = CONFIG.EON;

        data.actor.system.listdata = [];
        data.actor.system.listdata.fardigheter = [];
        data.actor.system.listdata.fardigheter.strid = [];
        data.actor.system.listdata.fardigheter.rorelse = [];
        data.actor.system.listdata.fardigheter.mystik = [];
        data.actor.system.listdata.fardigheter.social = [];
        data.actor.system.listdata.fardigheter.kunskap = [];
        data.actor.system.listdata.fardigheter.sprak = [];
        data.actor.system.listdata.fardigheter.vildmark = [];
        data.actor.system.listdata.fardigheter.ovriga = [];

        for (const item of this.actor.items) {
            data.actor.system.listdata.fardigheter[item.system.grupp].push(item);
        }

        for (const grupp in CONFIG.EON.fardighetgrupper) {
            data.actor.system.listdata.fardigheter[grupp] = data.actor.system.listdata.fardigheter[grupp].sort((a, b) => a.name.localeCompare(b.name));
        }

        console.log(data.actor);
        console.log(data.EON);

        return data;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        html
			.find('.inputdata')
			.change(event => this._onsheetChange(event));
    }

    async _onsheetChange(event) {
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;

		const source = dataset.source;
		const actorData = duplicate(this.actor);

        if (source == "folkslag") {
            var e = document.getElementById("folkslag");
            let data = game.EON.folkslag[e.value];

            if (data?.namn == undefined) {
                return;
            }

            if (this.actor.system.bakgrund.folkslag != "") {
                const performDelete = await new Promise((resolve) => {
                    Dialog.confirm({
                        title: "Varning!",
                        yes: () => resolve(true),
                        no: () => resolve(false),
                        content: "Om du byter folkslag kommer alla ändringar du gjort på dina grundegenskaper att nollställas enligt det nya folkslaget"
                    });
                });

                if (!performDelete)
                    return;
            }

            for (const egenskap in data.grundegenskaper) {
                actorData.system.grundegenskaper[egenskap].tvarde = data.grundegenskaper[egenskap].tvarde;
                actorData.system.grundegenskaper[egenskap].bonus = data.grundegenskaper[egenskap].bonus;
            }

            actorData.system.harleddegenskaper.forflyttning = await DiceHelper.BeraknaMedelvarde(actorData.system.grundegenskaper.rorlighet, actorData.system.grundegenskaper.talighet);
            actorData.system.harleddegenskaper.intryck = await DiceHelper.BeraknaMedelvarde(actorData.system.grundegenskaper.utstralning, actorData.system.grundegenskaper.visdom);
            actorData.system.harleddegenskaper.kroppsbyggnad = await DiceHelper.BeraknaMedelvarde(actorData.system.grundegenskaper.styrka, actorData.system.grundegenskaper.talighet);
            actorData.system.harleddegenskaper.reaktion = await DiceHelper.BeraknaMedelvarde(actorData.system.grundegenskaper.rorlighet, actorData.system.grundegenskaper.uppfattning);
            actorData.system.harleddegenskaper.sjalvkontroll = await DiceHelper.BeraknaMedelvarde(actorData.system.grundegenskaper.psyke, actorData.system.grundegenskaper.vilja);
            actorData.system.harleddegenskaper.vaksamhet = await DiceHelper.BeraknaMedelvarde(actorData.system.grundegenskaper.psyke, actorData.system.grundegenskaper.uppfattning);
            actorData.system.harleddegenskaper.livskraft = await DiceHelper.BeraknaLivskraft(actorData.system.grundegenskaper.styrka, actorData.system.grundegenskaper.talighet);

            actorData.system.bakgrund.folkslag = e.value;            

            await this.actor.update(actorData);
		    this.render();
            return;
        }		
	}
}