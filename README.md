# Pinflag - Envíos

Prototipo de motor de reglas para determinar opciones de despacho según las características de un pedido.

El sistema permite configurar reglas de negocio, evaluar pedidos, detectar conflictos entre reglas, resolverlos mediante prioridad y registrar la trazabilidad de la decisión obtenida.

---

## 1. Objetivo

El objetivo del proyecto es implementar un motor de reglas capaz de determinar las opciones de despacho de un pedido considerando atributos como:

- Monto.
- Peso.
- Comuna.
- Tipo de entrega.

El motor debe permitir que múltiples reglas puedan aplicarse simultáneamente y resolver de manera determinista los conflictos que se produzcan cuando distintas reglas intenten modificar el mismo atributo.

---

## 2. Stack tecnológico

- **Backend:** Node.js + Express.
- **Base de datos:** PostgreSQL.
- **Frontend:** React + Vite.
- **Contenedores:** Docker.
- **Control de versiones:** Git / GitHub.

---

## 3. Estructura del proyecto

```text
pinflagPruebaTecnica/
├── src/
│   ├── domain/
│   │   ├── Regla.js
│   │   └── MotorReglas.js
│   ├── application/
│   │   └── ServicioReglas.js
│   └── infrastructure/
│       ├── routes.js
│       ├── router.js
│       ├── db.js
│       └── repositorioReglas.js
├── database/
│   └── schema.sql
├── frontend/
├── server.js
├── package.json
├── package-lock.json
├── docker-compose.yml
├── .env
└── README.md
```

---

## 4. Arquitectura

El backend utiliza una estructura modular separando dominio, aplicación e infraestructura.

### Domain

Contiene la lógica principal del negocio.

**MotorReglas.js** es responsable de:

- Evaluar condiciones.
- Crear el índice de reglas.
- Obtener reglas candidatas.
- Determinar reglas aplicables.
- Detectar conflictos.
- Resolver conflictos mediante prioridad.
- Combinar acciones compatibles.
- Validar reglas incompatibles.
- Generar la trazabilidad de la decisión.

**Regla.js** representa la estructura de una regla.

### Application

**ServicioReglas.js** coordina los casos de uso entre el motor de reglas y la persistencia.

### Infrastructure

Contiene los componentes técnicos de la aplicación:

- API REST con Express.
- Conexión a PostgreSQL.
- Repositorio de reglas.
- Persistencia de decisiones.

---

## 5. Cómo levantar el proyecto

### Requisitos

Se necesita tener instalado:

- Node.js
- npm
- Docker Desktop
- Git

### 5.1 Clonar el repositorio

```bash
git clone https://github.com/Skyneress/pinflag-prueba-tecnica.git
cd pinflag-prueba-tecnica
```

### 5.2 Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
DB_HOST=127.0.0.1
DB_PORT=5434
DB_USER=postgres
DB_PASSWORD=<tu_password>
DB_NAME=pinflag
```

El archivo `.env` no se encuentra incluido en el repositorio.

### 5.3 Levantar PostgreSQL

Desde la raíz del proyecto:

```bash
docker compose up -d
```

Verificar que el contenedor esté ejecutándose:

```bash
docker ps
```

El contenedor utilizado es:

`pinflag-postgres`

PostgreSQL queda expuesto localmente en el puerto:

`5434`

### 5.4 Configurar la base de datos

El esquema de la base de datos se encuentra en:

`database/schema.sql`

Si es necesario ejecutar el esquema manualmente:

```bash
docker exec -i pinflag-postgres psql -U postgres -d pinflag < database/schema.sql
```

### 5.5 Levantar el backend

Desde la raíz del proyecto:

```bash
npm install
```

Luego:

```bash
node server.js
```

El backend queda disponible en:

`http://localhost:3000`

### 5.6 Levantar el frontend

Abrir otra terminal y entrar al directorio:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
```

Iniciar la aplicación:

```bash
npm run dev
```

El frontend queda disponible normalmente en:

`http://localhost:5173`

### 5.7 Uso

Desde la interfaz es posible:

1. Consultar las reglas configuradas.
2. Crear nuevas reglas.
3. Ingresar los datos de un pedido.
4. Evaluar el pedido.
5. Revisar las opciones de entrega resultantes.
6. Revisar las reglas aplicables.
7. Revisar conflictos y prioridades.
8. Revisar la trazabilidad de la decisión.

---

## 6. Modelo de reglas

Una regla está compuesta por:

- Condición.
- Acción.
- Prioridad.
- Versión.
- Estado de activación.

