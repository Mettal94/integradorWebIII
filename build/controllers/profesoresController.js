"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminar = exports.modificar = exports.insertar = exports.consultarUno = exports.traerProfes = exports.consultarTodos = exports.validarProf = void 0;
const conexion_1 = require("../db/conexion");
const profesorModel_1 = require("../models/profesorModel");
const cursoModel_1 = require("../models/cursoModel");
const express_validator_1 = require("express-validator");
const profesorRepository = conexion_1.AppDataSource.getRepository(profesorModel_1.Profesor);
const validarProf = () => [
    (0, express_validator_1.check)('dni').notEmpty().withMessage('DNI no puede estar vacío')
        .isLength({ min: 6 }).withMessage('DNI debe tener como mínimo 6 caracteres '),
    (0, express_validator_1.check)('nombre').notEmpty().withMessage('Nombre no puede estar vacío')
        .isLength({ min: 3 }).withMessage('Nombre debe tener como mínimo 3 caracteres'),
    (0, express_validator_1.check)('apellido').notEmpty().withMessage('Apellido no puede estar vacío')
        .isLength({ min: 3 }).withMessage('Apellido debe tener como mínimo 3 caracteres'),
    (0, express_validator_1.check)('email').notEmpty().withMessage('Email no puede estar vacío')
        .isEmail().withMessage('Email no es válido'),
    (0, express_validator_1.check)('telefono').notEmpty().withMessage('Debe ingresar un teléfono')
        .isLength({ min: 8 }).withMessage('Teléfono no válido'),
    (0, express_validator_1.check)('profesion').notEmpty().withMessage('Profesión no puede estar vacío'),
    (req, res, next) => {
        const errores = (0, express_validator_1.validationResult)(req);
        next();
    }
];
exports.validarProf = validarProf;
const consultarTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profesores = yield profesorRepository.find();
        res.render('listarProfesores', {
            pagina: 'Lista de Profesores',
            varnav: 'listar',
            profesores
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.consultarTodos = consultarTodos;
const traerProfes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profesores = yield profesorRepository.find();
        if (profesores) {
            return profesores;
        }
        else {
            return null;
        }
    }
    catch (err) {
        if (err instanceof Error) {
            res.render('Profesor no encontrado');
        }
    }
});
exports.traerProfes = traerProfes;
const consultarUno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    try {
        const profesor = yield profesorRepository.findOne({ where: { id: id } });
        if (profesorModel_1.Profesor) {
            return profesor;
        }
        else {
            return null;
        }
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.consultarUno = consultarUno;
const insertar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errores = (0, express_validator_1.validationResult)(req);
    if (!errores.isEmpty()) {
        return res.render('crearProfesores', {
            pagina: 'Crear Profesor',
            errores: errores.array()
        });
    }
    const { dni, nombre, apellido, email, profesion, telefono } = req.body;
    try {
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const profesorRepository = transactionalEntityManager.getRepository(profesorModel_1.Profesor);
            const existeProfesor = yield profesorRepository.findOne({
                where: [
                    { dni },
                    { email }
                ]
            });
            if (existeProfesor) {
                throw new Error('El profesor ya existe');
            }
            const nuevoProfesor = profesorRepository.create({ dni, nombre, apellido, email, profesion, telefono });
            yield profesorRepository.save(nuevoProfesor);
        }));
        const profesores = yield conexion_1.AppDataSource.getRepository(profesorModel_1.Profesor).find();
        res.render('listarProfesores', {
            pagina: 'Lista de Profesores',
            profesores
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.insertar = insertar;
const modificar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errores = (0, express_validator_1.validationResult)(req);
    if (!errores.isEmpty()) {
        const profesor = yield (0, exports.consultarUno)(req, res);
        return res.render('modificarProfesores', {
            pagina: 'Modificar Profesor',
            errores: errores.array(),
            profesor,
        });
    }
    try {
        const profesor = yield profesorRepository.findOneBy({ id: parseInt(req.params.id) });
        if (!profesor)
            return res.status(404).json({ message: "Profesor no encontrado" });
        profesorRepository.merge(profesor, req.body);
        const result = yield profesorRepository.save(profesor);
        res.redirect('/profesores/listarProfesores');
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.modificar = modificar;
const eliminar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        console.log(`ID recibido para eliminar: ${id}`);
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const cursoRepository = transactionalEntityManager.getRepository(cursoModel_1.Curso);
            const profesorRepository = transactionalEntityManager.getRepository(profesorModel_1.Profesor);
            const cursosRelacionados = yield cursoRepository.count({ where: { profesor: { id: Number(id) } } });
            if (cursosRelacionados > 0) {
                throw new Error('No es posible eliminar un profesor actualmente dictando cursos.');
            }
            const deleteResult = yield profesorRepository.delete(id);
            if (deleteResult.affected === 1) {
                return res.json({ mensaje: 'Profesor eliminado' });
            }
            else {
                throw new Error('Profesor no encontrado');
            }
        }));
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ mensaje: err.message });
        }
        else {
            res.status(400).json({ mensaje: 'Error' });
        }
    }
});
exports.eliminar = eliminar;
