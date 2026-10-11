// ============================================================================
// Backend de la invitación (Google Apps Script, pegado en el libro "invitado":
// Extensiones → Apps Script). Este archivo es la copia de referencia en el
// repo; lo que corre de verdad es lo que está pegado en Google.
//
// Pestañas del libro:
//   invitados       FAMILIA | TITULAR | CUPOS            (la lista)
//   Confirmaciones  se crea sola; ahí caen las respuestas del sitio
//   Configuración   se crea sola; ahí se abre/cierra el plazo (ver abajo)
//
// Cierre de confirmaciones — se controla SOLO desde la pestaña Configuración:
//   B3 "Recibir confirmaciones"  SÍ / NO   (NO = cerradas desde ya)
//   B4 "Fecha y hora límite"     2026-10-11 23:59   (hora de Colombia)
//   B5 "WhatsApp de contacto"    opcional (con código de país, sin espacios)
// Para ampliar el plazo: cambiar B4 (y dejar B3 en SÍ). Se aplica en ~15 s.
// El servidor decide con SU reloj, no con el del teléfono del invitado.
// ============================================================================

var HOJA_INVITADOS = 'invitados';
var HOJA_CONFIRMACIONES = 'Confirmaciones';
var HOJA_CONFIG = 'Configuración';
// Solo si el script NO se creó desde la hoja (Extensiones → Apps Script):
var ID_LIBRO = '';

// Respaldo: si la pestaña Configuración se borra o su fecha es inválida, el
// cierre sigue ocurriendo en esta fecha (hora de Colombia).
var CIERRE_POR_DEFECTO = '2026-10-11 23:59';
var ZONA_HORARIA = 'America/Bogota';
var HORAS_UTC_COLOMBIA = 5; // Colombia es UTC-5 todo el año (no cambia de hora)

// Cuánto se recuerda cada dato (segundos).
var CACHE_INVITADOS_SEG = 120;  // un cambio en "invitados" tarda hasta esto en verse
var CACHE_CONFIRMADAS_SEG = 30;
var CACHE_CONFIG_SEG = 15;      // un cambio en "Configuración" tarda hasta esto

function libro() {
  return ID_LIBRO ? SpreadsheetApp.openById(ID_LIBRO) : SpreadsheetApp.getActiveSpreadsheet();
}

function normalizar(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

function respuesta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------- caché ----

// Devuelve el dato guardado en caché o, si no está, lo calcula y lo guarda.
// Los errores no se guardan (así, al corregir la hoja se ve al instante).
function conCache(clave, segundos, calcular) {
  var cache = CacheService.getScriptCache();
  var guardado = cache.get(clave);
  if (guardado) { try { return JSON.parse(guardado); } catch (e) {} }
  var valor = calcular();
  if (!valor.error) {
    try { cache.put(clave, JSON.stringify(valor), segundos); } catch (e) {} // si no cabe, sigue sin caché
  }
  return valor;
}

// -------------------------------------------------------- plazo de cierre ----

function fechaValida(c) {
  if (!c) return null;
  if (c.mo < 1 || c.mo > 12 || c.d < 1 || c.d > 31 || c.h < 0 || c.h > 23 || c.mi < 0 || c.mi > 59) return null;
  if (new Date(Date.UTC(c.y, c.mo - 1, c.d)).getUTCDate() !== c.d) return null; // p. ej. 31 de febrero
  return c;
}

// Acepta "2026-10-11 23:59", "11/10/2026 23:59", solo el día ("2026-10-12" o
// "12/10/2026" → hasta las 23:59) o una fecha de la hoja (si Sheets convirtió
// lo escrito en fecha). Devuelve {y, mo, d, h, mi} o null.
function leerCierre(valor, zonaHoja) {
  var soloDia = false;
  if (valor instanceof Date) {
    var t = Utilities.formatDate(valor, zonaHoja || ZONA_HORARIA, 'yyyy-MM-dd HH:mm');
    valor = t;
    soloDia = /00:00$/.test(t); // fecha sin hora → se entiende "todo ese día"
  }
  var s = String(valor == null ? '' : valor).trim();
  var m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T]+(\d{1,2}):(\d{2}))?$/.exec(s);
  var c = null;
  if (m) c = { y: +m[1], mo: +m[2], d: +m[3], h: m[4] === undefined ? -1 : +m[4], mi: m[5] === undefined ? 0 : +m[5] };
  else {
    m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ ,]+(\d{1,2}):(\d{2}))?$/.exec(s);
    if (m) c = { y: +m[3], mo: +m[2], d: +m[1], h: m[4] === undefined ? -1 : +m[4], mi: m[5] === undefined ? 0 : +m[5] };
  }
  if (!c) return null;
  if (c.h === -1 || soloDia) { c.h = 23; c.mi = 59; }
  return fechaValida(c);
}

