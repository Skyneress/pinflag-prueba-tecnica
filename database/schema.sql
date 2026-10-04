CREATE TABLE reglas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    prioridad INTEGER NOT NULL,
    version INTEGER NOT NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE condiciones (
    id SERIAL PRIMARY KEY,
    regla_id INTEGER NOT NULL,
    atributo VARCHAR(100) NOT NULL,
    operador VARCHAR(10) NOT NULL,
    valor VARCHAR(255) NOT NULL,

    CONSTRAINT fk_condicion_regla
        FOREIGN KEY (regla_id)
        REFERENCES reglas(id)
        ON DELETE CASCADE
);

CREATE TABLE acciones (
    id SERIAL PRIMARY KEY,
    regla_id INTEGER NOT NULL,
    atributo VARCHAR(100) NOT NULL,
    valor VARCHAR(255) NOT NULL,
    habilitado BOOLEAN,

    CONSTRAINT fk_accion_regla
        FOREIGN KEY (regla_id)
        REFERENCES reglas(id)
        ON DELETE CASCADE
);