// ========== SUPABASE CONFIGURATION ==========
const SUPABASE_URL = 'https://qfurwelpzarnpcjxrzql.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdXJ3ZWxwemFybnBjanhyenFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzU2MjYsImV4cCI6MjA4MDExMTYyNn0.xE-eMmLR3EWN8zt8vitTFUyn_ICWMcFSDedVkVwo3xk';

// ========== GLOBAL VARIABLES - ALL IN ONE PLACE ==========
let supabase = null;
let isConnected = false;
let currentUser = null;
let currentSection = 'resumen';

// Data stores
let fichas = [];
let competencias = [];
let ambientes = [];
let instructores = [];
let programaciones = [];
let nextFichaId = 1;
let nextCompetenciaId = 1;
let nextAmbienteId = 1;
let nextInstructorId = 1;
let nextProgramacionId = 1;

// Constants
const CIUDADES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Otras'];
const TIPOS_AMBIENTE = ['Aula', 'Laboratorio', 'Taller', 'Virtual', 'Multiuso'];
const ESTADOS_FICHA = ['Activo', 'Finalizado', 'Suspendido'];
const ESTADOS_PROGRAMACION = ['Programada', 'En ejecución', 'Finalizada'];

const USERS = [
    { usuario: 'AdminCamillo', contrasena: '17954064@77', permisos: 'admin' },
    { usuario: 'HebertCoordinador', contrasena: 'Dani.Cami@2109#', permisos: 'admin' }
];

// ========== SUPABASE INITIALIZATION ==========
async function initSupabase() {
    console.log('🔌 Inicializando Supabase...');
    
    try {
        if (!window.supabase || !window.supabase.createClient) {
            console.warn('⚠️ Librería Supabase no disponible');
            return false;
        }
        
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Cliente Supabase inicializado correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error inicializando Supabase:', error);
        return false;
    }
}

// ========== CONNECTION & DATA LOADING ==========
async function connectToSupabase() {
    console.log('🔌 Intentando conectar a Supabase...');
    
    try {
        if (!supabase) {
            console.warn('⚠️ Cliente Supabase no inicializado');
            updateConnectionStatus('error');
            isConnected = false;
            return;
        }
        
        // Test connection
        const { data, error } = await supabase
            .from('fichas')
            .select('count', { count: 'exact', head: true });
        
        if (error) {
            console.error('❌ Error de conexión:', error.message);
            console.error('Detalles:', error);
            updateConnectionStatus('error');
            isConnected = false;
            alert('⚠️ Error al conectar con Supabase:\n' + error.message + '\n\nVerifica:\n1. Las credenciales\n2. Las políticas RLS\n3. La conexión a internet');
            return;
        }
        
        console.log('✅ Conexión exitosa a Supabase');
        updateConnectionStatus('connected');
        isConnected = true;
        
        // Load data
        await loadDataFromSupabase();
        
    } catch (err) {
        console.error('💥 Error crítico:', err);
        updateConnectionStatus('error');
        isConnected = false;
    }
}

function updateConnectionStatus(status) {
    const statusEl = document.getElementById('connectionStatus');
    if (!statusEl) return;
    
    statusEl.className = 'connection-status ' + status;
    
    if (status === 'connected') {
        statusEl.textContent = '✅ Conectado a Supabase';
        statusEl.style.color = '#27ae60';
    } else if (status === 'connecting') {
        statusEl.textContent = '⏳ Conectando...';
        statusEl.style.color = '#f39c12';
    } else if (status === 'error') {
        statusEl.textContent = '❌ Error de conexión';
        statusEl.style.color = '#e74c3c';
    }
}

