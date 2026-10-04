class Regla {
    constructor({id, condiciones, accion, prioridad, version}) {
        this.id = id;
        this.condiciones = condiciones;
        this.accion = accion;
        this.prioridad = prioridad;
        this.version = version;
    }
}

module.exports = Regla;