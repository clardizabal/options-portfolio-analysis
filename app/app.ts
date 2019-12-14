import express from 'express';
// import db from './db';
// import bodyParser from 'bodyparser';
// var multer  = require('multer')
// import multer from 'multer';
import morgan from 'morgan';
import routes from './routes';
// import cors from './cors';
var cors = require('cors');
// const dragZone = require('./app/dragZone');

// MAKE CONNECTION TO DATABASE
// db.connect();

const app = express();

const port = process.env.PORT || 3000;
app.set('port', port);
app.use(express.static(__dirname));
// app.use(cors());
app.use(cors({
  origin: 'http://localhost:3000'
}));
// Logging and parsing
app.use(morgan('dev'));
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(multer({dest:'./uploads/'}).single('portfolio'));

// Set up routes
routes(app);

// If we are being run directly, run the server.
if (!module.parent) {
  app.listen(app.get('port'));
  console.log('Listening on', app.get('port'));
//   console.log(process.env);
}