const express = require('express');
const bodyParser = require('body-parser');

const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');

const app = express();
const router = express.Router();

app.use(bodyParser.urlencoded({ extended: false }));

router.get('/', async (req, res, next) => {
    var results = await getPosts({});
    res.status(200).send(results);
});

router.get('/:id', async (req, res, next) => {
    var postId = req.params.id;
    var results = await getPosts({_id: postId});
    results = results[0];
    res.status(200).send(results);
});

router.post('/', async (req, res, next) => {
    // if (req.body.replyTo) {
    //     console.log(req.body.replyTo);
    // }
    
    if (!req.body.content) {
        console.log("Content param not sent with request");
        return res.sendStatus(404);
    }
    var postData = {
        content: req.body.content,
        postedBy: req.session.user
    }

    if (req.body.replyTo) {
        postData.replyTo = req.body.replyTo;
    }

    Post.create(postData)
    .then(async newPost => {
        newPost = await User.populate(newPost, { path: "postedBy"});
        res.status(201).send(newPost);
    })
    .catch(err => {
        console.log("Error creating post", err);
        res.sendStatus(500);
    })
});

router.put('/:id/like', async (req, res, next) => {
    
    var postID = req.params.id;
    var userID = req.session.user._id;
    //console.log(req.params.id);

    var isLiked = req.session.user.likes && req.session.user.likes.includes(postID);
    //console.log(isLiked);

    var option = isLiked ? "$pull" : "$addToSet"; 

    // Insert User Like
    req.session.user = await User.findByIdAndUpdate(userID, { [option]: { likes: postID}}, {new: true})
    .catch(err => {console.log(err); res.sendStatus(400);});

    // Insert Post Like
    var post = await Post.findByIdAndUpdate(postID, { [option]: { likes: userID}}, {new: true})
    .catch(err => {console.log(err); res.sendStatus(400);});

    res.status(200).send(post);
});

router.post('/:id/retweet', async (req, res, next) => {
    
    //return res.status(200).send("Yee-hah");

    var postID = req.params.id;
    var userID = req.session.user._id;
    //console.log(req.params.id);

    //var isLiked = req.session.user.likes && req.session.user.likes.includes(postID);
    //console.log(isLiked);

    //Try and delete retweet
    var deletedPost = await Post.findOneAndDelete({ postedBy: userID, retweetData: postID })
    .catch(err => {console.log(err); res.sendStatus(400);});

    var option = deletedPost != null ? "$pull" : "$addToSet"; 

    //return res.status(200).send(option);
    var repost = deletedPost;
    if (repost==null){
        repost = await Post.create({postedBy: userID, retweetData: postID})
        .catch(err => {console.log(err); res.sendStatus(400);});
    }

    // Perform retweet/un-retweet
    req.session.user = await User.findByIdAndUpdate(userID, { [option]: { retweets: repost._id}}, {new: true})
    .catch(err => {console.log(err); res.sendStatus(400);});

    // Insert Post Like
    var post = await Post.findByIdAndUpdate(postID, { [option]: { retweetUsers: userID}}, {new: true})
    .catch(err => {console.log(err); res.sendStatus(400);});

    res.status(200).send(post);
});

async function getPosts(filter) {
    var results = await Post.find(filter)
    .populate("postedBy")
    .populate("retweetData")
    .populate("replyTo")
    .sort({"createdAt":-1})
    .catch(err => {
        console.log(err);
        //res.sendStatus(500);
    })
    results = await User.populate(results, {path: "replyTo.postedBy"});
    return await User.populate(results, {path: "retweetData.postedBy"});
}

module.exports = router;