import { useEffect, useState } from "react";
import "./App.css";

function App() {

    // ==========================================
    // ESTADO DEL PEDIDO
    // ==========================================

    const [pedido, setPedido] = useState({
        monto: 60000,
        peso: 2,
        comuna: "Santiago",
        tipoEntrega: "DOMICILIO"
    });

    const [resultado, setResultado] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const [reglas, setReglas] = useState([]);

    // ==========================================
    // ESTADOS PARA CREAR REGLAS
    // ==========================================

    const [mostrarFormularioRegla, setMostrarFormularioRegla] =
        useState(false);

    const [nuevaRegla, setNuevaRegla] = useState({
        nombre: "",
        prioridad: 1,

        condicion: {
            atributo: "monto",
            operador: ">=",
            valor: ""
        },

        accion: {
            atributo: "courier",
            valor: "",
            habilitado: true
        }
    });

    // ==========================================
    // CARGAR REGLAS
    // ==========================================

    useEffect(() => {

        const cargarReglas = async () => {

            try {

                const respuesta = await fetch(
                    "http://localhost:3000/api/reglas"
                );

                const datos = await respuesta.json();

                if (!respuesta.ok) {
                    throw new Error(
                        "No fue posible cargar las reglas"
                    );
                }

                setReglas(datos);

            } catch (error) {

                console.error(
                    "Error cargando reglas:",
                    error
                );

            }
        };

        cargarReglas();

    }, []);

    // ==========================================
    // CAMBIAR DATOS DEL PEDIDO
    // ==========================================

    const manejarCambio = (e) => {

        const { name, value } = e.target;

        setPedido({
            ...pedido,

            [name]:
                name === "monto" || name === "peso"
                    ? Number(value)
                    : value
        });

    };

    // ==========================================
    // SIMULAR PEDIDO
    // ==========================================

    const simularPedido = async () => {

        setCargando(true);
        setError(null);

        try {

            const respuesta = await fetch(
                "http://localhost:3000/api/evaluar",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(pedido)
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {

                throw new Error(
                    datos.error ||
                    "Error evaluando el pedido"
                );

            }

            setResultado(datos);

        } catch (error) {

            setError(error.message);

        } finally {

            setCargando(false);

        }

    };

    // ==========================================
    // CAMBIAR DATOS DE NUEVA REGLA
    // ==========================================

    const manejarCambioRegla = (e) => {

        const { name, value } = e.target;

        setNuevaRegla({
            ...nuevaRegla,
            [name]: value
        });

    };

    const manejarCambioCondicion = (e) => {

        const { name, value } = e.target;

        setNuevaRegla({
            ...nuevaRegla,

            condicion: {
                ...nuevaRegla.condicion,
                [name]: value
            }
        });

    };

    const manejarCambioAccion = (e) => {

        const { name, value } = e.target;

        setNuevaRegla({
            ...nuevaRegla,

            accion: {
                ...nuevaRegla.accion,
                [name]: value
            }
        });

    };

    // ==========================================
    // CREAR REGLA
    // ==========================================

    const crearRegla = async () => {

        setError(null);

        try {

            const respuesta = await fetch(
                "http://localhost:3000/api/reglas",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        ...nuevaRegla,

                        prioridad: Number(
                            nuevaRegla.prioridad
                        ),

                        condicion: {

                            ...nuevaRegla.condicion,

                            valor:
                                nuevaRegla.condicion.atributo ===
                                    "monto" ||
                                nuevaRegla.condicion.atributo ===
                                    "peso"
                                    ? Number(
                                        nuevaRegla.condicion.valor
                                    )
                                    : nuevaRegla.condicion.valor

                        },

                        accion: {

                            ...nuevaRegla.accion,

                            // Convertimos el valor del select
                            // "true"/"false" a boolean real
                            habilitado:
                                nuevaRegla.accion.atributo ===
                                    "tipoEntrega"
                                    ? nuevaRegla.accion.habilitado ===
                                      "true"
                                    : null

                        }

                    })

                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {

                throw new Error(
                    datos.error ||
                    "No fue posible crear la regla"
                );

            }

            // ==========================================
            // NUEVO:
            // RECARGAR LAS REGLAS DESDE EL BACKEND
            // ==========================================
            //
            // No agregamos "datos" directamente porque
            // el POST devuelve solamente los datos básicos
            // de la regla.
            //
            // El GET devuelve la regla completa con:
            // condiciones + acciones.
            // ==========================================

            const respuestaReglas = await fetch(
                "http://localhost:3000/api/reglas"
            );

            const reglasActualizadas =
                await respuestaReglas.json();

            if (!respuestaReglas.ok) {

                throw new Error(
                    "La regla se creó, pero no fue posible actualizar el listado"
                );

            }

            setReglas(reglasActualizadas);

            // ==========================================
            // LIMPIAR FORMULARIO
            // ==========================================

            setNuevaRegla({

                nombre: "",

                prioridad: 1,

                condicion: {
                    atributo: "monto",
                    operador: ">=",
                    valor: ""
                },

                accion: {
                    atributo: "courier",
                    valor: "",
                    habilitado: true
                }

            });

            setMostrarFormularioRegla(false);

        } catch (error) {

            setError(error.message);

        }

    };

    return (

        <div className="app">

            {/* ======================================
                HEADER
            ====================================== */}

            <header className="header">

                <div>

                    <h1>
                        Motor de Reglas
                    </h1>

                    <p>
                        Simulador de despacho
                    </p>

                </div>

            </header>


            <main className="container">

                {/* ======================================
                    SIMULADOR
                ====================================== */}

                <section className="card">

                    <h2>
                        Simular pedido
                    </h2>


                    <div className="form-grid">

                        {/* MONTO */}

                        <div className="field">

                            <label>
                                Monto del pedido
                            </label>

                            <input
                                type="number"
                                name="monto"
                                value={pedido.monto}
                                onChange={manejarCambio}
                            />

                        </div>


                        {/* PESO */}

                        <div className="field">

                            <label>
                                Peso (kg)
                            </label>

                            <input
                                type="number"
                                name="peso"
                                value={pedido.peso}
                                onChange={manejarCambio}
                            />

                        </div>


                        {/* COMUNA */}

                        <div className="field">

                            <label>
                                Comuna
                            </label>

                            <input
                                type="text"
                                name="comuna"
                                value={pedido.comuna}
                                onChange={manejarCambio}
                            />

                        </div>


                        {/* TIPO DE ENTREGA */}

                        <div className="field">

                            <label>
                                Tipo de entrega
                            </label>

                            <select
                                name="tipoEntrega"
                                value={pedido.tipoEntrega}
                                onChange={manejarCambio}
                            >

                                <option value="DOMICILIO">
                                    Domicilio
                                </option>

                                <option value="RETIRO_TIENDA">
                                    Retiro en tienda
                                </option>

                                <option value="PUNTO_RETIRO">
                                    Punto de retiro
                                </option>

                            </select>

                        </div>

                    </div>


                    <button
                        className="button"
                        onClick={simularPedido}
                        disabled={cargando}
                    >

                        {cargando
                            ? "Evaluando..."
                            : "Simular pedido"}

                    </button>

                </section>


                {/* ======================================
                    ERROR
                ====================================== */}

                {error && (

                    <section className="card error">

                        <h2>
                            Error
                        </h2>

                        <p>
                            {error}
                        </p>

                    </section>

                )}


                {/* ======================================
                    RESULTADO
                ====================================== */}

                {resultado && (

                    <section className="card">

                        <h2>
                            Resultado
                        </h2>


                        {/* COURIER Y PRECIO */}

                        <div className="result-grid">


                            <div className="result-box">

                                <span>
                                    Courier
                                </span>

                                <strong>

                                    {resultado.decision.courier ||
                                        "Sin asignar"}

                                </strong>

                            </div>


                            <div className="result-box">

                                <span>
                                    Precio de envío
                                </span>

                                <strong>

                                    {resultado.decision.precio !==
                                        undefined

                                        ? `$${Number(
                                            resultado.decision.precio
                                        ).toLocaleString("es-CL")}`

                                        : "Sin definir"}

                                </strong>

                            </div>


                        </div>


                        {/* ======================================
                            TIPOS DE ENTREGA
                        ====================================== */}

                        <h3>
                            Tipos de entrega
                        </h3>


                        <div className="delivery-options">

                            {resultado.decision.tiposEntrega.map(
                                (entrega) => (

                                    <div
                                        className={`delivery-option ${
                                            entrega.disponible
                                                ? "available"
                                                : "unavailable"
                                        }`}

                                        key={entrega.tipo}
                                    >

                                        <span>

                                            {entrega.disponible
                                                ? "✓"
                                                : "✕"}

                                        </span>


                                        <strong>

                                            {entrega.tipo ===
                                                "DOMICILIO"

                                                ? "Domicilio"

                                                : entrega.tipo ===
                                                    "RETIRO_TIENDA"

                                                    ? "Retiro en tienda"

                                                    : "Punto de retiro"}

                                        </strong>


                                        <small>

                                            {entrega.disponible
                                                ? "Disponible"
                                                : "No disponible"}

                                        </small>

                                    </div>

                                )
                            )}

                        </div>


                        {/* ======================================
                            TRAZABILIDAD
                        ====================================== */}

                        <h3>
                            Trazabilidad
                        </h3>


                        <div className="trace">


                            <p>

                                <strong>
                                    Reglas evaluadas:
                                </strong>{" "}

                                {resultado.trazabilidad
                                    .reglasEvaluadas.length

                                    ? resultado.trazabilidad
                                        .reglasEvaluadas
                                        .join(", ")

                                    : "Ninguna"}

                            </p>


                            <p>

                                <strong>
                                    Reglas candidatas:
                                </strong>{" "}

                                {resultado.trazabilidad
                                    .reglasCandidatas

                                    ? resultado.trazabilidad
                                        .reglasCandidatas.length

                                        ? resultado.trazabilidad
                                            .reglasCandidatas
                                            .join(", ")

                                        : "Ninguna"

                                    : "No disponible"}

                            </p>


                            <p>

                                <strong>
                                    Reglas aplicables:
                                </strong>{" "}

                                {resultado.trazabilidad
                                    .reglasAplicables.length

                                    ? resultado.trazabilidad
                                        .reglasAplicables
                                        .join(", ")

                                    : "Ninguna"}

                            </p>


                            <p>

                                <strong>
                                    Conflictos:
                                </strong>{" "}

                                {resultado.trazabilidad
                                    .conflictos.length

                                    ? resultado.trazabilidad
                                        .conflictos
                                        .map(
                                            (conflicto) =>
                                                `${conflicto.atributo}: reglas ${conflicto.reglas.join(" y ")}`
                                        )
                                        .join(" | ")

                                    : "Ninguno"}

                            </p>


                        </div>


                        {/* ======================================
                            EXPLICACIÓN
                        ====================================== */}

                        <h3>
                            ¿Por qué se tomó esta decisión?
                        </h3>


                        <div className="decisions">


                            {resultado.trazabilidad
                                .decisiones.length === 0

                                ? (

                                    <p>
                                        No existen reglas aplicables
                                        para este pedido.
                                    </p>

                                )

                                : (

                                    resultado.trazabilidad
                                        .decisiones
                                        .map(
                                            (decision, index) => (

                                                <div
                                                    className="decision"
                                                    key={index}
                                                >

                                                    <div>

                                                        <strong>
                                                            {decision.atributo}
                                                        </strong>

                                                        <span>
                                                            Regla {decision.regla}
                                                        </span>

                                                    </div>

                                                    <p>
                                                        {decision.razon}
                                                    </p>

                                                </div>

                                            )
                                        )

                                )}

                        </div>


                    </section>

                )}


                {/* ======================================
                    REGLAS CONFIGURADAS
                ====================================== */}

                <section className="card">


                    <div className="rules-title">

                        <h2>
                            Reglas configuradas
                        </h2>


                        <button
                            className="button"
                            onClick={() =>
                                setMostrarFormularioRegla(
                                    !mostrarFormularioRegla
                                )
                            }
                        >

                            {mostrarFormularioRegla
                                ? "Cancelar"
                                : "+ Nueva regla"}

                        </button>

                    </div>


                    {/* ======================================
                        FORMULARIO NUEVA REGLA
                    ====================================== */}

                    {mostrarFormularioRegla && (

                        <div className="rule-form">

                            <h3>
                                Crear nueva regla
                            </h3>


                            <div className="form-grid">


                                {/* NOMBRE */}

                                <div className="field">

                                    <label>
                                        Nombre
                                    </label>

                                    <input
                                        type="text"
                                        name="nombre"
                                        value={nuevaRegla.nombre}
                                        onChange={manejarCambioRegla}
                                        placeholder="Ej: Pedidos sobre 50000"
                                    />

                                </div>


                                {/* PRIORIDAD */}

                                <div className="field">

                                    <label>
                                        Prioridad
                                    </label>

                                    <input
                                        type="number"
                                        name="prioridad"
                                        value={nuevaRegla.prioridad}
                                        onChange={manejarCambioRegla}
                                    />

                                </div>


                                {/* ATRIBUTO CONDICIÓN */}

                                <div className="field">

                                    <label>
                                        Atributo de condición
                                    </label>

                                    <select
                                        name="atributo"
                                        value={
                                            nuevaRegla
                                                .condicion
                                                .atributo
                                        }
                                        onChange={
                                            manejarCambioCondicion
                                        }
                                    >

                                        <option value="monto">
                                            Monto
                                        </option>

                                        <option value="peso">
                                            Peso
                                        </option>

                                        <option value="comuna">
                                            Comuna
                                        </option>

                                        <option value="tipoEntrega">
                                            Tipo de entrega
                                        </option>

                                    </select>

                                </div>


                                {/* OPERADOR */}

                                <div className="field">

                                    <label>
                                        Operador
                                    </label>

                                    <select
                                        name="operador"
                                        value={
                                            nuevaRegla
                                                .condicion
                                                .operador
                                        }
                                        onChange={
                                            manejarCambioCondicion
                                        }
                                    >

                                        <option value="=">
                                            =
                                        </option>

                                        <option value=">">
                                            &gt;
                                        </option>

                                        <option value=">=">
                                            &gt;=
                                        </option>

                                        <option value="<">
                                            &lt;
                                        </option>

                                        <option value="<=">
                                            &lt;=
                                        </option>

                                    </select>

                                </div>


                                {/* VALOR CONDICIÓN */}

                                <div className="field">

                                    <label>
                                        Valor de condición
                                    </label>

                                    <input
                                        type="text"
                                        name="valor"
                                        value={
                                            nuevaRegla
                                                .condicion
                                                .valor
                                        }
                                        onChange={
                                            manejarCambioCondicion
                                        }
                                        placeholder="Ej: 50000"
                                    />

                                </div>


                                {/* ACCIÓN */}

                                <div className="field">

                                    <label>
                                        Acción
                                    </label>

                                    <select
                                        name="atributo"
                                        value={
                                            nuevaRegla
                                                .accion
                                                .atributo
                                        }
                                        onChange={
                                            manejarCambioAccion
                                        }
                                    >

                                        <option value="courier">
                                            Asignar courier
                                        </option>

                                        <option value="precio">
                                            Modificar precio
                                        </option>

                                        <option value="tipoEntrega">
                                            Habilitar/bloquear entrega
                                        </option>

                                    </select>

                                </div>


                                {/* ======================================
                                    ACCIÓN COURIER
                                ====================================== */}

                                {nuevaRegla.accion.atributo ===
                                    "courier" && (

                                    <div className="field">

                                        <label>
                                            Courier
                                        </label>

                                        <input
                                            type="text"
                                            name="valor"
                                            value={
                                                nuevaRegla
                                                    .accion
                                                    .valor
                                            }
                                            onChange={
                                                manejarCambioAccion
                                            }
                                            placeholder="Ej: Blue Express"
                                        />

                                    </div>

                                )}


                                {/* ======================================
                                    ACCIÓN PRECIO
                                ====================================== */}

                                {nuevaRegla.accion.atributo ===
                                    "precio" && (

                                    <div className="field">

                                        <label>
                                            Precio de envío
                                        </label>

                                        <input
                                            type="number"
                                            name="valor"
                                            value={
                                                nuevaRegla
                                                    .accion
                                                    .valor
                                            }
                                            onChange={
                                                manejarCambioAccion
                                            }
                                            placeholder="Ej: 0"
                                        />

                                    </div>

                                )}


                                {/* ======================================
                                    ACCIÓN TIPO DE ENTREGA
                                ====================================== */}

                                {nuevaRegla.accion.atributo ===
                                    "tipoEntrega" && (

                                    <>

                                        <div className="field">

                                            <label>
                                                Tipo de entrega
                                            </label>

                                            <select
                                                name="valor"
                                                value={
                                                    nuevaRegla
                                                        .accion
                                                        .valor
                                                }
                                                onChange={
                                                    manejarCambioAccion
                                                }
                                            >

                                                <option value="">
                                                    Seleccionar
                                                </option>

                                                <option value="DOMICILIO">
                                                    Domicilio
                                                </option>

                                                <option value="RETIRO_TIENDA">
                                                    Retiro en tienda
                                                </option>

                                                <option value="PUNTO_RETIRO">
                                                    Punto de retiro
                                                </option>

                                            </select>

                                        </div>


                                        <div className="field">

                                            <label>
                                                Estado
                                            </label>

                                            <select
                                                name="habilitado"
                                                value={String(
                                                    nuevaRegla
                                                        .accion
                                                        .habilitado
                                                )}
                                                onChange={
                                                    manejarCambioAccion
                                                }
                                            >

                                                <option value="true">
                                                    Disponible
                                                </option>

                                                <option value="false">
                                                    Bloqueado
                                                </option>

                                            </select>

                                        </div>

                                    </>

                                )}


                            </div>


                            <button
                                className="button"
                                onClick={crearRegla}
                            >
                                Crear regla
                            </button>


                        </div>

                    )}


                    {/* ======================================
                        LISTADO DE REGLAS
                    ====================================== */}

                    {reglas.length === 0 ? (

                        <p>
                            No hay reglas configuradas.
                        </p>

                    ) : (

                        <div className="rules">

                            {reglas.map((regla) => (

                                <div
                                    className="rule"
                                    key={regla.id}
                                >


                                    <div className="rule-header">

                                        <strong>
                                            Regla {regla.id}
                                        </strong>

                                        <span>
                                            Prioridad: {regla.prioridad}
                                        </span>

                                    </div>


                                    <p>

                                        <strong>
                                            Condición:
                                        </strong>{" "}

                                        {regla.condiciones.map(
                                            (condicion, index) => (

                                                <span key={index}>

                                                    {condicion.atributo}{" "}

                                                    {condicion.operador}{" "}

                                                    {condicion.valor}

                                                </span>

                                            )
                                        )}

                                    </p>


                                    <p>

                                        <strong>
                                            Acción:
                                        </strong>{" "}

                                        {regla.accion.atributo ===
                                            "tipoEntrega"

                                            ? (
                                                <>
                                                    {regla.accion.habilitado ===
                                                        false
                                                        ? "Bloquear "
                                                        : "Habilitar "}

                                                    {regla.accion.valor ===
                                                        "DOMICILIO"
                                                        ? "domicilio"
                                                        : regla.accion.valor ===
                                                            "RETIRO_TIENDA"
                                                            ? "retiro en tienda"
                                                            : "punto de retiro"}
                                                </>
                                            )

                                            : (
                                                <>
                                                    {regla.accion.atributo} ={" "}
                                                    {regla.accion.valor}
                                                </>
                                            )}

                                    </p>


                                </div>

                            ))}

                        </div>

                    )}


                </section>


            </main>

        </div>

    );

}

export default App;