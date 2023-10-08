import { Ability, FightableNPC, SkillPoints } from "../@types";
import { FightHandler, Fighter } from "../structures/FightHandler";
import { cloneDeep } from "lodash";
import * as Stands from "./Stands/Stands";
import * as Functions from "../utils/Functions";

export const StandBarrage: Ability = {
    name: "Stand Barrage",
    description: "Performs an astoundingly fast flurry of punches that deals small damage per hit",
    cooldown: 5,
    extraTurns: 1,
    damage: 10,
    stamina: 10,
    dodgeScore: 1,
    target: "enemy"
};

export const KickBarrage: Ability = {
    name: "Kick Barrage",
    description: "Performs an astoundingly fast flurry of kicks that deals small damage per hit",
    cooldown: 3,
    extraTurns: 0,
    damage: 8,
    stamina: 6,
    dodgeScore: 1,
    target: "enemy"
};

export const StarFinger: Ability = {
    name: "Star Finger",
    description: "Extends {standName}'s finger and stabs the target in the eyes",
    cooldown: 8,
    extraTurns: 1,
    damage: 25,
    stamina: 18,
    dodgeScore: 2,
    target: "enemy"
};

export const RoadRoller: Ability = {
    ...StarFinger,
    name: "Road Roller",
    description:
        "jumps high into the sky, bringing a steamroller down with them, slamming it down where they were previously standing. CAN STACK FREE TURNS IF ENOUGH SPEED!"
};

export const TheWorld: Ability = {
    name: "The World",
    description: "Stops time for 5 turns",
    cooldown: 10,
    extraTurns: 5,
    damage: 0,
    stamina: 35,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        ctx.nextTurnPromises.push({
            cooldown: 6,
            promise: (fight) => {
                fight.turns[ctx.turns.length - 1].logs.push(
                    `> ${user.stand.emoji} **${user.name}:** Toki wo Ugokidasu...`
                );
                user.hasStoppedTime = false;
            },
            id: "" + Date.now() + Math.random() + ""
        });
        user.hasStoppedTime = true;

        if (user.stand.name === Stands.TheWorld.name) {
            ctx.turns[ctx.turns.length - 1].logs.push(
                `> ${user.stand.emoji} **${user.name}:** THE WORLD! TOKI WO TOMARE!`
            );
        } else if (user.stand.name === Stands.StarPlatinum.name) {
            ctx.turns[ctx.turns.length - 1].logs.push(
                `> ${user.stand.emoji} **${user.name}:** STAR PLATINUM: THE WORLD! TOKI WO TOMARE!`
            );
        } else
            ctx.turns[ctx.turns.length - 1].logs.push(
                `> ${user.stand.emoji} **${user.name}:** ${user.stand.name}: TOKI WO TOMARE!`
            );
    },
    dodgeScore: 0,
    target: "self"
};

export const EmeraldSplash: Ability = {
    name: "Emerald Splash",
    description: "fires off a large amount of energy which takes the form of emeralds.",
    cooldown: 5,
    extraTurns: 1,
    damage: 10,
    stamina: 15,
    dodgeScore: 10,
    target: "enemy"
};

export const VolaBarrage: Ability = {
    ...EmeraldSplash,
    name: "Vola Barrage",
    description: "Sends a wave of bullets in the direction the user is facing.",
    thumbnail:
        "https://cdn.discordapp.com/attachments/940949551911690311/1100382611634913391/AdorableRemoteBigmouthbass-mobile.gif",
    dodgeScore: 3,
    target: "enemy"
};

export const LittleBoy: Ability = {
    name: "Little Boy",
    description: "drop 3 bombs behind its opponent that will explode instantly",
    cooldown: 8,
    extraTurns: 1,
    extraTurnsIfGB: 1,
    damage: 15,
    stamina: 8,
    dodgeScore: 3,
    target: "enemy"
};

export const Manipulation: Ability = {
    name: "Manipulation",
    description: "Manipulates the opponent's body, causing them unable to control therseivles",
    cooldown: 10,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        const baseTarget = { ...target };
        let unmanipulated = false;

        const unmanipulate = (fight: {
            turns: {
                logs: string[];
            }[];
        }) => {
            if (unmanipulated) return;
            target.name = baseTarget.name;
            target.manipulatedBy = undefined;
            fight.turns[ctx.turns.length - 1].logs.push(
                `${user.stand.emoji} (target: ${target.name}) has been released from manipulation.`
            );
            unmanipulated = true;
        };

        if (user.manipulatedBy) {
            ctx.turns[ctx.turns.length - 1].logs.push(
                `**${user.manipulatedBy.name}:** [ERROR: cannot manipulate if already manipulated]`
            );
            return;
        } else if (target.manipulatedBy) {
            ctx.turns[ctx.turns.length - 1].logs.push(
                `**${user.name}:** [ERROR: cannot manipulate ${target.name} because they are already manipulated by ${target.manipulatedBy.name}]`
            );
            return;
        } else {
            target.name += " (Manipulated)";
            target.manipulatedBy = user;
            ctx.nextRoundPromises.push({
                cooldown: 2,
                promise: (fight) => {
                    unmanipulate(fight);
                },
                id: "" + Date.now() + Math.random() + ""
            });

            ctx.turns[ctx.turns.length - 1].logs.push(
                `${user.stand.emoji} **${user.name}:** ${user.stand.name}: Manipulation! (target: ${target.name})`
            );
        }
    },
    damage: 0,
    stamina: TheWorld.stamina,
    extraTurns: 0,
    thumbnail: "https://media.tenor.com/zOTu19A7VoEAAAAC/jojo-hierophant-green.gif",
    dodgeScore: 1,
    target: "enemy"
};

export const LightSpeedBarrage: Ability = {
    name: "Light-Speed Barrage",
    description: "erases matter to jump on the enemies and assault them with rapid punches.",
    cooldown: 5,
    damage: 12.5,
    stamina: 15,
    extraTurns: 1,
    thumbnail: "https://media.tenor.com/X1JHf1sGkwIAAAAd/okuyasu-the-hand.gif",
    dodgeScore: 4,
    target: "enemy"
};

export const DeadlyErasure: Ability = {
    name: "Deadly Erasure",
    description:
        "uses their right hand to erase space and jump one you and use the effect of surprise to erase you",
    cooldown: 15,
    damage: 35,
    stamina: 15,
    extraTurns: 2,
    special: true,
    thumbnail:
        "https://cdn.discordapp.com/attachments/940949551911690311/1100382190166081647/RawDaringEeve-mobile.gif",
    dodgeScore: 4,
    target: "enemy"
};

