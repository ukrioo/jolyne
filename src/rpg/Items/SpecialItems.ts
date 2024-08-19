import { Special, Stand, Item } from "../../@types";
import * as Emojis from "../../emojis.json";
import * as Stands from "../Stands/Stands";
import * as Functions from "../../utils/Functions";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import { AttachmentBuilder } from "discord.js";
import * as Consumables from "./ConsumableItems";
import * as Items from "./Items";
import { EvolutionStands } from "../Stands";
import { cloneDeep } from "lodash";
import { standLogsWebhook } from "../../utils/Webhooks";

interface boxLoot {
    percent: number;
    loot?: string;
    xp?: number;
    coins?: number;
    mult?: number;
}

async function useBox(
    ctx: CommandInteractionContext,
    loot: boxLoot[][],
    name: string,
    superator: string,
    emoji: string,
    shakingEmoji: string
): Promise<number> {
    let amount: number;
    console.log(ctx.interaction.commandName);
    if (ctx.interaction.commandName === "inventory") {
        amount = ctx.interaction.options.getInteger("amount", false);
        if (amount < 1) amount = 1;
        console.log(amount);
    }
    const oldData = cloneDeep(ctx.userData);

    await ctx.makeMessage({
        content: `${shakingEmoji} Your **${Functions.capitalize(name)}** is shaking...`,
    });
    await Functions.sleep(2000);

    loot = loot.filter((r) => r.length > 0);
    const winContent: string[] = [`▬▬▬▬▬**「${emoji} ${name.toUpperCase()}」**▬▬▬▬▬▬`];
    const updateMessage = () => ctx.makeMessage({ content: winContent.join("\n") });
    if (amount === 1) updateMessage();
    let counter = 0;
    for (let i = 0; i < amount; i++)
        for await (const lootBox of loot) {
            counter++;
            if (counter !== 1) {
                winContent.push(superator);
                if (amount === 1) await Functions.sleep(1000);
                if (amount === 1) updateMessage();
            }
            for await (const reward of lootBox) {
                if (amount === 1) await Functions.sleep(1000);
                if (reward.xp) {
                    const xp = Functions.addXp(ctx.userData, reward.xp);
                    winContent.push(`- **${xp.toLocaleString("en-US")}** ${Emojis.xp} XP`);
                } else if (reward.coins) {
                    const coins = Functions.addCoins(ctx.userData, reward.coins);
                    winContent.push(
                        `- **${coins.toLocaleString("en-US")}** ${Emojis.jocoins} coins`
                    );
                } else {
                    const item = Functions.findItem(reward.loot);
                    if (!item) continue;
                    Functions.addItem(ctx.userData, reward.loot, reward.mult ?? 1);
                    winContent.push(`- ${reward.mult ?? 1}x **${item.emoji} ${item.name}**`);
                }
                if (amount === 1) updateMessage();
            }
            if (amount === 1) updateMessage();
        }
    await Functions.sleep(1000);
    winContent.push(superator);
    ctx.client.database.saveUserData(ctx.userData);
    if (amount === 1) updateMessage();
    else
        ctx.makeMessage({
            content: `${emoji} | You used **x${amount} ${Functions.capitalize(
                name
            )}** and got: (fast mode: true)\n\n${Functions.getRewardsCompareData(
                oldData,
                ctx.userData
            )
                .map((x) => `- ${x}`)
                .join("\n")}`,
        });

    return amount;
}

