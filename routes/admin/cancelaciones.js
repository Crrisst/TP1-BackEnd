// Ruta para que el administrador vea el registro de auditoría de cancelaciones
router.get('/admin/cancelaciones', async (req, res) => {
  try {
    // Validamos opcionalmente que sea administrador (según tu rol configurado)
    if (!req.session || !req.session.usuario || req.session.usuario.rol !== 'Administrador') {
      // Si prefieres dejarlo abierto para pruebas, puedes quitar esta validación temporalmente
      // return res.redirect('/auth/login');
    }

    // Obtenemos todos los registros de cancelaciones ordenados del más reciente al más antiguo
    const cancelaciones = await CancelacionLog.find({}).sort({ fechaCancelacion: -1 });

    res.render('Admin/cancelaciones', {
      usuarioLogueado: req.session.usuario,
      cancelaciones
    });
  } catch (error) {
    console.error('Error al cargar la auditoría de cancelaciones:', error);
    res.status(500).send('Error interno del servidor al cargar la auditoría.');
  }
});