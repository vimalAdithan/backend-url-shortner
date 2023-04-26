import * as dotenv from "dotenv";
dotenv.config()
// const express = require("express");
import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import shortid from "shortid";

const app = express();
// app.set('view engine','ejs')
app.use(cors());
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;

const client = new MongoClient(MONGO_URL); // dial
// Top level await
await client.connect(); // call
console.log("Mongo is connected !!!  ");

app.get("/", async function (request, response) {
  const result = await client.db("url").collection("url").find({}).toArray();
  response.send(result);
});
app.post("/add", express.json(), async function (request, response) {
  const received = {
    fullurl: request.body.fullurl,
    shorturl: shortid.generate(),
    clicks: 0,
  };
  const result = await client.db("url").collection("url").insertOne(received);
  response.send(result);
});
app.get("/:shortid", async function (req, res) {
  const { shortid } = await req.params;
  const result = await client
    .db("url")
    .collection("url")
    .updateOne({ shorturl: shortid }, { $inc: { clicks: 1 } });
  if (result) {
    const click = await client
      .db("url")
      .collection("url")
      .findOne({ shorturl: shortid });
    res.redirect(click.fullurl);
  } else {
    res.sendStatus(404);
  };
});

app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));
