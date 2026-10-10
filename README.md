# Sistema de Gestión Integral (Backend)

Sistema web desarrollado con Node.js, Express, MongoDB y vistas Pug, diseñado para la gestión de usuarios, membresías, eventos, pasarelas de pago simuladas y control de acceso por roles (RBAC).

## 🚀 Funcionalidades Actuales del Sistema
- **Autenticación y Sesiones:** Login unificado y registro con redirección automática según el rol (`Administrador`, `Supervisor`, `Lector` o `Cliente`).
- **Control de Acceso (RBAC):**  
  - **Administrador:** Control total con privilegios para la creación, edición y eliminación de usuarios/personal, además de gestión general.
  - **Supervisor y Lector:** Acceso de auditoría al panel para visualizar el listado de usuarios y el historial de cancelaciones, con restricciones estrictas que ocultan los botones de acción y bloquean modificaciones.
- **Gestión de Clientes y Descuentos:** Clasificación de clientes por tipo con porcentajes de descuento personalizados aplicables en las compras.
- **Carrito y Compra de Entradas:** Flujo completo de selección y compra de entradas para eventos y salas.
- **Pasarela de Pago Simulada:** Validación estricta de campos de tarjeta requeridos para planes pagos y transacciones.
- **Auditoría de Cancelaciones:** Registro y visualización del historial de compras canceladas en el sistema.
- **Logs y Manejo de Errores:** Registro detallado en consola de peticiones HTTP (método, ruta, estado y tiempo de respuesta) junto con vistas estéticas para accesos denegados (`403`).

---
  Módulos a Desarrollar e ideas para implementar

- [ ] **Módulo de Salas, Eventos y Mapa de Asientos:**
  - Desarrollar el CRUD completo para administrar salas y funciones.
  - *Idea / Mejora:* Implementar un formulario de alta rápida de **Artistas** para asociarlos mediante un menú desplegable (`<select>`).
  - *En algunos espacio culturales que tenga el mapa y permitir configurar la distribución de asientos de la sala (definir cantidad de filas, asientos por fila o sectores como Platea/Pullman) al momento de crearla.
- [ ] **Módulo de Reportes y Estadísticas:**
  - Diseñar vistas de reportes y métricas de ventas/asistencia orientadas al rol de Supervisor.
- [ ] **Generación de Entradas con Diseño Realista y Código QR:**
  - Diseñar la vista de la entrada simulando un ticket físico de teatro/concierto (con solapa desprendible, tipografía elegante, datos de función, fila, asiento y un código QR único integrado para validación rápida en puerta).
- [ ] **Búsqueda y Filtros Avanzados en Cartelera:**
  - Agregar un panel de filtros en la vista principal de eventos para que los usuarios puedan buscar funciones rápidamente por fecha, artista, género o sala.
