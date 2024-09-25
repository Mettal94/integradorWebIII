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
const cursosController_1 = require("../controllers/cursosController");
const profesoresController_1 = require("../controllers/profesoresController");
const router = express_1.default.Router();
router.get('/listarCursos', cursosController_1.consultarTodos);
router.get('/crearCursos', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profesores = yield (0, profesoresController_1.traerProfes)(req, res);
        res.render('crearCursos', {
            pagina: 'Crear Curso',
            profesores
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json(err.message);
        }
    }
}));
router.post('/', (0, cursosController_1.validarCur)(), cursosController_1.insertar);
router.get('/modificarCursos/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const curso = yield (0, cursosController_1.consultarUno)(req, res);
        const profesores = yield (0, profesoresController_1.traerProfes)(req, res);
        if (!curso) {
            return res.status(404).send('Curso no encontrado');
        }
        res.render('modificarCursos', {
            curso,
            profesores
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
}));
router.route('/:id')
    .get(cursosController_1.consultarUno)
    .put((0, cursosController_1.validarCur)(), cursosController_1.modificar)
    .delete(cursosController_1.eliminar);
exports.default = router;
