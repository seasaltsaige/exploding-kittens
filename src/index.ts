import { Client, Collection, Message, Snowflake } from "discord.js";
import "dotenv/config";
import { Cards } from "./assets/Cards";
import Game from "./interface/Game.interface";
import Card from "./interface/Card.interface";

const client = new Client();
const storage = new Collection<Snowflake, Game>();
const gameCards = new Collection<Snowflake, typeof Cards>();
const maxPlayers = 5;


client.on("ready", () => console.log(`${client.user.username} logged in.`));

const prefix = ";"

client.on("message", async (message) => {
    if (!message.guild) return;
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(" ");
    const command = args.shift();

    switch (command) {
        case "create":
            if (storage.get(message.channel.id)) return message.channel.send("There is already a game in this channel.");
            gameCards.set(message.channel.id, JSON.parse(JSON.stringify(Cards)));
        
            storage.set(message.channel.id, {
                active: false,
                creator: message.author.id,
                currentPlayer: null,
                users: [{
                    cards: createCards(message, 7, false),
                    id: message.author.id,
                }],
                topCard: Cards.attack[0],
                bombs: null,
                defuses: null,
                player: 0,
            });

        return message.channel.send("Successfully created a new Exploding Kittens game!");
        case "join":
            const game = storage.get(message.channel.id);
            if (!game) return message.channel.send("You can't join a game when it doesn't even exist silly.");
            if (game.users.some(u => u.id === message.author.id)) return message.channel.send("You are already a part of this game, you can't join it again silly.");

            game.users.push({
                cards: createCards(message, 7, false),
                id: message.author.id,
            });

            if (game.users.length === maxPlayers) game.active = true;
        return message.channel.send("Successfully joined the current Exploding Kittens Game");
    }

});


