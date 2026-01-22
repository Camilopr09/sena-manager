# 🎓 Sistema de Gestión SENA

Sistema de gestión de fichas, competencias, ambientes, instructores y programaciones para SENA.

## 📋 Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet (opcional - funciona offline con datos de ejemplo)

## 🚀 Configuración Inicial

### Opción 1: Ejecutar sin Supabase (Modo Demo)

1. Abre el archivo `index.html` en tu navegador
2. El sistema funcionará con datos de ejemplo almacenados localmente

**Credenciales de prueba:**
- Usuario: `AdminCamillo`
- Contraseña: `17954064@77`

O

- Usuario: `HebertCoordinador`
- Contraseña: `Dani.Cami@2109#`

### Opción 2: Integrar con Supabase (Base de datos en la nube)

#### Paso 1: Crear un proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Guarda la URL del proyecto y la clave anónima

#### Paso 2: Obtener las credenciales

1. En tu proyecto de Supabase, ve a **Settings > API**
2. Copia:
   - **Project URL** (URL del proyecto)
   - **anon public** (Clave anónima)

#### Paso 3: Configurar la aplicación

1. Copia el archivo `config.example.js` como `config.js`:
   ```bash
   cp config.example.js config.js
   ```

2. Abre `config.js` y reemplaza:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'https://tu-proyecto.supabase.co',
       anonKey: 'tu-clave-anonima-aqui'
   };
   ```

#### Paso 4: Actualizar app.js

En el archivo `app.js`, busca las líneas:
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

Y reemplázalas con tus credenciales de Supabase:
```javascript
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON_KEY = 'tu-clave-anonima';
```

#### Paso 5: Crear las tablas en Supabase

Ejecuta este SQL en el editor SQL de Supabase:

```sql
-- Tabla: fichas
CREATE TABLE fichas (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nombre TEXT NOT NULL,
  competencia_principal TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  fecha_inicio TEXT NOT NULL,
  fecha_fin TEXT NOT NULL,
  horas_totales INT NOT NULL,
  estado TEXT NOT NULL,
  fecha_creacion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: competencias
CREATE TABLE competencias (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  ficha_id BIGINT NOT NULL REFERENCES fichas(id),
  nombre TEXT NOT NULL,
  horas_totales INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: ambientes
CREATE TABLE ambientes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,
  capacidad INT NOT NULL,
  ciudad TEXT NOT NULL,
  disponible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: instructores
CREATE TABLE instructores (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  documento TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  profesion TEXT NOT NULL,
  celular TEXT NOT NULL,
  correo TEXT NOT NULL,
  fecha_inicio_contrato TEXT NOT NULL,
  fecha_fin_contrato TEXT NOT NULL,
  horas_contratadas INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: programaciones
CREATE TABLE programaciones (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  ficha_id BIGINT NOT NULL REFERENCES fichas(id),
  competencia_id BIGINT NOT NULL REFERENCES competencias(id),
  instructor_id BIGINT NOT NULL REFERENCES instructores(id),
  ambiente_id BIGINT NOT NULL REFERENCES ambientes(id),
  horas INT NOT NULL,
  fecha_inicio TEXT NOT NULL,
  fecha_fin TEXT NOT NULL,
  estado TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_competencias_ficha_id ON competencias(ficha_id);
CREATE INDEX idx_programaciones_ficha_id ON programaciones(ficha_id);
CREATE INDEX idx_programaciones_competencia_id ON programaciones(competencia_id);
CREATE INDEX idx_programaciones_instructor_id ON programaciones(instructor_id);
CREATE INDEX idx_programaciones_ambiente_id ON programaciones(ambiente_id);

-- Habilitar Row Level Security (opcional pero recomendado)
ALTER TABLE fichas ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructores ENABLE ROW LEVEL SECURITY;
ALTER TABLE programaciones ENABLE ROW LEVEL SECURITY;
```

## 📁 Estructura del Proyecto

```
sena-manager/
├── index.html           # Página HTML principal
├── app.js              # Lógica de la aplicación
├── config.example.js   # Ejemplo de configuración
├── config.js           # Configuración (crear desde el ejemplo)
└── README.md           # Este archivo
```

## 🎯 Características

- ✅ Gestión de Fichas (crear, editar, eliminar)
- ✅ Gestión de Competencias
- ✅ Gestión de Ambientes
- ✅ Gestión de Instructores
- ✅ Programación de instructores
- ✅ Reportes y exportación a CSV
- ✅ Modo offline con datos de ejemplo
- ✅ Sincronización en tiempo real con Supabase

## 🔐 Seguridad

- Las credenciales se cargan desde variables de configuración
- El archivo `config.js` debe ser agregado a `.gitignore` para no subir credenciales
- Se recomienda usar Row Level Security en Supabase

## 📱 Compatibilidad

- Chrome/Edge: ✅ Totalmente compatible
- Firefox: ✅ Totalmente compatible
- Safari: ✅ Totalmente compatible
- Responsive design: ✅ Funciona en móviles y tablets

## 🆘 Solución de problemas

### "supabase.from no es una función"
- **Solución**: Verifica que `SUPABASE_URL` y `SUPABASE_ANON_KEY` sean válidos
- El sistema funcionará offline con datos de ejemplo si no está configurado

### No se sincroniza con Supabase
- Verifica tu conexión a internet
- Comprueba que las credenciales sean correctas
- Revisa la consola del navegador (F12) para ver los errores

### Los datos no se guardan
- Si está funcionando en modo offline, los datos se guardan localmente
- Para persistencia permanente, debes configurar Supabase

## 📧 Contacto

Para soporte o reportar problemas, contacta al administrador del sistema.

---

**Versión**: 1.0.0  
**Última actualización**: 21 de enero de 2026
