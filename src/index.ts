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
            gameCards.set(message.channel.id, JSON.parse(JSON.stringify(Cards)));
        
            storage.set(message.channel.id, {
                active: false,
                creator: message.author.id,
                currentPlayer: null,
                users: [{
                    cards: createCards(message, 1),
                    id: message.author.id,
                }],
                topCard: Cards.attack[0],
            });

            // message.channel.send(JSON.stringify(storage.get(message.channel.id)));
            console.log(gameCards.get(message.channel.id));

        break;
    }

});


function createCards (message: Message, amount: number, draw?: boolean) {
    const cards = gameCards.get(message.channel.id);
    const keys = [ "attack", "cats", "favor", "nope", "see-the-future", "shuffle", "skip" ];

    const handCards: Card[] = [];

    keys.forEach(k => handCards.push(cards[k]));

    console.log(handCards.length);

    // for (let i = 0; i < amount; i++) {
        
    // }
    return [cards.attack[0]];
}

client.login(process.env.TOKEN);