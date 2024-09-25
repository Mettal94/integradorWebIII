"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cursoEstudianteontroller_1 = require("../controllers/cursoEstudianteontroller");
const router = express_1.default.Router();
router.get('/', cursoEstudianteontroller_1.consultarInscripciones);
router.get('/xAlumno/:id', cursoEstudianteontroller_1.consultarxAlumno);
router.get('/xCurso/:id', cursoEstudianteontroller_1.consultarxCurso);
router.post('/', cursoEstudianteontroller_1.inscribir);
router.put('/', cursoEstudianteontroller_1.calificar);
router.delete('/:estudiante_id/:curso_id', cursoEstudianteontroller_1.cancelarInscripcion);
exports.default = router;
