import express from "express";
import {consultarTodos, consultarUno, insertar, modificar, eliminar, validarCur} from '../controllers/cursosController';
import { traerProfes} from "../controllers/profesoresController";
const router = express.Router();



router.get('/listarCursos', consultarTodos)

router.get('/crearCursos', async (req, res) =>{
    try{
        const profesores = await traerProfes(req,res);
        res.render('crearCursos', {
            pagina: 'Crear Curso',
            profesores
        });
    } catch(err:unknown){
          if(err instanceof Error){
               res.status(500).json(err.message);
          }
    }
});
router.post('/', validarCur(), insertar);

router.get('/modificarCursos/:id', async (req,res) => {
    try{
        const curso = await consultarUno(req,res);
        const profesores = await traerProfes(req,res);
        if(!curso){
            return res.status(404).send('Curso no encontrado');
        }
        res.render('modificarCursos', {
            curso,
            profesores
        });
    }catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
router.route('/:id')
    .get(consultarUno)
    .put(validarCur(), modificar)
    .delete(eliminar);

export default router;