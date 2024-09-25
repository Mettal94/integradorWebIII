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
exports.calificar = exports.cancelarInscripcion = exports.inscribir = exports.consultarxCurso = exports.consultarxEstudiante = exports.consultarUno = exports.consultarInscripciones = exports.validarIns = void 0;
const conexion_1 = require("../db/conexion");
const estudianteModel_1 = require("../models/estudianteModel");
const cursoModel_1 = require("../models/cursoModel");
const inscripcionModel_1 = require("../models/inscripcionModel");
const express_validator_1 = require("express-validator");
const validarIns = () => [
    (0, express_validator_1.check)('nota').isInt({ min: 1, max: 10 }).withMessage('Se debe calificar entre 1 y 10'),
    (req, res, next) => {
        const errores = (0, express_validator_1.validationResult)(req);
        next();
    }
];
exports.validarIns = validarIns;
const inscripcionRepository = conexion_1.AppDataSource.getRepository(inscripcionModel_1.Inscripcion);
const consultarInscripciones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inscripciones = yield inscripcionRepository.find({ relations: ['estudiante', 'curso'] });
        res.render('listarInscripciones', {
            pagina: 'Listado de inscripciones',
            varnav: 'listar',
            inscripciones,
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.consultarInscripciones = consultarInscripciones;
const consultarUno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { curso_id, estudiante_id } = req.params;
    try {
        const inscripcion = yield inscripcionRepository.findOne({
            where: { curso_id: parseInt(curso_id), estudiante_id: parseInt(estudiante_id) },
            relations: ['estudiante', 'curso']
        });
        if (inscripcion) {
            return inscripcion;
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
const consultarxEstudiante = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inscripciones = yield inscripcionRepository.find({
            where: { estudiante_id: parseInt(req.params.id) },
            relations: ['estudiante', 'curso']
        });
        if (inscripciones.length > 0) {
            return inscripciones;
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
exports.consultarxEstudiante = consultarxEstudiante;
const consultarxCurso = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inscripciones = yield inscripcionRepository.findBy({ curso_id: parseInt(req.params.id) });
        if (inscripciones) {
            res.render('listarInscripciones', {
                pagina: 'Inscripciones de curso',
                inscripciones
            });
        }
        else {
            res.status(400).json({ mensaje: 'No existen inscripciones en el curso' });
        }
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.consultarxCurso = consultarxCurso;
const inscribir = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { curso_id, estudiante_id, nota } = req.body;
    try {
        yield conexion_1.AppDataSource.transaction((transactionaEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const inscripcionRepository = transactionaEntityManager.getRepository(inscripcionModel_1.Inscripcion);
            const existe = yield inscripcionRepository.findOneBy({ curso_id: parseInt(curso_id), estudiante_id: parseInt(estudiante_id) });
            if (existe) {
                res.render('Inscripción ya efectuada');
            }
            else {
                const agregar = yield inscripcionRepository.create({ curso_id, estudiante_id, nota });
                const resultado = yield inscripcionRepository.save(agregar);
            }
        }));
        const inscripciones = yield inscripcionRepository.find({ relations: ['estudiante', 'curso'] });
        res.render('listarInscripciones', {
            pagina: 'Lista de inscripciones',
            inscripciones,
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.inscribir = inscribir;
const cancelarInscripcion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { curso_id, estudiante_id } = req.params;
    try {
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const estudiante = yield transactionalEntityManager.findOne(estudianteModel_1.Estudiante, { where: { id: parseInt(estudiante_id, 10) } });
            if (!estudiante) {
                return res.status(400).json({ mens: 'Estudiante no existe' });
            }
            const curso = yield transactionalEntityManager.findOne(cursoModel_1.Curso, { where: { id: parseInt(curso_id, 10) } });
            if (!curso) {
                return res.status(400).json({ mens: 'Curso no existe' });
            }
            const inscripcion = yield transactionalEntityManager.findOne(inscripcionModel_1.Inscripcion, {
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
            yield transactionalEntityManager.remove(inscripcion);
            res.status(200).json({ mens: 'Inscripción cancelada' });
        }));
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.cancelarInscripcion = cancelarInscripcion;
const calificar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errores = (0, express_validator_1.validationResult)(req);
    if (!errores.isEmpty()) {
        const inscripcion = yield (0, exports.consultarUno)(req, res);
        return res.render('calificarInscripciones', {
            pagina: 'Calificar Inscripción',
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
        const inscripcion = yield inscripcionRepository.findOneBy({
            estudiante_id: parseInt(estudiante_id, 10),
            curso_id: parseInt(curso_id, 10)
        });
        if (!inscripcion) {
            return res.status(404).json({ mensaje: "Inscripción no encontrada para el estudiante en el curso especificado" });
        }
        inscripcion.nota = nota;
        inscripcion.fecha = new Date();
        const resultado = yield inscripcionRepository.save(inscripcion);
        res.redirect('/inscripciones/listarInscripciones');
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.calificar = calificar;