export const Box: Special = {
    id: "box",
    name: "Box",
    description: "A box.",
    rarity: "B",
    emoji: "📦",
    price: 5000,
    tradable: true,
    storable: true,
    use: async (ctx: CommandInteractionContext) => {
        const possibleConsumables = Object.values(Consumables).filter(
            (r) =>
                r.tradable &&
                r.storable &&
                r.rarity !== "SS" &&
                r.rarity !== "S" &&
                r.rarity !== "T"
        );
        const midItemsList1 = Object.values(Items).filter(
            (r) =>
                r.tradable &&
                r.storable &&
                r.rarity !== "A" &&
                r.rarity !== "B" &&
                r.rarity !== "SS" &&
                r.rarity !== "T"
        );
        const standList = Object.values(Stands).filter(
            (r) => r.available && r.rarity !== "SS" && r.rarity !== "T"
        );

        const midItems = [
            ...possibleConsumables,
            ...midItemsList1,
            ...standList
                .filter((r) => r.rarity === "C")
                .map((x) => Functions.findItem(`${x.id}.$disc$`)),
        ].filter((r) => r);
        const okItems = [Items.Diamond, Items.AncientScroll];
        const rareItems = [
            ...standList
                .filter((r) => r.rarity === "B")
                .map((x) => Functions.findItem(`${x.id}.$disc$`)),
            ...Object.values(Items).filter(
                (r) =>
                    (r.tradable && r.storable && r.rarity === "B") ||
                    (r.tradable && r.storable && r.rarity === "A")
            ),
            Functions.findItem("stand_arrow"),
        ].filter((r) => r);

        const finalLoot: boxLoot[][] = [
            [
                {
                    percent: 100,
                    coins: Functions.randomNumber(1000, 5000),
                },
                {
                    percent: 100,
                    xp: Functions.randomNumber(
                        Functions.getMaxXp(ctx.userData.level ?? 1) / 100,
                        Functions.getMaxXp(ctx.userData.level ?? 1) / 50
                    ),
                },
            ],
            [],
            [],
        ];

        for (const item of midItems.filter((r) => Functions.percent(70))) {
            const target = finalLoot[1];

            if (!Functions.percent(30)) continue;
            target.push({
                percent: 100,
                loot: item.id,
            });
        }

        for (const item of rareItems.filter((r) => Functions.percent(30))) {
            const target = finalLoot[2];

            if (!Functions.percent(30)) continue;
            target.push({
                percent: 100,
                loot: item.id,
            });
        }
        return useBox(ctx, finalLoot, "box", "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬", "📦", Emojis.box_shaking);
    },
};

export const MoneyBox: Special = {
    id: "money_box",
    name: "Money Box",
    description: "A money box.",
    rarity: "B",
    emoji: Emojis.moneyBox,
    price: 35000,
    tradable: true,
    storable: true,
    use: async (ctx: CommandInteractionContext) => {
        const finalLoot: boxLoot[][] = [
            [
                {
                    percent: 100,
                    coins: Functions.randomNumber(20000, 50000),
                },
                {
                    percent: 100,
                    xp: Functions.randomNumber(
                        Functions.getMaxXp(ctx.userData.level ?? 1) / 100,
                        Functions.getMaxXp(ctx.userData.level ?? 1) / 50
                    ),
                },
            ],
            [],
            [],
        ];

        return useBox(
            ctx,
            finalLoot,
            "Money Box",
            "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
            Emojis["moneyBox"],
            Emojis["moneyBox_shaking"]
        );
    },
};
/*
export const XPBox: Special = {
    id: "xp_box",
    name: "Experience Box",
    description: "An Experience filled Box.\nBut maybe there is a secret hidden in here?",
    rarity: "S",
    emoji: Emojis.xp,
    price: 60009,
    tradable: true,
    storable: true,
    use: async (ctx: CommandInteractionContext) => {
        const finalLoot: boxLoot[][] = [
            [
                {
                    percent: 100,
                    xp: Functions.randomNumber(
                        Functions.getMaxXp(ctx.userData.level ?? 1) / 2,
                        Functions.getMaxXp(ctx.userData.level ?? 1) / 1
                    ),
                },
                {
                  percent: 0.1,
                  xp: 1000000,
                },
            ],
            [],
            [],
        ];

        return useBox(
            ctx,
            finalLoot,
            "XP Box",
            "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
            Emojis["xp"],
            Emojis["xp"]
        );
    },
};
*/
export const PatreonBox: Special = {
    id: "patron_box",
    name: "Patron Box",
    description: "A patron box.",
    rarity: "S",
    emoji: Emojis.patronbox,
    price: 200000,
    tradable: false,
    storable: true,
    use: async (ctx: CommandInteractionContext) => {
        const standList = Object.values(Stands).filter((r) => r.available && r.rarity === "S");

        const finalLoot: boxLoot[][] = [
            [
                {
                    percent: 100,
                    coins: 100000,
                },
                {
                    percent: 100,
                    xp:
                        Functions.getMaxXp(ctx.userData.level ?? 1) * 2 +
                        Functions.getMaxXp((ctx.userData.level ?? 1) + 1) +
                        Functions.getMaxXp((ctx.userData.level ?? 1) + 2) +
                        Functions.getMaxXp((ctx.userData.level ?? 1) + 3),
                },
            ],
            [
                {
                    percent: 100,
                    loot: standList[Math.floor(Math.random() * standList.length)].id + ".$disc$",
                },
                {
                    percent: 100,
                    loot: RareStandArrow.id,
                    mult: 30,
                },
            ],
        ];

        return useBox(
            ctx,
            finalLoot,
            "Patron Box",
            "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
            Emojis["patronbox"],
            Emojis["patronbox_shake"]
        );
    },
};

