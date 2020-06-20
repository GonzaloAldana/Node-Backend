import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import ENV from './environments/env.production'
import AuthToken from './middlewares/token.middleware';
import MongoDBHelper from './helpers/mongodb.helper';

const app = express();
const token = AuthToken();
const mongoDB = MongoDBHelper.getInstance(ENV.MONGODB);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

app.get('/api/auth/test', (req: Request, res: Response) => {
    res.status(200).json({
        ok: true,
        msg: 'Llamada API prueba correcta'
    });
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { userName, password, email } = req.body;

    const user = await mongoDB.db.collection('users').findOne({ email: email });

    if (user) {
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario o contraseña no válidos'
            });
        }

        const validUser = {
            email: user.email, userName: user.userName, rol: user.rol
        };

        jwt.sign(validUser, 'secretKey', { expiresIn: '120s' }, (err: any, token) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Ocurrió un error no esperado'
                });
            }

            res.status(200).json({
                ok: true,
                msg: 'Usuario autenticado correctamente',
                payload: {
                    userName: validUser.userName,
                    rol: validUser.rol,
                    token: token
                }
            });
        });
    }
    else {
        return res.status(404).json({
            ok: false,
            msg: 'Usuario o contraseña no válidos'
        });
    }

});

app.post('/api/auth/createUser', async (req: Request, res: Response) => {
    const { email, userName, password, rol } = req.body;

    const hashPassword = bcrypt.hashSync(password, 10);

    const newUser = {
        email, userName, password: hashPassword, rol
    };

    const insert = await mongoDB.db.collection('users').insertOne(newUser);

    res.status(200).json({
        ok: true,
        msg: 'Usuario creado correctamente',
        uid: insert.insertedId
    });
});

app.get('/api/auth/GetCustomers', token.verify, (req: Request, res: Response) => {
    const { authUser } = req.body;

    const mockCustomer = [{
        id: 1,
        name: 'Juan'
    }, {
        id: 2,
        name: 'Raúl'
    }];

    res.status(200).json({
        ok: true,
        msg: 'Permiso de acceso concedido',
        data: mockCustomer,
        user: authUser
    });


});

app.listen(ENV.API.PORT, async () => {
    console.log(`Servidor corriendo chido puerto ${ENV.API.PORT}`);
    await mongoDB.connect();
});

process.on('unhandledRejection', async (err: any) => {
    await mongoDB.close();
    process.exit();
});