function cierreTexto(c) {
  function dos(n) { return (n < 10 ? '0' : '') + n; }
  return c.y + '-' + dos(c.mo) + '-' + dos(c.d) + ' ' + dos(c.h) + ':' + dos(c.mi);
}

// Instante (ms UTC) del último segundo del minuto indicado, hora de Colombia.
// "Hasta las 23:59" incluye todo el minuto 23:59.
function limiteMs(c) {
  return Date.UTC(c.y, c.mo - 1, c.d, c.h + HORAS_UTC_COLOMBIA, c.mi) + 60000;
}

function interruptorAbierto(v) {
  if (v === false) return false; // Sheets convierte FALSE / una casilla sin marcar en booleano
  var n = normalizar(v);
  return !(n === 'no' || n === 'cerrado' || n === 'cerradas' || n === 'false' || n === '0' || n === 'off');
}

function soloDigitos(v) {
  var d = String(v == null ? '' : v).replace(/\D/g, '');
  return d.length >= 8 ? d : '';
}

function configPorDefecto(aviso) {
  var c = leerCierre(CIERRE_POR_DEFECTO);
  return { interruptor: true, cierre: cierreTexto(c), limiteMs: limiteMs(c), contacto: '', aviso: aviso || '' };
}

function plantillaConfig(hoja) {
  hoja.getRange('A1').setValue('Configuración de las confirmaciones');
  hoja.getRange('A3:A5').setValues([['Recibir confirmaciones'], ['Fecha y hora límite'], ['WhatsApp de contacto']]);
  hoja.getRange('B4').setNumberFormat('@'); // texto plano: que Sheets no lo convierta en fecha
  hoja.getRange('B5').setNumberFormat('@');
  hoja.getRange('B3:B5').setValues([['SÍ'], [CIERRE_POR_DEFECTO], ['']]);
  hoja.getRange('C3:C5').setValues([
    ['SÍ = se reciben hasta la fecha límite · NO = cerradas desde ya'],
    ['Formato 2026-10-11 23:59 (hora de Colombia). Si solo escribes el día, se entiende hasta las 11:59 p. m.'],
    ['Opcional. Con código de país y sin espacios (ej. 573001234567). Aparece como botón en el aviso de cierre.']
  ]);
  hoja.getRange('A7').setValue('Para ampliar el plazo: cambia la fecha y hora de B4 y deja B3 en SÍ. Se aplica en menos de 20 segundos.');
  try {
    hoja.getRange('A1').setFontWeight('bold').setFontSize(14);
    hoja.getRange('A3:A5').setFontWeight('bold');
    hoja.getRange('C3:C5').setFontColor('#666666');
    hoja.getRange('B3').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['SÍ', 'NO'], true).build());
    hoja.setColumnWidth(1, 190); hoja.setColumnWidth(2, 170); hoja.setColumnWidth(3, 560);
  } catch (e) {} // solo estética
}

// Busca la pestaña Configuración; si no existe la crea con la plantilla.
function hojaConfig() {
  var lb = libro(), hojas = lb.getSheets();
  for (var i = 0; i < hojas.length; i++) {
    if (normalizar(hojas[i].getName()) === normalizar(HOJA_CONFIG)) return hojas[i];
  }
  var hoja;
  try { hoja = lb.insertSheet(HOJA_CONFIG); }
  catch (e) { hoja = lb.getSheetByName(HOJA_CONFIG); if (!hoja) throw e; } // otra llamada la creó a la vez
  plantillaConfig(hoja);
  return hoja;
}