/*
export const StandBox: Special = {
    id: "stand_box",
    name: "Stand Box",
    description: "A very rare box with all obtainable stands, opening it will give you a random T, SS or S stand.",
    rarity: "SS",
    emoji: Emojis.menacing,
    price: 690000,
    tradable: true,
    storable: true,
    use: async (ctx: CommandInteractionContext) => {
        const standBoxList = Object.values(Stands).filter((r) => r.available && (r.rarity === "S" || r.rarity === "T" || r.rarity === "SS"));

        const finalLoot: boxLoot[][] = [
            [
                {
                    percent: 100,
                    coins: 100000,
                },
                {
                    percent: 100,
                    xp: Functions.getMaxXp(ctx.userData.level ?? 1),
                },
            ],
            [
                {
                    percent: 100,
                    loot: standBoxList[Math.floor(Math.random() * standList.length)].id + ".$disc$",
                },
                {
                    percent: 100,
                    loot: XPBox.id,
                    mult: 1,
                },
            ],
        ];

        return useBox(
            ctx,
            finalLoot,
            "Forbidden Stands",
            "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
            Emojis["menacing"],
            Emojis["menacing_animated"]
        );
    },
};
*/ // what did he do
const standArray = Object.values(Stands);
standArray.push({
    id: "silver_chariot",
    ...EvolutionStands.SilverChariot.evolutions[0],
});
standArray.push({
    id: "gold_experience",
    ...EvolutionStands.GoldExperience.evolutions[0],
});
standArray.push({
    id: "whitesnake",
    ...EvolutionStands.Whitesnake.evolutions[0],
});
standArray.push({
    id: "echoes",
    ...EvolutionStands.Echoes.evolutions[0],
});
standArray.push({
    id: "killer_queen",
    ...EvolutionStands.KillerQueen.evolutions[0],
});

const rareStandArray = cloneDeep(standArray);
rareStandArray.push(Stands.KingCrimson);

export const StandArrow: Special = {
    id: "stand_arrow",
    name: "Stand Arrow",
    description: "A stand arrow.",
    rarity: "A",
    emoji: Emojis["mysterious_arrow"],
    price: 35000,
    tradable: true,
    storable: true,
    craft: {
        broken_arrow: 3,
    },
    use: async (ctx: CommandInteractionContext, ...args: string[]) => {
        const percent = Math.floor(Math.random() * 100);

        if (Functions.findStand(ctx.userData.stand)) {
            await ctx.sendTranslated("items:MYSTERIOUS_ARROW.ALREADY_STAND");
            await Functions.sleep(2000);
            await ctx.sendTranslated("items:MYSTERIOUS_ARROW.ALREADY_STAND2");
            return 0;
        }

        await ctx.sendTranslated("items:MYSTERIOUS_ARROW.MANIFESTING");
        await Functions.sleep(2000);
        await ctx.sendTranslated("items:MYSTERIOUS_ARROW.INVADING");
        await Functions.sleep(2000);

        let stand: Stand;
        let color: number;

        if (percent <= 4) {
            stand = Functions.randomArray(standArray.filter((r) => r.rarity === "S"));
            color = 0x2b82ab;
        } else if (percent <= 20) {
            color = 0x3b8c4b;
            stand = Functions.randomArray(standArray.filter((r) => r.rarity === "A"));
        } else if (percent <= 40) {
            color = 0x786d23;
            stand = Functions.randomArray(standArray.filter((r) => r.rarity === "B"));
        } else {
            stand = Functions.randomArray(standArray.filter((r) => r.rarity === "C"));
            color = stand.color;
        }

        ctx.userData.stand = stand.id;

        const standCartBuffer = await Functions.generateStandCart(stand);
        const file = new AttachmentBuilder(standCartBuffer, { name: "stand.png" });
        const totalStandSkillPoints = Object.values(stand.skillPoints).reduce((a, b) => a + b, 0);

        ctx.makeMessage({
            content: `...`,
            files: [file],
            embeds: [
                {
                    title: stand.name,
                    image: { url: "attachment://stand.png" },
                    color: color,
                    description: `**Rarity:** ${stand.rarity}\n**Abilities [${
                        stand.abilities.length
                    }]:** ${stand.abilities
                        .map((v) => v.name)
                        .join(
                            ", "
                        )}\n**Skill-Points:** +${totalStandSkillPoints} skill-points:\n${Object.entries(
                        stand.skillPoints
                    )
                        .map(([key, value]) => `• +${value} ${key}`)
                        .join("\n")}`,
                },
            ],
        });
        await ctx.client.database.saveUserData(ctx.userData);
        standLogsWebhook.send({
            embeds: [
                {
                    title: "New Stand Obtained",
                    description: `**User:** @${ctx.user.username} (${ctx.user.id})\n**Arrow:** Stand Arrow\n**Stand:** ${stand.name}\n**Rarity:** ${stand.rarity}`,
                    color: color,
                    thumbnail: {
                        url: `attachment://stand.png`,
                    },
                    timestamp: new Date().toISOString(),
                },
            ],
            files: [file],
        });
        return 1;
    },
};

