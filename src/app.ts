import express, {Request, Response } from "express";
import cors from 'cors';
import morgan from "morgan";
import path from 'path';
import "reflect-metadata";
import estudiantesRoutes from "./routes/estudiantesRoutes";
import profesoresRoutes from "./routes/profesoresRoutes";
import cursosRoutes from "./routes/cursosRoutes";
import inscripcionRoutes from "./routes/inscripcionRoutes";
import methodOverride from "method-override";
const app = express();


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../public/views'));
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(morgan('dev'));
app.use(cors());

app.get('/', (req: Request, res: Response)=>{
    console.log(__dirname);
    return res.render('index',{
        pagina: 'Gestión Universidad'
    });
});

app.use('/estudiantes', estudiantesRoutes);
app.use('/profesores', profesoresRoutes);
app.use('/cursos', cursosRoutes);
app.use('/inscripciones', inscripcionRoutes);


//hacemos un cambio
export default app;