async function loadDataFromSupabase() {
    console.log('📊 Cargando datos de Supabase...');
    
    try {
        // Load fichas
        const { data: fichasData, error: e1 } = await supabase
            .from('fichas').select('*').order('id', { ascending: true });
        if (e1) throw e1;
        fichas = fichasData || [];
        nextFichaId = fichas.length > 0 ? Math.max(...fichas.map(f => f.id)) + 1 : 1;
        
        // Load competencias
        const { data: compData, error: e2 } = await supabase
            .from('competencias').select('*').order('id', { ascending: true });
        if (e2) throw e2;
        competencias = compData || [];
        nextCompetenciaId = competencias.length > 0 ? Math.max(...competencias.map(c => c.id)) + 1 : 1;
        
        // Load ambientes
        const { data: ambData, error: e3 } = await supabase
            .from('ambientes').select('*').order('id', { ascending: true });
        if (e3) throw e3;
        ambientes = ambData || [];
        nextAmbienteId = ambientes.length > 0 ? Math.max(...ambientes.map(a => a.id)) + 1 : 1;
        
        // Load instructores
        const { data: instData, error: e4 } = await supabase
            .from('instructores').select('*').order('id', { ascending: true });
        if (e4) throw e4;
        instructores = instData || [];
        nextInstructorId = instructores.length > 0 ? Math.max(...instructores.map(i => i.id)) + 1 : 1;
        
        // Load programaciones
        const { data: progData, error: e5 } = await supabase
            .from('programaciones').select('*').order('id', { ascending: true });
        if (e5) throw e5;
        programaciones = progData || [];
        nextProgramacionId = programaciones.length > 0 ? Math.max(...programaciones.map(p => p.id)) + 1 : 1;
        
        console.log('✅ Datos cargados:', {
            fichas: fichas.length,
            competencias: competencias.length,
            ambientes: ambientes.length,
            instructores: instructores.length,
            programaciones: programaciones.length
        });
        
    } catch (error) {
        console.error('❌ Error cargando datos:', error);
        throw error;
    }
}

// ========== INITIALIZATION ==========
async function initApp() {
    console.log('🚀 Iniciando aplicación...');
    updateConnectionStatus('connecting');
    
    // Initialize Supabase
    const supabaseReady = await initSupabase();
    
    if (supabaseReady) {
        // Connect to database
        await connectToSupabase();
    } else {
        console.warn('⚠️ Supabase no disponible - modo offline');
        updateConnectionStatus('error');
        // Load sample data if Supabase not available
        loadLocalData();
    }
    
    setupEventListeners();
    console.log('✅ Aplicación inicializada');
}

function loadLocalData() {
    console.log('📝 Cargando datos locales de ejemplo...');
    fichas = [
        {
            id: 1,
            nombre: 'Técnico en Mecánica Automotriz',
            competencia_principal: 'Mecánica Automotriz',
            ciudad: 'Bogotá',
            fecha_inicio: '01/01/2025',
            fecha_fin: '30/06/2025',
            horas_totales: 120,
            estado: 'Activo'
        },
        {
            id: 2,
            nombre: 'Técnico en Sistemas Computacionales',
            competencia_principal: 'Sistemas Computacionales',
            ciudad: 'Medellín',
            fecha_inicio: '15/02/2025',
            fecha_fin: '15/08/2025',
            horas_totales: 100,
            estado: 'Activo'
        }
    ];
    nextFichaId = 3;
    
    competencias = [
        { id: 1, ficha_id: 1, nombre: 'Diagnóstico de Motores', horas_totales: 40 },
        { id: 2, ficha_id: 1, nombre: 'Sistemas de Frenos', horas_totales: 40 },
        { id: 3, ficha_id: 2, nombre: 'Programación Básica', horas_totales: 50 }
    ];
    nextCompetenciaId = 4;
    
    ambientes = [
        { id: 1, codigo: 'A-101', nombre: 'Aula Técnica 1', tipo: 'Aula', capacidad: 30, ciudad: 'Bogotá', disponible: true },
        { id: 2, codigo: 'LAB-02', nombre: 'Laboratorio Automotriz', tipo: 'Laboratorio', capacidad: 15, ciudad: 'Bogotá', disponible: true }
    ];
    nextAmbienteId = 3;
    
    instructores = [
        {
            id: 1,
            documento: '12345678',
            nombre: 'Juan García López',
            profesion: 'Ingeniero Mecánico',
            celular: '3001234567',
            correo: 'juan.garcia@email.com',
            fecha_inicio_contrato: '01/01/2025',
            fecha_fin_contrato: '31/12/2025',
            horas_contratadas: 200
        }
    ];
    nextInstructorId = 2;

    programaciones = [
        {
            id: 1,
            ficha_id: 1,
            competencia_id: 1,
            instructor_id: 1,
            ambiente_id: 2,
            horas: 40,
            fecha_inicio: '01/01/2025',
            fecha_fin: '15/03/2025',
            estado: 'En ejecución'
        },
        {
            id: 2,
            ficha_id: 1,
            competencia_id: 2,
            instructor_id: 1,
            ambiente_id: 2,
            horas: 40,
            fecha_inicio: '16/03/2025',
            fecha_fin: '30/06/2025',
            estado: 'Programada'
        }
    ];
    nextProgramacionId = 3;
}