export const RareStandArrow: Special = {
    id: "rare_stand_arrow",
    name: "Rare Stand Arrow",
    description:
        "**SS tier: 0.25% chance, S tier:** 16% chance, **A tier:** 40% chance, **B tier:** 44% chance.",
    rarity: "A",
    emoji: Emojis["mysterious_arrow"],
    price: 35000,
    tradable: true,
    storable: true,
    craft: {
        stand_arrow: 10,
    },
    use: async (ctx: CommandInteractionContext, ...args: string[]) => {
        const percent = Math.floor(Math.random() * 100);

        if (Functions.findStand(ctx.userData.stand)) {
            await ctx.sendTranslated("items:RARE_MYSTERIOUS_ARROW.ALREADY_STAND");
            await Functions.sleep(2000);
            await ctx.sendTranslated("items:RARE_MYSTERIOUS_ARROW.ALREADY_STAND2");
            return 0;
        }

        await ctx.sendTranslated("items:RARE_MYSTERIOUS_ARROW.MANIFESTING");
        await Functions.sleep(2000);
        await ctx.sendTranslated("items:RARE_MYSTERIOUS_ARROW.INVADING");
        await Functions.sleep(2000);

        let stand: Stand;
        let color: number;

        if (Functions.percent(0.75)) {
            stand = Functions.randomArray(rareStandArray.filter((r) => r.rarity === "SS"));
            color = 0xff0000;
        } else if (percent <= 16) {
            stand = Functions.randomArray(rareStandArray.filter((r) => r.rarity === "S"));
            color = 0x2b82ab;
        } else if (percent <= 40) {
            color = 0x3b8c4b;
            stand = Functions.randomArray(rareStandArray.filter((r) => r.rarity === "A"));
        } else {
            color = 0x786d23;
            stand = Functions.randomArray(rareStandArray.filter((r) => r.rarity === "B"));
        }

        ctx.userData.stand = stand.id;

        const standCartBuffer = await Functions.generateStandCart(stand);
        const file = new AttachmentBuilder(standCartBuffer, { name: "stand.png" });
        const totalStandSkillPoints = Object.values(stand.skillPoints).reduce((a, b) => a + b, 0);

        ctx.makeMessage({
            content: `...`,
            files: [file],
            embeds: [
                {
                    title: stand.name,
                    image: { url: "attachment://stand.png" },
                    color: color,
                    description: `**Rarity:** ${stand.rarity}\n**Abilities [${
                        stand.abilities.length
                    }]:** ${stand.abilities
                        .map((v) => v.name)
                        .join(
                            ", "
                        )}\n**Skill-Points:** +${totalStandSkillPoints} skill-points:\n${Object.entries(
                        stand.skillPoints
                    )
                        .map(([key, value]) => `• +${value} ${key}`)
                        .join("\n")}`,
                },
            ],
        });
        await ctx.client.database.saveUserData(ctx.userData);
        standLogsWebhook.send({
            embeds: [
                {
                    title: "New Stand Obtained",
                    description: `**User:** @${ctx.user.username} (${ctx.user.id})\n**Arrow:** Rare Stand Arrow\n**Stand:** ${stand.name}\n**Rarity:** ${stand.rarity}`,
                    color: color,
                    thumbnail: {
                        url: `attachment://stand.png`,
                    },
                    timestamp: new Date().toISOString(),
                },
            ],
            files: [file],
        });
        return 1;
    },
};

