class MotorReglas {

    evaluarCondicion(pedido, condicion) {
        const valorPedido = pedido[condicion.atributo];

        switch (condicion.operador) {
            case '=':
                return valorPedido === condicion.valor;

            case ">":
                return valorPedido > condicion.valor;

            case "<":
                return valorPedido < condicion.valor;

            case ">=":
                return valorPedido >= condicion.valor;

            case "<=":
                return valorPedido <= condicion.valor;

            default:
                throw new Error(`Operador no soportado: ${condicion.operador}`);
        }
    }

    esAplicable(pedido, regla) {
        return regla.condiciones.every(condicion =>
            this.evaluarCondicion(pedido, condicion)
        );
    }

    crearIndice(reglas) {

    const indice = {};

    for (const regla of reglas) {

        for (const condicion of regla.condiciones) {

            const atributo = condicion.atributo;

            if (!indice[atributo]) {
                indice[atributo] = [];
            }

            indice[atributo].push({
                operador: condicion.operador,
                valor: condicion.valor,
                regla: regla
            });
        }
    }

    return indice;
}

    obtenerReglasCandidatas(pedido, indice) {

    const candidatos = new Map();

    for (const atributo in indice) {

        if (pedido[atributo] === undefined) {
            continue;
        }

        for (const entrada of indice[atributo]) {

            const regla = entrada.regla;

            candidatos.set(regla.id, regla);
        }
    }

    return Array.from(candidatos.values());
}

    obtenerReglasAplicables(pedido, reglas) {
        return reglas.filter(regla =>
            this.esAplicable(pedido, regla)
        )
    }

    detectarConflictos(reglasAplicables) {
        const conflictos = [];
        for (let i = 0; i < reglasAplicables.length; i++) {
            for (let j = i + 1; j < reglasAplicables.length; j++) {

                const reglaA = reglasAplicables[i];
                const reglaB = reglasAplicables[j];

                if (
                    reglaA.accion.atributo === reglaB.accion.atributo &&
                    reglaA.accion.valor !== reglaB.accion.valor
                ) {
                    conflictos.push({
                        atributo: reglaA.accion.atributo,
                        reglas: [reglaA.id, reglaB.id]
                    });
                }
            }

        }

        return conflictos;
    }

    validarConflictos(reglasAplicables) {
        const conflictos = this.detectarConflictos(reglasAplicables);

        for (const conflicto of conflictos) {
            const reglasEnConflicto = reglasAplicables.filter(regla =>
                conflicto.reglas.includes(regla.id)
            );

            const prioridades = reglasEnConflicto.map(regla =>
                regla.prioridad
            );

            const prioridadMaxima = Math.max(...prioridades);

            const reglasConPrioridadMaxima = reglasEnConflicto.filter(regla =>
                regla.prioridad === prioridadMaxima
            );

            if (reglasConPrioridadMaxima.length > 1) {
                throw new Error(
                    `Conflicto no resoluble: las reglas ${conflicto.reglas.join(", ")} tienen la misma prioridad`
                );
            }
        }
    }

    validarCompatibilidadEntrega(regla) {

        const tipoEntrega = regla.condiciones.find(
            condicion => condicion.atributo === "tipoEntrega"
        );

        if (
            tipoEntrega &&
            tipoEntrega.operador === "=" &&
            tipoEntrega.valor !== "DOMICILIO" &&
            regla.accion.atributo === "courier"
        ) {
            throw new Error(
                `Regla invalida: no se puede asignar un courier para el tipo de entrega ${tipoEntrega.valor}`
            )
        }

    }

    validarReglas(reglas) {

        for (const regla of reglas) {
            this.validarCompatibilidadEntrega(regla);
        }

        return true;
    }

    resolverConflictos(reglasAplicables) {
        const resultado = {};

        for (const regla of reglasAplicables) {
            const atributo = regla.accion.atributo;

            if (
                !resultado[atributo] ||
                regla.prioridad > resultado[atributo].prioridad
            ) {
                resultado[atributo] = regla;
            }
        }

        return resultado;
    }
obtenerDecisionFinal(reglasGanadoras) {

    const decision = {

        tiposEntrega: [
            {
                tipo: "DOMICILIO",
                disponible: true
            },
            {
                tipo: "RETIRO_TIENDA",
                disponible: true
            },
            {
                tipo: "PUNTO_RETIRO",
                disponible: true
            }
        ]

    };


    for (const atributo in reglasGanadoras) {

        const regla = reglasGanadoras[atributo];

        // ------------------------------------------
        // COURIER
        // ------------------------------------------

        if (atributo === "courier") {

            decision.courier =
                regla.accion.valor;

        }


        // ------------------------------------------
        // PRECIO
        // ------------------------------------------

        if (atributo === "precio") {

            decision.precio =
                regla.accion.valor;

        }


        // ------------------------------------------
        // TIPO DE ENTREGA
        // ------------------------------------------

        if (atributo === "tipoEntrega") {

            const tipoEntrega =
                regla.accion.valor;

            const habilitado =
                regla.accion.habilitado !== false;

            const tipo =
                decision.tiposEntrega.find(
                    entrega =>
                        entrega.tipo === tipoEntrega
                );

            if (tipo) {

                tipo.disponible =
                    habilitado;

            }

        }

    }

    return decision;
}

    generarTrazabilidad(
        reglas,
        reglasCandidatas,
        reglasAplicables,
        conflictos,
        resultado
    ) {
        const decisiones = [];

        for (const atributo in resultado) {

            const reglaGanadora = resultado[atributo];

            let razon = "Regla aplicable sin conflictos";

            const conflicto = conflictos.find(
                conflicto => conflicto.atributo === atributo
            );

            if (conflicto) {

                const otrasReglas = conflicto.reglas.filter(
                    id => id !== reglaGanadora.id
                );
                razon = `Mayor prioridad frente a regla(s): ${otrasReglas.join(", ")}`;
            }

            decisiones.push({
                atributo: atributo,
                regla: reglaGanadora.id,
                valor: reglaGanadora.accion.valor,
                razon: razon
            });
        }

        return {
            reglasEvaluadas: reglas.map(regla => regla.id),
            reglasCandidatas: reglasCandidatas.map(regla => regla.id),
            reglasAplicables: reglasAplicables.map(regla => regla.id),
            conflictos: conflictos,
            reglasGanadoras: Object.values(resultado).map(regla => regla.id),
            decisiones: decisiones
        };
    }



}

module.exports = MotorReglas;