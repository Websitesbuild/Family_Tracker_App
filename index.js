import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "family_Tracker",
  password: "Amit@8085",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function selectUser() {
  const result = await db.query("select * from users order by id");
  let users = result.rows;
  return users;
}

async function checkVisisted() {
  const result = await db.query(
    "SELECT country_code FROM visited_countries WHERE traveller_id = $1",
    [currentUserId]
  );
  // console.log(result.rows);
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

let users = await selectUser();
let currentUserId = users[0].id;

app.get("/", async (req, res) => {
  const users = await selectUser();
  if (users.length) {
    const countries = await checkVisisted();
    const user = users.find((usr) => usr.id == currentUserId);
    console.log(user.color);
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      users: users,
      color: `${user.color}`,
      currentUsr: currentUserId,
    });
  } else {
    res.render("new.ejs");
  }
});

app.post("/add", async (req, res) => {
  const input = req.body["country"];
  const countries = await checkVisisted();
  const user = await selectUser();
  const color = await db.query("select color from users where id = $1", [
    currentUserId,
  ]);
  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );
    const country_code = result.rows[0].country_code;
    
    try {
      await db.query(
        "INSERT INTO visited_countries (traveller_id,country_code) VALUES ($1,$2)",
        [currentUserId, country_code]
      );
      res.redirect("/");
    } catch (error) {
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        users: user,
        color: `${color.rows[0].color.toLowerCase()}`,
        error: "Country alredy Visited!",
        currentUsr: currentUserId,
      });
    }
  } catch (err) {
    console.log(err);
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      users: user,
      color: `${color.rows[0].color.toLowerCase()}`,
      error: "Country name does not exist, try again.",
      currentUsr: currentUserId,
    });
  }
});

app.post("/user", async (req, res) => {
  console.log("Click is: ", req.body);

  if (req.body.add == "new") {
    res.render("new.ejs");
  } else {
    currentUserId = req.body.user;
    const color = await db.query("select color from users where id = $1", [
      currentUserId,
    ]);

    console.log("User Color is: ", color.rows[0].color.toLowerCase());

    const users = await selectUser();

    const countries = await checkVisisted();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      users: users,
      color: `${color.rows[0].color.toLowerCase()}`,
      currentUsr: currentUserId,
    });
  }
});

app.post("/new", async (req, res) => {
  const usrName = req.body.name;
  const usrColor = req.body.color;
  const id = await db.query(
    "INSERT INTO users(name,color) values($1,$2) returning id",
    [usrName, usrColor]
  );
  currentUserId = id.rows[0].id;
  console.log(currentUserId);
  res.redirect("/");
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
});

app.get("/delete", async (req, res) => {
  await db.query("delete from visited_countries where traveller_id = $1", [currentUserId]);
  await db.query("delete from users where id = $1", [currentUserId]);
  const users = await selectUser();
  if (users.length) {
    currentUserId = users[0].id;
    res.redirect("/");
  } else {
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
