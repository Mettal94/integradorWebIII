import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../db/conexion';
import { Estudiante } from '../models/estudianteModel';
import { Inscripcion } from '../models/inscripcionModel';
import { check, validationResult } from "express-validator";
const estudianteRepository = AppDataSource.getRepository(Estudiante);

export const validar = ()=>[
    check('dni').notEmpty().withMessage('DNI no puede estar vacío')
    .isLength({min:6}).withMessage('DNI debe tener como mínimo 6 caracteres'),
    check('nombre').notEmpty().withMessage('Nombre no puede estar vacío')
    .isLength({min: 3}).withMessage('Nombre debe tener como mínimo 3 caracteres'),
    check('apellido').notEmpty().withMessage('Apellido no puede estar vacío')
    .isLength({min: 3}).withMessage('Apellido debe tener como mínimo 3 caracteres'),
    check('email').notEmpty().withMessage('Email no puede estar vacío')
    .isEmail().withMessage('Email no es válido'),
    (req:Request,res:Response,next:NextFunction)=>{
        const errores = validationResult(req);
        next();
    }
]

export const consultarTodos = async (req: Request, res: Response) => {
    try{
        const estudiantes = await estudianteRepository.find();
        res.render('listarEstudiantes', {
            pagina: 'Lista de Estudiantes',
            varnav: 'listar',
            estudiantes 

        });
    }catch(err: unknown){
        if(err instanceof Error){
            res.status(500).send(err.message);
        }
    }
};

export const traerEstudiantes = async (req:Request, res:Response) => {
    try{
        const estudiantes = estudianteRepository.find();
        if(estudiantes){
            return estudiantes;
        }else{
            return null;
        }
    }catch(err: unknown){
        if(err instanceof Error){
            res.status(500).send(err.message);
        }
    }
};

export const consultarUno = async (req: Request, res: Response): Promise<Estudiante | null | undefined> => {
    const id: number = parseInt(req.params.id); 
    try{
        const estudiante = await estudianteRepository.findOne({where: {id: id}});
        if(estudiante){
            return estudiante;
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
       return res.render('crearEstudiantes',{
            pagina: 'Crear Estudiante',
            errores: errores.array()
        });
    }
    
    const {dni, nombre, apellido, email} = req.body;

    try{
        await AppDataSource.transaction(async (transactionalEntityManager) => {
            const estudianteRepository = transactionalEntityManager.getRepository(Estudiante);
            const existeEstudiante = await estudianteRepository.findOne({
                where: [
                    { dni },
                    { email }
                ]
            });

            if (existeEstudiante) {
                throw new Error('El estudiante ya existe.');
            }
            const nuevoEstudiante = estudianteRepository.create({ dni, nombre, apellido, email });
            await estudianteRepository.save(nuevoEstudiante);
        });
        const estudiantes = await AppDataSource.getRepository(Estudiante).find();
        res.render('listarEstudiantes', {
            pagina: 'Lista de Estudiantes',
            estudiantes
        });
    }catch(err: unknown){
        if(err instanceof Error){
            res.status(500).send(err.message);
        }
    }
};

export const modificar = async (req: Request, res: Response) => {
    const { id } = req.params; 
    const { dni, nombre, apellido, email } = req.body; 

    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        const estudiante = await consultarUno(req, res);
        return res.render('modificarEstudiantes', {
            pagina: 'Modificar Estudiante',
            errores: errores.array(),
            estudiante, 
        });
    }
    try {   
        const estudiante = await estudianteRepository.findOne({ where: { id: parseInt(id) } });
        
        if (!estudiante) {
            return res.status(404).send('Estudiante no encontrado');
        }
        estudianteRepository.merge(estudiante, { dni, nombre, apellido, email });
        await estudianteRepository.save(estudiante);
        return res.redirect('/estudiantes/listarEstudiantes');
    } catch (error) {
        console.error('Error al modificar el estudiante:', error);
        return res.status(500).send('Error del servidor');
    }
};

export const eliminar = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await AppDataSource.transaction(async transactionalEntityManager => {
            const inscripcionRepository = transactionalEntityManager.getRepository(Inscripcion);
            const estudianteRepository = transactionalEntityManager.getRepository(Estudiante);

            const cursosRelacionados = await inscripcionRepository.count({ where: { estudiante: { id: Number(id) } } });
            if (cursosRelacionados > 0) {
                throw new Error('No es posible eliminar un estudiante actualmente cursando materias.');
            }
            const deleteResult = await estudianteRepository.delete(id);

            if (deleteResult.affected === 1) {
                return res.json({ mensaje: 'Estudiante eliminado' }); 
            } else {
                throw new Error('Estudiante no encontrado');
            }
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(400).json({ mensaje: err.message });
        } else {
            res.status(400).json({ mensaje: 'Error' });
        }
    }
};