const burnDamagePromise = (ctx: FightHandler, target: Fighter, damage: number, user: Fighter) => {
    ctx.nextTurnPromises.push({
        cooldown: 3,
        promise: (fight) => {
            fight.turns[ctx.turns.length - 1].logs.push(
                `:fire: **${target.name}** took **${damage}** burn damage`
            );
            if (target.health > 0) {
                target.health -= damage;
                user.totalDamageDealt += damage;
                if (target.health <= 0) {
                    target.health = 0;
                    fight.turns[ctx.turns.length - 1].logs.push(
                        `:fire: **${target.name}** died from burn damage`
                    );
                }
            }
        },
        id: "" + Date.now() + Math.random() + ""
    });
};

const bleedDamagePromise = (ctx: FightHandler, target: Fighter, damage: number, user: Fighter) => {
    ctx.nextTurnPromises.push({
        cooldown: 3,
        promise: (fight) => {
            fight.turns[ctx.turns.length - 1].logs.push(
                `🩸 **${target.name}** took **${damage}** bleed damage`
            );
            if (target.health > 0) {
                target.health -= damage;
                user.totalDamageDealt += damage;
                if (target.health <= 0) {
                    target.health = 0;
                    fight.turns[ctx.turns.length - 1].logs.push(
                        `🩸 **${target.name}** died from bleed damage`
                    );
                }
            }
        },
        id: "" + Date.now() + Math.random() + ""
    });
};

export const CrossfireHurricane: Ability = {
    name: "Crossfire Hurricane",
    description: "launches 1 cross in the shape of an ankh at the oppenent",
    cooldown: 5,
    damage: 10,
    stamina: 12,
    extraTurns: 0,
    useMessage: (user, target, damage, ctx) => {
        const burnDamageCalc = Math.round(
            Functions.getAbilityDamage(user, CrossfireHurricane) / 10
        );
        burnDamagePromise(ctx, target, burnDamageCalc, user);
    },
    thumbnail: "https://media.tenor.com/n79QWE9azhEAAAAC/magicians-red-avdol.gif",
    dodgeScore: 1,
    target: "enemy"
};

export const RedBind: Ability = {
    name: "Red Bind",
    description: "takes two swings at the opponent with fiery chains",
    cooldown: 7,
    damage: 17,
    stamina: 15,
    extraTurns: 0,
    useMessage: (user, target, damage, ctx) => {
        const burnDamageCalc = Math.round(Functions.getAbilityDamage(user, RedBind) / 10);
        burnDamagePromise(ctx, target, burnDamageCalc, user);
    },
    dodgeScore: 2,
    target: "enemy"
};

export const Bakugo: Ability = {
    name: "Bakugo",
    description: "grabs the opponent before engulfing the opponent's head in flames",
    cooldown: 12,
    damage: 25,
    stamina: 15,
    extraTurns: 1,
    useMessage: (user, target, damage, ctx) => {
        const burnDamageCalc = Math.round(Functions.getAbilityDamage(user, Bakugo) / 10);
        burnDamagePromise(ctx, target, burnDamageCalc, user);
    },
    special: true,
    dodgeScore: 3,
    target: "enemy"
};
/**
 * Hermit Purple DESU
 */

export const OhMyGod: Ability = {
    name: "Oh My God",
    description: "BOOSTS ALL YOUR STATS BY 100% FOR 3 TURNS LETS GOOOOO",
    cooldown: 4,
    damage: 0,
    stamina: 0,
    extraTurns: 1,
    useMessage: (user, target, damage, ctx) => {
        for (const stat in user.skillPoints) {
            user.skillPoints[stat as keyof typeof user.skillPoints] +=
                user.skillPoints[stat as keyof typeof user.skillPoints];
        }
        ctx.turns[ctx.turns.length - 1].logs.push(
            `${ctx.ctx.client.localEmojis.josephOMG} OH MY GOD **${user.name}**'s stats are boosted by 100% !1!1!1!!!!1!1`
        );

        ctx.nextRoundPromises.push({
            cooldown: 4,
            promise: (fight) => {
                fight.turns[ctx.turns.length - 1].logs.push(
                    `${ctx.ctx.client.localEmojis.josephOMG} OH MY GOD **${user.name}**'s stats are back...`
                );
                for (const stat in user.skillPoints) {
                    user.skillPoints[stat as keyof typeof user.skillPoints] -=
                        user.skillPoints[stat as keyof typeof user.skillPoints] / 2;
                }
            },
            id: "" + Date.now() + Math.random() + ""
        });
    },
    thumbnail: "https://media.tenor.com/RQtghGnCYxEAAAAd/jojo-oh-my-god.gif",
    dodgeScore: 0,
    target: "self"
};

export const VineSlap: Ability = {
    name: "Vine Slap",
    description: "extends {{standName}}'s vines to whip twice in the opponent's direction",
    cooldown: 4,
    damage: 15,
    stamina: 20,
    extraTurns: 1,
    dodgeScore: 2,
    target: "enemy"
};

export const VineBarrage: Ability = {
    ...StandBarrage,
    name: "Vine Barrage",
    description: "extends {{standName}}'s vines to whip the opponent",
    target: "enemy"
};

/**
 * THIS ABILITY IS ONLY FOR SEX PISTOLS OR ELSE IT WILL CRASH
 */
export const BulletsRafale: Ability = {
    name: "Bullets Rafale",
    description: "fires all your bullets at once",
    cooldown: 3,
    damage: 0,
    stamina: 35,
    extraTurns: 0,
    useMessage: (user, target, damage, ctx) => {
        const bulletId = `${ctx.id}_${user.id}`;
        ctx.ctx.client.fightCache.set(bulletId + "fireX", true);

        const bullets: number = (ctx.ctx.client.fightCache.get(bulletId) as number) || 0;
        if (bullets === 6) {
            ctx.turns[ctx.turns.length - 1].logs.push(
                `${ctx.ctx.client.localEmojis.sexPistols} **${user.name}** has no bullets left... You just wasted your ability & stamina omg you're so dumb`
            );
            return;
        }
        ctx.turns[ctx.turns.length - 1].logs.push(
            `>> ${ctx.ctx.client.localEmojis.sexPistols} **${
                user.name
            }** fires all their bullets at once! (${6 - bullets})`
        );
        for (let i = 0; i < 6 - bullets; i++) {
            user.stand.customAttack.handleAttack(
                ctx,
                user,
                target,
                Functions.getAttackDamages(user)
            );
        }
        ctx.ctx.client.fightCache.delete(bulletId + "fireX");
    },
    dodgeScore: 0,
    target: "enemy"
};

export const DeterminationFlurry: Ability = {
    name: "Determination Flurry",
    description: "A Barrage with multiple slashes (+ bleed damage)",
    cooldown: 5,
    damage: 25,
    stamina: 40,
    extraTurns: 0,
    useMessage: (user, target, damage, ctx) => {
        const burnDamageCalc = Math.round(
            Functions.getAbilityDamage(user, CrossfireHurricane) / 10
        );
        bleedDamagePromise(ctx, target, burnDamageCalc, user);
    },
    dodgeScore: 2,
    target: "enemy"
};