function setupEventListeners() {
    document.querySelectorAll('.menu-item[data-section]').forEach(item => {
        item.addEventListener('click', () => {
            showSection(item.dataset.section);
        });
    });
}

// ========== LOGIN MANAGEMENT ==========
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const user = USERS.find(u => u.usuario === username && u.contrasena === password);
    
    if (user) {
        currentUser = user;
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appContainer').classList.add('active');
        document.getElementById('currentUser').textContent = user.usuario;
        showSection('resumen');
    } else {
        const errorDiv = document.getElementById('loginError');
        errorDiv.textContent = 'Usuario o contraseña incorrectos';
        errorDiv.classList.remove('hidden');
    }
    
    return false;
}

function handleLogout() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        currentUser = null;
        document.getElementById('appContainer').classList.remove('active');
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('loginForm').reset();
        document.getElementById('loginError').classList.add('hidden');
    }
}

// ========== NAVIGATION ==========
function showSection(sectionId) {
    currentSection = sectionId;
    
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.menu-item[data-section="${sectionId}"]`)?.classList.add('active');
    
    const mainContent = document.getElementById('mainContent');
    
    switch(sectionId) {
        case 'resumen': renderResumen(mainContent); break;
        case 'fichas': renderFichas(mainContent); break;
        case 'competencias': renderCompetencias(mainContent); break;
        case 'ambientes': renderAmbientes(mainContent); break;
        case 'instructores': renderInstructores(mainContent); break;
        case 'programacion': renderProgramacion(mainContent); break;
        case 'reportes': renderReportes(mainContent); break;
    }
}

// ========== CRUD FUNCTIONS FOR FICHAS ==========
async function saveFicha(event) {
    event.preventDefault();
    
    const id = document.getElementById('fichaId').value;
    const nombre = document.getElementById('fichaNombre').value.trim();
    const competencia = document.getElementById('fichaCompetencia').value.trim();
    const ciudad = document.getElementById('fichaCiudad').value;
    const horas = parseInt(document.getElementById('fichaHoras').value);
    const estado = document.getElementById('fichaEstado').value;
    
    const fechaInicio = document.getElementById('fichaFechaInicio').value
        .split('-').reverse().join('/');
    const fechaFin = document.getElementById('fichaFechaFin').value
        .split('-').reverse().join('/');
    
    const fichaData = {
        nombre,
        competencia_principal: competencia,
        ciudad,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        horas_totales: horas,
        estado
    };
    
    try {
        if (id) {
            // UPDATE
            if (isConnected) {
                const { error } = await supabase
                    .from('fichas')
                    .update(fichaData)
                    .eq('id', parseInt(id));
                if (error) throw error;
                console.log('✅ Ficha actualizada en Supabase');
            }
            const ficha = fichas.find(f => f.id === parseInt(id));
            if (ficha) {
                Object.assign(ficha, fichaData);
            }
        } else {
            // INSERT
            const newFicha = {
                id: nextFichaId++,
                ...fichaData
            };
            
            if (isConnected) {
                const { error } = await supabase
                    .from('fichas')
                    .insert([newFicha]);
                if (error) throw error;
                console.log('✅ Ficha insertada en Supabase');
            }
            fichas.push(newFicha);
        }
        
        closeFichaModal();
        updateFichasTable();
        alert('✅ Ficha guardada correctamente');
    } catch (error) {
        console.error('❌ Error:', error);
        alert('❌ Error al guardar: ' + (error.message || 'Error desconocido'));
    }
}

async function deleteFicha(id) {
    if (!confirm('¿Eliminar esta ficha?')) return;
    
    try {
        if (isConnected) {
            await supabase.from('programaciones').delete().eq('ficha_id', id);
            await supabase.from('competencias').delete().eq('ficha_id', id);
            const { error } = await supabase.from('fichas').delete().eq('id', id);
            if (error) throw error;
        }
        
        programaciones = programaciones.filter(p => p.ficha_id !== id);
        competencias = competencias.filter(c => c.ficha_id !== id);
        fichas = fichas.filter(f => f.id !== id);
        
        updateFichasTable();
        alert('✅ Ficha eliminada');
    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
}

// ========== HELPER FUNCTIONS ==========
function calcularHorasProgramadas(competenciaId) {
    return programaciones
        .filter(p => p.competencia_id === competenciaId)
        .reduce((sum, p) => sum + p.horas, 0);
}

function calcularHorasDisponiblesInstructor(instructorId) {
    const instructor = instructores.find(i => i.id === instructorId);
    if (!instructor) return 0;
    const programadas = programaciones
        .filter(p => p.instructor_id === instructorId)
        .reduce((sum, p) => sum + p.horas, 0);
    return instructor.horas_contratadas - programadas;
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^\d{10}$/.test(phone);
}

// ========== RENDER FUNCTIONS ==========

// RESUMEN
function renderResumen(container) {
    const totalFichas = fichas.length;
    const totalInstructores = instructores.length;
    const totalAmbientes = ambientes.length;
    const fichasActivas = fichas.filter(f => f.estado === 'Activo').length;
    const horasTotalesProgramadas = programaciones.reduce((sum, p) => sum + p.horas, 0);
    
    let competenciasPendientes = 0;
    competencias.forEach(comp => {
        const programadas = calcularHorasProgramadas(comp.id);
        if (programadas < comp.horas_totales) {
            competenciasPendientes++;
        }
    });
    
    container.innerHTML = `
        <section class="section active">
            <h2 style="margin-bottom: 24px; color: var(--sena-blue);">                   Panel de Resumen</h2>
            <div class="dashboard-cards">
                <div class="dashboard-card" onclick="showSection('fichas')">
                    <div class="card-icon">📋</div>
                    <div class="card-value">${totalFichas}</div>
                    <div class="card-label">Total de Fichas</div>
                </div>
                <div class="dashboard-card" onclick="showSection('instructores')">
                    <div class="card-icon">👨‍🏫</div>
                    <div class="card-value">${totalInstructores}</div>
                    <div class="card-label">Total de Instructores</div>
                </div>
                <div class="dashboard-card" onclick="showSection('ambientes')">
                    <div class="card-icon">🏢</div>
                    <div class="card-value">${totalAmbientes}</div>
                    <div class="card-label">Total de Ambientes</div>
                </div>
                <div class="dashboard-card" onclick="showSection('programacion')">
                    <div class="card-icon">⏰</div>
                    <div class="card-value">${horasTotalesProgramadas}</div>
                    <div class="card-label">Horas Totales Programadas</div>
                </div>
                <div class="dashboard-card" onclick="showSection('competencias')">
                    <div class="card-icon">⚠️</div>
                    <div class="card-value">${competenciasPendientes}</div>
                    <div class="card-label">Competencias Pendientes</div>
                </div>
                <div class="dashboard-card" onclick="showSection('fichas')">
                    <div class="card-icon">✅</div>
                    <div class="card-value">${fichasActivas}</div>
                    <div class="card-label">Fichas Activas</div>
                </div>
            </div>
            
            <div class="table-container" style="margin-top: 40px;">
                <div class="table-header">
                    <h3>Fichas Recientes</h3>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Ciudad</th>
                                <th>Fecha Inicio</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${fichas.slice(-5).reverse().map(f => `
                                <tr>
                                    <td>${f.nombre}</td>
                                    <td>${f.ciudad}</td>
                                    <td>${f.fecha_inicio}</td>
                                    <td><span class="status-badge status-${f.estado.toLowerCase()}">${f.estado}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    `;
}

// FICHAS
function renderFichas(container) {
    container.innerHTML = `
        <section class="section active">
            <div class="section-header">
                <h2>Gestión de Fichas</h2>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <input type="text" id="searchFichas" class="search-box" placeholder="Buscar fichas..." onkeyup="filterFichas()">
                    <select id="filterEstadoFicha" class="form-control" onchange="filterFichas()">
                        <option value="">Todos los estados</option>
                        ${ESTADOS_FICHA.map(e => `<option value="${e}">${e}</option>`).join('')}
                    </select>
                    <button class="btn btn-primary" onclick="openFichaModal()">+ Nueva Ficha</button>
                </div>
            </div>
            
            <div class="table-container">
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Competencia Principal</th>
                                <th>Ciudad</th>
                                <th>Fecha Inicio</th>
                                <th>Horas</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="fichasTableBody">
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        
        ${getFichaModal()}
    `;
    
    updateFichasTable();
}

function filterFichas() {
    updateFichasTable();
}

function updateFichasTable() {
    const search = document.getElementById('searchFichas')?.value.toLowerCase() || '';
    const estado = document.getElementById('filterEstadoFicha')?.value || '';
    
    const filtered = fichas.filter(f => {
        const matchSearch = f.nombre.toLowerCase().includes(search) || 
                          f.competencia_principal.toLowerCase().includes(search) ||
                          f.ciudad.toLowerCase().includes(search);
        const matchEstado = !estado || f.estado === estado;
        return matchSearch && matchEstado;
    });
    
    const tbody = document.getElementById('fichasTableBody');
    if (!tbody) return;
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No se encontraron fichas</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(f => `
        <tr>
            <td>${f.id}</td>
            <td><strong>${f.nombre}</strong></td>
            <td>${f.competencia_principal}</td>
            <td>${f.ciudad}</td>
            <td>${f.fecha_inicio}</td>
            <td>${f.horas_totales}h</td>
            <td><span class="status-badge status-${f.estado.toLowerCase()}">${f.estado}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-secondary" onclick="editFicha(${f.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteFicha(${f.id})">Eliminar</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getFichaModal() {
    return `
        <div id="fichaModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="fichaModalTitle">Nueva Ficha</h3>
                    <button class="close-modal" onclick="closeFichaModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="fichaForm" onsubmit="saveFicha(event)">
                        <div class="form-group">
                            <label class="form-label">Nombre del Curso *</label>
                            <input type="text" id="fichaNombre" class="form-control" required minlength="3">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Competencia Principal *</label>
                            <input type="text" id="fichaCompetencia" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Ciudad *</label>
                            <select id="fichaCiudad" class="form-control" required>
                                <option value="">Seleccionar ciudad</option>
                                ${CIUDADES.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Fecha Inicio *</label>
                            <input type="date" id="fichaFechaInicio" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Fecha Terminación *</label>
                            <input type="date" id="fichaFechaFin" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Horas Totales *</label>
                            <input type="number" id="fichaHoras" class="form-control" required min="1">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Estado *</label>
                            <select id="fichaEstado" class="form-control" required>
                                ${ESTADOS_FICHA.map(e => `<option value="${e}">${e}</option>`).join('')}
                            </select>
                        </div>
                        <input type="hidden" id="fichaId">
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeFichaModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="document.getElementById('fichaForm').requestSubmit()">Guardar</button>
                </div>
            </div>
        </div>
    `;
}

function openFichaModal() {
    document.getElementById('fichaModalTitle').textContent = 'Nueva Ficha';
    document.getElementById('fichaForm').reset();
    document.getElementById('fichaId').value = '';
    document.getElementById('fichaModal').classList.add('active');
}

function closeFichaModal() {
    document.getElementById('fichaModal').classList.remove('active');
}

function editFicha(id) {
    const ficha = fichas.find(f => f.id === id);
    if (!ficha) return;
    
    document.getElementById('fichaModalTitle').textContent = 'Editar Ficha';
    document.getElementById('fichaId').value = ficha.id;
    document.getElementById('fichaNombre').value = ficha.nombre;
    document.getElementById('fichaCompetencia').value = ficha.competencia_principal;
    document.getElementById('fichaCiudad').value = ficha.ciudad;
    
    // Convert DD/MM/YYYY to YYYY-MM-DD
    const [di, mi, yi] = ficha.fecha_inicio.split('/');
    document.getElementById('fichaFechaInicio').value = `${yi}-${mi}-${di}`;
    const [df, mf, yf] = ficha.fecha_fin.split('/');
    document.getElementById('fichaFechaFin').value = `${yf}-${mf}-${df}`;
    
    document.getElementById('fichaHoras').value = ficha.horas_totales;
    document.getElementById('fichaEstado').value = ficha.estado;
    document.getElementById('fichaModal').classList.add('active');
}

// Placeholder functions (expand later)
function renderCompetencias(container) {
    container.innerHTML = `
        <section class="section active">
            <h2>Gestión de Competencias</h2>
            <p>Proximamente...</p>
        </section>
    `;
}

function renderAmbientes(container) {
    container.innerHTML = `
        <section class="section active">
            <h2>Gestión de Ambientes</h2>
            <p style="color: var(--sena-blue);">Total de ambientes: ${ambientes.length}</p>
            <div style="margin-top: 20px;">
                ${ambientes.map(a => `
                    <div style="padding: 10px; border: 1px solid #ddd; margin: 5px 0; border-radius: 4px;">
                        <strong>${a.nombre}</strong> (${a.tipo}) - Capacidad: ${a.capacidad}
                    </div>
                `).join('')}
            </div>
        </section>
    `;
}

function renderInstructores(container) {
    container.innerHTML = `
        <section class="section active">
            <h2>Gestión de Instructores</h2>
            <p style="color: var(--sena-blue);">Total de instructores: ${instructores.length}</p>
            <div style="margin-top: 20px;">
                ${instructores.map(i => `
                    <div style="padding: 10px; border: 1px solid #ddd; margin: 5px 0; border-radius: 4px;">
                        <strong>${i.nombre}</strong><br>
                        ${i.profesion} | ${i.celular} | ${i.correo}
                    </div>
                `).join('')}
            </div>
        </section>
    `;
}

function renderProgramacion(container) {
    container.innerHTML = `
        <section class="section active">
            <h2>Programación</h2>
            <p style="color: var(--sena-blue);">Total de programaciones: ${programaciones.length}</p>
            <div style="margin-top: 20px;">
                ${programaciones.map(p => `
                    <div style="padding: 10px; border: 1px solid #ddd; margin: 5px 0; border-radius: 4px;">
                        <strong>Ficha ID: ${p.ficha_id}</strong> | Competencia ID: ${p.competencia_id}<br>
                        Instructor ID: ${p.instructor_id} | Horas: ${p.horas} | ${p.estado}<br>
                        <strong>Fecha de inicio:</strong> ${p.fecha_inicio || 'N/A'} | <strong>Fecha de fin:</strong> ${p.fecha_fin || 'N/A'}
                    </div>
                `).join('')}
            </div>
        </section>
    `;
}

function renderReportes(container) {
    container.innerHTML = `
        <section class="section active">
            <h2>Reportes</h2>
            <p>Proximamente...</p>
        </section>
    `;
}

// ========== PAGE INITIALIZATION ==========
window.addEventListener('load', initApp);