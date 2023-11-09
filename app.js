const express = require("express");
const {config} = require("dotenv");
config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGOURL + "retryWrites=true&w=majority");

const bodyParser = require("body-parser");
const _ = require("lodash");
const ejs = require("ejs");


const homeStartingContent = `Home is more than just a physical space; it's a sanctuary of comfort, a haven for the soul. It's where we find solace after a long day, a place where our truest selves come to life. It's the backdrop to our most cherished memories, where laughter and love intertwine in the air. Home is where we learn, grow, and evolve, a canvas upon which the stories of our lives unfold. It's the warmth of a cozy blanket on a chilly winter evening, the scent of a home-cooked meal wafting from the kitchen, and the familiar creak of a well-trodden staircase. It's a place that reflects our unique personalities and tastes, a canvas for self-expression. Home is a refuge from the chaos of the world, a place where we can be our most authentic selves, where our walls hold the secrets of our joys and sorrows. It's where we build connections with those we hold dear, a place where relationships thrive and memories are etched into the very foundation. Home is the heartbeat of our lives, the anchor of our existence, and a reflection of who we are and what we hold dear.`

const aboutContent = `About is a multifaceted word that serves as a gateway to understanding, a window to knowledge, and a bridge to connection. It's the means by which we explore the world, gather information, and deepen our comprehension of the things that matter most to us. "About" encapsulates the essence of curiosity, the driving force behind our quest for knowledge. It's the starting point of a story, the first brushstroke on the canvas of understanding.

"About" is the connector, linking individuals, ideas, and concepts. It's the tool that helps us convey our thoughts, share our passions, and build relationships. It's a word that transcends boundaries, languages, and cultures, facilitating communication and fostering empathy.

"About" is the enabler of discovery, an open door to new experiences and adventures. It signifies the beginning of a journey, whether it's delving into a book, embarking on a trip, or connecting with someone new. It's the compass guiding our exploration, the path leading us to enlightenment.

"About" is a versatile word, an invitation to curiosity, a vessel for connection, and a portal to the vast tapestry of human experience. It's the spark that ignites our desire to learn, the glue that binds us together, and the key that unlocks the doors to the world's wonders.`

const contactContent = `Contact is the conduit of connection, the bridge that links people, ideas, and experiences. It's the essence of communication, enabling us to reach out and establish relationships, whether near or far. Contact is the medium through which we convey our thoughts, emotions, and intentions, transcending the boundaries of time and space.

In our interconnected world, contact is the cornerstone of collaboration and understanding. It embodies the power of human interaction, allowing us to share knowledge, express empathy, and foster bonds that unite us as a global community.

Contact is a catalyst for change, sparking the exchange of ideas and the birth of innovation. It's the point where creativity and expertise collide, propelling progress and shaping our collective future. It's the handshake that seals agreements, the phone call that mends relationships, and the email that keeps us in touch.

Contact is the gateway to new horizons, inviting us to explore unfamiliar territories and cultures. It represents the courage to connect with the unfamiliar and embrace diversity, breaking down barriers that separate us from the richness of the world.

In a digital age, contact takes on new dimensions, spanning virtual realms and enabling instantaneous communication. It's the click of a button that brings us closer, the message that conveys our sentiments, and the video call that makes distance feel insignificant.

Contact is the lifeblood of human connection, a dynamic force that weaves the tapestry of our lives, and a reminder that we are never truly alone. It embodies the resilience of human relationships, the potential for growth, and the unending possibilities that unfold when we reach out to one another.`

const postSchema = mongoose.Schema({
    title:String,
    postBody:String
})
const Post = mongoose.model("post",postSchema);

const blogSchema = mongoose.Schema({
    name:String,
    blogs: [postSchema]
})
const Blog = mongoose.model("Blog",blogSchema);

const app = express();

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.get("/",async function(req,res){  
    const response = await Blog.findOne({name:"blogs"});
    if(!response){
        await Blog.insertMany([{name:"blogs",blogs:[]}]);
    }
    else{
        res.render("home.ejs",{message:homeStartingContent,posts:response.blogs});
    }
   
});
app.get('/posts/:postName', async function (req, res) {
    let postName = req.params.postName;
    const response = await Blog.findOne({name:"blogs"});
    const arr = response.blogs;
    arr.forEach((post)=>{
        if((_.lowerCase(post._id) === _.lowerCase(postName))||(_.lowerCase(post.title) ===_.lowerCase(postName))){
            res.render(`post.ejs`,{postPage:{post}})
        };
    })
  });
app.get("/about",function(req,res){
    res.render("about.ejs",{AboutContent:aboutContent});
});
app.get("/contact",function(req,res){
    res.render("contact.ejs",{ContactContent:contactContent});
});
app.get("/compose",function(req,res){
    res.render("compose.ejs");
});
app.post("/compose",async function(req,res){
    const response = await Blog.findOne({name:"blogs"});
    
    const post = new Post({
        title: req.body.title,
        postBody:req.body.postBody
    });
    
    response.blogs.push(post);
    await Blog.findOneAndUpdate({name:"blogs"},{blogs:response.blogs});
    // const output = await Blog.findOne({name:"blogs"});
    // console.log(output);
    res.redirect("/");
});




app.listen(3000,function(){
    console.log("Server is running at port 3000");
})
