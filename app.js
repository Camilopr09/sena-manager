/ ========== SUPABASE CONFIGURATION ==========
const SUPABASE_URL = 'https://qfurwelpzarnpcjxrzql.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdXJ3ZWxwemFybnBjanhyenFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzU2MjYsImV4cCI6MjA4MDExMTYyNn0.xE-eMmLR3EWN8zt8vitTFUyn_ICWMcFSDedVkVwo3xk';

// Verificar que Supabase esté cargado
if (!window.supabase) {
    console.error('❌ CRITICAL: Supabase no está disponible');
    alert('Error crítico: Supabase no se cargó. Verifique su conexión a internet.');
}

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Test de conexión inmediato
console.log('🔍 Iniciando test de conexión a Supabase...');
console.log('URL:', SUPABASE_URL);
console.log('Cliente creado:', supabase ? 'SÍ' : 'NO');

// ========== DATA STRUCTURES ==========
let currentUser = null;
let currentSection = 'resumen';
let isConnected = false;

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

// ========== INITIALIZATION ==========
async function initApp() {
    updateConnectionStatus('connecting');
    await connectToSupabase();
    setupEventListeners();
    setupRealtimeSubscriptions();
}

async function connectToSupabase() {
    try {
        console.log('🔌 Intentando conectar a Supabase...');
        
        // Test connection
        const { data, error, count } = await supabase
            .from('fichas')
            .select('*', { count: 'exact', head: false });
        
        if (error) {
            console.error('❌ Error de conexión a Supabase:', error);
            console.error('Detalles del error:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            updateConnectionStatus('error');
            alert(`Error de conexión a la base de datos:\n${error.message}\n\nUsando datos de ejemplo.`);
            await initializeSampleData();
            return;
        }
        
        updateConnectionStatus('connected');
        isConnected = true;
        console.log('✅ Conectado a Supabase exitosamente');
        console.log(`📊 Fichas en la base de datos: ${count || data?.length || 0}`);
        
        // Load data from Supabase
        await loadDataFromSupabase();
        
    } catch (err) {
        console.error('💥 Error crítico en conexión:', err);
        console.error('Stack trace:', err.stack);
        updateConnectionStatus('error');
        alert(`Error crítico de conexión:\n${err.message}\n\nUsando datos de ejemplo.`);
        await initializeSampleData();
    }
}

function updateConnectionStatus(status) {
    const statusEl = document.getElementById('connectionStatus');
    if (!statusEl) return;
    
    statusEl.className = 'connection-status ' + status;
    
    if (status === 'connected') {
        statusEl.textContent = '✓ Conectado a Supabase';
    } else if (status === 'connecting') {
        statusEl.textContent = '⏳ Conectando...';
    } else if (status === 'error') {
        statusEl.textContent = '⚠️ Error de conexión';
    }
}

async function loadDataFromSupabase() {
    try {
        // Load fichas
        const { data: fichasData, error: fichasError } = await supabase
            .from('fichas')
            .select('*')
            .order('id', { ascending: true });
        
        if (fichasError) throw fichasError;
        fichas = fichasData || [];
        nextFichaId = fichas.length > 0 ? Math.max(...fichas.map(f => f.id)) + 1 : 1;
        
        // Load competencias
        const { data: competenciasData, error: competenciasError } = await supabase
            .from('competencias')
            .select('*')
            .order('id', { ascending: true });
        
        if (competenciasError) throw competenciasError;
        competencias = competenciasData || [];
        nextCompetenciaId = competencias.length > 0 ? Math.max(...competencias.map(c => c.id)) + 1 : 1;
        
        // Load ambientes
        const { data: ambientesData, error: ambientesError } = await supabase
            .from('ambientes')
            .select('*')
            .order('id', { ascending: true });
        
        if (ambientesError) throw ambientesError;
        ambientes = ambientesData || [];
        nextAmbienteId = ambientes.length > 0 ? Math.max(...ambientes.map(a => a.id)) + 1 : 1;
        
        // Load instructores
        const { data: instructoresData, error: instructoresError } = await supabase
            .from('instructores')
            .select('*')
            .order('id', { ascending: true });
        
        if (instructoresError) throw instructoresError;
        instructores = instructoresData || [];
        nextInstructorId = instructores.length > 0 ? Math.max(...instructores.map(i => i.id)) + 1 : 1;
        
        // Load programaciones
        const { data: programacionesData, error: programacionesError } = await supabase
            .from('programaciones')
            .select('*')
            .order('id', { ascending: true });
        
        if (programacionesError) throw programacionesError;
        programaciones = programacionesData || [];
        nextProgramacionId = programaciones.length > 0 ? Math.max(...programaciones.map(p => p.id)) + 1 : 1;
        
        console.log('✅ Data loaded from Supabase:', {
            fichas: fichas.length,
            competencias: competencias.length,
            ambientes: ambientes.length,
            instructores: instructores.length,
            programaciones: programaciones.length
        });
        
        // If no data exists, initialize with sample data
        if (fichas.length === 0) {
            await initializeSampleData();
        }
        
    } catch (error) {
        console.error('Error loading data from Supabase:', error);
        alert('Error al cargar datos. Reintentando...');
    }
}

async function initializeSampleData() {
    if (fichas.length > 0) {
        console.log('ℹ️ Ya existen datos, saltando inicialización');
        return;
    }
    
    console.log('📝 Inicializando datos de ejemplo...');
    
    // Sample fichas (mantén tus datos existentes)
    const sampleFichas = [ /* tus datos actuales */ ];
    
    if (isConnected) {
        console.log('  → Insertando fichas de ejemplo en Supabase...');
        const { data: insertedFichas, error: fichasError } = await supabase
            .from('fichas')
            .insert(sampleFichas)
            .select();
        
        if (fichasError) {
            console.error('❌ Error insertando fichas:', fichasError);
        } else {
            console.log('  ✅ Fichas insertadas:', insertedFichas?.length || 0);
        }
    }
    fichas = sampleFichas;
    nextFichaId = 3;
    
    // Repite el mismo patrón para competencias, ambientes, instructores y programaciones
    
    console.log('✅ Datos de ejemplo inicializados correctamente');
}
    
    // Insert sample competencias
    const sampleCompetencias = [
        { id: 1, ficha_id: 1, nombre: 'Diagnóstico de Motores', horas_totales: 40 },
        { id: 2, ficha_id: 1, nombre: 'Sistemas de Frenos', horas_totales: 40 },
        { id: 3, ficha_id: 1, nombre: 'Eléctrica Automotriz', horas_totales: 40 },
        { id: 4, ficha_id: 2, nombre: 'Programación Básica', horas_totales: 50 },
        { id: 5, ficha_id: 2, nombre: 'Redes Computacionales', horas_totales: 50 }
    ];
    
    if (isConnected) {
        const { error: compError } = await supabase.from('competencias').insert(sampleCompetencias);
        if (compError) console.error('Error inserting competencias:', compError);
    }
    competencias = sampleCompetencias;
    nextCompetenciaId = 6;
    
    // Insert sample ambientes
    const sampleAmbientes = [
        { id: 1, codigo: 'A-101', nombre: 'Aula Técnica 1', tipo: 'Aula', capacidad: 30, ciudad: 'Bogotá', disponible: true },
        { id: 2, codigo: 'LAB-02', nombre: 'Laboratorio Automotriz', tipo: 'Laboratorio', capacidad: 15, ciudad: 'Bogotá', disponible: true },
        { id: 3, codigo: 'A-201', nombre: 'Aula Sistemas', tipo: 'Aula', capacidad: 25, ciudad: 'Medellín', disponible: true },
        { id: 4, codigo: 'V-001', nombre: 'Sala Virtual', tipo: 'Virtual', capacidad: 50, ciudad: 'Bogotá', disponible: true }
    ];
    
    if (isConnected) {
        const { error: ambError } = await supabase.from('ambientes').insert(sampleAmbientes);
        if (ambError) console.error('Error inserting ambientes:', ambError);
    }
    ambientes = sampleAmbientes;
    nextAmbienteId = 5;
    
    // Insert sample instructores
    const sampleInstructores = [
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
        },
        {
            id: 2,
            documento: '87654321',
            nombre: 'María López Rodríguez',
            profesion: 'Técnica en Sistemas',
            celular: '3109876543',
            correo: 'maria.lopez@email.com',
            fecha_inicio_contrato: '15/02/2025',
            fecha_fin_contrato: '15/08/2025',
            horas_contratadas: 160
        },
        {
            id: 3,
            documento: '11111111',
            nombre: 'Carlos Rodríguez Martínez',
            profesion: 'Electricista Especializado',
            celular: '3005551234',
            correo: 'carlos.rodriguez@email.com',
            fecha_inicio_contrato: '01/01/2025',
            fecha_fin_contrato: '30/06/2025',
            horas_contratadas: 180
        }
    ];
    
    if (isConnected) {
        const { error: instError } = await supabase.from('instructores').insert(sampleInstructores);
        if (instError) console.error('Error inserting instructores:', instError);
    }
    instructores = sampleInstructores;
    nextInstructorId = 4;
    
    // Insert sample programaciones
    const sampleProgramaciones = [
        {
            id: 1,
            ficha_id: 1,
            competencia_id: 1,
            instructor_id: 1,
            ambiente_id: 1,
            horas: 20,
            fecha_inicio: '01/02/2025',
            fecha_fin: '15/03/2025',
            estado: 'Programada'
        },
        {
            id: 2,
            ficha_id: 1,
            competencia_id: 1,
            instructor_id: 2,
            ambiente_id: 2,
            horas: 20,
            fecha_inicio: '16/03/2025',
            fecha_fin: '30/04/2025',
            estado: 'Programada'
        }
    ];
    
    if (isConnected) {
        const { error: progError } = await supabase.from('programaciones').insert(sampleProgramaciones);
        if (progError) console.error('Error inserting programaciones:', progError);
    }
    programaciones = sampleProgramaciones;
    nextProgramacionId = 3;
    
    console.log('✅ Sample data initialized');
}