export const FencingBarrage: Ability = {
    ...StandBarrage,
    name: "Fencing Barrage",
    description: "A Barrage with multiple slashes",
    target: "enemy"
};

export const Finisher: Ability = {
    name: "Finisher",
    description:
        "attacks or finish the opponent by aiming at one of his vital parts [CRITICAL, BLEED DAMAGES]",
    cooldown: 8,
    damage: 50,
    stamina: 40,
    extraTurns: 1,
    useMessage: (user, target, damage, ctx) => {
        const burnDamageCalc = Math.round(Functions.getAbilityDamage(user, Finisher) / 10);
        bleedDamagePromise(ctx, target, burnDamageCalc, user);
    },
    dodgeScore: 2,
    target: "enemy"
};

export const LifeTransference: Ability = {
    name: "Life Transference",
    description:
        "Transfers life force between individuals, healing allies by 30% of their max health or heavily damaging enemies ",
    cooldown: 6,
    damage: 0,

    stamina: 60,
    ally: true,
    extraTurns: 0,
    useMessage: (user, target, damage, ctx) => {
        if (
            ctx.getTeamIdx(user.manipulatedBy ? user.manipulatedBy : user) ===
            ctx.getTeamIdx(target.manipulatedBy ? target.manipulatedBy : target)
        ) {
            // Heal the target by transferring life force
            const healAmount = Math.round(target.maxHealth * 0.3); // Adjust the heal amount as desired
            const oldHealth = target.health;
            target.incrHealth(healAmount);
            ctx.turns[ctx.turns.length - 1].logs.push(
                `${user.stand.emoji} LIFE TRANSFERENCE: ${target.name} has been healed for **${(
                    target.health - oldHealth
                ).toLocaleString("en-US")}** health.`
            );
        } else {
            // Drain the life force of the enemy
            const drainAmount = Functions.getAttackDamages(user) * 3;
            const oldHealth = target.health;
            target.incrHealth(-drainAmount);
            user.totalDamageDealt += drainAmount;
            ctx.turns[ctx.turns.length - 1].logs.push(
                `${user.stand.emoji} LIFE TRANSFERENCE: ${target.name} has lost **${(
                    oldHealth - target.health
                ).toLocaleString("en-US")}** health due to life force drain.`
            );
        }
    },
    dodgeScore: 0,
    target: "any"
};

export const RequiemArrowBlast: Ability = {
    name: "Requiem Arrow Blast",
    description: "Unleashes **__an extremely powerful__** blast of energy using its requiem arrow.",
    cooldown: 12,
    damage: 65,
    stamina: 60,
    extraTurns: 0,
    dodgeScore: 2,
    target: "enemy"
};

export const EternalSleep: Ability = {
    name: "Eternal Sleep",
    description:
        "Induces a deep sleep on anyone within its range, even allies, except if they are strong enough to resist it [real dodge score: 3].",
    cooldown: 5,
    damage: 0,
    stamina: 50,
    extraTurns: 0,
    useMessage: (user, target, damage, ctx) => {
        ctx.fighters
            .filter((x) => x.id !== user.id)
            .forEach((x) => {
                const dodgeResults: boolean[] = [];

                for (let i = 0; i < 3; i++) {
                    const userDodgeScore = Functions.getDodgeScore(user) + 5 + user.level / 10;
                    const fighterSpeedScore = Functions.getSpeedScore(x) + 10 + x.level / 10;

                    const randomNumber = Functions.randomNumber(0, 100);
                    const dodgeThreshold =
                        userDodgeScore / (fighterSpeedScore * 2 + userDodgeScore);

                    if (randomNumber < dodgeThreshold * 100) dodgeResults.push(true);
                }
                if (dodgeResults.every((r) => r) && dodgeResults.length !== 0) {
                    x.frozenFor += 3;
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `- ${user.stand.emoji} ETERNAL SLEEP: **${user.name}** has put **${x.name}** to sleep for 3 turns...`
                    );
                } else {
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `- ${user.stand.emoji} ETERNAL SLEEP: **${x.name}** resisted.`
                    );
                }
            });
    },
    dodgeScore: 0,
    target: "self"
};

export const StandDisc: Ability = {
    name: "Stand Disc",
    description: "Removes temporarily the stand of the target",
    cooldown: 9,
    damage: 0,
    stamina: 50,
    special: true,
    extraTurns: 0,
    dodgeScore: 7,
    useMessage: (user, target, damage, ctx) => {
        const stand = target.stand;
        target.stand = null;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand.emoji} STAND DISC: **${user.name}** has removed temporarily the stand of **${target.name}**... (${stand.name} ${stand.emoji})`
        );
        ctx.nextRoundPromises.push({
            cooldown: 3,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                target.stand = stand;
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand.emoji} STAND DISC: **${target.name}** has recovered their stand... (${stand.name} ${stand.emoji})`
                );
            }
        });
    },
    target: "enemy"
};

export const Hallucinogen: Ability = {
    name: "Hallucinogen",
    description:
        "Creates a hallucinogen that decreases EVERYONE's (except your allies) perception & speed BY 90%",
    cooldown: 7,
    damage: 0,
    stamina: 50,
    special: true,
    extraTurns: 0,
    dodgeScore: 0,
    useMessage: (user, target, damage, ctx) => {
        ctx.fighters
            .filter((x) => x.id !== user.id && ctx.getTeamIdx(user) !== ctx.getTeamIdx(x))
            .forEach((x) => {
                x.skillPoints.perception = Math.round(x.skillPoints.perception * 0.1);
                x.skillPoints.speed = Math.round(x.skillPoints.speed * 0.1);
            });
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand.emoji} HALLUCINOGEN: **${user.name}** has created a hallucinogen that decreases EVERYONE's (except your allies) perception & speed BY 90%...`
        );
        ctx.nextRoundPromises.push({
            cooldown: 3,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                ctx.fighters
                    .filter((x) => x.id !== user.id && ctx.getTeamIdx(user) !== ctx.getTeamIdx(x))
                    .forEach((x) => {
                        x.skillPoints.perception = Math.round(x.skillPoints.perception / 0.1);
                        x.skillPoints.speed = Math.round(x.skillPoints.speed / 0.1);
                    });
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand.emoji} HALLUCINOGEN: **${user.name}**'s hallucinogen EFFECT has disappeared...`
                );
            }
        });
    },
    target: "self"
};

export const Heal: Ability = {
    name: "Heal",
    description: "Heals the target by 15% of the healer's max health",
    cooldown: 4,
    damage: 0,
    stamina: 25,
    extraTurns: 0,
    dodgeScore: 0,
    useMessage: (user, target, damage, ctx) => {
        const heal = Math.round(user.maxHealth * 0.15);
        target.health += heal;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand.emoji} HEAL: **${user.name}** has healed **${
                target.name
            }** by **${heal}** health... ${
                ctx.getTeamIdx(user) === ctx.getTeamIdx(target)
                    ? ""
                    : "(wtf dude you just healed an enemy lol)"
            }`
        );
    },
    target: "ally"
};

export const LifeShot: Ability = {
    name: "Life Shot",
    description: "Causes your opponent's soul to leave their body for some turns",
    cooldown: 11,
    damage: 0,
    stamina: 50,
    extraTurns: 0,
    dodgeScore: 0,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        target.frozenFor += 3;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand.emoji} LIFE SHOT: **${user.name}** has caused **${target.name}**'s soul to leave their body for 3 turns...`
        );
    },
    target: "enemy"
};

