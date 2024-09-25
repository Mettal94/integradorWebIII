import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../db/conexion';
import { Profesor } from '../models/profesorModel';
import { Curso } from '../models/cursoModel';
import { check, validationResult } from "express-validator";

const profesorRepository = AppDataSource.getRepository(Profesor);

export const validarProf = () => [
    check('dni').notEmpty().withMessage('DNI no puede estar vacío')
    .isLength({min:6}).withMessage('DNI debe tener como mínimo 6 caracteres '),
    check('nombre').notEmpty().withMessage('Nombre no puede estar vacío')
    .isLength({min:3}).withMessage('Nombre debe tener como mínimo 3 caracteres'),
    check('apellido').notEmpty().withMessage('Apellido no puede estar vacío')
    .isLength({min:3}).withMessage('Apellido debe tener como mínimo 3 caracteres'),
    check('email').notEmpty().withMessage('Email no puede estar vacío')
    .isEmail().withMessage('Email no es válido'),
    check('telefono').notEmpty().withMessage('Debe ingresar un teléfono')
    .isLength({min:8}).withMessage('Teléfono no válido'),
    check('profesion').notEmpty().withMessage('Profesión no puede estar vacío'),
    (req:Request,res:Response,next:NextFunction)=>{
        const errores = validationResult(req);
        next();
    }
]
export const consultarTodos = async (req: Request, res: Response) => {
    try{
        const profesores = await profesorRepository.find();
        res.render('listarProfesores', {
            pagina: 'Lista de Profesores',
            varnav: 'listar',
            profesores
        });
    } catch (err: unknown) {
        if (err instanceof Error){
            res.status(500).send(err.message);
        }
    }
    
};

export const traerProfes = async (req:Request,res:Response):Promise<Profesor[] |null |undefined>=>{
    try{
        const profesores = await profesorRepository.find();
        if(profesores){
            return profesores;
        } else {
            return null;
        }
    }catch(err:unknown){
        if(err instanceof Error){
            res.render('Profesor no encontrado');
        }
    }
}

export const consultarUno = async (req: Request, res: Response): Promise<Profesor | null | undefined> => {
    const id: number = parseInt(req.params.id);
    try{
        const profesor = await profesorRepository.findOne({where: {id: id}});
        if(Profesor){
            return profesor;
        }else{
            return null;
        }
    }catch (err: unknown) {
        if (err instanceof Error){
            res.status(500).send(err.message);
        }
    }
    
};

export const insertar = async (req: Request, res: Response) => {
    
    const errores = validationResult(req);
    if(!errores.isEmpty()){
       return res.render('crearProfesores',{
            pagina: 'Crear Profesor',
            errores: errores.array()
        });
    }
    
    const {dni, nombre, apellido, email, profesion, telefono} = req.body;
    try{
        await AppDataSource.transaction(async(transactionalEntityManager) => {
            const profesorRepository = transactionalEntityManager.getRepository(Profesor);
            const existeProfesor = await profesorRepository.findOne({
                where: [
                    { dni },
                    { email }
                ]
            });
            if(existeProfesor){
                throw new Error('El profesor ya existe');
            }
            const nuevoProfesor = profesorRepository.create({dni, nombre, apellido, email, profesion, telefono});
            await profesorRepository.save(nuevoProfesor); 
        });
        const profesores = await AppDataSource.getRepository(Profesor).find();
        res.render('listarProfesores', {
            pagina: 'Lista de Profesores',
            profesores
        });
    }catch (err: unknown) {
        if (err instanceof Error){
            res.status(500).send(err.message);
        }
    }   
};

export const modificar = async (req: Request, res: Response) => {

    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        const profesor = await consultarUno(req, res);
        return res.render('modificarProfesores', {
            pagina: 'Modificar Profesor',
            errores: errores.array(),
            profesor, 
        });
    }
    try{
        const profesor = await profesorRepository.findOneBy({id: parseInt(req.params.id)});
        if(!profesor) return res.status(404).json({message: "Profesor no encontrado"});

        profesorRepository.merge(profesor, req.body);
        const result = await profesorRepository.save(profesor);
        res.redirect('/profesores/listarProfesores');
    }catch (err: unknown) {
        if (err instanceof Error){
            res.status(500).send(err.message);
        }
    }     
};

export const eliminar = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        console.log(`ID recibido para eliminar: ${id}`); 
        await AppDataSource.transaction(async transactionalEntityManager => {
            const cursoRepository = transactionalEntityManager.getRepository(Curso);
            const profesorRepository = transactionalEntityManager.getRepository(Profesor);

            const cursosRelacionados = await cursoRepository.count({ where: { profesor: { id: Number(id) } } });
            if (cursosRelacionados > 0) {
                throw new Error('No es posible eliminar un profesor actualmente dictando cursos.');
            }
            const deleteResult = await profesorRepository.delete(id);

            if (deleteResult.affected === 1) {
                return res.json({ mensaje: 'Profesor eliminado' }); 
            } else {
                throw new Error('Profesor no encontrado');
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