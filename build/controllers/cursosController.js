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
exports.eliminar = exports.modificar = exports.insertar = exports.consultarUno = exports.traerCursos = exports.consultarTodos = exports.validarCur = void 0;
const conexion_1 = require("../db/conexion");
const cursoModel_1 = require("../models/cursoModel");
const profesorModel_1 = require("../models/profesorModel");
const express_validator_1 = require("express-validator");
const cursoRepository = conexion_1.AppDataSource.getRepository(cursoModel_1.Curso);
const validarCur = () => [
    (0, express_validator_1.check)('nombre').isEmpty().withMessage('Se requiere un nombre para el curso')
        .isLength({ min: 5 }).withMessage('Curso debe tener como mínimo 5 caracteres'),
    (0, express_validator_1.check)('descripcion').isEmpty().withMessage('Se requiere una descripción')
        .isLength({ min: 6 }).withMessage('Descripción debe tener como mínimo 6 caracteres'),
    (req, res, next) => {
        const errores = (0, express_validator_1.validationResult)(req);
        next();
    }
];
exports.validarCur = validarCur;
const consultarTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cursos = yield cursoRepository.find({ relations: ['profesor'] });
        res.render('listarCursos', {
            pagina: 'Lista de cursos',
            varnav: 'listar',
            cursos
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.consultarTodos = consultarTodos;
const traerCursos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cursos = yield cursoRepository.find({ relations: ['profesor'] });
        if (cursos) {
            return cursos;
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
exports.traerCursos = traerCursos;
const consultarUno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const curso = yield cursoRepository.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ['profesor']
        });
        if (curso) {
            return curso;
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
        return res.render('crearCursos', {
            pagina: 'Crear Curso',
            errores: errores.array()
        });
    }
    const { nombre, descripcion, profesor_id } = req.body;
    try {
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const profesor = yield transactionalEntityManager.findOne(profesorModel_1.Profesor, { where: { id: profesor_id } });
            if (!profesor) {
                return res.status(400).json({ mensaje: 'El profesor no existe' });
            }
            const nuevoCurso = new cursoModel_1.Curso();
            nuevoCurso.nombre = nombre;
            nuevoCurso.descripcion = descripcion;
            nuevoCurso.profesor = profesor;
            const cursoInsertado = yield transactionalEntityManager.save(nuevoCurso);
            const cursos = yield conexion_1.AppDataSource.getRepository(cursoModel_1.Curso).find({ relations: ['profesor'] });
            res.render('listarCursos', {
                pagina: 'Lista de cursos',
                cursos
            });
        }));
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
        const curso = yield (0, exports.consultarUno)(req, res);
        return res.render('modificarCursos', {
            pagina: 'Modificar Curso',
            errores: errores.array(),
            curso,
        });
    }
    const { id } = req.params;
    const { nombre, descripcion, profesor_id } = req.body;
    try {
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const profesor = yield transactionalEntityManager.findOne(profesorModel_1.Profesor, { where: { id: profesor_id } });
            if (!profesor) {
                return res.status(400).json({ mensaje: 'El profesor no existe' });
            }
            const curso = yield transactionalEntityManager.findOne(cursoModel_1.Curso, { where: { id: parseInt(id, 10) } });
            if (!curso) {
                return res.status(404).json({ mensaje: 'El curso no existe' });
            }
            transactionalEntityManager.merge(cursoModel_1.Curso, curso, {
                nombre,
                descripcion,
                profesor,
            });
            // Guardar los cambios
            const cursoActualizado = yield transactionalEntityManager.save(curso);
            return res.redirect('/cursos/listarCursos');
        }));
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
        const cursoRepository = conexion_1.AppDataSource.getRepository(cursoModel_1.Curso);
        const curso = yield cursoRepository.findOne({ where: { id: parseInt(id, 10) } });
        if (!curso) {
            return res.status(404).json({ mensaje: 'El curso no existe' });
        }
        yield cursoRepository.remove(curso);
        res.status(200).json({ mensaje: 'Curso eliminado' });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.eliminar = eliminar;