export const LifeGiver: Ability = {
    name: "Life Giver",
    description:
        "Gold Experience can imbue inanimate objects with life, creating living organisms. These organisms can be used for various purposes, such as attacking enemies or providing support to allies",
    cooldown: 5,
    damage: 0,
    stamina: 50,
    extraTurns: 0,
    dodgeScore: 0,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        const teamIndex = ctx.getTeamIdx(user);
        const team = ctx.teams[teamIndex];

        const NPC: FightableNPC = {
            id: Functions.randomArray(["speedwagon_foundation", "kakyoin", "jotaro", "dio"]),
            name: `${user.name}'s Life Giver [${target.name} CLONE]`,
            skillPoints: {
                strength: Math.round(target.skillPoints.strength) / 10,
                perception: Math.round(target.skillPoints.perception) / 10,
                speed: Math.round(target.skillPoints.speed) / 10,
                defense: Math.round(target.skillPoints.defense) / 10,
                stamina: Math.round(target.skillPoints.stamina) / 10
            },
            level: target.level / 10,
            stand: target.stand?.id,
            equippedItems: target.equippedItems,
            standsEvolved: target.standsEvolved,
            emoji: target.stand?.emoji ?? "🤷‍♂️"
        };
        console.log(team);
        team.push(new Fighter(NPC));
        ctx.fighters.push(new Fighter(NPC));
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand.emoji} LIFE GIVER: **${user.name}** has created a clone of **${target.name}**...`
        );

        ctx.nextRoundPromises.push({
            cooldown: 3,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                const idx = team.findIndex((x) => x.id === NPC.id);
                if (idx !== -1) {
                    team.splice(idx, 1);
                    fight.turns[fight.turns.length - 1].logs.push(
                        `- ${user.stand.emoji} LIFE GIVER: **${user.name}**'s clone of **${target.name}** has disappeared...`
                    );
                }
                ctx.fighters = ctx.fighters.filter((x) => x.id !== NPC.id);
            }
        });
    },
    target: "self"
};

// sand clone ability, similar to life giver
export const SandClone: Ability = {
    name: "Sand Clone",
    description:
        "The Fool can create clones of itself out of sand, which can be used to attack or defend",
    cooldown: 2,
    damage: 0,

    stamina: 50,
    extraTurns: 0,
    dodgeScore: 0,
    useMessage: (user, target, damage, ctx) => {
        const teamIndex = ctx.getTeamIdx(user);
        const team = ctx.teams[teamIndex];

        const NPC: FightableNPC = {
            id: Functions.randomArray(["speedwagon_foundation", "kakyoin", "jotaro", "dio"]),
            name: `${user.name}'s Sand Clone`,
            skillPoints: {
                strength: Math.round(user.skillPoints.strength) / 10,
                perception: Math.round(user.skillPoints.perception) / 10,
                speed: Math.round(user.skillPoints.speed) / 10,
                defense: Math.round(user.skillPoints.defense) / 10,
                stamina: Math.round(user.skillPoints.stamina) / 10
            },
            level: user.level / 10,
            stand: user.stand?.id,
            equippedItems: user.equippedItems,
            standsEvolved: user.standsEvolved,
            emoji: user.stand?.emoji ?? "🤷‍♂️"
        };
        team.push(new Fighter(NPC));
        ctx.fighters.push(new Fighter(NPC));
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand.emoji} SAND CLONE: **${user.name}** has created a clone of **${user.name}**...`
        );

        ctx.nextRoundPromises.push({
            cooldown: 3,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                const idx = team.findIndex((x) => x.id === NPC.id);
                if (idx !== -1) {
                    team.splice(idx, 1);
                    fight.turns[fight.turns.length - 1].logs.push(
                        `- ${user.stand.emoji} SAND CLONE: **${user.name}**'s clone of **${user.name}** has disappeared...`
                    );
                }
                ctx.fighters = ctx.fighters.filter((x) => x.id !== NPC.id);
            }
        });
    },
    target: "self"
};

export const SandProjectiles: Ability = {
    name: "Sand Projectiles",
    description: "shoot or propel sand at high speeds towards its targets",
    cooldown: 5,
    damage: 14,
    stamina: 20,
    extraTurns: 1,
    dodgeScore: 2,
    target: "enemy"
};

export const SandMimicry: Ability = {
    name: "Sand Mimicry",
    description:
        "The Fool can disperse its body to avoid physical attacks or slip through narrow spaces, attacking remotely (x100 perception huge boost for **3 turns**)",
    cooldown: 6,
    damage: 0,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    useMessage: (user, target, damage, ctx) => {
        const oldSkillPoints = user.skillPoints;
        user.skillPoints.perception *= 100;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand.emoji} SAND MIMICRY: **${user.name}**'s perception has been boosted by x100...`
        );

        ctx.nextRoundPromises.push({
            cooldown: 3,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                if (!fight.fighters.find((x) => x.id === user.id)) return;
                user.skillPoints = oldSkillPoints;
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand.emoji} SAND MIMICRY: **${user.name}**'s perception has been reset...`
                );
            }
        });
    },
    target: "self"
};

export const SandStorm: Ability = {
    name: "Sand Storm",
    description:
        "has the ability to create sandstorms, hindering visibility and disorienting opponents",
    cooldown: 9,
    damage: 0,
    stamina: 30,
    extraTurns: 0,
    dodgeScore: 0,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        const oldSkillPoints: { [key: string]: SkillPoints } = {};
        for (const fighter of ctx.fighters.filter(
            (w) => ctx.getTeamIdx(w) !== ctx.getTeamIdx(user) && w.health > 0
        )) {
            oldSkillPoints[fighter.id] = fighter.skillPoints;
            fighter.skillPoints.perception = Math.round(fighter.skillPoints.perception * 0.1);
            fighter.skillPoints.speed = Math.round(fighter.skillPoints.speed * 0.1);
            ctx.turns[ctx.turns.length - 1].logs.push(
                `- ${user.stand.emoji} SAND STORM: **${user.name}** has decreased **${fighter.name}**'s perception & speed by 90%...`
            );
        }

        ctx.nextRoundPromises.push({
            cooldown: 3,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                for (const fighter of ctx.fighters.filter(
                    (w) => ctx.getTeamIdx(w) !== ctx.getTeamIdx(user) && w.health > 0
                )) {
                    if (!fight.fighters.find((x) => x.id === fighter.id)) return;
                    fighter.skillPoints = oldSkillPoints[fighter.id];
                    fight.turns[fight.turns.length - 1].logs.push(
                        `- ${user.stand.emoji} SAND STORM: **${user.name}**'s sand storm EFFECT has disappeared...`
                    );
                }
            }
        });
    },
    target: "enemy"
};