export const SpookyArrow2023: Special = {
    // item that gives stand skeletal_spectre
    id: "spooky_arrow_2023",
    name: "Spooky Arrow 2023",
    description: "A spooky arrow that gives you a stand.",
    rarity: "T",
    emoji: Emojis["mysterious_arrow"] + "🎃",
    price: 0,
    tradable: false,
    storable: true,
    use: async (ctx: CommandInteractionContext, ...args: string[]) => {
        if (Functions.findStand(ctx.userData.stand)) {
            await ctx.sendTranslated("items:SPOOKY_ARROW.ALREADY_STAND");
            await Functions.sleep(2000);
            await ctx.sendTranslated("items:SPOOKY_ARROW.ALREADY_STAND2");
            return 0;
        }

        const stand = Functions.findStand("skeletal_spectre");
        if (!stand)
            throw new Error("Stand not found skeletal spectre fatal error may break the game wtf.");

        ctx.userData.stand = stand.id;
        ctx.client.database.saveUserData(ctx.userData);

        const standCartBuffer = await Functions.generateStandCart(stand);
        const file = new AttachmentBuilder(standCartBuffer, { name: "stand.png" });
        const totalStandSkillPoints = Object.values(stand.skillPoints).reduce((a, b) => a + b, 0);

        ctx.makeMessage({
            content: `...`,
            files: [file],
            embeds: [
                {
                    title: stand.name,
                    image: { url: "attachment://stand.png" },
                    color: stand.color,
                    description: `**Rarity:** ${stand.rarity}\n**Abilities [${
                        stand.abilities.length
                    }]:** ${stand.abilities
                        .map((v) => v.name)
                        .join(
                            ", "
                        )}\n**Skill-Points:** +${totalStandSkillPoints} skill-points:\n${Object.entries(
                        stand.skillPoints
                    )
                        .map(([key, value]) => `• +${value} ${key}`)
                        .join(
                            "\n"
                        )} \n\n**Note:** This stand was only available during the Halloween Event 2023.`,
                },
            ],
        });

        return 1;
    },
};

export const RequiemArrow: Special = {
    id: "requiem_arrow",
    name: "Requiem Arrow",
    description:
        "A requiem arrow. It can be used to evolve your stand if you have Gold Experience or Silver Chariot.",
    rarity: "SS",
    emoji: Emojis["requiem_arrow"],
    price: 500000,
    tradable: true,
    storable: true,
    craft: {
        ancient_scroll: 300,
        stand_arrow: 500,
        broken_arrow: 1000,
    },
    use: async (ctx: CommandInteractionContext, ...args: string[]) => {
        const stand = Functions.findStand(ctx.userData.stand);

        if (ctx.userData.stand !== "gold_experience" && ctx.userData.stand !== "silver_chariot") {
            await ctx.sendTranslated("items:REQUIEM_ARROW.NOT_REQUIEM");
            return 0;
        }
        if (ctx.userData.level < 50) {
            ctx.makeMessage({
                content: "You are not worthy of this arrow yet...",
            });
            return 0;
        }
        if (ctx.userData.standsEvolved[stand.id] === 1) {
            await ctx.sendTranslated("items:REQUIEM_ARROW.ALREADY_REQUIEM", {
                stand: stand.name,
            });
            return 0;
        }
        ctx.userData.standsEvolved[stand.id] = 1;
        await ctx.sendTranslated("items:REQUIEM_ARROW.EVOLVING", {
            stand: stand.name,
        });
        ctx.client.database.saveUserData(ctx.userData);
        return 1;
    },
};

