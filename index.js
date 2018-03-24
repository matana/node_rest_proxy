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

// define json schema
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

  var status;
  // check is request body matches the ClassificationPost schema
  if (v.validate(request.body, postSchema).errors.length > 0) {
    response.status(400).end();
    return;
  }
  // create post request
  var classificationRequest = {
    id: uuid(),
    createdOn: Date.now(),
    data: request.body.data,
    topics: request.body.topics,
  };
  // save post request in project dir ./data (db)
  fs.writeFile(__dirname + "/data/" + classificationRequest.id, JSON.stringify(classificationRequest), 'utf8', function(err) {
    if (err) {
      response.status(500).end();
    }
  });

  response.json({
    id: classificationRequest.id
  });
  response.status(201).end();
});

app.get('/classifications', function(request, response) {
  var classificationsIds = fs.readdirSync(__dirname + "/data/");
  var classificationsResponse = [];
  classificationsIds.forEach(id => {
    classificationsResponse.push({
      'id': id
    });
  });
  response.json(classificationsResponse);
  response.status(200).end();
});

app.get('/classifications/:id', function(request, response) {
  var id = request.params.id;
  if (!fs.existsSync(__dirname + "/data/" + id)) {
    response.status(400).end();
    return;
  }
  var classificationResponse = fs.readFileSync(__dirname + "/data/" + id, 'utf8');
  response.json(JSON.parse(classificationResponse));
  response.status(200).end();
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});
