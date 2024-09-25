import express from 'express';
import {calificar, cancelarInscripcion, consultarInscripciones, consultarxEstudiante,
        consultarxCurso, inscribir, consultarUno,
        validarIns} from '../controllers/inscripcionController';
import { traerEstudiantes } from '../controllers/estudiantesController';
import { traerCursos } from '../controllers/cursosController';        
const router = express.Router();


router.get('/listarInscripciones',consultarInscripciones);

router.get('/crearInscripciones', async (req,res) => {
        try{
             const estudiantes = await traerEstudiantes(req,res);
             const cursos = await traerCursos(req,res);
             res.render('crearInscripciones', {
                pagina: 'Crear Inscripciones',
                estudiantes,
                cursos
             });   
        }catch(err:unknown){
          if(err instanceof Error){
               res.status(500).json(err.message);
          }
        }
});

router.post('/',inscribir );

router.get('/inscripcionesEstudiante', async (req, res) => {
        try {
            const estudiantes = await traerEstudiantes(req, res);
            const inscripciones = await consultarxEstudiante(req,res);
    
            res.render('inscripcionesEstudiante', {
                pagina: 'Inscripciones por Estudiante',
                estudiantes,
                inscripciones,
            });
        } catch (err) {
            if (err instanceof Error) {
                res.status(500).json(err.message);
            }
        }
});
router.get('/xCurso/:id',consultarxCurso );

router.get('/calificar/:curso_id/:estudiante_id', async (req,res) => {
        try{
                const inscripcion = await consultarUno(req,res);
                res.render('calificarInscripciones', {
                        pagina:'Calificar Inscripción',
                        inscripcion,
                });
        }catch(err:unknown){
          if(err instanceof Error){
               res.status(500).json(err.message);
          }
        }
});
router.put('/:curso_id/:estudiante_id', validarIns(),calificar);

router.delete('/:curso_id/:estudiante_id',cancelarInscripcion);

export default router;