function createCards (message: Message, amount: number, draw?: boolean) {
    const cards = gameCards.get(message.channel.id);
    const game = storage.get(message.channel.id);

    const newHand: Card[] = [];

    const arrOfFns: Function[] = [ attackCards, catsCards, favorCards, nopeCards, see_the_futureCards, shuffleCards, skipCards ];
    if (draw) [defuseCards, exploding_kittenCards].forEach(f => arrOfFns.push(f));
    // Im only going to comment one of these, because each one is the same, just for each function;

    function attackCards(): void {
        const notAttack = arrOfFns.filter(f => f.name !== "attackCards"); // Filter the above array of all of the functions to not include the current function
        const m = Math.floor(Math.random() * cards["attack"].length); // Generate a random number based off of the cards
        if (checkInPlayCards(message, cards["attack"][m])) return notAttack[Math.floor(Math.random() * notAttack.length)](); // Check if that category has been dried out, if it is, run a different function
        const card = cards["attack"][m]; // Define the required card
        if (card.inPlay >= card.amount) return attackCards(); // Check if that specific card is dried out, if it is, rerun this function;
        card.inPlay++; // If it isn't increment the inPlay counter;
        newHand.push(card); // Add the card to the players hand;
    }
    function catsCards(): void {
        const notCats = arrOfFns.filter(f => f.name !== "catsCards");
        const m = Math.floor(Math.random() * cards["cats"].length);
        if (checkInPlayCards(message, cards["cats"][m])) return notCats[Math.floor(Math.random() * notCats.length)]();
        const card = cards["cats"][m];
        if (card.inPlay >= card.amount) return catsCards();
        card.inPlay++;
        newHand.push(card);
    }
    function favorCards(): void {
        const notFavor = arrOfFns.filter(f => f.name !== "favorCards");
        const m = Math.floor(Math.random() * cards["cats"].length);
        if (checkInPlayCards(message, cards["favor"][m])) return notFavor[Math.floor(Math.random() * notFavor.length)]();
        const card = cards["favor"][m];
        if (card.inPlay >= card.amount) return favorCards();
        card.inPlay++;
        newHand.push(card);
    }
    function nopeCards(): void {
        const notNope = arrOfFns.filter(f => f.name !== "nopeCards");
        const m = Math.floor(Math.random() * cards["nope"].length);
        if (checkInPlayCards(message, cards["nope"][m])) return notNope[Math.floor(Math.random() * notNope.length)]();
        const card = cards["nope"][m];
        if (card.inPlay >= card.amount) return nopeCards();
        card.inPlay++;
        newHand.push(card);
    }
    function see_the_futureCards(): void {
        const notSee_the_futureCards = arrOfFns.filter(f => f.name !== "see_the_futureCards");
        const m = Math.floor(Math.random() * cards["see-the-future"].length);
        if (checkInPlayCards(message, cards["see-the-future"][m])) return notSee_the_futureCards[Math.floor(Math.random() * notSee_the_futureCards.length)]();
        const card = cards["see-the-future"][m];
        if (card.inPlay >= card.amount) return see_the_futureCards();
        card.inPlay++;
        newHand.push(card);
    }
    function shuffleCards(): void {
        const notShuffleCards = arrOfFns.filter(f => f.name !== "shuffleCards");
        const m = Math.floor(Math.random() * cards["shuffle"].length);
        if (checkInPlayCards(message, cards["shuffle"][m])) return notShuffleCards[Math.floor(Math.random() * notShuffleCards.length)]();
        const card = cards["shuffle"][m];
        if (card.inPlay >= card.amount) return shuffleCards();
        card.inPlay++;
        newHand.push(card);
    }
    function skipCards(): void {
        const notSkipCards = arrOfFns.filter(f => f.name !== "skipCards");
        const m = Math.floor(Math.random() * cards["skip"].length);
        if (checkInPlayCards(message, cards["skip"][m])) return notSkipCards[Math.floor(Math.random() * notSkipCards.length)]();
        const card = cards["skip"][m];
        if (card.inPlay >= card.amount) return skipCards();
        card.inPlay++;
        newHand.push(card);
    }
    function defuseCards(): void {
        const notDefuseCards = arrOfFns.filter(f => f.name !== "defuseCards");
        const m = Math.floor(Math.random() * cards["defuse"].length);
        if (checkInPlayCards(message, cards["defuse"][m])) return notDefuseCards[Math.floor(Math.random() * notDefuseCards.length)]();
        const card = cards["defuse"][m];
        if (card.inPlay >= card.amount) return defuseCards();
        card.inPlay++;
        newHand.push(card);
    }
    function exploding_kittenCards(): void {
        const m = Math.floor(Math.random() * cards["exploding-kitten"].length);
        const card = cards["exploding-kitten"][m];
        if (card.inPlay >= card.amount) return exploding_kittenCards();
        card.inPlay++;
        newHand.push(card);
    }

    let i = 0;
    do {
        let math = Math.floor(Math.random() * (7));
        const curplayers = game.users.length;

        const bombs = curplayers - 1;
        const chanceBombs = bombs / 56;
        const mathBombs = Math.random();
        const smol = Math.random();
        const defuses = 6 - curplayers;
        const chance = defuses / 56;

        if (mathBombs < chanceBombs && draw) math = 8;
        else if (smol < chance && draw) math = 7;

        switch (math) {
            case 0:
                //attack
                attackCards();
            break;
            case 1:
                //cats
                catsCards();
            break;
            case 2:
                //favor
                favorCards();
            break;
            case 3:
                //nope
                nopeCards();
            break;
            case 4:
                //see the future
                see_the_futureCards();
            break;
            case 5:
                //shuffle
                shuffleCards();
            break;
            case 6:
                //skip
                skipCards();
            break;
            case 7:
                //defuse
                defuseCards();
            break;
            case 8:
                //exploding kitten
                exploding_kittenCards();
            break;
        }

    } while (++i < amount);

    if (!draw) {
        defuseCards();
    }

    gameCards.set(message.channel.id, cards);

    return newHand;
}

function checkInPlayCards (message: Message, gameCard: Card) {
    for (const card of <Card[]>(gameCards.get(message.channel.id))[gameCard.type]) if (card.inPlay >= card.amount) return true; else return false
}

client.login(process.env.TOKEN);