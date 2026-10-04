const express = require("express");
const ServicioReglas = require("../application/ServicioReglas");

const router = express.Router();

const servicioReglas = new ServicioReglas();


// ==========================================
// EVALUAR PEDIDO
// ==========================================

router.post("/evaluar", async (req, res) => {

    try {

        const pedido = req.body;

        const resultado =
            await servicioReglas.evaluarPedido(pedido);

        res.json(resultado);

    } catch (error) {

        console.error(error);

        res.status(400).json({
            error: error.message
        });

    }
});


// ==========================================
// OBTENER REGLAS
// ==========================================

router.get("/reglas", async (req, res) => {

    try {

        const reglas =
            await servicioReglas.repositorio.obtenerReglas();

        res.json(reglas);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    }
});


// ==========================================
// CREAR REGLA
// ==========================================

router.post("/reglas", async (req, res) => {

    try {

        const regla = req.body;

        const resultado =
            await servicioReglas.crearRegla(regla);

        res.status(201).json(resultado);

    } catch (error) {

        console.error(error);

        res.status(400).json({
            error: error.message
        });

    }
});

router.get("/decisiones/:id", async (req, res) => {

    try {

        const decision =
            await servicioReglas.repositorio.obtenerDecision(
                req.params.id
            );

        if (!decision) {

            return res.status(404).json({
                error: "Decisión no encontrada"
            });

        }

        res.json(decision);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    }

});


module.exports = router;