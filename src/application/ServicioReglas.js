const MotorReglas = require("../domain/MotorReglas");
const RepositorioReglas = require("../infrastructure/repositorioReglas");

class ServicioReglas {

    constructor() {
        this.motor = new MotorReglas();
        this.repositorio = new RepositorioReglas();
    }

    async evaluarPedido(pedido) {

    const reglas = await this.repositorio.obtenerReglas();

    this.motor.validarReglas(reglas);

    const indice =
        this.motor.crearIndice(reglas);

    const reglasCandidatas =
        this.motor.obtenerReglasCandidatas(
            pedido,
            indice
        );

    const reglasAplicables =
        this.motor.obtenerReglasAplicables(
            pedido,
            reglasCandidatas
        );

    this.motor.validarConflictos(
        reglasAplicables
    );

    const conflictos =
        this.motor.detectarConflictos(
            reglasAplicables
        );

    const resultado =
        this.motor.resolverConflictos(
            reglasAplicables
        );

    const decisionFinal =
        this.motor.obtenerDecisionFinal(
            resultado
        );

    const trazabilidad =
        this.motor.generarTrazabilidad(
            reglas,
            reglasCandidatas,
            reglasAplicables,
            conflictos,
            resultado
        );

    // Versión de las reglas utilizada
    const reglasVersion = reglas.length > 0
        ? Math.max(
            ...reglas.map(regla => regla.version || 1)
        )
        : 1;

    // Guardar decisión histórica
    const registro =
        await this.repositorio.guardarDecision({
            reglasVersion,
            pedido,
            decision: decisionFinal,
            trazabilidad
        });

    return {
        decisionId: registro.id,
        reglasVersion,
        decision: decisionFinal,
        trazabilidad
    };
}


    async crearRegla(regla) {

        // Validar que la nueva regla
        // cumpla las validaciones del motor
        this.motor.validarReglas([
            {
                condiciones: [regla.condicion],
                accion: regla.accion
            }
        ]);

        // Guardar la regla en PostgreSQL
        return await this.repositorio.crearRegla(regla);
    }

}

module.exports = ServicioReglas;