export const SandSelfHealing: Ability = {
    name: "Sand Self Healing",
    description:
        "can heal itself (+15% max health) by reforming its sand particles around injuries and aiding in the recovery process",
    cooldown: 8,
    damage: 0,
    stamina: 15,
    extraTurns: 0,
    dodgeScore: 0,
    useMessage: (user, target, damage, ctx) => {
        const heal = Math.round(user.maxHealth * 0.15);
        user.health += heal;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand.emoji} SAND SELF HEALING: **${user.name}** has healed himself by **${heal}** health...`
        );
    },
    target: "self"
};

export const SwiftStrike: Ability = {
    name: "Swift Strike",
    description: "Unleash a lightning-fast strike with your katana, dealing massive damage.",
    cooldown: 5,
    damage: 15,
    stamina: 30,
    extraTurns: 1,
    dodgeScore: 3,
    target: "enemy"
};

export const BerserkersFury: Ability = {
    name: "Berserker's Fury",
    description:
        "Enter a state of berserk fury, greatly increasing your attack power for a limited time.",
    cooldown: 6,
    damage: 0,

    stamina: 20,
    extraTurns: 4,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        const strengthIncrease = Math.round(user.skillPoints.strength * 0.25); // 25% strength increase
        const defenseDecrease = Math.round(user.skillPoints.defense * 0.1); // 10% defense decrease
        const maxHealth = Math.round(user.maxHealth * 0.1); // 10% decrease in max health
        const health = Math.round(user.health * 0.1); // 10% decrease in current health

        user.skillPoints.strength += strengthIncrease;
        user.skillPoints.defense -= defenseDecrease;
        user.health -= health; // 10% decrease in current health
        user.maxHealth -= maxHealth; // 10% decrease in max health
        user.maxHealth -= Math.round(user.maxHealth * 0.1); // 10% decrease in max health
        ctx.turns[ctx.turns.length - 1].logs.push(
            `<:emoji_177:1136204824803819651> **${user.name}** enters a state of berserker's fury! Their strength is increased by **${strengthIncrease}**, but their defense and max health suffer.`
        );

        ctx.nextRoundPromises.push({
            cooldown: 3,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                user.skillPoints.strength -= strengthIncrease;
                user.skillPoints.defense += defenseDecrease;
                user.maxHealth += maxHealth;
                user.health += health;
                fight.turns[fight.turns.length - 1].logs.push(
                    `<:emoji_177:1136204824803819651> **${user.name}**'s berserker's fury has worn off.`
                );
            }
        });
    },
    dodgeScore: 0,
    target: "self"
};

export const BerserkersRampage: Ability = {
    name: "Berserker's Rampage",
    description:
        "Enter a state of berserk ramapage, attacking every enemies with a flurry of strikes. [true dodge score: 4]",
    cooldown: 7,
    damage: 0,

    stamina: 20,
    extraTurns: 4,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        ctx.fighters
            .filter((w) => ctx.getTeamIdx(w) !== ctx.getTeamIdx(user) && w.health > 0)
            .forEach((x) => {
                const dodgeResults: boolean[] = [];

                for (let i = 0; i < 4; i++) {
                    const userDodgeScore = Functions.getDodgeScore(user) + 5 + user.level / 10;
                    const fighterSpeedScore = Functions.getSpeedScore(x) + 10 + x.level / 10;

                    const randomNumber = Functions.randomNumber(0, 100);
                    const dodgeThreshold =
                        userDodgeScore / (fighterSpeedScore * 2 + userDodgeScore);

                    if (randomNumber < dodgeThreshold * 100) dodgeResults.push(true);
                }
                if (dodgeResults.every((r) => r) && dodgeResults.length !== 0) {
                    const damages = Math.round(Functions.getAttackDamages(user) * 1.75);
                    x.health -= damages;
                    user.totalDamageDealt += damage;
                    if (x.health <= 0) x.health = 0;
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `- ${user.weapon.emoji} RAMPAGE: **${user.name}** has dealt **${damages.toLocaleString("en-US")}** damages to **${x.name}**.`
                    );
                } else {
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `- ${user.stand.emoji} RAMPAGE: **${x.name}** dodged.`
                    );
                }
            });
    },
    dodgeScore: 0,
    target: "self"
};

export const KnivesThrow: Ability = {
    name: "Knives Throw",
    description:
        "Throw a flurry of knives at your opponent, dealing damage and reducing their stamina by 3% of their max stamina",
    cooldown: 5,
    damage: 0,
    dodgeScore: 0,
    stamina: 30,
    extraTurns: 0,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        for (let i = 0; i < 4; i++) {
            const dodgeScore = Functions.getDodgeScore(target) + 5 + target.level / 10;
            const userSpeedScore = Functions.getSpeedScore(user) + 10 + user.level / 10;

            const randomNumber = Functions.randomNumber(0, 100);
            const dodgeThreshold = dodgeScore / (userSpeedScore * 2 + dodgeScore);

            if (randomNumber < dodgeThreshold * 100) {
                ctx.turns[ctx.turns.length - 1].logs.push(
                    `- ${user.weapon.emoji} KNIVES THROW: **${target.name}** dodged.`
                );
            } else {
                const damages = Math.round(Functions.getAttackDamages(user) * 0.75);
                target.health -= damages;
                user.totalDamageDealt += damages;
                if (target.health <= 0) target.health = 0;
                const stamina = Math.round(target.maxStamina * 0.03);
                target.stamina -= stamina;
                if (target.stamina <= 0) target.stamina = 0;
                ctx.turns[ctx.turns.length - 1].logs.push(
                    `- ${user.weapon.emoji} KNIVES THROW: **${user.name}** has dealt **${damages.toLocaleString("en-US")}** damages to **${target.name}** and reduced their stamina by **${stamina}**.`
                );
            }
        }
    }
};

export const GasolineBullets: Ability = {
    name: "Gasoline Bullets",
    description: "Shoots bullets made of gasoline to every enemies [true dodge score: 2]",
    cooldown: 5,
    damage: 0,
    dodgeScore: 0,
    stamina: 30,
    extraTurns: 0,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        ctx.fighters
            .filter((w) => ctx.getTeamIdx(w) !== ctx.getTeamIdx(user) && w.health > 0)
            .forEach((x) => {
                const dodgeResults: boolean[] = [];

                for (let i = 0; i < 2; i++) {
                    const userDodgeScore = Functions.getDodgeScore(user) + 5 + user.level / 10;
                    const fighterSpeedScore = Functions.getSpeedScore(x) + 10 + x.level / 10;

                    const randomNumber = Functions.randomNumber(0, 100);
                    const dodgeThreshold =
                        userDodgeScore / (fighterSpeedScore * 2 + userDodgeScore);

                    if (randomNumber < dodgeThreshold * 100) dodgeResults.push(true);
                }
                if (dodgeResults.every((r) => r) && dodgeResults.length !== 0) {
                    const damages = Math.round(Functions.getAttackDamages(user) * 3);
                    x.health -= damages;
                    user.totalDamageDealt += damages;
                    if (x.health <= 0) x.health = 0;
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `- ${user.stand.emoji} GASOLINE BULLETS: **${user.name}** has dealt **${damages.toLocaleString("en-US")}** damages to **${x.name}**.`
                    );
                } else {
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `- ${user.stand.emoji} GASOLINE BULLETS: **${x.name}** dodged...`
                    );
                }
            });
    }
};

