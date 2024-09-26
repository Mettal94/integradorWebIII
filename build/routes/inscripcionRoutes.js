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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inscripcionController_1 = require("../controllers/inscripcionController");
const estudiantesController_1 = require("../controllers/estudiantesController");
const cursosController_1 = require("../controllers/cursosController");
const router = express_1.default.Router();
router.get('/listarInscripciones', inscripcionController_1.consultarInscripciones);
router.get('/crearInscripciones', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const estudiantes = yield (0, estudiantesController_1.traerEstudiantes)(req, res);
        const cursos = yield (0, cursosController_1.traerCursos)(req, res);
        res.render('crearInscripciones', {
            pagina: 'Crear Inscripciones',
            estudiantes,
            cursos
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json(err.message);
        }
    }
}));
router.post('/', inscripcionController_1.inscribir);
/*
router.get('/inscripcionesEstudiante', async (req, res) => {
        try {
            const estudiantes = await traerEstudiantes(req, res);
           // const inscripciones = await consultarxEstudiante(req,res);
    
            res.render('inscripcionesEstudiante', {
                pagina: 'Inscripciones por Estudiante',
                estudiantes,
               // inscripciones,
            });
        } catch (err) {
            if (err instanceof Error) {
                res.status(500).json(err.message);
            }
        }
}); */
router.get('/inscripcionesEstudiante/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inscripciones = yield (0, inscripcionController_1.consultarxEstudiante)(req, res);
        res.render('inscripcionesEstudiante', {
            pagina: 'Inscripciones por Estudiante',
            inscripciones,
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json(err.message);
        }
    }
}));
router.get('/xCurso/:id', inscripcionController_1.consultarxCurso);
router.get('/calificar/:curso_id/:estudiante_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inscripcion = yield (0, inscripcionController_1.consultarUno)(req, res);
        res.render('calificarInscripciones', {
            pagina: 'Calificar Inscripción',
            inscripcion,
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json(err.message);
        }
    }
}));
router.put('/:curso_id/:estudiante_id', (0, inscripcionController_1.validarIns)(), inscripcionController_1.calificar);
router.delete('/:curso_id/:estudiante_id', inscripcionController_1.cancelarInscripcion);
exports.default = router;
