const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const User = require('../schemas/UserSchema');

const app = express();
const router = express.Router();

router.get('/:id', (req, res, next) => {
    var payload = {
        pageTitle: "View Post",
        userLoggedIn: req.session,
        userLoggedInJS: JSON.stringify(req.session.user),
        postId: req.params.id
    }
    res.status(200).render('postPage', payload);
});



module.exports = router;