const pool = require("./db");
const Regla = require("../domain/Regla");

class RepositorioReglas {

    async obtenerReglas() {

        const consulta = `
            SELECT
                r.id,
                r.nombre,
                r.prioridad,
                r.version,
                r.activa,

                c.atributo AS condicion_atributo,
                c.operador AS condicion_operador,
                c.valor AS condicion_valor,

                a.atributo AS accion_atributo,
                a.valor AS accion_valor,
                a.habilitado AS accion_habilitado

            FROM reglas r

            LEFT JOIN condiciones c
                ON c.regla_id = r.id

            LEFT JOIN acciones a
                ON a.regla_id = r.id

            WHERE r.activa = TRUE

            ORDER BY r.id;
        `;

        const resultado = await pool.query(consulta);

        return resultado.rows.map(fila => {

            let valorCondicion = fila.condicion_valor;

            if (!isNaN(valorCondicion)) {
                valorCondicion = Number(valorCondicion);
            }

            let valorAccion = fila.accion_valor;

            if (
                fila.accion_atributo === "precio" &&
                !isNaN(valorAccion)
            ) {
                valorAccion = Number(valorAccion);
            }

            return new Regla({
                id: fila.id,

                condiciones: [
                    {
                        atributo: fila.condicion_atributo,
                        operador: fila.condicion_operador,
                        valor: valorCondicion
                    }
                ],

                accion: {
                    atributo: fila.accion_atributo,
                    valor: valorAccion,
                    habilitado: fila.accion_habilitado
                },

                prioridad: fila.prioridad,
                version: fila.version
            });

        });
    }


    async crearRegla(regla) {

        const cliente = await pool.connect();

        try {

            await cliente.query("BEGIN");

            const resultadoRegla = await cliente.query(
                `
                INSERT INTO reglas
                    (nombre, prioridad, version, activa)
                VALUES
                    ($1, $2, $3, TRUE)
                RETURNING id, nombre, prioridad, version, activa;
                `,
                [
                    regla.nombre,
                    regla.prioridad,
                    regla.version || 1
                ]
            );

            const nuevaRegla = resultadoRegla.rows[0];


            // Crear condición
            await cliente.query(
                `
                INSERT INTO condiciones
                    (regla_id, atributo, operador, valor)
                VALUES
                    ($1, $2, $3, $4);
                `,
                [
                    nuevaRegla.id,
                    regla.condicion.atributo,
                    regla.condicion.operador,
                    String(regla.condicion.valor)
                ]
            );


            // Crear acción
            await cliente.query(
                `
                INSERT INTO acciones
                    (regla_id, atributo, valor, habilitado)
                VALUES
                    ($1, $2, $3, $4);
                `,
                [
                    nuevaRegla.id,
                    regla.accion.atributo,
                    String(regla.accion.valor),
                    regla.accion.habilitado ?? null
                ]
            );


            await cliente.query("COMMIT");

            return nuevaRegla;

        } catch (error) {

            await cliente.query("ROLLBACK");

            throw error;

        } finally {

            cliente.release();

        }
    }

        async guardarDecision(decision) {

        const consulta = `
            INSERT INTO decisiones
                (reglas_version, pedido, decision, trazabilidad)
            VALUES
                ($1, $2, $3, $4)
            RETURNING id, reglas_version, created_at;
        `;

        const resultado = await pool.query(consulta, [
            decision.reglasVersion,
            decision.pedido,
            decision.decision,
            decision.trazabilidad
        ]);

        return resultado.rows[0];
    }

    async obtenerDecision(id) {

        const consulta = `
            SELECT
                id,
                reglas_version,
                pedido,
                decision,
                trazabilidad,
                created_at
            FROM decisiones
            WHERE id = $1;
        `;

        const resultado = await pool.query(
            consulta,
            [id]
        );

        return resultado.rows[0];
    }
}

module.exports = RepositorioReglas;