// ========== DÍAS FESTIVOS COLOMBIA 2026 ==========
// Incluye festivos nacionales obligatorios y festivos trasladados a lunes según la Ley Emiliani

const FESTIVOS_COLOMBIA_2026 = [
    // Enero
    { fecha: '2026-01-01', nombre: 'Año Nuevo' },
    { fecha: '2026-01-12', nombre: 'Día de los Reyes Magos (trasladado)' },
    
    // Marzo
    { fecha: '2026-03-23', nombre: 'Día de San José (trasladado)' },
    
    // Abril (Semana Santa)
    { fecha: '2026-04-02', nombre: 'Jueves Santo' },
    { fecha: '2026-04-03', nombre: 'Viernes Santo' },
    
    // Mayo
    { fecha: '2026-05-01', nombre: 'Día del Trabajo' },
    { fecha: '2026-05-18', nombre: 'Ascensión del Señor (trasladado)' },
    
    // Junio
    { fecha: '2026-06-08', nombre: 'Corpus Christi (trasladado)' },
    { fecha: '2026-06-15', nombre: 'Sagrado Corazón de Jesús (trasladado)' },
    { fecha: '2026-06-29', nombre: 'San Pedro y San Pablo (trasladado)' },
    
    // Julio
    { fecha: '2026-07-20', nombre: 'Día de la Independencia' },
    
    // Agosto
    { fecha: '2026-08-07', nombre: 'Batalla de Boyacá' },
    { fecha: '2026-08-17', nombre: 'Asunción de la Virgen (trasladado)' },
    
    // Octubre
    { fecha: '2026-10-12', nombre: 'Día de la Raza (trasladado)' },
    
    // Noviembre
    { fecha: '2026-11-02', nombre: 'Todos los Santos (trasladado)' },
    { fecha: '2026-11-16', nombre: 'Independencia de Cartagena (trasladado)' },
    
    // Diciembre
    { fecha: '2026-12-08', nombre: 'Inmaculada Concepción' },
    { fecha: '2026-12-25', nombre: 'Navidad' }
];

/**
 * Verifica si una fecha es día festivo en Colombia
 * @param {Date} fecha - Fecha a verificar
 * @returns {boolean} - True si es festivo
 */
function esFestivo(fecha) {
    // Formatear fecha en zona horaria local (YYYY-MM-DD)
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const fechaStr = `${year}-${month}-${day}`;
    return FESTIVOS_COLOMBIA_2026.some(f => f.fecha === fechaStr);
}

/**
 * Verifica si una fecha es fin de semana (sábado o domingo)
 * @param {Date} fecha - Fecha a verificar
 * @returns {boolean} - True si es fin de semana
 */
function esFinDeSemana(fecha) {
    const dia = fecha.getDay();
    return dia === 0 || dia === 6; // 0 = Domingo, 6 = Sábado
}

/**
 * Verifica si una fecha es día hábil (no es fin de semana ni festivo)
 * @param {Date} fecha - Fecha a verificar
 * @returns {boolean} - True si es día hábil
 */
function esDiaHabil(fecha) {
    return !esFinDeSemana(fecha) && !esFestivo(fecha);
}

/**
 * Calcula el número de días hábiles entre dos fechas
 * @param {Date|string} fechaInicio - Fecha de inicio (Date o string YYYY-MM-DD)
 * @param {Date|string} fechaFin - Fecha de fin (Date o string YYYY-MM-DD)
 * @returns {number} - Número de días hábiles
 */
/**
 * Calcula el número de días hábiles entre dos fechas.
 * Permite opcionalmente pasar los días de la semana en los que hay clase
 * (por ejemplo [1,3,5] para Lunes, Miércoles, Viernes). Si se provee,
 * sólo se contarán las fechas que caigan en esos días de la semana y que no
 * sean festivos. Si no se provee, se mantiene el comportamiento original
 * (no fines de semana y no festivos).
 * @param {Date|string} fechaInicio
 * @param {Date|string} fechaFin
 * @param {number[]|string[]} [diasSemanaPermitidos] - Opcional: array de números 0-6 (0=Dom)
 *        o nombres de días ('lunes','martes',...) en español.
 * @returns {number}
 */