export const CarCrash: Ability = {
    name: "Car Crash",
    description: "Crashes a car into the opponent, dealing massive damage.]",
    cooldown: 5,
    damage: StandBarrage.damage,
    dodgeScore: 0,
    stamina: 30,
    extraTurns: 0,
    target: "enemy"
};

export const Transformation: Ability = {
    name: "Transformation",
    description: "Boosts all your skill points by 100% for 2 turns",
    cooldown: 5,
    damage: 0,

    stamina: 30,
    extraTurns: 0,
    dodgeScore: 0,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        const oldSkillPoints = cloneDeep(user.skillPoints);
        user.skillPoints.strength *= 2;
        user.skillPoints.perception *= 2;
        user.skillPoints.speed *= 2;
        user.skillPoints.defense *= 2;
        user.skillPoints.stamina *= 2;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand.emoji} TRANSFORMATION: **${user.name}**'s skill points have been boosted by 100%...`
        );

        ctx.nextRoundPromises.push({
            cooldown: 3,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                user.skillPoints = oldSkillPoints;
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand.emoji} TRANSFORMATION: **${user.name}**'s transformation EFFECT has disappeared...`
                );
            }
        });
    },
    target: "self"
};

export const Rage: Ability = {
    name: "Rage",
    description:
        "When enabled, the more damage you take, the more damage you deal for 3 turns (+5 strength everytime you loose 1% of your max health). [USABLE PASSIVE, USES NO STAMINA]",
    cooldown: 5,
    damage: 0,

    stamina: 0,
    extraTurns: 0,
    dodgeScore: 0,
    special: true,
    target: "self",
    useMessage: (user, target, damage, ctx) => {
        let currentHealth = user.health;
        const oldStrength = user.skillPoints.strength;

        const endId = Functions.generateRandomId();
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand.emoji} RAGE: **${user.name}** has entered a state of rage...`
        );

        function promiseToCheckHealthAndAddStrength() {
            ctx.nextTurnPromises.push({
                cooldown: 1,
                id: Functions.generateRandomId(),
                promise: (fight) => {
                    if (user.health < currentHealth) {
                        // add +5 strength every time user loses 1% of Functions.maxHealth(user);
                        const healthLost = currentHealth - user.health;
                        const strengthToAdd = Math.round(healthLost * 0.05);
                        user.skillPoints.strength += strengthToAdd;
                        currentHealth = user.health;
                        fight.turns[fight.turns.length - 1].logs.push(
                            `- ${user.stand.emoji} RAGE: **${user.name}** has gained **${strengthToAdd}** strength due to rage...`
                        );
                    }
                    if (!ctx.nextTurnPromises.find((x) => x.id === endId)) {
                        promiseToCheckHealthAndAddStrength();
                    }
                }
            });
        }

        promiseToCheckHealthAndAddStrength();

        ctx.nextRoundPromises.push({
            cooldown: 4,
            id: endId,
            promise: (fight) => {
                user.skillPoints.strength = oldStrength;
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand.emoji} RAGE: **${user.name}**'s rage EFFECT has disappeared...`
                );
            }
        });
    }
};

export const ScytheSlash: Ability = {
    name: "Scythe Slash",
    description: "Slash your opponent with your scythe, dealing damage.",
    cooldown: 3,
    damage: 20,
    stamina: 5,
    dodgeScore: 0,
    extraTurns: 0,
    target: "enemy"
};

export const MysteriousGas: Ability = {
    name: "Mysterious Gas",
    description:
        "Release a mysterious gas that will confuse every enemies for 3 turns [true dodge score: 3]", // every fighters except allies frozenFor += 3
    cooldown: 7,
    damage: 0,

    stamina: 30,
    extraTurns: 0,
    dodgeScore: 0,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        ctx.fighters
            .filter((w) => ctx.getTeamIdx(w) !== ctx.getTeamIdx(user) && w.health > 0)
            .forEach((x) => {
                const dodgeResults: boolean[] = [];

                for (let i = 0; i < 3; i++) {
                    const userDodgeScore = Functions.getDodgeScore(user) + 5 + user.level / 10;
                    const fighterSpeedScore = Functions.getSpeedScore(x) + 10 + x.level / 10;

                    const randomNumber = Functions.randomNumber(0, 100);
                    const dodgeThreshold =
                        userDodgeScore / (fighterSpeedScore * 2 + userDodgeScore);

                    if (randomNumber < dodgeThreshold * 100) dodgeResults.push(true);
                }
                if (dodgeResults.every((r) => r) && dodgeResults.length !== 0) {
                    x.frozenFor += 3;
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `- ${user.stand.emoji} MYSTERIOUS GAS: **${user.name}** has confused **${x.name}** for 3 turns...`
                    );
                } else {
                    ctx.turns[ctx.turns.length - 1].logs.push(
                        `- ${user.stand.emoji} MYSTERIOUS GAS: **${x.name}** resisted.`
                    );
                }
            });
    },
    target: "self"
};

export const PoisonGas: Ability = {
    name: "Poison Gas",
    description:
        "Release a poisonous gas that will poison every enemies for 3 turns This will also damage your teammates including you but 90% less", // deals your atk damage every turn to every opponents for some turns. 10% of your atk damage is also dealt to you every turn.
    cooldown: 8,
    damage: 0,

    stamina: 30,
    extraTurns: 0,
    dodgeScore: 0,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        const poisonDamage = Math.round(Functions.getAttackDamages(user));
        ctx.turns[ctx.turns.length - 1].logs.push(
            `> ${user.stand.emoji} POISON GAS: **${user.name}** has released a poisonous gas...`
        );

        ctx.nextTurnPromises.push({
            cooldown: 4,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                fight.fighters.forEach(fighter => {
                    const damages = fight.getTeamIdx(fighter) !== fight.getTeamIdx(user) ? poisonDamage : Math.round(poisonDamage * 0.1);
                    fighter.health -= damages;
                    if (fighter.health <= 0) fighter.health = 0;
                    fight.turns[fight.turns.length - 1].logs.push(
                        `- ${user.stand.emoji} POISON GAS: **${user.name}** has dealt **${damages.toLocaleString("en-US")}** damages to **${fighter.name}**.`
                    );
                });
            }
        });


    },
    target: "self"
};

