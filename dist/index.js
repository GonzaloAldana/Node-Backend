"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_production_1 = __importDefault(require("./environments/env.production"));
const token_middleware_1 = __importDefault(require("./middlewares/token.middleware"));
const mongodb_helper_1 = __importDefault(require("./helpers/mongodb.helper"));
const app = express_1.default();
const token = token_middleware_1.default();
const mongoDB = mongodb_helper_1.default.getInstance(env_production_1.default.MONGODB);
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use(cors_1.default({ origin: true, credentials: true }));
app.get('/api/auth/test', (req, res) => {
    res.status(200).json({
        ok: true,
        msg: 'Llamada API prueba correcta'
    });
});
app.post('/api/auth/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userName, password, email } = req.body;
    const user = yield mongoDB.db.collection('users').findOne({ email: email });
    if (user) {
        if (!bcryptjs_1.default.compareSync(password, user.password)) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario o contraseña no válidos'
            });
        }
        const validUser = {
            email: user.email, userName: user.userName, rol: user.rol
        };
        jsonwebtoken_1.default.sign(validUser, 'secretKey', { expiresIn: '120s' }, (err, token) => {
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
}));
app.post('/api/auth/createUser', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, userName, password, rol } = req.body;
    const hashPassword = bcryptjs_1.default.hashSync(password, 10);
    const newUser = {
        email, userName, password: hashPassword, rol
    };
    const insert = yield mongoDB.db.collection('users').insertOne(newUser);
    res.status(200).json({
        ok: true,
        msg: 'Usuario creado correctamente',
        uid: insert.insertedId
    });
}));
app.get('/api/auth/GetCustomers', token.verify, (req, res) => {
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
app.listen(env_production_1.default.API.PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Servidor corriendo chido puerto ${env_production_1.default.API.PORT}`);
    yield mongoDB.connect();
}));
process.on('unhandledRejection', (err) => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoDB.close();
    process.exit();
}));
