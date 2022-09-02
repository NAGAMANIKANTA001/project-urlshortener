require('dotenv').config();
const mongoose = require('mongoose')
const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser')
const dns = require('dns')
const shortId = require('shortid')
const random = require('random')
const app = express();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
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
      res.send("Not Found")
    } else if(data != null){
      res.redirect(data.url)
    } else {
      res.send("Not Found")
    }
  })
})
app.post('/api/shorturl', (req, res) => {
  console.log(req.body)
  const url=req.body.url.replace(/(^\w+:|^)\/\//, '');
  dns.lookup(url, (err,address,family) => {
    if (err) {
      res.json({ error: "inavlid url" })
    } else {
      let newURL = new URL({url:req.body.url})
      newURL.save((err,data)=>{
        if(err) {
          res.send("Data not saved")
        } else {
          res.json({ original_url: req.body.url, short_url: data.short_url })
        }
      })
    }
  })
})

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
