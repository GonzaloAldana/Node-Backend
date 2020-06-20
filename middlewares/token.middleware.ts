import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export default () => {
    return {
        verify: (req: Request, res: Response, next: NextFunction) => {
            const bearerHeader = req.headers['authorization'];
            if (typeof bearerHeader !== 'undefined') {
                const bearer = bearerHeader.split(' ');
                const bearerToken = bearer[1];
                jwt.verify(bearerToken, 'secretKey', (err: any, tokenDecoded: any) => {
                    if (err) {
                        return res.status(403).json({
                            ok: false,
                            msg: 'No tiene acceso'
                        });
                    }

                    req.body.authUser = tokenDecoded;
                    next();
                })
            }
            else {
                return res.status(401).json({
                    ok: false,
                    msg: 'Acceso restringido, inicia sesión'
                });
            }
        }
    }
};