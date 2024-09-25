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
const profesoresController_1 = require("../controllers/profesoresController");
const router = express_1.default.Router();
router.get('/listarProfesores', profesoresController_1.consultarTodos);
router.get('/crearProfesores', (req, res) => {
    res.render('crearProfesores', {
        pagina: 'Crear Profesor',
    });
});
router.post('/', (0, profesoresController_1.validarProf)(), profesoresController_1.insertar);
router.get('/modificarProfesores/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profesor = yield (0, profesoresController_1.consultarUno)(req, res);
        if (!profesor) {
            return res.status(404).send('Profesor no encontrado');
        }
        res.render('modificarProfesores', {
            profesor,
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
}));
router.route('/:id')
    .get(profesoresController_1.consultarUno)
    .put((0, profesoresController_1.validarProf)(), profesoresController_1.modificar)
    .delete(profesoresController_1.eliminar);
exports.default = router;
