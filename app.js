const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const mongoose = require('./database');
const middleware = require('./middleware');

const app = express();
const port = 3003;

const server = app.listen(port, () => {
    console.log('listening on port ' + port);
});

app.set('view engine', 'pug');
app.set('views','views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: 'vkhew nkavjcn',
    resave: true,
    saveUninitialized: false
}));

//Routes
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const logoutRoute = require('./routes/logoutRoutes');
const postRoute = require('./routes/postRoutes');
const profileRoute = require('./routes/profileRoutes');

//API routes
const postAPIRoute = require('./routes/api/posts');

app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/logout', logoutRoute);
app.use('/api/posts', postAPIRoute);
app.use('/posts',  middleware.requireLogin, postRoute);
app.use('/profile', profileRoute);

app.get('/', middleware.requireLogin, (req, res, next) => {
    var payload = {
        pageTitle: "Home",
        userLoggedIn: req.session,
        userLoggedInJS: JSON.stringify(req.session.user)
    }
    res.status(200).render("home", payload);
});
