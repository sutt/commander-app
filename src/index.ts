import express from 'express';
import bodyParser, { json } from 'body-parser';
import path from 'path';
import dotenv from 'dotenv';
import authApi from './auth';
import commandApi from './commandapi';
const cookieParser = require('cookie-parser');

dotenv.config();

const PORT: number = parseInt(process.env.COMMANDER_PORT as string || '3009');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/', authApi);
app.use('/', commandApi);

app.listen(PORT, () => {
    console.log('Server started on http://localhost:' + PORT);
});