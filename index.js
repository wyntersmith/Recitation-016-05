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
          res.status(403).render("pages/login", {message: "Incorrect username or password", error: true});  //incorrect password
        }
      }
    })
    .catch((err) => {
      if (err instanceof pgp.errors.QueryResultError && err.code == pgp.errors.queryResultErrorCode.noData) { //incorrect username
        res.status(403).render("pages/login", {message: "Incorrect username or password", error: true});
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
      res.status(400).render('pages/register', {message: "Username or Email already in use" , error: true});
    }
    else {
      db.any(query, [req.body.username, req.body.email, req.body.firstName, req.body.lastName, hashedPassword])
      .then(function (data) {
        res.status(400).render('pages/login', {message: "Successfully registered! Please Login", error: false});
      })
      .catch(function (err) {
        res.status(400).render('pages/register', {message: "Error adding user to database", error: true});
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

app.get('/get_profile/:host_user_id', async (req, res) => {
  const query = "select * from users where user_id = $1;";
  const query1 = "select * from user_parties where user_id = $1;";
// console.log(req.params, req.query)
  // console.log(req.params['host_user_id']);
  db.any(query, [req.params['host_user_id']])
  .then(function (data) {

    db.any(query1, [req.params['host_user_id']])
    .then(function (data1) {
      // Return data
      // console.log(data,data1);
      res.json({return_data: data, return_data1: data1});

    })
    .catch(function (err) {
      res.json({ error: "Error fetching user data." });
    });  


  })
  .catch(function (err) {
    res.json({ error: "Error fetching user data." });
  });

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

app.post("/add_party", (req, res) => {

  const query = "insert into party_info (host_user_id, party_name, party_address1, party_address2, party_city, party_state, zipcode, party_date, start_time, party_description, party_image) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)";

  const host_user_id = req.session.user.user_id;
  const party_name  = req.body.inputPartyName;
  // const latitude = req.body.latitude;
  // const longitude = req.body.longitude;
  const party_address1 = req.body.address1;
  const party_address2 = req.body.address2;
  const party_city = req.body.inputCity;
  const party_state = req.body.inputState;
  const party_zip = req.body.inputZip;
  const party_date = req.body.inputDate;
  const start_time = req.body.inputTime;
  const party_description = req.body.inputDescription;
  const party_image = req.body.inputImageLink;

  if(host_user_id== '' || party_name == '' || party_address1  == '' || req.body.address2 == '' || req.body.inputCity == '' || req.body.inputState == '' || req.body.inputZip == '' || req.body.inputDate == '' || req.body.inputTime == '' || req.body.inputDescription == ''){
    res.status(400).render("pages/add_party", {message: "Please fill out all fields", error: true})
    return;
  }

  //console.log(host_user_id, party_name, party_address1, party_address2, party_city, party_state, party_zip, party_date, start_time, party_description, party_image);
  db.any(query, [host_user_id, party_name, party_address1, party_address2, party_city, party_state, party_zip, party_date, start_time, party_description, party_image])
  .then(function (data) {
    res.render('pages/party', {message: "Succesfully added party", error: false});
  })
  .catch(function (err) {
    res.render('pages/add_party', {message: "Error adding party", error: true});
  });
  
});



app.get("/add_party", (req, res) => {
  res.render("pages/add_party");
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