import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bodyParser, { json } from 'body-parser';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import path from 'path';
// import * as cookieParser from 'cookie-parser';
const cookieParser = require('cookie-parser');

const SECRET_KEY: string = 'yourSuperSecretKey'; // This should be kept secret and possibly in environment variables
const users: { [key: string]: string } = {}; // In-memory store for users. This can be a file or other persistent storage in a real application.

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }))


async function authenticate(req: Request): Promise<boolean> {
    const token: string | undefined = req.cookies['commander_token'] as string;
    
    if (!token) {
        console.log("auth: token not found");
        return false;
    }

    return new Promise((resolve) => {
        jwt.verify(token, SECRET_KEY, (err: any, decoded: any) => {
            if (!err) {
                console.log("auth: success");
                resolve(true);
            } else {
                console.log("auth: token not valid");
                resolve(false);
            }
        });
    });
}


app.get('/', async (req: Request, res: Response) => {
    const loggedIn = await authenticate(req)
    if (loggedIn) {
        return res.render('protect')
    } else {
        return res.redirect('/login-form');
    }
});


app.get('/login-form', (req: Request, res: Response) => {
    res.render('auth');
});


app.post('/login', (req: Request, res: Response) => {
    
    const { username, password } = req.body;
    
    const hashedPassword = users[username];
    if (!hashedPassword) {
        return res.status(401).json({ error: 'Invalid username' });
    }
    if (bcrypt.compareSync(password, hashedPassword)) {
        const token: string = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
        res.cookie('commander_token', token, {
             httpOnly: false, 
             secure: false,
             maxAge: 60 * 60 * 1000,
            }
        );
        res.redirect('/');
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});


app.get('/protected', async (req: Request, res: Response) => {
    const loggedIn = await authenticate(req)
    if (loggedIn) {
        return res.render('protect')
    } else {
        return res.status(403).send('Not logged in');
    }
});


app.get('/data-protected', async (req: Request, res: Response) => {
    const loggedIn = await authenticate(req)
    if (loggedIn) {
        return res.json({ data: 'This is protected data' });
    } else {
        return res.status(403).json({});
    }
});


const _username = 'username'
const _password = 'password'
users[_username] = bcrypt.hashSync(_password, 10);

app.listen(3009, () => {
    console.log('Server started on http://localhost:3009');
});