import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log(__dirname)
export default __dirname;



import multer from 'multer';
//funcion para admitir imganes  y archivos de texto
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './src/uploads')
    },
    filename: function (req, file, cb) {
       
        let tipo=file.mimetype.split("/")[0]
        if(tipo!=="image"){
            return cb(new Error("Solo se admiten imagenes...!"))
        } 

        cb( null, Date.now() + "-" + file.originalname )

    }
})

export const upload = multer({ storage: storage });

const SECRET = "CoderCoder123"
export const generaHash = password => bcrypt.hashSync( password, bcrypt.genSaltSync(10) );
export const validaPassword = (password, hash) => bcrypt.compareSync( password, hash );