// Lee la pestaña Configuración. Si algo falla, el cierre por defecto sigue vigente.
function leerConfig() {
  var hoja, filas;
  try {
    hoja = hojaConfig();
    filas = hoja.getRange(1, 1, Math.max(1, Math.min(hoja.getLastRow(), 30)), 2).getValues();
  } catch (e) {
    return configPorDefecto('config-no-disponible');
  }
  var zona = '';
  try { zona = libro().getSpreadsheetTimeZone(); } catch (e) {}
  var interruptor = true, limite = null, contacto = '', hayFecha = false;
  filas.forEach(function (f) {
    var k = normalizar(f[0]);
    if (k.indexOf('recibir') === 0) interruptor = interruptorAbierto(f[1]);
    else if (k.indexOf('fecha') === 0) { hayFecha = true; limite = leerCierre(f[1], zona); }
    else if (k.indexOf('whatsapp') === 0 || k.indexOf('contacto') === 0) contacto = soloDigitos(f[1]);
  });
  var aviso = '';
  if (!limite) { limite = leerCierre(CIERRE_POR_DEFECTO); aviso = hayFecha ? 'fecha-invalida' : 'sin-fecha'; }
  return { interruptor: interruptor, cierre: cierreTexto(limite), limiteMs: limiteMs(limite), contacto: contacto, aviso: aviso };
}

// Evalúa contra el reloj del servidor. El cierre por tiempo NO se guarda en
// caché: solo se recuerda la configuración, no si está abierto.
function calcularEstado(cfg, ahoraMs) {
  var pasoElPlazo = ahoraMs >= cfg.limiteMs;
  return {
    abierto: cfg.interruptor && !pasoElPlazo,
    motivo: !cfg.interruptor ? 'manual' : (pasoElPlazo ? 'plazo' : ''),
    cierre: cfg.cierre,
    contacto: cfg.contacto,
    aviso: cfg.aviso
  };
}

function estado() {
  var cfg;
  try { cfg = conCache('config', CACHE_CONFIG_SEG, leerConfig); } catch (e) { cfg = configPorDefecto('config-no-disponible'); }
  return calcularEstado(cfg, Date.now());
}

function estadoSinCache() {
  var cfg;
  try { cfg = leerConfig(); } catch (e) { cfg = configPorDefecto('config-no-disponible'); }
  return calcularEstado(cfg, Date.now());
}

// ------------------------------------------------------------- invitados ----

// Lista de invitados, con los textos de búsqueda ya normalizados.
function cargarInvitados() {
  var hoja = null, hojas = libro().getSheets();
  for (var h = 0; h < hojas.length; h++) {
    if (normalizar(hojas[h].getName()) === normalizar(HOJA_INVITADOS)) hoja = hojas[h];
  }
  if (!hoja) return { error: 'No existe la pestaña ' + HOJA_INVITADOS };
  var filas = hoja.getDataRange().getValues();
  var enc = filas[0].map(normalizar);
  var iFam = enc.indexOf('familia'), iTit = enc.indexOf('titular'), iCup = enc.indexOf('cupos');
  if (iFam < 0 || iTit < 0 || iCup < 0) return { error: 'Faltan columnas FAMILIA / TITULAR / CUPOS' };
  var lista = [];
  for (var i = 1; i < filas.length; i++) {
    var familia = String(filas[i][iFam]).trim();
    var titular = String(filas[i][iTit]).trim();
    if (!familia && !titular) continue;
    lista.push({
      familia: familia || titular,
      titular: titular || familia,
      cupos: Math.max(1, parseInt(filas[i][iCup], 10) || 1),
      nf: normalizar(familia),
      nt: normalizar(titular)
    });
  }
  return { lista: lista };
}

// Familias que ya tienen fila en Confirmaciones → { 'familia normalizada': true }
function familiasConfirmadas() {
  var hoja = libro().getSheetByName(HOJA_CONFIRMACIONES);
  var mapa = {};
  if (!hoja || hoja.getLastRow() < 2) return mapa;
  var filas = hoja.getDataRange().getValues();
  var iFam = filas[0].map(normalizar).indexOf('familia');
  if (iFam < 0) iFam = 1;
  for (var i = 1; i < filas.length; i++) {
    var k = normalizar(filas[i][iFam]);
    if (k) mapa[k] = true;
  }
  return mapa;
}

