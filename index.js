require('dotenv').config();
const mongoose = require('mongoose')
const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser')
const dns = require('dns')
const shortId = require('shortid')
const app = express();
const mySecret = process.env['MONGO_URI']
console.log(mySecret)
mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
  if (err) {
    console.log(err.message)
  } else {
    console.log("Connected")
  }
});
const { stringify } = require('querystring');
const urlSchema = new mongoose.Schema({
  url:String,
  short_url:{
    type:String,
    default:shortId.generate
  }
})
const URL = mongoose.model('URL',urlSchema);
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
app.get('/api/shorturl/:su', (req, res) => {
  console.log(req.params.su)
  URL.findOne({short_url:req.params.su},(err,data)=> {
    if(err) {
      console.log("Not Found")
      res.send("Not Found")
    } else if(data != null){
      console.log(data.url)
      res.redirect(data.url)
    } else {
      console.log("Not Found")
      res.send("Not Found")
    }
  })
})
app.post('/api/shorturl', (req, res) => {
  
  // This is just for testing purposes
  console.log(req.body)
  console.log(req.get('host'))
  const url=req.body.url.replace(/(^\w+:|^)\/\//, '');
  if(url.indexOf(req.get('host'))!=-1) {
    let newURL = new URL({url:req.body.url})
      newURL.save((err,data)=>{
        if(err) {
          console.log("Data Not Saved")
          res.send("Data not saved")
        } else {
          console.log({ original_url: req.body.url, short_url: data.short_url })
          res.json({ original_url: req.body.url, short_url: data.short_url })
        }
      })
  }
  else {
  dns.lookup(url, (err,address,family) => {
    if (err) {
      console.log("Invalid URL")
      res.json({ error: "invalid url" })
    } else {
      let newURL = new URL({url:req.body.url})
      newURL.save((err,data)=>{
        if(err) {
          console.log("Data Not Saved")
          res.send("Data not saved")
        } else {
          console.log({ original_url: req.body.url, short_url: data.short_url })
          res.json({ original_url: req.body.url, short_url: data.short_url })
        }
      })
    }
  })
  }
})

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
