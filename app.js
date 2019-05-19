const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const expressSanitizer = require("express-sanitizer");
const port = process.env.PORT || 8080;


// App CONFIG
mongoose.connect("mongodb://localhost/blog_app", {useNewUrlParser: true});
app.set("view engine", "ejs");
app.use(express.static("public"));   // For CSS
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer()); // this should be below the bodyParser
app.use(methodOverride("_method"));

// Mongoose CONFIG
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    // if you want a default image if the user does not enter an image.  image: {type: String, default: "Placeholder image.jpg"}
    body: String,
    created: {type: Date, default: Date.now} // so that when d user enters a blog it automatically selects the current date
});

var Blog = mongoose.model("blog", blogSchema);

// Blog.create(
//     {
//         title: "Test Blog",
//         image: "https://farm1.staticflickr.com/130/321487195_ff34bde2f5.jpg",
//         body: "Hi There THis is a Blog Post"
// }, (err, blog) => {
//     if(err){
//         console.log(err);
//     } else{
//         console.log("Blog was created");
//         console.log(Blog);
//     }
// });

// RESTFUL ROUTES
app.get("/", (req, res) => {
    res.redirect("/blogs");
});

// INDEX ROUTE
app.get("/blogs", (req, res) => {
    Blog.find({}, (err, blogs) => {
        if(err) {
            console.log("ERROR!!!");
        } else {
            res.render("index", {blogs: blogs});
        }
    })
});

// NEW ROUTE
app.get("/blogs/new", (req, res) => {
    res.render("new");
});

// CREATE ROUTE
app.post("/blogs", (req, res) => {
    //Sanitize Input
    req.body.blog.body = req.sanitize(req.body.blog.body); 
    /* req.body.blog.body: req.body is the info coming from the form dat we use body parser...
    blog.body is name we gave to the input in the form we called Body*/

    // Create Blog
    Blog.create(req.body.blog, (err, newBlog) => {
        if(err) {
            res.render("new");
        } else{
            // Redirect to the index page
            res.redirect("/blogs");
        }
    });
});

// SHOW ROUTE
app.get("/blogs/:id", (req, res) => {
    // Find particular blog by ID
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err) {
            res.redirect("/blogs"); // will be refactored later.
        } else{
            // show tempelate with that Blogs
            res.render("show", {blog: foundBlog});
        }
    });
});

// EDIT ROUTE
app.get("/blogs/:id/edit", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err) {
            res.redirect("/blogs");
        } else{
            res.render("edit", {blog: foundBlog});
        }
    })
});

// UPDATE ROUTE
app.put("/blogs/:id", (req, res) => {
    //Sanitize Input
    req.body.blog.body = req.sanitize(req.body.blog.body); 
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) =>{
        if(err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);  // redirect back to the SHOW route with the Blog ID.  
        }
    })
});

// DELETE ROUTE
app.delete("/blogs/:id", (req, res) => {
    Blog.findByIdAndDelete(req.params.id, (err) => {
        if(err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    })
})














app.listen(port, () => {
    console.log("Server is listening on Port 8080");
});