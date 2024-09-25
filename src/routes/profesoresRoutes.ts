import express from 'express';
import {consultarTodos, consultarUno, insertar, modificar, eliminar, validarProf} from '../controllers/profesoresController';
const router = express.Router();


router.get('/listarProfesores', consultarTodos);

router.get('/crearProfesores', (req,res) => {
    res.render('crearProfesores', {
        pagina: 'Crear Profesor',
    });
});

router.post('/', validarProf(), insertar);

router.get('/modificarProfesores/:id', async (req,res) => {
    try{
        const profesor = await consultarUno(req, res); 
        if (!profesor) {
            return res.status(404).send('Profesor no encontrado');
        }
        res.render('modificarProfesores', {
            profesor, 
        });
    }catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});

router.route('/:id')
    .get(consultarUno)
    .put(validarProf(),modificar)
    .delete(eliminar);

export default router;