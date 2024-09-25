import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../db/conexion';
import { Curso } from '../models/cursoModel';
import { Profesor } from '../models/profesorModel';
import { check, validationResult } from "express-validator";
const cursoRepository = AppDataSource.getRepository(Curso);

export const validarCur = () =>[
    check('nombre').isEmpty().withMessage('Se requiere un nombre para el curso')
    .isLength({min:5}).withMessage('Curso debe tener como mínimo 5 caracteres'),
    check('descripcion').isEmpty().withMessage('Se requiere una descripción')
    .isLength({min:6}).withMessage('Descripción debe tener como mínimo 6 caracteres'),
    (req:Request,res:Response,next:NextFunction)=>{
        const errores = validationResult(req);
        next();
    }
]

export const consultarTodos = async (req: Request, res: Response) => {
    try{
        const cursos = await cursoRepository.find({relations: ['profesor']});
        res.render('listarCursos', {
            pagina:'Lista de cursos',
            varnav: 'listar',
            cursos
        });
    }catch(err: unknown){
        if(err instanceof Error){
            res.status(500).send(err.message);
        }
    }
};

export const traerCursos = async (req: Request, res: Response) => {
    try{
        const cursos = await cursoRepository.find({relations: ['profesor']});
        if(cursos){
            return cursos;
        }else{
            return null;
        }
    }catch(err: unknown){
        if(err instanceof Error){
            res.status(500).send(err.message);
        }
    }
};

export const consultarUno = async (req: Request, res: Response): Promise<Curso | null | undefined> => {
    const {id}=req.params;
    try{
        const curso = await cursoRepository.findOne({
            where: {id: parseInt(req.params.id)},
            relations: ['profesor']
        });
        if(curso){
            return curso;
        }else{
            return null;
        }
    }catch(err: unknown){
        if(err instanceof Error){
            res.status(500).send(err.message);
        }
    }
};

export const insertar = async (req: Request, res: Response) => {
   
    const errores = validationResult(req);
    if(!errores.isEmpty()){
       return res.render('crearCursos',{
            pagina: 'Crear Curso',
            errores: errores.array()
        });
    }
   
    const { nombre, descripcion, profesor_id } = req.body;
        
    try {
        await AppDataSource.transaction(async transactionalEntityManager => {
           
            const profesor = await transactionalEntityManager.findOne(Profesor, { where: { id: profesor_id } });

            if (!profesor) {
                return res.status(400).json({ mensaje: 'El profesor no existe' });
            }

            
            const nuevoCurso = new Curso();
            nuevoCurso.nombre = nombre;
            nuevoCurso.descripcion = descripcion;
            nuevoCurso.profesor = profesor;

            const cursoInsertado = await transactionalEntityManager.save(nuevoCurso);
            const cursos = await AppDataSource.getRepository(Curso).find({relations: ['profesor']});
            res.render('listarCursos', {
                pagina:'Lista de cursos',
                cursos
            });
        });
    }catch(err: unknown){
        if(err instanceof Error){
            res.status(500).send(err.message);
        }
    }
};

export const modificar = async (req: Request, res: Response) => {
    
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        const curso = await consultarUno(req, res);
        return res.render('modificarCursos', {
            pagina: 'Modificar Curso',
            errores: errores.array(),
            curso, 
        });
    }
    
    const { id } = req.params;
    const { nombre, descripcion, profesor_id } = req.body;
    try {
        await AppDataSource.transaction(async transactionalEntityManager => {
           
            const profesor = await transactionalEntityManager.findOne(Profesor, { where: { id: profesor_id } }); 
            if (!profesor) {
                return res.status(400).json({ mensaje: 'El profesor no existe' });
            } 
            
            const curso = await transactionalEntityManager.findOne(Curso, { where: { id: parseInt(id, 10) } });
            if (!curso) {
                return res.status(404).json({ mensaje: 'El curso no existe' });
            }

            transactionalEntityManager.merge(Curso, curso, {
                nombre,
                descripcion,
                profesor,
            });

            // Guardar los cambios
            const cursoActualizado = await transactionalEntityManager.save(curso);
            return res.redirect('/cursos/listarCursos');
        });
    }catch(err: unknown){
        if(err instanceof Error){
            res.status(500).send(err.message);
        }
    }
};

export const eliminar = async (req: Request, res: Response) => {
    const {id}=req.params;
    try {
        const cursoRepository = AppDataSource.getRepository(Curso);
        const curso = await cursoRepository.findOne({ where: { id: parseInt(id, 10) } });
        if (!curso) {
            return res.status(404).json({ mensaje: 'El curso no existe' });
        }
        await cursoRepository.remove(curso);
        res.status(200).json({ mensaje: 'Curso eliminado' });
    } catch(err){
        if (err instanceof Error){
            res.status(500).send(err.message);
        }
    }

};