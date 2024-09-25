import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../db/conexion';
import { Estudiante } from '../models/estudianteModel';
import { Curso } from '../models/cursoModel';
import { Inscripcion } from '../models/inscripcionModel';
import { check, validationResult } from "express-validator";

export const validarIns = () =>[
    check('nota').isInt({min: 1, max: 10}).withMessage('Se debe calificar entre 1 y 10'),
    (req:Request,res:Response,next:NextFunction)=>{
        const errores = validationResult(req);
        next();
    }
]

const inscripcionRepository = AppDataSource.getRepository(Inscripcion);

export const consultarInscripciones = async (req: Request, res: Response) => {
    try {
        const inscripciones = await inscripcionRepository.find({ relations: ['estudiante', 'curso'] });
        res.render('listarInscripciones', {
            pagina: 'Listado de inscripciones',
            varnav: 'listar',
            inscripciones,
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
};

export const consultarUno = async (req:Request, res:Response) => {
    const {curso_id, estudiante_id} = req.params;
    try{
        const inscripcion = await inscripcionRepository.findOne({
            where: {curso_id: parseInt(curso_id), estudiante_id: parseInt(estudiante_id)},
            relations: ['estudiante', 'curso']
        });
        if(inscripcion){
            return inscripcion;
        } else {
            return null;
        }
    }catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
};

export const consultarxEstudiante = async (req: Request, res: Response) => {
    try {
        const inscripciones = await inscripcionRepository.find({ 
            where: { estudiante_id: parseInt(req.params.id) },
            relations: ['estudiante', 'curso'] 
        });
        if (inscripciones.length > 0) {
            return inscripciones;
        }else{
            return null;
        }
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
};

export const consultarxCurso = async (req: Request, res: Response) => {
    try {
        const inscripciones = await inscripcionRepository.findBy({ curso_id: parseInt(req.params.id) });
        if (inscripciones) {
            res.render('listarInscripciones', {
                pagina: 'Inscripciones de curso',
                inscripciones
            })
        } else {
            res.status(400).json({ mensaje: 'No existen inscripciones en el curso' });
        }
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
};

export const inscribir = async (req: Request, res: Response) => {
    const { curso_id, estudiante_id, nota } = req.body;
    try {
        await AppDataSource.transaction(async (transactionaEntityManager) => {
            const inscripcionRepository = transactionaEntityManager.getRepository(Inscripcion);
            const existe = await inscripcionRepository.findOneBy({ curso_id: parseInt(curso_id), estudiante_id: parseInt(estudiante_id) });
            if (existe) {
                res.render('Inscripción ya efectuada');
            } else {
                const agregar = await inscripcionRepository.create({ curso_id, estudiante_id, nota });
                const resultado = await inscripcionRepository.save(agregar);
            }
        });
        const inscripciones = await inscripcionRepository.find({ relations: ['estudiante', 'curso'] });
        res.render('listarInscripciones', {
            pagina: 'Lista de inscripciones',
            inscripciones,
        })
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
};
export const cancelarInscripcion = async (req: Request, res: Response) => {
    const { curso_id, estudiante_id } = req.params;
    try {
        await AppDataSource.transaction(async transactionalEntityManager => {

            const estudiante = await transactionalEntityManager.findOne(Estudiante, { where: { id: parseInt(estudiante_id, 10) } });
            if (!estudiante) {
                return res.status(400).json({ mens: 'Estudiante no existe' });
            }


            const curso = await transactionalEntityManager.findOne(Curso, { where: { id: parseInt(curso_id, 10) } });
            if (!curso) {
                return res.status(400).json({ mens: 'Curso no existe' });
            }

            const inscripcion = await transactionalEntityManager.findOne(Inscripcion, {
                where: {
                    estudiante: { id: parseInt(estudiante_id, 10) },
                    curso: { id: parseInt(curso_id, 10) }
                }
            });
            if (!inscripcion) {
                return res.status(400).json({ mens: 'La inscripción no existe' });
            }

            if (inscripcion.nota > 0) {
                return res.status(400).json({ mens: 'No se puede cancelar la inscripción porque el estudiante ya ha sido calificado' });
            }

            await transactionalEntityManager.remove(inscripcion);

            res.status(200).json({ mens: 'Inscripción cancelada' });
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
};

export const calificar = async (req: Request, res: Response) => {
    
    const errores = validationResult(req);
        if (!errores.isEmpty()) {
            const inscripcion = await consultarUno(req,res);
            return res.render('calificarInscripciones', {
                    pagina:'Calificar Inscripción',
                    errores: errores.array(),
                    inscripcion,
            });
        }
    
    const { estudiante_id, curso_id } = req.params; 
    const { nota } = req.body; 
    try {

        if (nota == null || isNaN(nota) || nota < 0 || nota > 10) { 
            return res.status(400).json({ mensaje: "Nota inválida, debe ser un número entre 0 y 10" });
        }

        const inscripcion = await inscripcionRepository.findOneBy({ 
            estudiante_id: parseInt(estudiante_id, 10), 
            curso_id: parseInt(curso_id, 10) 
        });

        if (!inscripcion) {
            return res.status(404).json({ mensaje: "Inscripción no encontrada para el estudiante en el curso especificado" });
        }
        inscripcion.nota = nota;
        inscripcion.fecha = new Date(); 

        const resultado = await inscripcionRepository.save(inscripcion);

        res.redirect('/inscripciones/listarInscripciones');
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
};
