var express = require('express');
var app = express();
var http = require('http');
var url = require('url');
var bodyParser = require('body-parser');

const uuid = require('uuid/v4');
const fs = require('fs');

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

var postSchema = {
  "id": "/ClassificationPost",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "createdOn": {
      "type": "date"
    },
    "topics": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "data": {
      "type": "string"
    }
  },
  "required": ["data", "topics"]
};

var Validator = require('jsonschema').Validator;
var v = new Validator();
v.addSchema(postSchema, '/ClassificationPost');

app.post('/classifications', function(request, response) {

  if (v.validate(request.body, postSchema).errors.length > 0) {
    response.sendStatus(400)
  }

  var classificationRequest = {
    id: uuid(),
    createdOn: Date.now(),
    data: request.body.data,
    topics: request.body.topics,
  };

  fs.writeFile(__dirname + "/data/" + classificationRequest.id, JSON.stringify(classificationRequest), 'utf8', function(err) {
    if (err) {
      console.log(err);
      response.sendStatus(500)
    }
    response.sendStatus(201)
  });

});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});
