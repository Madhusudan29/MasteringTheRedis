const express = require("express");
const redis = require("redis");
const fetch = require("node-fetch");
const app = express();
const Port = process.env.PORT || 5000;
const RedisPort = process.env.PORT || 6379;
const client = redis.createClient(RedisPort);

// Set Response
function setResponse(username, repos) {
  return `<h2>${username} has ${repos} GitHub repos!</h2>`;
}

// Make Response To GitHub for Data
async function getRepos(req, res) {
  try {
    console.log(`Fetching Data....`);
    const { username } = req.params;
    const response = await fetch(`https://api.github.com/users/${username}`);
    const data = await response.json(); //  console.log(data);
    const repos = data.public_repos;
    //  Set Data To Redis
    client.setex(username, 3600, repos);
    res.send(setResponse(username, repos));
    console.log(`Fetched the Data.`);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
}

// Cache Midleware
function cache(req, res, next) {
  const { username } = req.params;
  client.get(username, (err, data) => {
    if (err) throw err;
    if (data !== null) {
      res.send(setResponse(username, data));
    } else {
      next();
    }
  });
}

app.get("/repos/:username", cache, getRepos);

app.listen(Port, () => console.log(`Serving on http://localhost:${Port}`));
