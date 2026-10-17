# Urbana Cult - Sistema de Gestion de Entradas y Espectaculos

Aplicacion web backend orientada a la administracion, comercializacion y control de acceso para espectaculos culturales y teatrales. El sistema implementa una arquitectura basada en el patron MVC (Modelo-Vista-Controlador) sobre Node.js, Express y MongoDB, proporcionando interfaces renderizadas del lado del servidor mediante el motor de plantillas Pug.

---

## 1. Descripcion General

Urbana Cult resuelve el ciclo operativo completo de un teatro o centro cultural:
* Gestion de usuarios con roles y permisos diferenciados (Administrador y Cliente).
* Administracion de salas, aforos y cartelera de eventos.
* Modulo de venta, carrito de compras y registro de transacciones financieras.
* Emision y control de pases de acceso unitarios con codigos QR unicos.
* Panel de control y auditoria de recaudacion en tiempo real.

---

## 2. Pila Tecnologica (Tech Stack)

* Entorno de ejecucion: Node.js (modulos ESM)
* Framework backend: Express.js
* Base de datos: MongoDB (Soporte local y MongoDB Atlas)
* Modelado y ODM: Mongoose
* Motor de vistas: Pug (Server-Side Rendering)
* Gestion de sesiones: express-session con almacenamiento seguro en memoria
* Criptografia y seguridad: Modulo nativo node:crypto (PBKDF2 y generacion de salts aleatorios)

---

## 3. Estructura del Proyecto

```text
TP1-BackEnd/
├── config/
│   └── db.js                        # Modulo de conexion a MongoDB
├── controllers/
│   ├── admin.controller.js          # Control de usuarios, salas, eventos y balance
│   ├── auth.controller.js           # Registro, login y cierre de sesion
│   └── cliente.controller.js        # Cartelera, carrito, checkout, perfil y entradas
├── middlewares/
│   ├── errorHandler.js              # Captura y formateo centralizado de errores
│   ├── logger.js                    # Registro de peticiones HTTP en consola
│   └── validadores.js               # Middlewares de control de acceso por rol (RBAC)
├── models/
│   ├── Entrada.js                   # Esquema de pases digitales emitidos
│   ├── Evento.js                    # Esquema de espectaculos y cupos
│   ├── Sala.js                      # Esquema de recintos y capacidades
│   ├── Transaccion.js               # Esquema de comprobantes y auditoria de pagos
│   └── Usuario.js                   # Esquema de usuarios y credenciales
├── routes/
│   ├── admin.routes.js              # Enrutador protegido para administradores
│   ├── auth.routes.js               # Enrutador de autenticacion publica
│   └── cliente.routes.js            # Enrutador protegido para clientes
├── views/
│   ├── Admin/                       # Vistas administrativas (dashboard, balance, eventos)
│   ├── auth/                        # Vistas de acceso y registro
│   └── Cliente/                     # Vistas de cliente (cartelera, carrito, entradas, perfil)
├── .env                             # Variables de entorno y cadenas de conexion
├── app.js                           # Archivo principal de configuracion y arranque
├── package.json                     # Dependencias y scripts de ejecucion
└── README.md                        # Documentacion tecnica del sistema
```

---

## 4. Modulos y Funcionalidades Principales

### Modulo de Autenticacion y Control de Acceso (RBAC)
* Registro con validacion estricta: DNI numerico de 7 a 8 digitos, formato de correo valido y control de mayoria de edad.
* Separacion de privilegios mediante middlewares (`esAdmin`, `esCliente`).
* Persistencia del estado mediante cookies de sesion firmadas y almacenamiento en `req.session`.

### Modulo de Cliente
* Cartelera interactiva: Consulta de eventos con control de stock remanente y bloqueo de compra ante cupo agotado.
* Carrito de compras y Checkout: Validacion de datos de pago y persistencia de la transaccion.
* Mi Perfil: Autogestion de datos personales con inmutabilidad del nombre de usuario para preservar la integridad referencial, y actualizacion en caliente de la sesion activa.
* Mis Entradas: Desglose unitario de localidades compradas (Ticket N de Total), asignacion de estado operativo (Valida, Utilizada, Cancelada) y generacion de codigos QR unicos e independientes por pase para el control en puerta.

### Modulo de Administracion y Metricas
* Gestion de entidades maestras: Salas (con calculo y validacion de aforos por sector), Eventos y Usuarios.
* Gestion y Balance de Entradas: Modulo que concilia la recaudacion real y los tickets emitidos cruzando las operaciones de la coleccion `transaccions` con los cupos propios del evento, evitando calculos nominales inexactos.

---

## 5. Requisitos Previos

* Node.js v16.x o superior instalado.
* Instancia de MongoDB local en ejecucion (puerto por defecto 27017) o una cuenta en MongoDB Atlas.

---

## 6. Instalacion y Puesta en Marcha

1. Clonar el repositorio o descomprimir el proyecto en el directorio de trabajo:
   ```bash
   cd TP1-BackEnd
   ```

2. Instalar las dependencias del proyecto:
   ```bash
   npm install
   ```

3. Configurar las variables de entorno en el archivo `.env`:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/TP2
   SESSION_SECRET=clave_secreta_para_firmar_sesiones_urbana_cult
   ```
   *(Nota: para conectar con la nube, reemplazar `MONGO_URI` por la cadena provista por MongoDB Atlas, por ejemplo: `mongodb+srv://<usuario>:<password>@cluster0.mongodb.net/UrbanaCult`).*

4. (Opcional) Cargar datos de prueba iniciales:
   ```bash
   node scripts/seed.js
   ```

5. Iniciar la aplicacion:
   * Modo produccion:
     ```bash
     npm start
     ```
   * Modo desarrollo (con recarga automatica):
     ```bash
     npm run dev
     ```

6. Acceder a la plataforma desde el navegador en:
   ```text
   http://localhost:3000
   ```

---

## 7. Roadmap y Mejoras Futuras

* Hashing Criptografico Avanzado: Migracion del esquema de guardado de contraseñas hacia PBKDF2 con Salt aleatorio y 10.000 iteraciones (SHA-512) mediante el modulo nativo `node:crypto`.
* Firmas Digitales en Pases de Acceso: Inyeccion de firmas digitales criptograficas en la carga util de cada codigo QR para certificar su legitimidad en el lector de puerta y evitar falsificaciones.
* Adaptabilidad Mobile-First: Refactorizacion del maquetado CSS de las plantillas Pug para optimizar la compra y la presentacion de pases digitales desde dispositivos moviles.
* Extension de Roles (RBAC): Creacion del rol 'Operador de Puerta', acotado unicamente al escaneo de entradas y registro de asistencia sin permisos sobre la configuracion del sistema.
* Integracion de Pasarelas Reales: Conexion asincrona con APIs de pago (Mercado Pago o Stripe) mediante Webhooks de confirmacion de estado.