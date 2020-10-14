import { Snowflake } from "discord.js";
import Card from "./Card.interface";
import User from "./User.interface";
export default interface Game {
    creator: Snowflake;
    active: boolean;
    users: User[];
    currentPlayer: Snowflake;
    topCard: Card;
};