function setupRealtimeSubscriptions() {
    if (!isConnected) return;
    
    // Subscribe to fichas changes
    supabase
        .channel('fichas-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'fichas' }, async (payload) => {
            console.log('🔄 Fichas changed:', payload);
            await loadDataFromSupabase();
            if (currentSection === 'fichas' || currentSection === 'resumen') {
                showSection(currentSection);
            }
        })
        .subscribe();
    
    // Subscribe to competencias changes
    supabase
        .channel('competencias-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'competencias' }, async (payload) => {
            console.log('🔄 Competencias changed:', payload);
            await loadDataFromSupabase();
            if (currentSection === 'competencias') {
                showSection(currentSection);
            }
        })
        .subscribe();
    
    // Subscribe to ambientes changes
    supabase
        .channel('ambientes-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ambientes' }, async (payload) => {
            console.log('🔄 Ambientes changed:', payload);
            await loadDataFromSupabase();
            if (currentSection === 'ambientes') {
                showSection(currentSection);
            }
        })
        .subscribe();
    
    // Subscribe to instructores changes
    supabase
        .channel('instructores-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'instructores' }, async (payload) => {
            console.log('🔄 Instructores changed:', payload);
            await loadDataFromSupabase();
            if (currentSection === 'instructores') {
                showSection(currentSection);
            }
        })
        .subscribe();
    
    // Subscribe to programaciones changes
    supabase
        .channel('programaciones-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'programaciones' }, async (payload) => {
            console.log('🔄 Programaciones changed:', payload);
            await loadDataFromSupabase();
            if (currentSection === 'programacion' || currentSection === 'reportes') {
                showSection(currentSection);
            }
        })
        .subscribe();
    
    console.log('✅ Real-time subscriptions active');
}

function loadInitialData() {
    // Fichas iniciales
    fichas = [
        {
            id: 1,
            nombre: 'Técnico en Mecánica Automotriz',
            competencia_principal: 'Mecánica Automotriz',
            ciudad: 'Bogotá',
            fecha_inicio: '01/01/2025',
            fecha_fin: '30/06/2025',
            horas_totales: 120,
            estado: 'Activo',
            fecha_creacion: new Date().toLocaleDateString('es-CO')
        },
        {
            id: 2,
            nombre: 'Técnico en Sistemas Computacionales',
            competencia_principal: 'Sistemas Computacionales',
            ciudad: 'Medellín',
            fecha_inicio: '15/02/2025',
            fecha_fin: '15/08/2025',
            horas_totales: 100,
            estado: 'Activo',
            fecha_creacion: new Date().toLocaleDateString('es-CO')
        }
    ];
    nextFichaId = 3;

    // Competencias iniciales
    competencias = [
        { id: 1, ficha_id: 1, nombre: 'Diagnóstico de Motores', horas_totales: 40 },
        { id: 2, ficha_id: 1, nombre: 'Sistemas de Frenos', horas_totales: 40 },
        { id: 3, ficha_id: 1, nombre: 'Eléctrica Automotriz', horas_totales: 40 },
        { id: 4, ficha_id: 2, nombre: 'Programación Básica', horas_totales: 50 },
        { id: 5, ficha_id: 2, nombre: 'Redes Computacionales', horas_totales: 50 }
    ];
    nextCompetenciaId = 6;

    // Ambientes iniciales
    ambientes = [
        { id: 1, codigo: 'A-101', nombre: 'Aula Técnica 1', tipo: 'Aula', capacidad: 30, ciudad: 'Bogotá', disponible: true },
        { id: 2, codigo: 'LAB-02', nombre: 'Laboratorio Automotriz', tipo: 'Laboratorio', capacidad: 15, ciudad: 'Bogotá', disponible: true },
        { id: 3, codigo: 'A-201', nombre: 'Aula Sistemas', tipo: 'Aula', capacidad: 25, ciudad: 'Medellín', disponible: true },
        { id: 4, codigo: 'V-001', nombre: 'Sala Virtual', tipo: 'Virtual', capacidad: 50, ciudad: 'Bogotá', disponible: true }
    ];
    nextAmbienteId = 5;

    // Instructores iniciales
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
        },
        {
            id: 2,
            documento: '87654321',
            nombre: 'María López Rodríguez',
            profesion: 'Técnica en Sistemas',
            celular: '3109876543',
            correo: 'maria.lopez@email.com',
            fecha_inicio_contrato: '15/02/2025',
            fecha_fin_contrato: '15/08/2025',
            horas_contratadas: 160
        },
        {
            id: 3,
            documento: '11111111',
            nombre: 'Carlos Rodríguez Martínez',
            profesion: 'Electricista Especializado',
            celular: '3005551234',
            correo: 'carlos.rodriguez@email.com',
            fecha_inicio_contrato: '01/01/2025',
            fecha_fin_contrato: '30/06/2025',
            horas_contratadas: 180
        }
    ];
    nextInstructorId = 4;

    // Programaciones iniciales
    programaciones = [
        {
            id: 1,
            ficha_id: 1,
            competencia_id: 1,
            instructor_id: 1,
            ambiente_id: 1,
            horas: 20,
            fecha_inicio: '01/02/2025',
            fecha_fin: '15/03/2025',
            estado: 'Programada'
        },
        {
            id: 2,
            ficha_id: 1,
            competencia_id: 1,
            instructor_id: 2,
            ambiente_id: 2,
            horas: 20,
            fecha_inicio: '16/03/2025',
            fecha_fin: '30/04/2025',
            estado: 'Programada'
        }
    ];
    nextProgramacionId = 3;
}

function setupEventListeners() {
    // Menu navigation
    document.querySelectorAll('.menu-item[data-section]').forEach(item => {
        item.addEventListener('click', () => {
            showSection(item.dataset.section);
        });
    });
}
// ========== MOBILE MENU ==========
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const btn = document.getElementById('mobileMenuBtn');
    
    if (sidebar.classList.contains('mobile-open')) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const btn = document.getElementById('mobileMenuBtn');
    
    sidebar.classList.add('mobile-open');
    btn.textContent = '✕';
}

