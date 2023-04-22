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


// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

// TODO - Include your API routes here

// Get parties
app.get('/api/parties', async (req, res) => {
  const query = "SELECT * FROM party_info;";
  try {
    const party_data = await db.any(query);
    res.json(party_data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error fetching party data." });
  }
});

app.get('/api/partyHostInfo', async (req, res) => {
  
})

// Setup CSS
app.use(express.static('public'));

app.get('/welcome', (req, res) => {
  res.json({ status: 'success', message: 'Welcome!' });
});

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
      if (data) {
        const match = await bcrypt.compare(req.body.password, data.password);
        if (match) {

          req.session.user = {
            user_id: data.user_id,
            username,
            firstName: data.firstname,
            lastName: data.lastname,
            email: data.email,
          };
          req.session.save();
          res.redirect("/profile");
        }
        else {
          res.status(403).render("pages/login", {denied: true});  //incorrect password
        }
      }
    })
    .catch((err) => {
      if (err instanceof pgp.errors.QueryResultError && err.code == pgp.errors.queryResultErrorCode.noData) { //incorrect username
        res.status(403).render("pages/login", {denied: true});
      }
      else {
        console.log(err);
        res.status(500).render("pages/error");
      }

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
  if(req.body.username == '' || req.body.firstName == '' || req.body.lastName == '' || req.body.email == '' || req.body.password == ''){
    res.status(400).render("pages/register", {
      isUsernameValid: req.body.username != '',
      isFirstNameValid: req.body.firstName != '',
      isLastNameValid: req.body.lastName != '',
      isEmailValid: req.body.email != '',
      isPasswordValid: req.body.password != '',
    })
    return;
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const query1 = "select * from users where username = $1 or email = $2;"
  const query = "insert into users (username,email,firstName,lastName, password) values ($1,$2,$3,$4,$5);";

  
  db.any(query1, [req.body.username, req.body.email])
  .then(function (data) {
    if (data.length) { 
      res.status(400).render('pages/register', {message: "Username or Email already in use"});
    }
    else {
      db.any(query, [req.body.username, req.body.email, req.body.firstName, req.body.lastName, hashedPassword])
      .then(function (data) {
        res.redirect('/login');
      })
      .catch(function (err) {
        res.redirect('/register');
      });
  
    }

  })
  .catch(function (err) {
    res.redirect('/register');
  });



});

app.use(auth); // Authentication required

// Home case - redirect to discover
app.get('/', (req, res) => {
  res.redirect('/party');
});


app.get('/profile', async (req, res) => {
  const query = "select * from user_parties where user_id = $1";


  let parties_data;
  try {
    parties_data = await db.oneOrNone(query, [req.session.user.user_id]);
    if (parties_data == null) {
      parties_data = {
        parties_attended: 0,
        parties_hosted: 0
      }
    }
  } catch (err) {
    console.log(err);
    res.render('pages/error');
    return;

  }
  res.render('pages/profile', {
    username: req.session.user.username,
    firstName: req.session.user.firstName,
    lastName: req.session.user.lastName,
    email: req.session.user.email,
    parties_attended: parties_data.parties_attended,
    parties_hosted: parties_data.parties_hosted,
  });


});

// app.get('/discover', async (req, res) => {
//   console.log("Discover page");
//   const query = "select * from party_info;";
//   try {
//     party_data = await db.any(query)
//     console.log(party_data);
//     res.render('pages/discover', {
//       data: party_data,
//     });
//   } catch (err) {
//     console.log(err);
//     res.render('pages/discover');
//   }
// });


app.get("/party", (req, res) => {
  res.render("pages/party");
});

app.post("/party", (req, res) => {
  //const query = "insert into party_info (host_user_id, party_name,location, party_date, start_time, party_description) values ($1,$2,$3,$4,$5, $6)";
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/login");
});


// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = {
  server: app.listen(3000),
  db: db,
};
console.log('Server is listening on port 3000');