export const HealBarrage: Ability = {
    name: "Heal Barrage",
    description: "Basic Stand Barrage but heals your allies by 200% of the damages done",
    cooldown: 4,
    damage: 0,
    stamina: 25,
    extraTurns: 0,
    dodgeScore: StandBarrage.dodgeScore,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        const damages = Math.round(Functions.getAbilityDamage(user, StandBarrage));
        const heal = Math.round(damages * 2);

        target.health -= damages;
        user.totalDamageDealt += damages;

        if (target.health <= 0) target.health = 0;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `> ${user.stand.emoji} HEAL BARRAGE: **${user.name}** has dealt **${damages.toLocaleString("en-US")}** damages to **${target.name}**.`
        );

        ctx.fighters
            .filter((x) => ctx.getTeamIdx(x) === ctx.getTeamIdx(user))
            .filter((w) => w.health > 0)
            .filter(z => z.id !== user.id)
            .forEach((x) => {
                x.health += heal;

                if (x.health > x.maxHealth) x.health = x.maxHealth;

                ctx.turns[ctx.turns.length - 1].logs.push(
                    `- ${user.stand.emoji} HEAL BARRAGE: **${user.name}** has healed **${x.name}** by **${heal}** :heart:.`
                );
            });

    }
};

export const Restoration: Ability = {
    name: "Restoration",
    description: `Heals 10% of the healer's max health to every allies, except yourself. [Do not use this ability if you don't have any allies]`,
    cooldown: 6,
    damage: 0,
    stamina: 35,
    extraTurns: 0,
    dodgeScore: 0,
    target: "self",
    useMessage: (user, target, damage, ctx) => {
        const heal = Math.round(user.maxHealth * 0.1);

        ctx.fighters
            .filter((x) => ctx.getTeamIdx(x) === ctx.getTeamIdx(user)).filter(w => w.id !== user.id)
            .forEach((x) => {
                x.health += heal;

                if (x.health > x.maxHealth) x.health = x.maxHealth;

                ctx.turns[ctx.turns.length - 1].logs.push(
                    `- ${user.stand.emoji} RESTORATION: **${user.name}** has healed **${x.name}** by **${heal}** :heart:.`
                );
            });
    }
};

export const YoAngelo: Ability = {
    name: "Yo Angelo",
    description: "Transforms the target into a rock for 3 turns",
    cooldown: 8,
    damage: 0,
    stamina: 50,
    extraTurns: 0,
    dodgeScore: 2,
    target: "enemy",
    special: true,
    useMessage: (user, target, damage, ctx) => {
        target.frozenFor += 3;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand.emoji} YO ANGELO: **${user.name}** has transformed **${target.name}** into a rock for 3 turns... LOL GET CLAPPED BOZO`
        );
    }
};

export const HealPunch: Ability = {
    name: "Heal Punch",
    description: "Punches the target, healing your teammates by 150% of the damage dealt",
    cooldown: 4,
    damage: 0,
    stamina: 25,
    extraTurns: 0,
    dodgeScore: 0,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        const damages = Math.round(Functions.getAbilityDamage(user, StandBarrage) * 0.75);

        target.health -= damages;
        user.totalDamageDealt += damages;

        if (target.health <= 0) target.health = 0;

        ctx.turns[ctx.turns.length - 1].logs.push(
            `> ${user.stand.emoji} HEAL PUNCH: **${user.name}** has dealt **${damages.toLocaleString("en-US")}** damages to **${target.name}**.`
        );

        ctx.fighters
            .filter((x) => ctx.getTeamIdx(x) === ctx.getTeamIdx(user)).filter(w => w.id !== user.id)
            .forEach((x) => {
                const heal = Math.round(damages * 1.5);
                x.health += heal;

                if (x.health > x.maxHealth) x.health = x.maxHealth;

                ctx.turns[ctx.turns.length - 1].logs.push(
                    `- ${user.stand.emoji} HEAL PUNCH: **${user.name}** has healed **${x.name}** by **${heal}** :heart:.`
                );
            });
    }
};

export const CoinBarrage: Ability = {
    ...StandBarrage,
    name: "Coin Barrage",
    description: "Unleash a barrage of coins, that explode on impact\n"
};

const poisonDamagePromise = (ctx: FightHandler, target: Fighter, damage: number, user: Fighter, cooldown: number) => {
    ctx.nextTurnPromises.push({
        cooldown,
        promise: (fight) => {
            fight.turns[ctx.turns.length - 1].logs.push(
                `☠️🧪☣️ **${target.name}** took **${damage}** poison damage`
            );
            if (target.health > 0) {
                target.health -= damage;
                user.totalDamageDealt += damage;
                if (target.health <= 0) {
                    target.health = 0;
                    fight.turns[ctx.turns.length - 1].logs.push(
                        `☠️🧪☣️ **${target.name}** died from poison damage`
                    );
                }
            }
        },
        id: "" + Date.now() + Math.random() + ""
    });
};

export const CapsuleShot: Ability = {
    name: "Capsule Shot",
    description: "shoot the capsules from your fist at your enemy, poisoning them for 5 turns.",
    cooldown: 7,
    damage: 0,
    stamina: 30,
    extraTurns: 0,
    dodgeScore: 0,
    target: "enemy",
    useMessage: (user, target, damage, ctx) => {
        const damageX = Functions.getAttackDamages(user);
        target.health -= damageX;
        user.totalDamageDealt += damageX;
        if (target.health <= 0) target.health = 0;

        ctx.turns[ctx.turns.length - 1].logs.push(
            `> ${user.stand.emoji} CAPSULE SHOT: **${user.name}** has dealt **${damageX.toLocaleString("en-US")}** damages to **${target.name}**.`
        );

        const burnDamageCalc = Math.round(
            Functions.getAbilityDamage(user, CrossfireHurricane) / 10
        );
        poisonDamagePromise(ctx, target, burnDamageCalc, user, 5);

    }

};

export const LightManifestation: Ability = {
    name: "Light Manifestation",
    description: "Become light and slash your opponent for heavy, giving you 2 extra turns. Not dodgeable",
    cooldown: 3,
    damage: 35,
    stamina: 15,
    extraTurns: 2,
    dodgeScore: 0,
    target: "enemy",
    thumbnail: "https://static.wikia.nocookie.net/jjba/images/8/8d/Hanged_man_powa.gif"
};

export const WristKnives: Ability = {
    name: "Wrist Knives",
    description: "Shoots knives from your wrists at all your enemies (x2 knives). [true dodge score: 3, hardly dodgeable]",
    cooldown: 5,
    damage: 0,
    stamina: 15,
    extraTurns: 0,
    dodgeScore: 0,
    target: "self",
    useMessage: (user, target, damage, ctx) => {
        ctx.fighters
            .filter((w) => ctx.getTeamIdx(w) !== ctx.getTeamIdx(user) && w.health > 0)
            .forEach((x) => {
                for (let i = 0; i < 2; i++) {
                    const dodgeResults: boolean[] = [];

                    for (let i = 0; i < 3; i++) {
                        const userDodgeScore = Functions.getDodgeScore(user) + 5 + user.level / 10;
                        const fighterSpeedScore = Functions.getSpeedScore(x) + 10 + x.level / 10;

                        const randomNumber = Functions.randomNumber(0, 100);
                        const dodgeThreshold =
                            userDodgeScore / (fighterSpeedScore * 2 + userDodgeScore);

                        if (randomNumber < dodgeThreshold * 100) dodgeResults.push(true);
                    }
                    if (dodgeResults.every((r) => r) && dodgeResults.length !== 0) {
                        const damages = Math.round(Functions.getAttackDamages(user));
                        x.health -= damages;
                        user.totalDamageDealt += damages;
                        if (x.health <= 0) x.health = 0;
                        ctx.turns[ctx.turns.length - 1].logs.push(
                            `- ${user.stand.emoji} WRIST KNIVES: **${user.name}** has dealt **${damages.toLocaleString("en-US")}** damages to **${x.name}**.`
                        );
                    } else {
                        ctx.turns[ctx.turns.length - 1].logs.push(
                            `- ${user.stand.emoji} WRIST KNIVES: **${x.name}** dodged.`
                        );
                    }
                }
            });
    }
};

export const HomingBullets: Ability = {
    name: "Homing Bullets",
    description: "Shoots a bullet that will follow the enemy and hit him. This bullet can change its trajectory and is very hard to dodge.",
    cooldown: 3,
    damage: 35,
    stamina: 30,
    extraTurns: 0,
    dodgeScore: 5,
    target: "enemy"
};

export const RapidStrikes: Ability = {
    name: "Rapid Strikes - Wing Cutter",
    description: "Tower of Gray's wings move at incredible speeds, delivering a flurry of razor-sharp strikes to the enemy.",
    cooldown: 4,
    damage: 20,
    stamina: 25,
    extraTurns: 0,
    dodgeScore: 4,
    target: "enemy"
};

export const Razor_SharpScales: Ability = {
    ...RapidStrikes,
    name: "Razor-Sharp Scales",
    description: "Dark Blue Moon can also use its scales as projectiles, throwing them against the enemy."
};

export const ObjectManipulation: Ability = {
    ...KickBarrage,
    name: "Object Manipulation",
    description: "Strength is capable of manipulating objects to attack the enemy.",
    cooldown: 0,
    damage: 12
};

export const ViolentBurst: Ability = {
    description: "Spice Girl quickly makes an object go back to its original state making a burst happen sending the enemy back",
    name: "Violent Burst",
    cooldown: 6,
    damage: StandBarrage.damage + 4,
    dodgeScore: 1,
    stamina: 15,
    extraTurns: 0,
    target: "enemy"
};

/**
 * Bones elargement: makes your bone biggers so it doubles your hp & max hp for 3 turns
 */
export const BonesElargement: Ability = {
    name: "Bones Elargement",
    description: "Makes your bones bigger, doubling your max health for 3 turns",
    cooldown: 5,
    damage: 0,
    stamina: 20,
    extraTurns: 0,
    dodgeScore: 0,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        const oldMaxHealth = user.maxHealth;
        user.maxHealth *= 2;
        user.health *= 2;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand.emoji} BONES ELARGEMENT: **${user.name}**'s bones have been enlarged...`
        );

        ctx.nextRoundPromises.push({
            cooldown: 3,
            id: Functions.generateRandomId(),
            promise: (fight) => {
                user.maxHealth = oldMaxHealth;
                user.health = Math.min(user.health, user.maxHealth);
                fight.turns[fight.turns.length - 1].logs.push(
                    `- ${user.stand.emoji} BONES ELARGEMENT: **${user.name}**'s bones have returned to their normal size...`
                );
            }
        });
    },
    target: "self"
};

