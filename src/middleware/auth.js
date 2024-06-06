import jwt from 'jsonwebtoken';
import { SECRET } from '../utils.js';


/* export const authToken = (req,res,next )=>{
    
    if(!req.headers.authorization){//pregunto por si vienen algo en el header
        res.setHeader('Content-Type','application/json');
        return res.status(401).json({error:`Usuario no autenticado`})
    }
    next()
} */

export const authTokenPermisos = (permisos = []) => {// auth(["admin", "user"])  o  auth(["admin"])

	return (req, res, next) => {
		permisos = permisos.map((p) => p.toLowerCase());

		if (permisos.includes("public")) {
			return next();
		}

		if (!req.user?.role) {//si existe usuario y rol 
			res.setHeader("Content-Type", "application/json");
			return res.status(401).json({ error: `No tienes los roles permitidos para acceder a esta informacion` });
		}

		if (!permisos.includes(req.user.role.toLowerCase())) {
			res.setHeader("Content-Type", "application/json");
			return res.status(403).json({ error: `Acceso denegado por rol insuficiente` });
		}

		return next();
	};
};

export  const authToken = (req, res, next) => {
    const token = req.cookies.CookiePrueba; //  el nombre de la cookie DEBE SER correcto
    if (!token) {
        return res.status(401).json({ message: 'Token no provisto' });
    }
    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Fallo error al autenticar token' });
        }
        req.user = decoded; // Aquí se guarda el usuario decodificado en req.user
        next();
    });
};

