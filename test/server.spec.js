// Imports the index.js file to be tested.
const {server, db} = require('../index.js'); //TO-DO Make sure the path to your index.js is correctly added
// Importing libraries
const bcrypt = require('bcrypt');

const testUser = {
  username: 'Apple',
  email: 'apple@test.com',
  firstName: 'Test',
  lastName: 'Test',
  password: 'n0tApp13',
};

before(async () => {
  const hashedPassword = await bcrypt.hash(testUser.password, 10);
  const query = "insert into users (username,email,firstName,lastName, password) values ($1,$2,$3,$4,$5);";

  db.any(query, [testUser.username, testUser.email, testUser.firstName, testUser.lastName, hashedPassword])

});

after(async () => {
  const query = "delete from users where username = $1";
  db.any(query, [testUser.username]);
});


// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

describe('Server test cases', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });

  // ===========================================================================
  // TO-DO: Part A Login unit test case
  // ===========================================================================
  
  // to run tests: docker-compose run web npm run testandrun
  // server never runs if tests are failing so separated them

  // LOGIN PAGE
  it('Test login with valid user redirects to profile', done => {
    chai
      .request(server)
      .post('/login')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        username: testUser.username, 
        password: testUser.password,
      })
      .redirects(0)
      .end((err, res) => {
        expect(res).to.redirect;
        expect(res.headers).to.have.property('location');
        expect(res.headers.location).to.include('/profile');
        done();
      });
  });

  it('Test login with valid user and incorrect password returns 403', done => {
    chai
      .request(server)
      .post('/login')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        username: testUser.username, 
        password: 'InvalidPassword',
      })
      .end((err, res) => {
        expect(res).to.have.status(403)
        done();
      });
  });


  it('Test login with invalid user returns 403', done => {
    chai
      .request(server)
      .post('/login')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        username: 'InvalidUser', 
        password: 'InvalidPassword',
      })
      .end((err, res) => {
        expect(res).to.have.status(403)
        done();
      });
  });


  // PROFILE PAGE
  it('Tests if profile loads successfully', done => {
    chai
    .request(server)
    .get('/profile')
    .end((err,res) => {
      expect(res).to.have.status(200)
      done();
    })
  });

          // party_address1:
          // party_address2:
          // party_city:
          // party_state:
          // party_zipcode:
          // party_date:
          // start_time:
          // party_description:
          // party_image:
  // DISCOVER PAGE
  it('Tests if discover loads successfully', done => {
    chai
    .request(server)
    .get('/discover')
    .end((err,res) => {
      expect(res).to.have.status(200)
      done();
    })
  });


  //REGISTER PAGE
  it('Test valid register with redirect to login', done => {
    chai
      .request(server)
      .post('/register')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        firstName:'Ada',
        lastName: 'Lovelace',
        username: 'adalovelace',
        email: 'ada@lovelace',  
        password: 'te$t1nG',
      })
      .redirects(0)
      .end((err, res) => {
        expect(res).to.redirect;
        expect(res.headers).to.have.property('location');
        expect(res.headers.location).to.include('/login');
        const query = "delete from users where username = 'adalovelace'";
        db.any(query);
        done();
      });
  });

  it('Test register with invalid info returns 400', done => {
    chai
      .request(server)
      .post('/register')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        firstName: '',
        lastName: '',
        username: '',
        email: '', 
        password: '',
      })
      .end((err, res) => {
        expect(res).to.have.status(400)
        done();
      });
  });

  it('Test register with user or email already in database returns 400', done => {
    chai
      .request(server)
      .post('/register')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        username: testUser.username,
        email: testUser.email, 
        password: testUser.password,
      })
      .end((err, res) => {
        expect(res).to.have.status(400)
        done();
      });
  });

  // PARTY PAGE
  // it('Test add_party with party not in database returns ', done => {
  //   chai
  //   .request(server)
  //   .post('')
  //   .set('content-type', 'application/x-www-form-urlencoded')
  //     .send({
  //       host_user_id: testUser.user_id,
  //       party_name: 'Sample Party'
          // party_address1: ''
          // party_address2: ''
          // party_city: 'Boulder'
          // party_state: 'Colorado'
          // party_zipcode: ''
          // party_date: ''
          // start_time: ''
          // party_description: 'Sample Description'
          // party_image: 'https://pbs.twimg.com/profile_images/949787136030539782/LnRrYf6e_400x400.jpg'

  //     })
  //     .end((err, res) => {
  //       expect(res).to.have.status(400)
  //       done();
  //     });

  // })

});