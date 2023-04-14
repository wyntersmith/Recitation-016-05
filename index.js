// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

app.set('view engine', 'ejs'); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const user = {
  username: undefined,
  firstName: undefined,
  lastName: undefined,
  email: undefined,
};

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

// TODO - Include your API routes here
  
app.get('/login', (req, res) => {
  res.render('pages/login');
});

app.get('/register', (req, res) => {
  res.render('pages/register');
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const query = "select * from users where username = $1;";

  db.one(query, [username])
    .then(async function (data) {
      if(data) {
        const match = await bcrypt.compare(req.body.password, data.password);
        if(match){

          user.username = username;
          user.firstName = data.firstName;
          user.lastName = data.lastName;
          user.email=data.email;

          req.session.user = data;
          req.session.save();
          res.redirect("/discover");
        }
        else{
          res.render("/login", {
            error: true,
            message: "Incorrect username or password."
          })
        }
      }
      else{
        res.render("/login", {
          error: true,
          message: "User does not exist"
        })
      }
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/login");
    });
});

// Authentication middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

app.post('/register', async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const query = "insert into users (username, password) values ($1, $2);";

  db.any(query, [req.body.username, hashedPassword])
  .then(function (data) {
    res.redirect('/login');
  })
  .catch(function (err) {
    res.redirect('/register');
  });

});

app.use(auth); // Authentication required

// Home case - redirect to discover
app.get('/', (req, res) => {
  res.redirect('/discover'); 
});


app.get('/profile', (req, res) => {
  res.render('pages/profile',{
    username: req.session.user.username,
    firstName: req.session.user.firstName,
    lastName: req.session.user.lastName,
    email: req.session.user.email,
  });

});

app.get('/discover', (req, res) => {
    res.render('pages/discover');
});


app.get("/party", (req, res) => {
  req.session.destroy();
  res.render("pages/party");
  });

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/login");
});







// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000);
console.log('Server is listening on port 3000');