function calcularDiasHabiles(fechaInicio, fechaFin, diasSemanaPermitidos = null) {
    // Convertir strings a Date usando zona horaria local
    let inicio, fin;
    if (typeof fechaInicio === 'string') {
        const [year, month, day] = fechaInicio.split('-').map(Number);
        inicio = new Date(year, month - 1, day);
    } else {
        inicio = new Date(fechaInicio);
    }
    
    if (typeof fechaFin === 'string') {
        const [year, month, day] = fechaFin.split('-').map(Number);
        fin = new Date(year, month - 1, day);
    } else {
        fin = new Date(fechaFin);
    }
    
    if (inicio > fin) {
        return 0;
    }
    
    let diasHabiles = 0;
    const fechaActual = new Date(inicio);
    let allowedSet = null;
    if (diasSemanaPermitidos && Array.isArray(diasSemanaPermitidos)) {
        // Normalizar a números 0-6 (0=Domingo)
        const mapDias = {
            domingo: 0, lunes: 1, martes: 2, miercoles: 3, miércoles: 3, jueves: 4, viernes: 5, sabado: 6, sábado: 6
        };
        allowedSet = new Set(diasSemanaPermitidos.map(d => {
            if (typeof d === 'number') return d;
            const key = String(d).toLowerCase();
            return mapDias[key] !== undefined ? mapDias[key] : NaN;
        }).filter(x => !Number.isNaN(x)));
    }
    
    while (fechaActual <= fin) {
        const dia = fechaActual.getDay();
        if (allowedSet) {
            // Si el día de la semana no está en el horario, no cuenta
            if (!allowedSet.has(dia)) {
                fechaActual.setDate(fechaActual.getDate() + 1);
                continue;
            }
            // Si está programado ese día pero es festivo, no cuenta
            if (esFestivo(fechaActual)) {
                fechaActual.setDate(fechaActual.getDate() + 1);
                continue;
            }
            // Si está programado y no es festivo, cuenta (permitimos sábados si están en allowedSet)
            diasHabiles++;
        } else {
            if (esDiaHabil(fechaActual)) {
                diasHabiles++;
            }
        }
        fechaActual.setDate(fechaActual.getDate() + 1);
    }
    
    return diasHabiles;
}

/**
 * Calcula el total de horas hábiles entre dos fechas con un horario específico
 * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
 * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
 * @param {string} horaInicio - Hora de inicio (HH:MM formato 24h)
 * @param {string} horaFin - Hora de fin (HH:MM formato 24h)
 * @returns {Object} - { diasHabiles, horasPorDia, totalHoras }
 */
function calcularHorasHabiles(fechaInicio, fechaFin, horaInicio, horaFin, diasSemanaPermitidos = null) {
    // Calcular días hábiles (respetando los días de semana permitidos si se proporcionan)
    const diasHabiles = calcularDiasHabiles(fechaInicio, fechaFin, diasSemanaPermitidos);
    
    // Calcular horas por día
    const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number);
    const [horaFinH, horaFinM] = horaFin.split(':').map(Number);
    
    const minutosInicio = horaInicioH * 60 + horaInicioM;
    const minutosFin = horaFinH * 60 + horaFinM;
    const minutosTotal = minutosFin - minutosInicio;
    const horasPorDia = minutosTotal / 60;
    
    // Calcular total de horas hábiles
    const totalHoras = diasHabiles * horasPorDia;
    
    return {
        diasHabiles,
        horasPorDia: Math.round(horasPorDia * 100) / 100, // Redondear a 2 decimales
        totalHoras: Math.round(totalHoras * 100) / 100
    };
}

