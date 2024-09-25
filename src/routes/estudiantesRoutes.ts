//Requerimos express en la ruta del estudiante
import express from 'express';
import {consultarTodos, consultarUno, insertar, modificar, eliminar, validar} from '../controllers/estudiantesController';
//Con una constante inicializamos el Router de express
const router = express.Router();


router.get('/listarEstudiantes', consultarTodos);

router.get('/crearEstudiantes', (req, res) => {
    res.render('crearEstudiantes', {
        pagina: 'Crear Estudiante',
    });
});

router.post('/',validar(),insertar);

router.get('/modificarEstudiantes/:id', async (req, res) => {
    try {
        const estudiante = await consultarUno(req, res); 
        if (!estudiante) {
            return res.status(404).send('Estudiante no encontrado');
        }
        res.render('modificarEstudiantes', {
            estudiante, 
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});


router.route('/:id')
    .get(consultarUno)
    .put(validar(),modificar)
    .delete(eliminar);

export default router;