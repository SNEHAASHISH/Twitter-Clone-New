const express = require('express');
const path = require('path');
const app = express();
const middleware = require('./middleware');
const port = 3003;

const server = app.listen(port, () => {
    console.log('listening on port ' + port);
});

app.set('view engine', 'pug');
app.set('views','views');

app.use(express.static(path.join(__dirname, "public")));

//Routes
const loginRoute = require('./routes/loginRoutes');

app.use('/login', loginRoute);

app.get('/', middleware.requireLogin, (req, res, next) => {
    var payload = {
        pageTitle: "Home"
    }
    res.status(200).render("home", payload);
});
