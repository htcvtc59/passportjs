const express = require('express');
const bodyParser = require('body-parser');
const Passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const fs = require('fs');


const app = express();

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "mysecret", cookie: {
        maxAge: 1000 * 60 * 5
    }
}
));
app.use(Passport.initialize());
app.use(Passport.session());

app.get('/', function (req, res) {
    res.render('login');
});
app.route('/login')
    .get((req, res) =>
        res.render('login'))
    .post(Passport.authenticate('local', {
        failureRedirect: '/login',
        successRedirect: '/loginsucces'
    }))

app.get('/private', (req, res) => {
    if (req.isAuthenticated()) {
        res.send('welcome to private');
    } else {
        res.send('not login');
    }
});


app.get('/loginsucces', (req, res) => res.send('Login Success'));

Passport.use(new LocalStrategy(
    (username, password, done) => {
        fs.readFile('./userDB.json', (err, data) => {
            const db = JSON.parse(data);
            console.log(db);
            const userRecord = db.find(user => user.usr == username);
            if (userRecord && userRecord.pwd == password) {
                return done(null, userRecord);
            } else {
                return done(null, false);
            }
        })

    }
))

Passport.serializeUser((user, done) => {
    done(null, user.usr)
});


Passport.deserializeUser((username, done) => {
    fs.readFile('./userDB.json', (err, data) => {
        const db = JSON.parse(data);
        const userRecord = db.find(user => user.usr == username);
        if (userRecord) {
            return done(null, userRecord);
        } else {
            return done(null, false);
        }
    })
});

const port = 3000;
app.listen(port, () => console.log("Server up http://localhost:3000"));