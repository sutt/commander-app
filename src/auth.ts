import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import vms from './data/vm-instances.json';

dotenv.config();
const SECRET_KEY: string    = process.env.COMMANDER_SECRET_KEY as string;
const USERNAME: string      = process.env.COMMANDER_USERNAME as string;
const PASSWORD: string      = process.env.COMMANDER_PASSWORD as string;

const users: { [key: string]: string } = {[USERNAME]: bcrypt.hashSync(PASSWORD, 10)}; 

const router = Router();

export async function authenticate(req: Request): Promise<boolean> {
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


router.get('/', async (req: Request, res: Response) => {
    const loggedIn = await authenticate(req)
    if (loggedIn) {
        return res.render('index', { instances: vms });
    } else {
        return res.redirect('/login-form');
    }
});


router.get('/login-form', (req: Request, res: Response) => {
    res.render('auth');
});


router.post('/login', (req: Request, res: Response) => {
    
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


export default router;