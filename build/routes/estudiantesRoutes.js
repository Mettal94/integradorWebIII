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
//Requerimos express en la ruta del estudiante
const express_1 = __importDefault(require("express"));
const estudiantesController_1 = require("../controllers/estudiantesController");
//Con una constante inicializamos el Router de express
const router = express_1.default.Router();
router.get('/listarEstudiantes', estudiantesController_1.consultarTodos);
router.get('/crearEstudiantes', (req, res) => {
    res.render('crearEstudiantes', {
        pagina: 'Crear Estudiante',
    });
});
router.post('/', (0, estudiantesController_1.validar)(), estudiantesController_1.insertar);
router.get('/modificarEstudiantes/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const estudiante = yield (0, estudiantesController_1.consultarUno)(req, res);
        if (!estudiante) {
            return res.status(404).send('Estudiante no encontrado');
        }
        res.render('modificarEstudiantes', {
            estudiante,
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
}));
router.route('/:id')
    .get(estudiantesController_1.consultarUno)
    .put((0, estudiantesController_1.validar)(), estudiantesController_1.modificar)
    .delete(estudiantesController_1.eliminar);
exports.default = router;
