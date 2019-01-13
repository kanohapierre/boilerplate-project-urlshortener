'use strict';

// init project
var express = require('express');
const bodyParser = require('body-parser');
const dns = require("dns");
const validUrl = require("valid-url");
const mongoose = require("mongoose");

var cors = require('cors');

//var MongoClient = require('mongodb');
//const CONNECTION_STRING = process.env.DB;
let db = mongoose.connection;
let Schema = mongoose.Schema;

var app = express();

// create website schema 
const websiteSchema = new Schema({
  original_url: String
});

// create website model 
const Website = mongoose.model("Website", websiteSchema);

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
// connect database 
mongoose.connect(process.env.DB);
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
  console.log('database connected');
});
 
// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(bodyParser.urlencoded());


app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});



  app.post('/api/shorturl/new', (req,res) => {
  let original_url = req.body.original_url;
  let short_url;
  
  if(validUrl.is_http_uri(original_url) || validUrl.is_https_uri(original_url)){
    
    Website.findOne({"original_url": original_url}, (err, data) => {
      if(err){
        res.json({
          "error":"invalid URL"
        });
      }
      if(data === null){
        let newWebsite = new Website({ "original_url": original_url });
        newWebsite.save((err, data) => {
          if(err){
            res.json({
              "error":"invalid URL"
            });
          } else {
            res.json({
              "original_url": data.original_url,
              "short_url": data.id
            })
          }
        })
      } else {
        res.json({
          "original_url": data.original_url,
          "short_url": data.id
        })
      }
    }) 
  } else {
    res.json({
      "error":"invalid URL"
    })
  }
});

app.get('/api/shorturl/:shorturl', (req,res) => {
  
  Website.findById(req.params.shorturl, (err, data) => {
    if(err){
      res.json({"error":"invalid URL"});
    }
    
    res.redirect(data.original_url);
  })
});
  

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});



// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


//app.listen(port, function () {
//  console.log('Node.js listening ...');
//});