// ------------------------------------------------------------- endpoints ----

// GET ?estado=1  → estado del plazo (para verificar rápido y para el sitio)
// GET ?q=texto   → familias que coinciden (mínimo 3 letras, máximo 8).
//   Abierto: un arreglo. Cerrado: {cerrado:true, cierre, contacto, resultados:[...]}
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.estado) {
    var est = estado();
    return respuesta({
      ok: true,
      abierto: est.abierto,
      motivo: est.motivo,
      cierre: est.cierre,
      contacto: est.contacto,
      aviso: est.aviso,
      ahora: Utilities.formatDate(new Date(), ZONA_HORARIA, 'yyyy-MM-dd HH:mm:ss')
    });
  }
  var q = normalizar(p.q);
  if (q.length < 3) return respuesta([]);
  var datos = conCache('invitados', CACHE_INVITADOS_SEG, cargarInvitados);
  if (datos.error) return respuesta({ error: datos.error });
  var confirmadas = conCache('confirmadas', CACHE_CONFIRMADAS_SEG, familiasConfirmadas);
  var resultado = [];
  for (var i = 0; i < datos.lista.length && resultado.length < 8; i++) {
    var g = datos.lista[i];
    if (g.nf.indexOf(q) !== -1 || g.nt.indexOf(q) !== -1) {
      resultado.push({
        familia: g.familia,
        titular: g.titular,
        cupos: g.cupos,
        confirmada: !!confirmadas[normalizar(g.familia)]
      });
    }
  }
  var estado2 = estado();
  if (!estado2.abierto) {
    return respuesta({ cerrado: true, motivo: estado2.motivo, cierre: estado2.cierre, contacto: estado2.contacto, resultados: resultado });
  }
  return respuesta(resultado);
}

// POST { rows: [{familia, cupos, invitado, asiste, mensaje}] } → filas en Confirmaciones
// Es la compuerta de verdad: aunque alguien se salte el sitio, un envío fuera
// de plazo se rechaza aquí con { ok:false, error:'cerrado' } y no se escribe nada.
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var est = estadoSinCache(); // SIN caché: es la verificación de plazo
    if (!est.abierto) {
      return respuesta({ ok: false, error: 'cerrado', motivo: est.motivo, cierre: est.cierre, contacto: est.contacto });
    }
    var rows = (JSON.parse(e.postData.contents).rows || []).slice(0, 30);
    if (rows.length === 0) return respuesta({ ok: false, error: 'sin-datos' });
    var confirmadas = familiasConfirmadas(); // SIN caché: es la verificación de duplicados
    var nuevas = rows.filter(function (r) { return !confirmadas[normalizar(r.familia)]; });
    if (nuevas.length === 0) return respuesta({ ok: false, error: 'ya-confirmada' });
    var hoja = libro().getSheetByName(HOJA_CONFIRMACIONES);
    if (!hoja) {
      hoja = libro().insertSheet(HOJA_CONFIRMACIONES);
      hoja.appendRow(['Fecha', 'Familia', 'Cupos', 'Invitado', 'Asiste', 'Mensaje']);
    }
    var ahora = new Date();
    nuevas.forEach(function (r) {
      hoja.appendRow([ahora, texto(r.familia), Number(r.cupos) || 0, texto(r.invitado), texto(r.asiste), texto(r.mensaje)]);
    });
    CacheService.getScriptCache().remove('confirmadas'); // la próxima búsqueda ya la ve como confirmada
    return respuesta({ ok: true });
  } catch (err) {
    return respuesta({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Evita que un texto que empiece con = + - @ se ejecute como fórmula en la hoja
function texto(s) {
  s = String(s || '').slice(0, 500);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

// Opcional: ejecutala a mano desde el editor si editaste la pestaña
// "invitados" y querés que el cambio se vea ya, sin esperar los 2 minutos.
function limpiarCache() {
  CacheService.getScriptCache().removeAll(['invitados', 'confirmadas', 'config']);
}