Las condiciones pueden utilizar atributos del pedido como:

- `monto`
- `peso`
- `comuna`
- `tipoEntrega`

Los operadores soportados actualmente son:

```text
=
>
>=
<
<=
```

Las acciones implementadas permiten modificar:

- `courier`
- `precio`
- disponibilidad de `tipoEntrega`

---

## 7. Evaluación de reglas

El proceso de evaluación sigue las siguientes etapas:

```text
Pedido
  ↓
Carga de reglas activas
  ↓
Creación del índice
  ↓
Obtención de reglas candidatas
  ↓
Evaluación de condiciones
  ↓
Reglas aplicables
  ↓
Detección de conflictos
  ↓
Resolución por prioridad
  ↓
Combinación de acciones compatibles
  ↓
Decisión final
  ↓
Trazabilidad
  ↓
Persistencia de la decisión
```

El indexamiento se utiliza para reducir el conjunto de reglas que deben evaluarse completamente.

El índice no determina qué regla gana. La resolución de conflictos se realiza posteriormente mediante la lógica de negocio y la prioridad de las reglas.

---

## 8. Resolución de conflictos

Existe un conflicto cuando dos o más reglas aplicables intentan modificar el mismo atributo con valores incompatibles.

Por ejemplo:

**Regla 1**

Condición: `monto >= 50000`

Acción: `courier = Blue Express`

Prioridad: `10`

**Regla 2**

Condición: `peso < 20`

Acción: `courier = FedEx`

Prioridad: `5`

Para un pedido de $60.000 y 2 kg ambas reglas son aplicables.

Como ambas intentan modificar `courier`, existe un conflicto.

La regla con mayor prioridad resulta seleccionada:

- Regla 1 → prioridad 10 → Blue Express
- Regla 2 → prioridad 5 → FedEx

**Resultado:**

```text
courier = Blue Express
```

Las reglas que modifican atributos diferentes pueden coexistir.

Por ejemplo:

```text
Regla 1 → courier = Blue Express
Regla 3 → precio = 0
```

Ambas pueden aplicarse simultáneamente porque modifican atributos diferentes.

---

## 9. Trazabilidad

Cada evaluación genera información que permite explicar cómo se obtuvo la decisión.

La trazabilidad registra:

- Reglas evaluadas.
- Reglas candidatas.
- Reglas aplicables.
- Conflictos detectados.
- Reglas seleccionadas.
- Motivo de selección.

Por ejemplo:

```text
Reglas evaluadas: 1, 2, 3, 4, 5, 6

Reglas candidatas: 1, 3, 4, 2, 5, 6

Reglas aplicables: 1, 3, 2

Conflictos: courier: reglas 1 y 2

courier → Regla 1
Mayor prioridad frente a regla(s): 2

precio → Regla 3
Regla aplicable sin conflictos
```

Además, cada decisión queda almacenada en PostgreSQL junto con la versión de las reglas utilizada para la evaluación.

---

## 10. Persistencia de decisiones

Las evaluaciones realizadas por el motor se almacenan en la tabla `decisiones`.

Una decisión conserva:

- Versión de reglas.
- Pedido evaluado.
- Decisión obtenida.
- Trazabilidad.
- Fecha de creación.

Esto permite recuperar una decisión histórica sin necesidad de volver a ejecutar el motor.

**Endpoint:**

```text
GET /api/decisiones/:id
```

---

## 11. Limitaciones del prototipo

El proyecto corresponde a un MVP de prueba técnica y no pretende cubrir todas las necesidades de un motor de reglas productivo.

Entre las principales limitaciones:

- El modelo actual utiliza una condición y una acción por regla.
- La validación de compatibilidad entre courier y tipo de entrega está simplificada.
- La gestión de versiones se mantiene a nivel básico.
- La indexación implementada corresponde a una primera aproximación para reducir candidatos.
- No existe una interfaz avanzada para administrar versiones de reglas.
- No se implementan autenticación ni autorización.
- No se implementan métricas ni observabilidad productiva.

---

## 12. Uso de IA

Se utilizó inteligencia artificial como apoyo durante el desarrollo para:

- Diseñar el modelo del motor de reglas.
- Identificar escenarios de conflicto.
- Apoyar la implementación del prototipo.
- Revisar errores durante el desarrollo.
- Diseñar casos de prueba.
- Apoyar la elaboración de la documentación.

Las decisiones de diseño y la implementación fueron revisadas y ejecutadas durante el desarrollo del prototipo.