/**
 * Obtiene información detallada sobre el cálculo de días hábiles
 * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
 * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
 * @returns {Object} - Información detallada
 */
function obtenerDetalleCalculo(fechaInicio, fechaFin, diasSemanaPermitidos = null) {
    // Convertir strings a Date usando zona horaria local
    const [yearI, monthI, dayI] = fechaInicio.split('-').map(Number);
    const inicio = new Date(yearI, monthI - 1, dayI);
    
    const [yearF, monthF, dayF] = fechaFin.split('-').map(Number);
    const fin = new Date(yearF, monthF - 1, dayF);
    
    let totalDias = 0;
    let diasHabiles = 0;
    let finesDeSemana = 0;
    let festivos = 0;
    const festivosEncontrados = [];
    // Contadores para cuando se usan días de semana programados
    let diasProgramadosTotal = 0;
    let diasProgramadosHabiles = 0;
    let tieneDiasProgramados = false;
    let allowedSet = null;
    if (diasSemanaPermitidos && Array.isArray(diasSemanaPermitidos)) {
        const mapDias = {
            domingo: 0, lunes: 1, martes: 2, miercoles: 3, miércoles: 3, jueves: 4, viernes: 5, sabado: 6, sábado: 6
        };
        allowedSet = new Set(diasSemanaPermitidos.map(d => {
            if (typeof d === 'number') return d;
            const key = String(d).toLowerCase();
            return mapDias[key] !== undefined ? mapDias[key] : NaN;
        }).filter(x => !Number.isNaN(x)));
    }
    
    const fechaActual = new Date(inicio);
    
    while (fechaActual <= fin) {
        totalDias++;
        const dia = fechaActual.getDay();

        if (allowedSet) {
            // Hay un horario con días de semana permitidos
            tieneDiasProgramados = true;
            if (allowedSet.has(dia)) {
                diasProgramadosTotal++;
                if (esFestivo(fechaActual)) {
                    festivos++;
                    // registrar festivo
                    const year = fechaActual.getFullYear();
                    const month = String(fechaActual.getMonth() + 1).padStart(2, '0');
                    const day = String(fechaActual.getDate()).padStart(2, '0');
                    const fechaStr = `${year}-${month}-${day}`;
                    const festivoInfo = FESTIVOS_COLOMBIA_2026.find(f => f.fecha === fechaStr);
                    if (festivoInfo) {
                        festivosEncontrados.push({
                            fecha: festivoInfo.fecha,
                            nombre: festivoInfo.nombre,
                            dia: fechaActual.toLocaleDateString('es-CO', { weekday: 'long' })
                        });
                    }
                } else {
                    // Programado y no festivo = día contado como hábil para la programación
                    diasProgramadosHabiles++;
                }
            }
            // También contabilizar fines de semana por separado si aplica
            if (esFinDeSemana(fechaActual)) {
                finesDeSemana++;
            }
        } else {
            if (esFinDeSemana(fechaActual)) {
                finesDeSemana++;
            } else if (esFestivo(fechaActual)) {
                festivos++;
            // Formatear fecha en zona horaria local
            const year = fechaActual.getFullYear();
            const month = String(fechaActual.getMonth() + 1).padStart(2, '0');
            const day = String(fechaActual.getDate()).padStart(2, '0');
            const fechaStr = `${year}-${month}-${day}`;
            
            const festivoInfo = FESTIVOS_COLOMBIA_2026.find(f => f.fecha === fechaStr);
            if (festivoInfo) {
                festivosEncontrados.push({
                    fecha: festivoInfo.fecha,
                    nombre: festivoInfo.nombre,
                    dia: fechaActual.toLocaleDateString('es-CO', { weekday: 'long' })
                });
            }
            } else {
                diasHabiles++;
            }
        }
        
        fechaActual.setDate(fechaActual.getDate() + 1);
    }
    // Si se usaron días programados, sobrescribimos 'diasHabiles' para representar
    // los días que pertenecen al horario y no son festivos. Conservamos los otros
    // contadores para información adicional.
    if (tieneDiasProgramados) {
        diasHabiles = diasProgramadosHabiles;
    }

    return {
        totalDias,
        diasHabiles,
        finesDeSemana,
        festivos,
        festivosEncontrados,
        // Info adicional cuando se usan días programados
        tieneDiasProgramados,
        diasProgramadosTotal,
        diasProgramadosHabiles
    };
}

