console.log(`Good Morning`);
const express = require("express");
const app = express();
const hbs = require("hbs");
const exphbs = require("express-handlebars");
const path = require("path");
const methodOverride = require("method-override");
const redis = require("redis");
const client = redis.createClient();
// Set Port
const Port = 3621;
client.on("connect", function () {
  console.log("Connected to Redis...");
});
// View Engine
// app.engine("hbs", exphbs({ defaultLayout: "main" }));
app.set("view engine", "hbs");
hbs.registerPartials(path.join(__dirname, "/views/layouts"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MethodOverride
app.use(methodOverride("_method"));

// Home Route
app.get("/", (req, res) => {
  res.render("searchUsers");
});
// Add User Route
app.get("/addUser", (req, res) => {
  res.render("addUser");
});
// Search User Route
app.post("/user/search", (req, res) => {
  let id = req.body.id;
  client.hgetall(id, function (err, obj) {
    if (err) throw err;
    if (!obj) {
      res.render("searchUsers", {
        error: "User you are searching does not exists!",
      });
    } else {
      obj.id = id;
      res.render("details", { user: obj });
    }
  });
});
// Add User Post Route
app.post("/user/add", (req, res) => {
  let id = req.body.id;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  let phone = req.body.phone;

  client.hmset(
    id,
    [
      "first_name",
      first_name,
      "last_name",
      last_name,
      "email",
      email,
      "phone",
      phone,
    ],
    (err, obj) => {
      if (err) throw err;
      console.log(obj);
      res.redirect("/");
    }
  );
});
// Delet User Route
app.delete("/user/delete/:id", (req, res) => {
  console.log(`Request Came....`);
  client.del(req.params.id);
  res.redirect("/");
});

// Listning
app.listen(Port, () => console.log(`Serving on http://localhost:${Port}`));