/**
 * Arm splitter: You enclose your opponents arm bones until they snap, causing bleed damage and does dmg based on strength.
 */
export const ArmSplitter: Ability = {
    name: "Arm Splitter",
    description: "You enclose your opponents arm bones until they snap, causing bleed damage and does dmg based on strength.",
    cooldown: 7,
    damage: 0,

    stamina: 30,
    extraTurns: 0,
    dodgeScore: 0,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        const burnDamageCalc = Math.round(Functions.getAbilityDamage(user, Finisher) / 10);
        bleedDamagePromise(ctx, target, burnDamageCalc, user);

        const armsplitterdmg = Math.round(Functions.getAttackDamages(user) * 1.89);
        target.health -= armsplitterdmg;
        if (target.health <= 0) target.health = 0;
        user.totalDamageDealt += armsplitterdmg;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand.emoji} ARM SPLITTER: **${user.name}** has dealt **${armsplitterdmg.toLocaleString("en-US")}** damages to **${target.name}**.`
        );
    },
    target: "enemy"
};

/**
 * Fist enlargement: You enlarge your fist, throwing a giant fist at the enemy! Does damage based on strength.
 */
export const FistEnlargement: Ability = {
    ...Finisher,
    name: "Fist Enlargement",
    description: "You enlarge your fist, throwing a giant fist at the enemy! Does damage based on strength."
};

/**
 * Heart breaker:You enclose your opponents ribs, causing it to press down on the opponents lungs and heart. Bleed damage and does damage based on strength.
 * ULTIMATE, DEALS A LOT OF DMG
 */
export const HeartBreaker: Ability = {
    name: "Heart Breaker",
    description: "You enclose your opponents ribs, causing it to press down on the opponents lungs and heart. Bleed damage and does damage based on strength, giving you an extra turn",
    cooldown: 10,
    damage: 0,

    stamina: 70,
    extraTurns: 1,
    dodgeScore: 0,
    special: true,
    useMessage: (user, target, damage, ctx) => {
        const burnDamageCalc = Math.round(Functions.getAbilityDamage(user, Finisher) / 10);
        bleedDamagePromise(ctx, target, burnDamageCalc, user);

        const heartbreakerdmg = Math.round(Functions.getAttackDamages(user) * 3.5);
        target.health -= heartbreakerdmg;
        if (target.health <= 0) target.health = 0;
        user.totalDamageDealt += heartbreakerdmg;
        ctx.turns[ctx.turns.length - 1].logs.push(
            `- ${user.stand.emoji} HEART BREAKER: **${user.name}** has dealt **${heartbreakerdmg.toLocaleString("en-US")}** damages to **${target.name}**.`
        );
    },
    target: "enemy"
};

/**
 * Bone Spear: basic ability, does damage based on strength.
 */
export const BoneSpear: Ability = {
    ...KickBarrage,
    name: "Bone Spear",
    description: "You throw a spear made of bone at the enemy."
};