export const SkillPointsResetPotion: Special = {
    id: "skill_points_reset_potion",
    name: "Skill Points Reset Potion",
    description: "A potion that resets your skill points.",
    rarity: "A",
    emoji: Emojis.sp_potion,
    price: 59000,
    tradable: true,
    storable: true,
    use: async (ctx, ars) => {
        for (const [key, value] of Object.entries(ctx.userData.skillPoints)) {
            ctx.userData.skillPoints[key as keyof (typeof ctx.userData)["skillPoints"]] = 0;
        }
        ctx.client.database.saveUserData(ctx.userData).catch(() => {
            return false;
        });

        ctx.makeMessage({
            content: `You have successfully reset your skill points. You may want to use them again by using the ${ctx.client.getSlashCommandMention(
                "skill points invest"
            )} command. Should you need help or have any questions, please join our [support server](https://discord.gg/jolyne-support-923608916540145694)`,
        });

        return 1;
    },
};

export const ChristmasGift: Special = {
    id: "christmas_gift",
    name: "Christmas Gift",
    description: "A gift that was available during Christmas.",
    rarity: "T",
    emoji: Emojis["xmasgift"],
    price: 5000,
    tradable: true,
    storable: true,
    use: async (ctx: CommandInteractionContext) => {
        const possibleConsumables = Object.values(Consumables).filter(
            (r) =>
                r.tradable &&
                r.storable &&
                r.rarity !== "T" &&
                r.rarity !== "SS" &&
                r.rarity !== "S"
        );
        const midItemsList1 = Object.values(Items).filter(
            (r) =>
                r.tradable &&
                r.storable &&
                r.rarity !== "A" &&
                r.rarity !== "B" &&
                r.rarity !== "T" &&
                r.rarity !== "SS" &&
                r.rarity !== "S"
        );
        const standList = Object.values(Stands).filter(
            (r) => r.available && r.rarity !== "SS" && r.rarity !== "T" && r.rarity !== "S"
        );

        const midItems = [
            ...possibleConsumables,
            ...midItemsList1,
            ...standList
                .filter((r) => r.rarity === "C")
                .map((x) => Functions.findItem(`${x.id}.$disc$`)),
        ].filter((r) => r);
        const okItems = [Items.Diamond, Items.AncientScroll];
        const rareItems = [
            ...standList
                .filter((r) => r.rarity === "B")
                .map((x) => Functions.findItem(`${x.id}.$disc$`)),
            ...Object.values(Items).filter(
                (r) =>
                    (r.tradable && r.storable && r.rarity === "B") ||
                    (r.tradable && r.storable && r.rarity === "A")
            ),
            Functions.findItem("stand_arrow"),
        ].filter((r) => r);

        const finalLoot: boxLoot[][] = [
            [
                {
                    percent: 100,
                    loot: Functions.findItem(Functions.randomArray(standList).id).id,
                    mult: 1,
                },
                {
                    percent: 85,
                    loot: Functions.findItem(Functions.randomArray(standList).id).id,
                    mult: 1,
                },
                {
                    percent: 25,
                    loot: Functions.findItem(Functions.randomArray(standList).id).id,
                    mult: 1,
                },
            ],
            [
                {
                    percent: 100,
                    loot: Functions.findItem("rare_stand_arrow").id,
                },
                {
                    percent: 100,
                    loot: Functions.findItem("candy_cane").id,
                    mult: 5,
                },
            ],
        ];

        return useBox(
            ctx,
            finalLoot,
            "Christmas Box",
            "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
            Emojis["xmasgift"],
            Emojis["xmasgift_shake"]
        );
    },
};

export const BoosterBox: Special = {
    id: "booster_box",
    name: "Booster Box",
    description: "A box that given to people who boosted our support server.",
    rarity: "A",
    emoji: "📦",
    price: 5000,
    tradable: true,
    storable: true,
    use: async (ctx: CommandInteractionContext) => {
        const standList = Object.values(Stands).filter((r) => r.available && r.rarity === "S");

        const finalLoot: boxLoot[][] = [
            [
                {
                    percent: 100,
                    coins: 100000,
                },
                {
                    percent: 100,
                    xp:
                        Functions.getMaxXp(ctx.userData.level ?? 1) +
                        Functions.getMaxXp((ctx.userData.level ?? 1) + 1),
                },
            ],
            [
                {
                    percent: 100,
                    loot: standList[Math.floor(Math.random() * standList.length)].id + ".$disc$",
                },
                {
                    percent: 100,
                    loot: StandArrow.id,
                    mult: 30,
                },
            ],
        ];

        return useBox(
            ctx,
            finalLoot,
            "Booster Box",
            "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
            "📦" + "<a:booster:1212488355158302740>",
            Emojis.box_shaking + "<a:booster:1212488355158302740>"
        );
    },
};
