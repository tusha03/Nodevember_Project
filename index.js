const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
require('dotenv').config();

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }))

const mongodburl = process.env.MONGO_URL;
mongoose.connect(mongodburl)
    .then(() => {
        console.log('DB connected successfully')
    })
    .catch((err) => {
        console.log('Error occured at DB connectionn', err)

    });

const blogSchema = new mongoose.Schema({
    title: String,
    imageURL: String,
    description: String
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

const Blog = new mongoose.model('blog', blogSchema);
const User = new mongoose.model('users', userSchema);

app.get('/', (req, res) => {
    res.render('login')
})

app.get('/home', (req, res) => {

    Blog.find({})
        .then((arr) => {
            res.render('home', { blogPostsData: arr });
        })
        .catch((err) => {
            console.log('Can not find blogs', err);
            res.render('/404')
        });
})


app.get('/login', (req, res) => [
    res.redirect('/')
])

app.get('/signup', (req, res) => {
    res.render('signup')
})

app.post('/login', (req, res) => {
    const email = req.body.email;
    const pass = req.body.password;
    User.findOne({ email: email, password: pass })
        .then((user) => {
            if (user === null) {
                res.redirect('/')
            }
            else if (user.email === email && user.password === pass) {
                Blog.find({})
                    .then((arr) => {
                        res.render('home', { blogPostsData: arr })
                    })
            }
            else {
                res.redirect('/')
            }


        })
})


app.post('/signup', (req, res) => {
    const email = req.body.email;
    const pass = req.body.password;

    const newUser = new User({
        email: email,
        password: pass
    })

    newUser.save()
        .then(() => {
            console.log("New user created")
        })
        .catch(() => {
            console.log("New user created time err")
        })

    res.redirect('/')

})

app.get('/contact', (req, res) => {
    res.render('contact');
})

app.get('/about', (req, res) => {
    res.render('about');
})

app.get('/compose', (req, res) => {
    res.render('compose');
})

app.post('/compose', (req, res) => {

    const title = req.body.title;
    const image = req.body.imageUrl;
    const description = req.body.description;

    const newBlog = new Blog({
        imageURL: image,
        title: title,
        description: description
    });

    newBlog.save()
        .then(() => {
            console.log('Blog posted successfully')
        })
        .catch((err) => {
            console.log('Error posting new blog', err)
        });

    res.redirect('/home');
})

app.get('/post/:id', (req, res) => {

    const id = req.params.id;

    Blog.findOne({ _id: new ObjectId(id) })
        .then(data => {
            const post = {
                title: data.title,
                imageURL: data.imageURL,
                description: data.description
            }
            res.render('post', { post: post });
        })
        .catch(err => {
            console.log("Post show time err")
        })
})


app.get('/post/delete/:id', (req, res) => {
    const id = req.params.id;
    Blog.findOne({ _id: new ObjectId(id) })
        .then(del => {
            Blog.deleteOne({ _id: new ObjectId(del._id) })
                .then(mes => {
                    console.log("Post delete ")
                    res.redirect('/home')
                })
                .catch(err => {
                    console.log("Post delete time err")
                })
        })
        .catch(err => {
            console.log("Post find time err")
        })
})


const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => {
    console.log('server listening port 3000 http://localhost:3000');
})