function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const btn = document.getElementById('mobileMenuBtn');
    
    sidebar.classList.remove('mobile-open');
    btn.textContent = '☰';
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const btn = document.getElementById('mobileMenuBtn');
    
    if (sidebar && btn && sidebar.classList.contains('mobile-open')) {
        if (!sidebar.contains(e.target) && !btn.contains(e.target)) {
            closeMobileMenu();
        }
    }
});
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
    
    // Update menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.menu-item[data-section="${sectionId}"]`)?.classList.add('active');
    
    // Render section
    const mainContent = document.getElementById('mainContent');
    
    switch(sectionId) {
        case 'resumen':
            renderResumen(mainContent);
            break;
        case 'fichas':
            renderFichas(mainContent);
            break;
        case 'competencias':
            renderCompetencias(mainContent);
            break;
        case 'ambientes':
            renderAmbientes(mainContent);
            break;
        case 'instructores':
            renderInstructores(mainContent);
            break;
        case 'programacion':
            renderProgramacion(mainContent);
            break;
        case 'reportes':
            renderReportes(mainContent);
            break;
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

function getProgressColor(percentage) {
    if (percentage >= 100) return 'progress-complete';
    if (percentage > 0) return 'progress-partial';
    return 'progress-incomplete';
}

function formatDate(dateString) {
    return dateString;
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^\d{10}$/.test(phone);
}

function exportToCSV(filename, data) {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ========== SECTION RENDERERS ==========

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
            <h2 style="margin-bottom: 24px; color: var(--sena-blue);">Panel de Resumen</h2>
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
            
            <div class="table-container">
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
                                <th>Fecha Fin</th>
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
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state">No se encontraron fichas</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(f => `
        <tr>
            <td>${f.id}</td>
            <td><strong>${f.nombre}</strong></td>
            <td>${f.competencia_principal}</td>
            <td>${f.ciudad}</td>
            <td>${f.fecha_inicio}</td>
            <td>${f.fecha_fin}</td>
            <td>${f.horas_totales}h</td>
            <td><span class="status-badge status-${f.estado.toLowerCase()}">${f.estado}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-secondary" onclick="editFicha(${f.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteFicha(${f.id})">Eliminar</button>
                    <button class="btn btn-sm btn-success" onclick="viewFichaDetails(${f.id})">Ver Detalles</button>
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
                            <label class="form-label required">Nombre del Curso</label>
                            <input type="text" id="fichaNombre" class="form-control" required minlength="3">
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Competencia Principal</label>
                            <input type="text" id="fichaCompetencia" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Ciudad</label>
                            <select id="fichaCiudad" class="form-control" required>
                                <option value="">Seleccionar ciudad</option>
                                ${CIUDADES.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Fecha Inicio</label>
                            <input type="date" id="fichaFechaInicio" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Fecha Terminación</label>
                            <input type="date" id="fichaFechaFin" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Horas Totales</label>
                            <input type="number" id="fichaHoras" class="form-control" required min="1">
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Estado</label>
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

async function saveFicha(event) {
    event.preventDefault();
    
    const id = document.getElementById('fichaId').value;
    const fechaInicio = document.getElementById('fichaFechaInicio').value;
    const fechaFin = document.getElementById('fichaFechaFin').value;
    
    if (new Date(fechaFin) <= new Date(fechaInicio)) {
        alert('La fecha de terminación debe ser posterior a la fecha de inicio');
        return;
    }
    
    const fichaData = {
        nombre: document.getElementById('fichaNombre').value.trim(),
        competencia_principal: document.getElementById('fichaCompetencia').value.trim(),
        ciudad: document.getElementById('fichaCiudad').value,
        fecha_inicio: fechaInicio.split('-').reverse().join('/'),
        fecha_fin: fechaFin.split('-').reverse().join('/'),
        horas_totales: parseInt(document.getElementById('fichaHoras').value),
        estado: document.getElementById('fichaEstado').value
    };
    
    try {
        if (id) {
            // Update existing ficha
            if (isConnected) {
                const { error } = await supabase
                    .from('fichas')
                    .update(fichaData)
                    .eq('id', parseInt(id));
                
                if (error) throw error;
            }
            const ficha = fichas.find(f => f.id === parseInt(id));
            Object.assign(ficha, fichaData);
        } else {
            // Insert new ficha
            const newFicha = {
                id: nextFichaId++,
                ...fichaData,
                fecha_creacion: new Date().toLocaleDateString('es-CO')
            };
            
            if (isConnected) {
                const { error } = await supabase
                    .from('fichas')
                    .insert([newFicha]);
                
                if (error) throw error;
            }
            fichas.push(newFicha);
        }
        
        closeFichaModal();
        updateFichasTable();
    } catch (error) {
        console.error('Error saving ficha:', error);
        alert('Error al guardar la ficha. Por favor intente nuevamente.');
    }
}

async function deleteFicha(id) {
    const tieneCompetencias = competencias.some(c => c.ficha_id === id);
    const tieneProgramaciones = programaciones.some(p => p.ficha_id === id);
    
    let message = '¿Está seguro que desea eliminar esta ficha?';
    if (tieneCompetencias || tieneProgramaciones) {
        message = '¿Está seguro? Se eliminarán también las competencias y programaciones vinculadas.';
    }
    
    if (!confirm(message)) return;
    
    try {
        if (isConnected) {
            // Delete related programaciones
            await supabase.from('programaciones').delete().eq('ficha_id', id);
            
            // Delete related competencias
            await supabase.from('competencias').delete().eq('ficha_id', id);
            
            // Delete ficha
            const { error } = await supabase.from('fichas').delete().eq('id', id);
            if (error) throw error;
        }
        
        // Update local data
        programaciones = programaciones.filter(p => p.ficha_id !== id);
        competencias = competencias.filter(c => c.ficha_id !== id);
        fichas = fichas.filter(f => f.id !== id);
        
        updateFichasTable();
    } catch (error) {
        console.error('Error deleting ficha:', error);
        alert('Error al eliminar la ficha.');
    }
}

function viewFichaDetails(id) {
    const ficha = fichas.find(f => f.id === id);
    if (!ficha) return;
    
    const competenciasFicha = competencias.filter(c => c.ficha_id === id);
    const programacionesFicha = programaciones.filter(p => p.ficha_id === id);
    
    let html = `
        <div class="modal active">
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h3>Detalles de Ficha: ${ficha.nombre}</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="background: #f8f9fa; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
                        <p><strong>ID:</strong> ${ficha.id}</p>
                        <p><strong>Competencia Principal:</strong> ${ficha.competencia_principal}</p>
                        <p><strong>Ciudad:</strong> ${ficha.ciudad}</p>
                        <p><strong>Fecha Inicio:</strong> ${ficha.fecha_inicio}</p>
                        <p><strong>Fecha Fin:</strong> ${ficha.fecha_fin}</p>
                        <p><strong>Horas Totales:</strong> ${ficha.horas_totales}h</p>
                        <p><strong>Estado:</strong> <span class="status-badge status-${ficha.estado.toLowerCase()}">${ficha.estado}</span></p>
                    </div>
                    
                    <h4>Competencias Asociadas</h4>
                    ${competenciasFicha.length > 0 ? `
                        <table style="width: 100%; margin-bottom: 20px;">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Horas Totales</th>
                                    <th>Programadas</th>
                                    <th>Restantes</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${competenciasFicha.map(c => {
                                    const programadas = calcularHorasProgramadas(c.id);
                                    return `
                                        <tr>
                                            <td>${c.nombre}</td>
                                            <td>${c.horas_totales}h</td>
                                            <td>${programadas}h</td>
                                            <td>${c.horas_totales - programadas}h</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    ` : '<p>No hay competencias asociadas</p>'}
                    
                    <h4>Programaciones</h4>
                    ${programacionesFicha.length > 0 ? `
                        <table style="width: 100%;">
                            <thead>
                                <tr>
                                    <th>Competencia</th>
                                    <th>Instructor</th>
                                    <th>Ambiente</th>
                                    <th>Horas</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${programacionesFicha.map(p => {
                                    const comp = competencias.find(c => c.id === p.competencia_id);
                                    const inst = instructores.find(i => i.id === p.instructor_id);
                                    const amb = ambientes.find(a => a.id === p.ambiente_id);
                                    return `
                                        <tr>
                                            <td>${comp?.nombre || 'N/A'}</td>
                                            <td>${inst?.nombre || 'N/A'}</td>
                                            <td>${amb?.nombre || 'N/A'}</td>
                                            <td>${p.horas}h</td>
                                            <td><span class="status-badge status-${p.estado.toLowerCase().replace(' ', '')}">${p.estado}</span></td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    ` : '<p>No hay programaciones</p>'}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

// COMPETENCIAS
function renderCompetencias(container) {
    container.innerHTML = `
        <section class="section active">
            <div class="section-header">
                <h2>Gestión de Competencias</h2>
            </div>
            
            <div class="filters">
                <div class="filter-item">
                    <label>Ficha</label>
                    <select id="filterFichaCompetencia" class="form-control" onchange="updateCompetenciasTable()">
                        <option value="">Seleccionar ficha</option>
                        ${fichas.map(f => `<option value="${f.id}">${f.nombre}</option>`).join('')}
                    </select>
                </div>
                <button class="btn btn-primary" onclick="openCompetenciaModal()" id="btnAgregarCompetencia" disabled>+ Agregar Competencia</button>
            </div>
            
            <div class="table-container">
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Horas Totales</th>
                                <th>Programadas</th>
                                <th>Restantes</th>
                                <th>% Cobertura</th>
                                <th>Progreso</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="competenciasTableBody">
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        
        ${getCompetenciaModal()}
    `;
    
    updateCompetenciasTable();
}

function updateCompetenciasTable() {
    const fichaId = parseInt(document.getElementById('filterFichaCompetencia')?.value || '0');
    const tbody = document.getElementById('competenciasTableBody');
    const btnAgregar = document.getElementById('btnAgregarCompetencia');
    
    if (!tbody) return;
    
    if (btnAgregar) {
        btnAgregar.disabled = !fichaId;
    }
    
    if (!fichaId) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Seleccione una ficha para ver sus competencias</td></tr>';
        return;
    }
    
    const filtered = competencias.filter(c => c.ficha_id === fichaId);
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Esta ficha no tiene competencias asignadas</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(c => {
        const programadas = calcularHorasProgramadas(c.id);
        const restantes = c.horas_totales - programadas;
        const porcentaje = (programadas / c.horas_totales * 100).toFixed(0);
        const colorClass = getProgressColor(parseFloat(porcentaje));
        
        let estado = '';
        if (parseFloat(porcentaje) === 100) estado = '✓ Completa';
        else if (parseFloat(porcentaje) > 0) estado = '⚠️ Parcial';
        else estado = '❌ Pendiente';
        
        return `
            <tr>
                <td><strong>${c.nombre}</strong></td>
                <td>${c.horas_totales}h</td>
                <td>${programadas}h</td>
                <td style="color: ${restantes > 0 ? 'var(--sena-red)' : 'var(--sena-green)'}; font-weight: bold;">${restantes}h</td>
                <td>${porcentaje}%</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill ${colorClass}" style="width: ${Math.min(porcentaje, 100)}%">${porcentaje}%</div>
                    </div>
                </td>
                <td>${estado}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-secondary" onclick="editCompetencia(${c.id})">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCompetencia(${c.id})">Eliminar</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function getCompetenciaModal() {
    return `
        <div id="competenciaModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="competenciaModalTitle">Nueva Competencia</h3>
                    <button class="close-modal" onclick="closeCompetenciaModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="competenciaForm" onsubmit="saveCompetencia(event)">
                        <div class="form-group">
                            <label class="form-label required">Nombre de la Competencia</label>
                            <input type="text" id="competenciaNombre" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Horas Totales</label>
                            <input type="number" id="competenciaHoras" class="form-control" required min="1">
                        </div>
                        <input type="hidden" id="competenciaId">
                        <input type="hidden" id="competenciaFichaId">
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeCompetenciaModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="document.getElementById('competenciaForm').requestSubmit()">Guardar</button>
                </div>
            </div>
        </div>
    `;
}

function openCompetenciaModal() {
    const fichaId = document.getElementById('filterFichaCompetencia').value;
    if (!fichaId) {
        alert('Seleccione una ficha primero');
        return;
    }
    
    document.getElementById('competenciaModalTitle').textContent = 'Nueva Competencia';
    document.getElementById('competenciaForm').reset();
    document.getElementById('competenciaId').value = '';
    document.getElementById('competenciaFichaId').value = fichaId;
    document.getElementById('competenciaModal').classList.add('active');
}

function closeCompetenciaModal() {
    document.getElementById('competenciaModal').classList.remove('active');
}

function editCompetencia(id) {
    const comp = competencias.find(c => c.id === id);
    if (!comp) return;
    
    document.getElementById('competenciaModalTitle').textContent = 'Editar Competencia';
    document.getElementById('competenciaId').value = comp.id;
    document.getElementById('competenciaFichaId').value = comp.ficha_id;
    document.getElementById('competenciaNombre').value = comp.nombre;
    document.getElementById('competenciaHoras').value = comp.horas_totales;
    document.getElementById('competenciaModal').classList.add('active');
}

async function saveCompetencia(event) {
    event.preventDefault();
    
    const id = document.getElementById('competenciaId').value;
    const fichaId = parseInt(document.getElementById('competenciaFichaId').value);
    const nombre = document.getElementById('competenciaNombre').value.trim();
    const horas = parseInt(document.getElementById('competenciaHoras').value);
    
    // Check for duplicates
    const duplicate = competencias.find(c => 
        c.ficha_id === fichaId && 
        c.nombre.toLowerCase() === nombre.toLowerCase() && 
        (!id || c.id !== parseInt(id))
    );
    
    if (duplicate) {
        alert('Ya existe una competencia con ese nombre en esta ficha');
        return;
    }
    
    try {
        if (id) {
            const comp = competencias.find(c => c.id === parseInt(id));
            const programadas = calcularHorasProgramadas(comp.id);
            if (horas < programadas) {
                alert(`No puede establecer horas totales (${horas}) menores a las ya programadas (${programadas})`);
                return;
            }
            
            if (isConnected) {
                const { error } = await supabase
                    .from('competencias')
                    .update({ nombre, horas_totales: horas })
                    .eq('id', parseInt(id));
                
                if (error) throw error;
            }
            comp.nombre = nombre;
            comp.horas_totales = horas;
        } else {
            const newComp = {
                id: nextCompetenciaId++,
                ficha_id: fichaId,
                nombre,
                horas_totales: horas
            };
            
            if (isConnected) {
                const { error } = await supabase
                    .from('competencias')
                    .insert([newComp]);
                
                if (error) throw error;
            }
            competencias.push(newComp);
        }
        
        closeCompetenciaModal();
        updateCompetenciasTable();
    } catch (error) {
        console.error('Error saving competencia:', error);
        alert('Error al guardar la competencia.');
    }
}

async function deleteCompetencia(id) {
    const tieneProgramaciones = programaciones.some(p => p.competencia_id === id);
    
    let message = '¿Está seguro que desea eliminar esta competencia?';
    if (tieneProgramaciones) {
        message = '¿Está seguro? Se eliminarán también las programaciones vinculadas.';
    }
    
    if (!confirm(message)) return;
    
    try {
        if (isConnected) {
            await supabase.from('programaciones').delete().eq('competencia_id', id);
            const { error } = await supabase.from('competencias').delete().eq('id', id);
            if (error) throw error;
        }
        
        programaciones = programaciones.filter(p => p.competencia_id !== id);
        competencias = competencias.filter(c => c.id !== id);
        
        updateCompetenciasTable();
    } catch (error) {
        console.error('Error deleting competencia:', error);
        alert('Error al eliminar la competencia.');
    }
}

// AMBIENTES
function renderAmbientes(container) {
    container.innerHTML = `
        <section class="section active">
            <div class="section-header">
                <h2>Gestión de Ambientes</h2>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <input type="text" id="searchAmbientes" class="search-box" placeholder="Buscar ambientes..." onkeyup="filterAmbientes()">
                    <select id="filterTipoAmbiente" class="form-control" onchange="filterAmbientes()">
                        <option value="">Todos los tipos</option>
                        ${TIPOS_AMBIENTE.map(t => `<option value="${t}">${t}</option>`).join('')}
                    </select>
                    <button class="btn btn-primary" onclick="openAmbienteModal()">+ Nuevo Ambiente</button>
                </div>
            </div>
            
            <div class="table-container">
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Capacidad</th>
                                <th>Ciudad</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="ambientesTableBody">
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        
        ${getAmbienteModal()}
    `;
    
    updateAmbientesTable();
}

function filterAmbientes() {
    updateAmbientesTable();
}

function updateAmbientesTable() {
    const search = document.getElementById('searchAmbientes')?.value.toLowerCase() || '';
    const tipo = document.getElementById('filterTipoAmbiente')?.value || '';
    
    const filtered = ambientes.filter(a => {
        const matchSearch = a.codigo.toLowerCase().includes(search) || a.nombre.toLowerCase().includes(search);
        const matchTipo = !tipo || a.tipo === tipo;
        return matchSearch && matchTipo;
    });
    
    const tbody = document.getElementById('ambientesTableBody');
    if (!tbody) return;
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No se encontraron ambientes</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(a => `
        <tr>
            <td><strong>${a.codigo}</strong></td>
            <td>${a.nombre}</td>
            <td>${a.tipo}</td>
            <td>${a.capacidad}</td>
            <td>${a.ciudad}</td>
            <td>
                ${a.disponible ? 
                    '<span style="color: var(--sena-green); font-weight: bold;">✓ Disponible</span>' : 
                    '<span style="color: var(--sena-red); font-weight: bold;">✗ No disponible</span>'}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-secondary" onclick="editAmbiente(${a.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAmbiente(${a.id})">Eliminar</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getAmbienteModal() {
    return `
        <div id="ambienteModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="ambienteModalTitle">Nuevo Ambiente</h3>
                    <button class="close-modal" onclick="closeAmbienteModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="ambienteForm" onsubmit="saveAmbiente(event)">
                        <div class="form-group">
                            <label class="form-label required">Código</label>
                            <input type="text" id="ambienteCodigo" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Nombre</label>
                            <input type="text" id="ambienteNombre" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Tipo</label>
                            <select id="ambienteTipo" class="form-control" required>
                                ${TIPOS_AMBIENTE.map(t => `<option value="${t}">${t}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Capacidad</label>
                            <input type="number" id="ambienteCapacidad" class="form-control" required min="1">
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Ciudad</label>
                            <select id="ambienteCiudad" class="form-control" required>
                                ${CIUDADES.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">
                                <input type="checkbox" id="ambienteDisponible" checked> Disponible
                            </label>
                        </div>
                        <input type="hidden" id="ambienteId">
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeAmbienteModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="document.getElementById('ambienteForm').requestSubmit()">Guardar</button>
                </div>
            </div>
        </div>
    `;
}

function openAmbienteModal() {
    document.getElementById('ambienteModalTitle').textContent = 'Nuevo Ambiente';
    document.getElementById('ambienteForm').reset();
    document.getElementById('ambienteId').value = '';
    document.getElementById('ambienteDisponible').checked = true;
    document.getElementById('ambienteModal').classList.add('active');
}

function closeAmbienteModal() {
    document.getElementById('ambienteModal').classList.remove('active');
}

function editAmbiente(id) {
    const amb = ambientes.find(a => a.id === id);
    if (!amb) return;
    
    document.getElementById('ambienteModalTitle').textContent = 'Editar Ambiente';
    document.getElementById('ambienteId').value = amb.id;
    document.getElementById('ambienteCodigo').value = amb.codigo;
    document.getElementById('ambienteNombre').value = amb.nombre;
    document.getElementById('ambienteTipo').value = amb.tipo;
    document.getElementById('ambienteCapacidad').value = amb.capacidad;
    document.getElementById('ambienteCiudad').value = amb.ciudad;
    document.getElementById('ambienteDisponible').checked = amb.disponible;
    document.getElementById('ambienteModal').classList.add('active');
}

async function saveAmbiente(event) {
    event.preventDefault();
    
    const id = document.getElementById('ambienteId').value;
    const codigo = document.getElementById('ambienteCodigo').value.trim();
    
    // Check for duplicate codigo
    const duplicate = ambientes.find(a => 
        a.codigo.toLowerCase() === codigo.toLowerCase() && 
        (!id || a.id !== parseInt(id))
    );
    
    if (duplicate) {
        alert('Ya existe un ambiente con ese código');
        return;
    }
    
    const ambienteData = {
        codigo,
        nombre: document.getElementById('ambienteNombre').value.trim(),
        tipo: document.getElementById('ambienteTipo').value,
        capacidad: parseInt(document.getElementById('ambienteCapacidad').value),
        ciudad: document.getElementById('ambienteCiudad').value,
        disponible: document.getElementById('ambienteDisponible').checked
    };
    
    try {
        if (id) {
            if (isConnected) {
                const { error } = await supabase
                    .from('ambientes')
                    .update(ambienteData)
                    .eq('id', parseInt(id));
                
                if (error) throw error;
            }
            const amb = ambientes.find(a => a.id === parseInt(id));
            Object.assign(amb, ambienteData);
        } else {
            const newAmb = {
                id: nextAmbienteId++,
                ...ambienteData
            };
            
            if (isConnected) {
                const { error } = await supabase
                    .from('ambientes')
                    .insert([newAmb]);
                
                if (error) throw error;
            }
            ambientes.push(newAmb);
        }
        
        closeAmbienteModal();
        updateAmbientesTable();
    } catch (error) {
        console.error('Error saving ambiente:', error);
        alert('Error al guardar el ambiente.');
    }
}

async function deleteAmbiente(id) {
    const tieneProgramaciones = programaciones.some(p => p.ambiente_id === id);
    
    let message = '¿Está seguro que desea eliminar este ambiente?';
    if (tieneProgramaciones) {
        message = 'Este ambiente está asignado a programaciones. ¿Desea eliminarlo de todas formas?';
    }
    
    if (!confirm(message)) return;
    
    try {
        if (isConnected) {
            if (tieneProgramaciones) {
                await supabase.from('programaciones').delete().eq('ambiente_id', id);
            }
            const { error } = await supabase.from('ambientes').delete().eq('id', id);
            if (error) throw error;
        }
        
        if (tieneProgramaciones) {
            programaciones = programaciones.filter(p => p.ambiente_id !== id);
        }
        ambientes = ambientes.filter(a => a.id !== id);
        updateAmbientesTable();
    } catch (error) {
        console.error('Error deleting ambiente:', error);
        alert('Error al eliminar el ambiente.');
    }
}

// INSTRUCTORES
function renderInstructores(container) {
    container.innerHTML = `
        <section class="section active">
            <div class="section-header">
                <h2>Gestión de Instructores</h2>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <input type="text" id="searchInstructores" class="search-box" placeholder="Buscar instructores..." onkeyup="filterInstructores()">
                    <button class="btn btn-primary" onclick="openInstructorModal()">+ Nuevo Instructor</button>
                </div>
            </div>
            
            <div class="table-container">
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Documento</th>
                                <th>Nombre</th>
                                <th>Profesión</th>
                                <th>Celular</th>
                                <th>Correo</th>
                                <th>H. Contratadas</th>
                                <th>H. Programadas</th>
                                <th>H. Disponibles</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="instructoresTableBody">
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        
        ${getInstructorModal()}
    `;
    
    updateInstructoresTable();
}

function filterInstructores() {
    updateInstructoresTable();
}

function updateInstructoresTable() {
    const search = document.getElementById('searchInstructores')?.value.toLowerCase() || '';
    
    const filtered = instructores.filter(i => {
        return i.nombre.toLowerCase().includes(search) || 
               i.documento.includes(search) ||
               i.profesion.toLowerCase().includes(search);
    });
    
    const tbody = document.getElementById('instructoresTableBody');
    if (!tbody) return;
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state">No se encontraron instructores</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(i => {
        const programadas = programaciones.filter(p => p.instructor_id === i.id).reduce((sum, p) => sum + p.horas, 0);
        const disponibles = i.horas_contratadas - programadas;
        const porcentaje = (programadas / i.horas_contratadas * 100).toFixed(0);
        
        let colorClass = 'var(--sena-green)';
        if (porcentaje >= 100) colorClass = 'var(--sena-red)';
        else if (porcentaje >= 75) colorClass = 'var(--sena-yellow)';
        
        return `
            <tr>
                <td><strong>${i.documento}</strong></td>
                <td>${i.nombre}</td>
                <td>${i.profesion}</td>
                <td>${i.celular}</td>
                <td>${i.correo}</td>
                <td>${i.horas_contratadas}h</td>
                <td>${programadas}h</td>
                <td style="color: ${colorClass}; font-weight: bold;">${disponibles}h</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-secondary" onclick="editInstructor(${i.id})">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteInstructor(${i.id})">Eliminar</button>
                        <button class="btn btn-sm btn-success" onclick="viewInstructorDetails(${i.id})">Ver</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function getInstructorModal() {
    return `
        <div id="instructorModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="instructorModalTitle">Nuevo Instructor</h3>
                    <button class="close-modal" onclick="closeInstructorModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="instructorForm" onsubmit="saveInstructor(event)">
                        <div class="form-group">
                            <label class="form-label required">Documento (CC)</label>
                            <input type="text" id="instructorDocumento" class="form-control" required pattern="[0-9]+">
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Nombre Completo</label>
                            <input type="text" id="instructorNombre" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Profesión/Título</label>
                            <input type="text" id="instructorProfesion" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Celular (10 dígitos)</label>
                            <input type="tel" id="instructorCelular" class="form-control" required pattern="[0-9]{10}">
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Correo Electrónico</label>
                            <input type="email" id="instructorCorreo" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Fecha Inicio Contrato</label>
                            <input type="date" id="instructorFechaInicio" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Fecha Terminación Contrato</label>
                            <input type="date" id="instructorFechaFin" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Horas Contratadas (Total)</label>
                            <input type="number" id="instructorHoras" class="form-control" required min="1">
                        </div>
                        <input type="hidden" id="instructorId">
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeInstructorModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="document.getElementById('instructorForm').requestSubmit()">Guardar</button>
                </div>
            </div>
        </div>
    `;
}

function openInstructorModal() {
    document.getElementById('instructorModalTitle').textContent = 'Nuevo Instructor';
    document.getElementById('instructorForm').reset();
    document.getElementById('instructorId').value = '';
    document.getElementById('instructorModal').classList.add('active');
}

function closeInstructorModal() {
    document.getElementById('instructorModal').classList.remove('active');
}

function editInstructor(id) {
    const inst = instructores.find(i => i.id === id);
    if (!inst) return;
    
    document.getElementById('instructorModalTitle').textContent = 'Editar Instructor';
    document.getElementById('instructorId').value = inst.id;
    document.getElementById('instructorDocumento').value = inst.documento;
    document.getElementById('instructorNombre').value = inst.nombre;
    document.getElementById('instructorProfesion').value = inst.profesion;
    document.getElementById('instructorCelular').value = inst.celular;
    document.getElementById('instructorCorreo').value = inst.correo;
    
    const [di, mi, yi] = inst.fecha_inicio_contrato.split('/');
    document.getElementById('instructorFechaInicio').value = `${yi}-${mi}-${di}`;
    const [df, mf, yf] = inst.fecha_fin_contrato.split('/');
    document.getElementById('instructorFechaFin').value = `${yf}-${mf}-${df}`;
    
    document.getElementById('instructorHoras').value = inst.horas_contratadas;
    document.getElementById('instructorModal').classList.add('active');
}

async function saveInstructor(event) {
    event.preventDefault();
    
    const id = document.getElementById('instructorId').value;
    const documento = document.getElementById('instructorDocumento').value.trim();
    const celular = document.getElementById('instructorCelular').value.trim();
    const correo = document.getElementById('instructorCorreo').value.trim();
    
    // Validations
    if (!validatePhone(celular)) {
        alert('El celular debe tener exactamente 10 dígitos');
        return;
    }
    
    if (!validateEmail(correo)) {
        alert('Ingrese un correo electrónico válido');
        return;
    }
    
    // Check duplicate documento
    const duplicate = instructores.find(i => 
        i.documento === documento && 
        (!id || i.id !== parseInt(id))
    );
    
    if (duplicate) {
        alert('Ya existe un instructor con ese número de documento');
        return;
    }
    
    const fechaInicio = document.getElementById('instructorFechaInicio').value;
    const fechaFin = document.getElementById('instructorFechaFin').value;
    
    if (new Date(fechaFin) <= new Date(fechaInicio)) {
        alert('La fecha de terminación debe ser posterior a la fecha de inicio');
        return;
    }
    
    const instructorData = {
        documento,
        nombre: document.getElementById('instructorNombre').value.trim(),
        profesion: document.getElementById('instructorProfesion').value.trim(),
        celular,
        correo,
        fecha_inicio_contrato: fechaInicio.split('-').reverse().join('/'),
        fecha_fin_contrato: fechaFin.split('-').reverse().join('/'),
        horas_contratadas: parseInt(document.getElementById('instructorHoras').value)
    };
    
    try {
        if (id) {
            if (isConnected) {
                const { error } = await supabase
                    .from('instructores')
                    .update(instructorData)
                    .eq('id', parseInt(id));
                
                if (error) throw error;
            }
            const inst = instructores.find(i => i.id === parseInt(id));
            Object.assign(inst, instructorData);
        } else {
            const newInst = {
                id: nextInstructorId++,
                ...instructorData
            };
            
            if (isConnected) {
                const { error } = await supabase
                    .from('instructores')
                    .insert([newInst]);
                
                if (error) throw error;
            }
            instructores.push(newInst);
        }
        
        closeInstructorModal();
        updateInstructoresTable();
    } catch (error) {
        console.error('Error saving instructor:', error);
        alert('Error al guardar el instructor.');
    }
}

async function deleteInstructor(id) {
    const tieneProgramaciones = programaciones.some(p => p.instructor_id === id);
    
    let message = '¿Está seguro que desea eliminar este instructor?';
    if (tieneProgramaciones) {
        message = 'Este instructor tiene programaciones. ¿Desea eliminarlo de todas formas? Las programaciones también se eliminarán.';
    }
    
    if (!confirm(message)) return;
    
    try {
        if (isConnected) {
            if (tieneProgramaciones) {
                await supabase.from('programaciones').delete().eq('instructor_id', id);
            }
            const { error } = await supabase.from('instructores').delete().eq('id', id);
            if (error) throw error;
        }
        
        if (tieneProgramaciones) {
            programaciones = programaciones.filter(p => p.instructor_id !== id);
        }
        instructores = instructores.filter(i => i.id !== id);
        updateInstructoresTable();
    } catch (error) {
        console.error('Error deleting instructor:', error);
        alert('Error al eliminar el instructor.');
    }
}

function viewInstructorDetails(id) {
    const inst = instructores.find(i => i.id === id);
    if (!inst) return;
    
    const progInstructor = programaciones.filter(p => p.instructor_id === id);
    const programadas = progInstructor.reduce((sum, p) => sum + p.horas, 0);
    const disponibles = inst.horas_contratadas - programadas;
    
    let html = `
        <div class="modal active">
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h3>Detalles de Instructor: ${inst.nombre}</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="background: #f8f9fa; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
                        <p><strong>Documento:</strong> ${inst.documento}</p>
                        <p><strong>Profesión:</strong> ${inst.profesion}</p>
                        <p><strong>Celular:</strong> ${inst.celular}</p>
                        <p><strong>Correo:</strong> ${inst.correo}</p>
                        <p><strong>Contrato:</strong> ${inst.fecha_inicio_contrato} - ${inst.fecha_fin_contrato}</p>
                        <p><strong>Horas Contratadas:</strong> ${inst.horas_contratadas}h</p>
                        <p><strong>Horas Programadas:</strong> ${programadas}h</p>
                        <p><strong>Horas Disponibles:</strong> <span style="font-weight: bold; color: var(--sena-green);">${disponibles}h</span></p>
                    </div>
                    
                    <h4>Programaciones</h4>
                    ${progInstructor.length > 0 ? `
                        <table style="width: 100%;">
                            <thead>
                                <tr>
                                    <th>Ficha</th>
                                    <th>Competencia</th>
                                    <th>Ambiente</th>
                                    <th>Horas</th>
                                    <th>Fechas</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${progInstructor.map(p => {
                                    const ficha = fichas.find(f => f.id === p.ficha_id);
                                    const comp = competencias.find(c => c.id === p.competencia_id);
                                    const amb = ambientes.find(a => a.id === p.ambiente_id);
                                    return `
                                        <tr>
                                            <td>${ficha?.nombre || 'N/A'}</td>
                                            <td>${comp?.nombre || 'N/A'}</td>
                                            <td>${amb?.nombre || 'N/A'}</td>
                                            <td>${p.horas}h</td>
                                            <td>${p.fecha_inicio} - ${p.fecha_fin}</td>
                                            <td><span class="status-badge status-${p.estado.toLowerCase().replace(' ', '')}">${p.estado}</span></td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    ` : '<p>No tiene programaciones asignadas</p>'}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

// PROGRAMACIÓN
function renderProgramacion(container) {
    container.innerHTML = `
        <section class="section active">
            <div class="section-header">
                <h2>Programación de Instructores</h2>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 16px;">Paso 1: Seleccionar Ficha</h3>
                <div class="filters">
                    <div class="filter-item">
                        <label>Ficha</label>
                        <select id="progFicha" class="form-control" onchange="updateProgCompetencias()">
                            <option value="">Seleccionar ficha</option>
                            ${fichas.map(f => `<option value="${f.id}">${f.nombre}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div id="fichaResumen" style="margin-top: 16px;"></div>
            </div>
            
            <div id="competenciasSection" style="display: none;">
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h3 style="margin-bottom: 16px;">Paso 2: Seleccionar Competencia</h3>
                    <div class="table-container">
                        <div class="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Horas Totales</th>
                                        <th>Asignadas</th>
                                        <th>Restantes</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="progCompetenciasBody">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 16px;">Programaciones Actuales</h3>
                <div class="filters">
                    <input type="text" id="searchProgramaciones" class="search-box" placeholder="Buscar..." onkeyup="updateProgramacionesTable()">
                </div>
                <div class="table-container">
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Ficha</th>
                                    <th>Competencia</th>
                                    <th>Instructor</th>
                                    <th>Ambiente</th>
                                    <th>Horas</th>
                                    <th>Fechas</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="programacionesTableBody">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
        
        ${getProgramacionModal()}
    `;
    
    updateProgramacionesTable();
}

function updateProgCompetencias() {
    const fichaId = parseInt(document.getElementById('progFicha').value);
    const fichaResumen = document.getElementById('fichaResumen');
    const competenciasSection = document.getElementById('competenciasSection');
    
    if (!fichaId) {
        fichaResumen.innerHTML = '';
        competenciasSection.style.display = 'none';
        return;
    }
    
    const ficha = fichas.find(f => f.id === fichaId);
    if (!ficha) return;
    
    fichaResumen.innerHTML = `
        <div class="alert alert-info">
            <strong>${ficha.nombre}</strong><br>
            Competencia Principal: ${ficha.competencia_principal} | Ciudad: ${ficha.ciudad} | 
            Fechas: ${ficha.fecha_inicio} - ${ficha.fecha_fin} | Total Horas: ${ficha.horas_totales}h
        </div>
    `;
    
    const comps = competencias.filter(c => c.ficha_id === fichaId);
    const tbody = document.getElementById('progCompetenciasBody');
    
    const disponibles = comps.filter(c => {
        const programadas = calcularHorasProgramadas(c.id);
        return programadas < c.horas_totales;
    });
    
    if (disponibles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Todas las competencias están completamente asignadas</td></tr>';
    } else {
        tbody.innerHTML = disponibles.map(c => {
            const programadas = calcularHorasProgramadas(c.id);
            const restantes = c.horas_totales - programadas;
            return `
                <tr>
                    <td><strong>${c.nombre}</strong></td>
                    <td>${c.horas_totales}h</td>
                    <td>${programadas}h</td>
                    <td style="color: var(--sena-green); font-weight: bold;">${restantes}h</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="openProgramacionModal(${fichaId}, ${c.id})">Asignar Instructor</button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    competenciasSection.style.display = 'block';
}

function updateProgramacionesTable() {
    const search = document.getElementById('searchProgramaciones')?.value.toLowerCase() || '';
    
    const filtered = programaciones.filter(p => {
        const ficha = fichas.find(f => f.id === p.ficha_id);
        const comp = competencias.find(c => c.id === p.competencia_id);
        const inst = instructores.find(i => i.id === p.instructor_id);
        
        return (ficha?.nombre.toLowerCase().includes(search) ||
                comp?.nombre.toLowerCase().includes(search) ||
                inst?.nombre.toLowerCase().includes(search));
    });
    
    const tbody = document.getElementById('programacionesTableBody');
    if (!tbody) return;
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No hay programaciones registradas</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(p => {
        const ficha = fichas.find(f => f.id === p.ficha_id);
        const comp = competencias.find(c => c.id === p.competencia_id);
        const inst = instructores.find(i => i.id === p.instructor_id);
        const amb = ambientes.find(a => a.id === p.ambiente_id);
        
        return `
            <tr>
                <td>${ficha?.nombre || 'N/A'}</td>
                <td>${comp?.nombre || 'N/A'}</td>
                <td>${inst?.nombre || 'N/A'}</td>
                <td>${amb?.nombre || 'N/A'}</td>
                <td>${p.horas}h</td>
                <td>${p.fecha_inicio} - ${p.fecha_fin}</td>
                <td><span class="status-badge status-${p.estado.toLowerCase().replace(' ', '')}">${p.estado}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-secondary" onclick="editProgramacion(${p.id})">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteProgramacion(${p.id})">Eliminar</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function getProgramacionModal() {
    return `
        <div id="programacionModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="programacionModalTitle">Asignar Instructor</h3>
                    <button class="close-modal" onclick="closeProgramacionModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="programacionInfo" class="alert alert-info" style="margin-bottom: 16px;"></div>
                    <form id="programacionForm" onsubmit="saveProgramacion(event)">
                        <div class="form-group">
                            <label class="form-label required">Instructor</label>
                            <select id="progInstructor" class="form-control" required onchange="updateProgInfo()">
                                <option value="">Seleccionar instructor</option>
                            </select>
                            <small id="instructorInfo" style="color: var(--sena-gray);"></small>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Ambiente</label>
                            <select id="progAmbiente" class="form-control" required>
                                <option value="">Seleccionar ambiente</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Horas a Asignar</label>
                            <input type="number" id="progHoras" class="form-control" required min="1" onchange="updateProgInfo()">
                            <small id="horasInfo" style="color: var(--sena-gray);"></small>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Fecha Inicio</label>
                            <input type="date" id="progFechaInicio" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Fecha Fin</label>
                            <input type="date" id="progFechaFin" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Estado</label>
                            <select id="progEstado" class="form-control" required>
                                ${ESTADOS_PROGRAMACION.map(e => `<option value="${e}">${e}</option>`).join('')}
                            </select>
                        </div>
                        <input type="hidden" id="progId">
                        <input type="hidden" id="progFichaId">
                        <input type="hidden" id="progCompetenciaId">
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeProgramacionModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="document.getElementById('programacionForm').requestSubmit()">Guardar</button>
                </div>
            </div>
        </div>
    `;
}

function openProgramacionModal(fichaId, competenciaId) {
    const ficha = fichas.find(f => f.id === fichaId);
    const comp = competencias.find(c => c.id === competenciaId);
    
    if (!ficha || !comp) return;
    
    const programadas = calcularHorasProgramadas(competenciaId);
    const restantes = comp.horas_totales - programadas;
    
    document.getElementById('programacionModalTitle').textContent = 'Asignar Instructor';
    document.getElementById('programacionForm').reset();
    document.getElementById('progId').value = '';
    document.getElementById('progFichaId').value = fichaId;
    document.getElementById('progCompetenciaId').value = competenciaId;
    
    document.getElementById('programacionInfo').innerHTML = `
        <strong>Ficha:</strong> ${ficha.nombre}<br>
        <strong>Competencia:</strong> ${comp.nombre}<br>
        <strong>Horas Restantes:</strong> <span style="color: var(--sena-green); font-weight: bold;">${restantes}h</span>
    `;
    
    // Populate instructors with available hours
    const selectInstructor = document.getElementById('progInstructor');
    selectInstructor.innerHTML = '<option value="">Seleccionar instructor</option>';
    
    instructores.forEach(inst => {
        const disponibles = calcularHorasDisponiblesInstructor(inst.id);
        if (disponibles > 0) {
            const option = document.createElement('option');
            option.value = inst.id;
            option.textContent = `${inst.nombre} (${disponibles}h disponibles)`;
            selectInstructor.appendChild(option);
        }
    });
    
    // Populate ambientes (filter by city)
    const selectAmbiente = document.getElementById('progAmbiente');
    selectAmbiente.innerHTML = '<option value="">Seleccionar ambiente</option>';
    
    ambientes.filter(a => a.disponible && a.ciudad === ficha.ciudad).forEach(amb => {
        const option = document.createElement('option');
        option.value = amb.id;
        option.textContent = `${amb.codigo} - ${amb.nombre} (${amb.tipo})`;
        selectAmbiente.appendChild(option);
    });
    
    document.getElementById('programacionModal').classList.add('active');
    updateProgInfo();
}

function closeProgramacionModal() {
    document.getElementById('programacionModal').classList.remove('active');
}

function updateProgInfo() {
    const competenciaId = parseInt(document.getElementById('progCompetenciaId').value);
    const instructorId = parseInt(document.getElementById('progInstructor').value);
    const horas = parseInt(document.getElementById('progHoras').value) || 0;
    
    if (competenciaId) {
        const comp = competencias.find(c => c.id === competenciaId);
        const programadas = calcularHorasProgramadas(competenciaId);
        const restantes = comp.horas_totales - programadas;
        document.getElementById('horasInfo').textContent = `Horas restantes en competencia: ${restantes}h`;
    }
    
    if (instructorId) {
        const disponibles = calcularHorasDisponiblesInstructor(instructorId);
        document.getElementById('instructorInfo').textContent = `Horas disponibles del instructor: ${disponibles}h`;
    }
}

function editProgramacion(id) {
    const prog = programaciones.find(p => p.id === id);
    if (!prog) return;
    
    const ficha = fichas.find(f => f.id === prog.ficha_id);
    const comp = competencias.find(c => c.id === prog.competencia_id);
    
    document.getElementById('programacionModalTitle').textContent = 'Editar Programación';
    document.getElementById('progId').value = prog.id;
    document.getElementById('progFichaId').value = prog.ficha_id;
    document.getElementById('progCompetenciaId').value = prog.competencia_id;
    
    const programadas = calcularHorasProgramadas(prog.competencia_id);
    const restantes = comp.horas_totales - programadas + prog.horas;
    
    document.getElementById('programacionInfo').innerHTML = `
        <strong>Ficha:</strong> ${ficha?.nombre || 'N/A'}<br>
        <strong>Competencia:</strong> ${comp?.nombre || 'N/A'}<br>
        <strong>Horas Restantes:</strong> <span style="color: var(--sena-green); font-weight: bold;">${restantes}h</span>
    `;
    
    // Populate selects
    const selectInstructor = document.getElementById('progInstructor');
    selectInstructor.innerHTML = '<option value="">Seleccionar instructor</option>';
    instructores.forEach(inst => {
        const disponibles = calcularHorasDisponiblesInstructor(inst.id);
        const extra = inst.id === prog.instructor_id ? prog.horas : 0;
        if (disponibles + extra > 0) {
            const option = document.createElement('option');
            option.value = inst.id;
            option.textContent = `${inst.nombre} (${disponibles + extra}h disponibles)`;
            if (inst.id === prog.instructor_id) option.selected = true;
            selectInstructor.appendChild(option);
        }
    });
    
    const selectAmbiente = document.getElementById('progAmbiente');
    selectAmbiente.innerHTML = '<option value="">Seleccionar ambiente</option>';
    ambientes.filter(a => a.ciudad === ficha?.ciudad).forEach(amb => {
        const option = document.createElement('option');
        option.value = amb.id;
        option.textContent = `${amb.codigo} - ${amb.nombre} (${amb.tipo})`;
        if (amb.id === prog.ambiente_id) option.selected = true;
        selectAmbiente.appendChild(option);
    });
    
    document.getElementById('progHoras').value = prog.horas;
    
    const [di, mi, yi] = prog.fecha_inicio.split('/');
    document.getElementById('progFechaInicio').value = `${yi}-${mi}-${di}`;
    const [df, mf, yf] = prog.fecha_fin.split('/');
    document.getElementById('progFechaFin').value = `${yf}-${mf}-${df}`;
    
    document.getElementById('progEstado').value = prog.estado;
    document.getElementById('programacionModal').classList.add('active');
    updateProgInfo();
}

async function saveProgramacion(event) {
    event.preventDefault();
    
    const id = document.getElementById('progId').value;
    const fichaId = parseInt(document.getElementById('progFichaId').value);
    const competenciaId = parseInt(document.getElementById('progCompetenciaId').value);
    const instructorId = parseInt(document.getElementById('progInstructor').value);
    const ambienteId = parseInt(document.getElementById('progAmbiente').value);
    const horas = parseInt(document.getElementById('progHoras').value);
    const fechaInicio = document.getElementById('progFechaInicio').value;
    const fechaFin = document.getElementById('progFechaFin').value;
    const estado = document.getElementById('progEstado').value;
    
    // Validations
    if (new Date(fechaFin) <= new Date(fechaInicio)) {
        alert('La fecha de fin debe ser posterior a la fecha de inicio');
        return;
    }
    
    const comp = competencias.find(c => c.id === competenciaId);
    const programadas = calcularHorasProgramadas(competenciaId);
    const currentHoras = id ? programaciones.find(p => p.id === parseInt(id)).horas : 0;
    const restantes = comp.horas_totales - programadas + currentHoras;
    
    if (horas > restantes) {
        alert(`No puede asignar ${horas} horas. Solo hay ${restantes} horas disponibles en esta competencia.`);
        return;
    }
    
    const disponibles = calcularHorasDisponiblesInstructor(instructorId);
    const currentInstructorHoras = (id && programaciones.find(p => p.id === parseInt(id)).instructor_id === instructorId) ? programaciones.find(p => p.id === parseInt(id)).horas : 0;
    const disponiblesInstructor = disponibles + currentInstructorHoras;
    
    if (horas > disponiblesInstructor) {
        alert(`El instructor solo tiene ${disponiblesInstructor} horas disponibles.`);
        return;
    }
    
    // Check for duplicate instructor-competencia
    const duplicate = programaciones.find(p => 
        p.instructor_id === instructorId && 
        p.competencia_id === competenciaId && 
        p.ficha_id === fichaId &&
        (!id || p.id !== parseInt(id))
    );
    
    if (duplicate) {
        alert('Este instructor ya está asignado a esta competencia en esta ficha.');
        return;
    }
    
    const progData = {
        ficha_id: fichaId,
        competencia_id: competenciaId,
        instructor_id: instructorId,
        ambiente_id: ambienteId,
        horas,
        fecha_inicio: fechaInicio.split('-').reverse().join('/'),
        fecha_fin: fechaFin.split('-').reverse().join('/'),
        estado
    };
    
    try {
        if (id) {
            if (isConnected) {
                const { error } = await supabase
                    .from('programaciones')
                    .update(progData)
                    .eq('id', parseInt(id));
                
                if (error) throw error;
            }
            const prog = programaciones.find(p => p.id === parseInt(id));
            Object.assign(prog, progData);
        } else {
            const newProg = {
                id: nextProgramacionId++,
                ...progData
            };
            
            if (isConnected) {
                const { error } = await supabase
                    .from('programaciones')
                    .insert([newProg]);
                
                if (error) throw error;
            }
            programaciones.push(newProg);
        }
        
        closeProgramacionModal();
        updateProgramacionesTable();
        updateProgCompetencias();
    } catch (error) {
        console.error('Error saving programacion:', error);
        alert('Error al guardar la programación.');
    }
}

async function deleteProgramacion(id) {
    if (!confirm('¿Está seguro que desea eliminar esta programación? Las horas se liberarán.')) return;
    
    try {
        if (isConnected) {
            const { error } = await supabase.from('programaciones').delete().eq('id', id);
            if (error) throw error;
        }
        
        programaciones = programaciones.filter(p => p.id !== id);
        updateProgramacionesTable();
        updateProgCompetencias();
    } catch (error) {
        console.error('Error deleting programacion:', error);
        alert('Error al eliminar la programación.');
    }
}

// REPORTES
function renderReportes(container) {
    container.innerHTML = `
        <section class="section active">
            <h2 style="margin-bottom: 24px;">Reportes</h2>
            
            <div class="tabs">
                <button class="tab-btn active" data-tab="tab-instructores" onclick="showReportTab('tab-instructores')">Instructores</button>
                <button class="tab-btn" data-tab="tab-fichas" onclick="showReportTab('tab-fichas')">Fichas</button>
                <button class="tab-btn" data-tab="tab-pendientes" onclick="showReportTab('tab-pendientes')">Pendientes</button>
                <button class="tab-btn" data-tab="tab-matriz" onclick="showReportTab('tab-matriz')">Matriz</button>
            </div>
            
            <div id="tab-instructores" class="tab-content active">
                ${renderReporteInstructores()}
            </div>
            
            <div id="tab-fichas" class="tab-content">
                ${renderReporteFichas()}
            </div>
            
            <div id="tab-pendientes" class="tab-content">
                ${renderReportePendientes()}
            </div>
            
            <div id="tab-matriz" class="tab-content">
                ${renderReporteMatriz()}
            </div>
        </section>
    `;
}

function showReportTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

function renderReporteInstructores() {
    const rows = instructores.map(inst => {
        const programadas = programaciones.filter(p => p.instructor_id === inst.id).reduce((sum, p) => sum + p.horas, 0);
        const disponibles = inst.horas_contratadas - programadas;
        const porcentaje = (programadas / inst.horas_contratadas * 100).toFixed(0);
        
        const progs = programaciones.filter(p => p.instructor_id === inst.id);
        const detalles = progs.map(p => {
            const ficha = fichas.find(f => f.id === p.ficha_id);
            const comp = competencias.find(c => c.id === p.competencia_id);
            const amb = ambientes.find(a => a.id === p.ambiente_id);
            return `
                <tr style="background: #f8f9fa;">
                    <td colspan="3">${ficha?.nombre || 'N/A'}</td>
                    <td>${comp?.nombre || 'N/A'}</td>
                    <td>${amb?.nombre || 'N/A'}</td>
                    <td>${p.horas}h</td>
                    <td>${p.fecha_inicio} - ${p.fecha_fin}</td>
                </tr>
            `;
        }).join('');
        
        return `
            <tr>
                <td><strong>${inst.documento}</strong></td>
                <td>${inst.nombre}</td>
                <td>${inst.profesion}</td>
                <td>${inst.celular}</td>
                <td>${inst.correo}</td>
                <td>${inst.horas_contratadas}h</td>
                <td>${programadas}h</td>
                <td>${disponibles}h</td>
                <td>${porcentaje}%</td>
            </tr>
            ${detalles}
        `;
    }).join('');
    
    const fecha = new Date().toLocaleDateString('es-CO');
    
    return `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3>Listado de Instructores</h3>
            <button class="btn btn-success" onclick="exportarInstructores()">Exportar CSV</button>
        </div>
        <div class="table-container">
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Documento</th>
                            <th>Nombre</th>
                            <th>Profesión</th>
                            <th>Celular</th>
                            <th>Email</th>
                            <th>H. Contratadas</th>
                            <th>H. Programadas</th>
                            <th>H. Disponibles</th>
                            <th>% Carga</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows || '<tr><td colspan="9" class="empty-state">No hay instructores</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderReporteFichas() {
    const rows = fichas.map(ficha => {
        const comps = competencias.filter(c => c.ficha_id === ficha.id);
        const totalHorasComps = comps.reduce((sum, c) => sum + c.horas_totales, 0);
        const totalProgramadas = comps.reduce((sum, c) => sum + calcularHorasProgramadas(c.id), 0);
        const porcentaje = totalHorasComps > 0 ? (totalProgramadas / totalHorasComps * 100).toFixed(0) : 0;
        
        return `
            <tr>
                <td>${ficha.id}</td>
                <td><strong>${ficha.nombre}</strong></td>
                <td>${ficha.competencia_principal}</td>
                <td>${ficha.ciudad}</td>
                <td>${ficha.fecha_inicio}</td>
                <td>${ficha.fecha_fin}</td>
                <td>${ficha.horas_totales}h</td>
                <td>${porcentaje}%</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill ${getProgressColor(parseFloat(porcentaje))}" style="width: ${Math.min(porcentaje, 100)}%">${porcentaje}%</div>
                    </div>
                </td>
                <td><span class="status-badge status-${ficha.estado.toLowerCase()}">${ficha.estado}</span></td>
            </tr>
        `;
    }).join('');
    
    return `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3>Listado de Fichas</h3>
            <button class="btn btn-success" onclick="exportarFichas()">Exportar CSV</button>
        </div>
        <div class="table-container">
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Comp. Principal</th>
                            <th>Ciudad</th>
                            <th>Fecha Inicio</th>
                            <th>Fecha Fin</th>
                            <th>Total Horas</th>
                            <th>% Programado</th>
                            <th>Progreso</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows || '<tr><td colspan="10" class="empty-state">No hay fichas</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderReportePendientes() {
    const pendientes = [];
    
    competencias.forEach(comp => {
        const programadas = calcularHorasProgramadas(comp.id);
        if (programadas < comp.horas_totales) {
            const ficha = fichas.find(f => f.id === comp.ficha_id);
            const restantes = comp.horas_totales - programadas;
            const pctFaltante = (restantes / comp.horas_totales * 100).toFixed(0);
            pendientes.push({ ficha, comp, programadas, restantes, pctFaltante });
        }
    });
    
    pendientes.sort((a, b) => parseFloat(b.pctFaltante) - parseFloat(a.pctFaltante));
    
    const rows = pendientes.map(p => `
        <tr style="background-color: rgba(231, 76, 60, 0.05);">
            <td>${p.ficha?.nombre || 'N/A'}</td>
            <td><strong>${p.comp.nombre}</strong></td>
            <td>${p.comp.horas_totales}h</td>
            <td>${p.programadas}h</td>
            <td style="color: var(--sena-red); font-weight: bold;">${p.restantes}h</td>
            <td style="color: var(--sena-red); font-weight: bold;">${p.pctFaltante}%</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="programarAhora(${p.ficha?.id}, ${p.comp.id})">Programar Ahora</button>
            </td>
        </tr>
    `).join('');
    
    return `
        <h3 style="margin-bottom: 16px;">Competencias Pendientes</h3>
        <div class="table-container">
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Ficha</th>
                            <th>Competencia</th>
                            <th>Horas Totales</th>
                            <th>Asignadas</th>
                            <th>Restantes</th>
                            <th>% Faltante</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows || '<tr><td colspan="7" class="empty-state">¡Todas las competencias están completamente asignadas!</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderReporteMatriz() {
    let html = '<h3 style="margin-bottom: 16px;">Matriz Instructor × Ficha-Competencia</h3><div class="table-container"><div class="table-responsive"><table style="min-width: 1000px;"><thead><tr><th>Instructor</th>';
    
    competencias.forEach(comp => {
        const ficha = fichas.find(f => f.id === comp.ficha_id);
        html += `<th style="white-space: nowrap;">${ficha?.nombre.substring(0, 20) || '?'} - ${comp.nombre.substring(0, 20)}</th>`;
    });
    
    html += '<th><strong>TOTAL</strong></th></tr></thead><tbody>';
    
    instructores.forEach(inst => {
        html += `<tr><td><strong>${inst.nombre}</strong></td>`;
        let totalInst = 0;
        
        competencias.forEach(comp => {
            const prog = programaciones.find(p => p.instructor_id === inst.id && p.competencia_id === comp.id);
            if (prog) {
                html += `<td style="background-color: var(--sena-blue); color: white; text-align: center; font-weight: bold;">${prog.horas}h</td>`;
                totalInst += prog.horas;
            } else {
                html += '<td style="text-align: center; color: #ccc;">-</td>';
            }
        });
        
        html += `<td style="text-align: center; font-weight: bold;">${totalInst}h</td></tr>`;
    });
    
    html += '<tr><td><strong>TOTAL</strong></td>';
    competencias.forEach(comp => {
        const total = calcularHorasProgramadas(comp.id);
        html += `<td style="text-align: center; font-weight: bold;">${total}h</td>`;
    });
    html += '<td></td></tr>';
    
    html += '</tbody></table></div></div>';
    return html;
}

function programarAhora(fichaId, competenciaId) {
    showSection('programacion');
    setTimeout(() => {
        document.getElementById('progFicha').value = fichaId;
        updateProgCompetencias();
        setTimeout(() => {
            openProgramacionModal(fichaId, competenciaId);
        }, 100);
    }, 100);
}

function exportarInstructores() {
    const fecha = new Date().toLocaleDateString('es-CO').replace(/\//g, '-');
    let csv = 'Documento,Nombre,Profesión,Celular,Email,Horas Contratadas,Programadas,Disponibles,% Carga\n';
    
    instructores.forEach(inst => {
        const programadas = programaciones.filter(p => p.instructor_id === inst.id).reduce((sum, p) => sum + p.horas, 0);
        const disponibles = inst.horas_contratadas - programadas;
        const porcentaje = (programadas / inst.horas_contratadas * 100).toFixed(0);
        csv += `${inst.documento},"${inst.nombre}","${inst.profesion}",${inst.celular},${inst.correo},${inst.horas_contratadas},${programadas},${disponibles},${porcentaje}\n`;
    });
    
    exportToCSV(`Instructores_${fecha}.csv`, csv);
}

function exportarFichas() {
    const fecha = new Date().toLocaleDateString('es-CO').replace(/\//g, '-');
    let csv = 'ID,Nombre,Competencia Principal,Ciudad,Fecha Inicio,Fecha Fin,Total Horas,% Programado,Estado\n';
    
    fichas.forEach(ficha => {
        const comps = competencias.filter(c => c.ficha_id === ficha.id);
        const totalHorasComps = comps.reduce((sum, c) => sum + c.horas_totales, 0);
        const totalProgramadas = comps.reduce((sum, c) => sum + calcularHorasProgramadas(c.id), 0);
        const porcentaje = totalHorasComps > 0 ? (totalProgramadas / totalHorasComps * 100).toFixed(0) : 0;
        csv += `${ficha.id},"${ficha.nombre}","${ficha.competencia_principal}",${ficha.ciudad},${ficha.fecha_inicio},${ficha.fecha_fin},${ficha.horas_totales},${porcentaje},${ficha.estado}\n`;
    });
    
    exportToCSV(`Fichas_${fecha}.csv`, csv);
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
