\# Pinflag - Motor de Reglas de Despacho



Prototipo desarrollado para la prueba técnica de Pinflag.



El proyecto implementa un motor de reglas para determinar, a partir de las características de un pedido, las condiciones de despacho aplicables, considerando:



\- Tipo de entrega disponible.

\- Courier.

\- Precio de envío.

\- Reglas aplicables.

\- Conflictos entre reglas.

\- Prioridad.

\- Trazabilidad de la decisión.



La solución busca que la evaluación sea determinista y que sea posible reconstruir por qué se obtuvo una determinada decisión.



\---



\## 1. Objetivo



El sistema permite configurar reglas de despacho y simular pedidos para determinar:



\- Courier asignado.

\- Precio de envío.

\- Tipos de entrega disponibles.

\- Reglas evaluadas.

\- Reglas candidatas.

\- Reglas aplicables.

\- Conflictos detectados.

\- Regla seleccionada y motivo de la decisión.



Las reglas pueden coexistir cuando modifican atributos diferentes y los conflictos sobre un mismo atributo se resuelven utilizando una prioridad explícita.



\---



\## 2. Stack tecnológico



\### Backend



\- Node.js

\- Express

\- PostgreSQL

\- Docker



\### Frontend



\- React

\- Vite



\---



\## 3. Estructura del proyecto



```text

pinflagPruebaTecnica/

│

├── database/

│   └── schema.sql

│

├── frontend/

│   ├── src/

│   │   ├── App.jsx

│   │   ├── App.css

│   │   └── ...

│   ├── package.json

│   └── vite.config.js

│

├── src/

│   ├── domain/

│   │   ├── MotorReglas.js

│   │   └── Regla.js

│   │

│   ├── application/

│   │   └── ServicioReglas.js

│   │

│   └── infrastructure/

│       ├── db.js

│       ├── repositorioReglas.js

│       ├── router.js

│       └── routes.js

│

├── .gitignore

├── docker-compose.yml

├── package.json

├── package-lock.json

├── server.js

└── README.md



4\. Arquitectura

El backend utiliza una estructura modular separando dominio, aplicación e infraestructura.

Domain

Contiene la lógica principal del negocio.

MotorReglas.js es responsable de:

\- Evaluar condiciones.

\- Crear el índice de reglas.

\- Obtener reglas candidatas.

\- Determinar reglas aplicables.

\- Detectar conflictos.

\- Resolver conflictos mediante prioridad.

\- Combinar acciones compatibles.

\- Validar reglas incompatibles.

\- Generar la trazabilidad de la decisión.

Regla.js representa la estructura de una regla.



Application

ServicioReglas.js coordina los casos de uso entre el motor de reglas y la persistencia.

Infrastructure

Contiene los componentes técnicos de la aplicación:

\- API REST con Express.

\- Conexión a PostgreSQL.

\- Repositorio de reglas.

\- Persistencia de decisiones.



5\. Modelo de reglas

Una regla está compuesta por:

\- Condición.

\- Acción.

\- Prioridad.

\- Versión.

\- Estado de activación.

Las condiciones pueden utilizar atributos del pedido como:

\- monto

\- peso

\- comuna

\- tipoEntrega

Los operadores soportados actualmente son:

=

>

>=

<

<=

Las acciones implementadas permiten modificar:

\- courier

\- precio

\- disponibilidad de tipoEntrega



6\. Evaluación de reglas

El proceso de evaluación sigue las siguientes etapas:

Pedido

&#x20; ↓

Carga de reglas activas

&#x20; ↓

Creación del índice

&#x20; ↓

Obtención de reglas candidatas

&#x20; ↓

Evaluación de condiciones

&#x20; ↓

Reglas aplicables

&#x20; ↓

Detección de conflictos

&#x20; ↓

Resolución por prioridad

&#x20; ↓

Combinación de acciones compatibles

&#x20; ↓

Decisión final

&#x20; ↓

Trazabilidad

&#x20; ↓

Persistencia de la decisión



El indexamiento se utiliza para reducir el conjunto de reglas que deben evaluarse completamente.

El índice no determina qué regla gana. La resolución de conflictos se realiza posteriormente mediante la lógica de negocio y la prioridad de las reglas.

7. Resolución de conflictos

Existe un conflicto cuando dos o más reglas aplicables intentan modificar el mismo atributo con valores incompatibles.

Por ejemplo:

Regla 1

Condición: monto >= 50000

Acción: courier = Blue Express

Prioridad: 10



Regla 2

Condición: peso < 20

Acción: courier = FedEx

Prioridad: 5



Para un pedido de $60.000 y 2 kg ambas reglas son aplicables.

Como ambas intentan modificar courier, existe un conflicto.

La regla con mayor prioridad resulta seleccionada:



Regla 1 → prioridad 10 → Blue Express

Regla 2 → prioridad 5  → FedEx



Resultado:

courier = Blue Express



Las reglas que modifican atributos diferentes pueden coexistir.

Por ejemplo:

Regla 1 → courier = Blue Express

Regla 3 → precio = 0



Ambas pueden aplicarse simultáneamente porque modifican atributos diferentes.



8\. Trazabilidad

Cada evaluación genera información que permite explicar cómo se obtuvo la decisión.

La trazabilidad registra:

\- Reglas evaluadas.

\- Reglas candidatas.

\- Reglas aplicables.

\- Conflictos detectados.

\- Reglas seleccionadas.

\- Motivo de selección.

Por ejemplo:

Reglas evaluadas: 1, 2, 3, 4, 5, 6

Reglas candidatas: 1, 3, 4, 2, 5, 6

Reglas aplicables: 1, 3, 2

Conflictos: courier: reglas 1 y 2



courier → Regla 1

Mayor prioridad frente a regla(s): 2



precio → Regla 3

Regla aplicable sin conflictos



Además, cada decisión queda almacenada en PostgreSQL junto con la versión de las reglas utilizada para la evaluación.



9\. Persistencia de decisiones

Las evaluaciones realizadas por el motor se almacenan en la tabla decisiones.

Una decisión conserva:

\- Versión de reglas.

\- Pedido evaluado.

\- Decisión obtenida.

\- Trazabilidad.

\- Fecha de creación.

Esto permite recuperar una decisión histórica sin necesidad de volver a ejecutar el motor.

Endpoint:

GET /api/decisiones/:id

10\. Limitaciones del prototipo

El proyecto corresponde a un MVP de prueba técnica y no pretende cubrir todas las necesidades de un motor de reglas productivo.

Entre las principales limitaciones:

\- El modelo actual utiliza una condición y una acción por regla.

\- La validación de compatibilidad entre courier y tipo de entrega está simplificada.

\- La gestión de versiones se mantiene a nivel básico.

\- La indexación implementada corresponde a una primera aproximación para reducir candidatos.

\- No existe una interfaz avanzada para administrar versiones de reglas.

\- No se implementan autenticación ni autorización.

\- No se implementan métricas ni observabilidad productiva.

11\. Uso de IA

Se utilizó inteligencia artificial como apoyo durante el desarrollo para:

\- Diseñar el modelo del motor de reglas.

\- Identificar escenarios de conflicto.

\- Apoyar la implementación del prototipo.

\- Revisar errores durante el desarrollo.

\- Diseñar casos de prueba.

\- Apoyar la elaboración de la documentación.

Las decisiones de diseño y la implementación fueron revisadas y ejecutadas durante el desarrollo del prototipo.