/**
 * Formatea la información de cálculo para mostrar al usuario
 * @param {Object} detalle - Detalle del cálculo
 * @param {Object} horasInfo - Información de horas (opcional)
 * @returns {string} - HTML formateado
 */
function formatearInfoCalculo(detalle, horasInfo = null) {
    let html = `
        <div style="background: var(--bg-light); padding: 16px; border-radius: 8px; margin-top: 12px;">
            <h4 style="margin: 0 0 12px 0; color: var(--sena-blue); font-size: 14px;">
                📊 Cálculo de Días Hábiles
            </h4>
            <div style="display: grid; gap: 8px; font-size: 13px;">
                <div style="display: flex; justify-content: space-between;">
                    <span>Total de días:</span>
                    <strong>${detalle.totalDias}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; color: var(--sena-green);">
                    <span>Días hábiles:</span>
                    <strong>${detalle.diasHabiles}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; color: var(--sena-gray);">
                    <span>Fines de semana:</span>
                    <strong>${detalle.finesDeSemana}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; color: var(--sena-orange);">
                    <span>Festivos:</span>
                    <strong>${detalle.festivos}</strong>
                </div>
            </div>
    `;
    
    if (horasInfo) {
        html += `
            <hr style="border: none; border-top: 1px solid var(--border-color); margin: 12px 0;">
            <h4 style="margin: 0 0 12px 0; color: var(--sena-blue); font-size: 14px;">
                ⏰ Cálculo de Horas Hábiles
            </h4>
            <div style="display: grid; gap: 8px; font-size: 13px;">
                <div style="display: flex; justify-content: space-between;">
                    <span>Horas por día:</span>
                    <strong>${horasInfo.horasPorDia}h</strong>
                </div>
                <div style="display: flex; justify-content: space-between; color: var(--sena-green); font-size: 15px;">
                    <span>Total horas hábiles:</span>
                    <strong>${horasInfo.totalHoras}h</strong>
                </div>
            </div>
        `;
    }
    
        if (detalle.tieneDiasProgramados) {
            html += `
                <hr style="border: none; border-top: 1px solid var(--border-color); margin: 12px 0;">
                <h4 style="margin: 0 0 8px 0; color: var(--sena-blue); font-size: 13px;">
                    📅 Días programados en el horario
                </h4>
                <div style="font-size: 12px; color: var(--text-secondary);">
                    <div style="display:flex; justify-content:space-between;">
                        <span>Días en el horario (total):</span>
                        <strong>${detalle.diasProgramadosTotal}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; color: var(--sena-green);">
                        <span>Días programados contados (no festivos):</span>
                        <strong>${detalle.diasProgramadosHabiles}</strong>
                    </div>
                </div>
            `;
        }
    
    if (detalle.festivosEncontrados.length > 0) {
        html += `
            <hr style="border: none; border-top: 1px solid var(--border-color); margin: 12px 0;">
            <h4 style="margin: 0 0 8px 0; color: var(--sena-orange); font-size: 13px;">
                🎉 Festivos en el período:
            </h4>
            <div style="font-size: 12px; color: var(--text-secondary);">
                ${detalle.festivosEncontrados.map(f => `
                    <div style="margin-bottom: 4px;">
                        • ${f.nombre} - ${new Date(f.fecha).toLocaleDateString('es-CO', { 
                            day: 'numeric', 
                            month: 'long' 
                        })}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}
