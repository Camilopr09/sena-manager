# 📅 Calculadora de Días Hábiles - Colombia 2026

## Descripción

Esta funcionalidad agrega una calculadora automática de días hábiles para Colombia 2026 al sistema de gestión SENA. Cuando se crea o edita una programación, el sistema calcula automáticamente:

- **Días hábiles** entre las fechas seleccionadas
- **Horas totales hábiles** basadas en el horario diario establecido
- **Festivos** que caen dentro del período
- **Fines de semana** excluidos del cálculo

## 🎯 Características

### 1. Días Festivos de Colombia 2026

La calculadora incluye **todos los días festivos oficiales** de Colombia para el año 2026:

| Fecha | Festivo |
|-------|---------|
| 1 de enero | Año Nuevo |
| 12 de enero | Día de los Reyes Magos (trasladado) |
| 23 de marzo | Día de San José (trasladado) |
| 2 de abril | Jueves Santo |
| 3 de abril | Viernes Santo |
| 1 de mayo | Día del Trabajo |
| 18 de mayo | Ascensión del Señor (trasladado) |
| 8 de junio | Corpus Christi (trasladado) |
| 15 de junio | Sagrado Corazón de Jesús (trasladado) |
| 29 de junio | San Pedro y San Pablo (trasladado) |
| 20 de julio | Día de la Independencia |
| 7 de agosto | Batalla de Boyacá |
| 17 de agosto | Asunción de la Virgen (trasladado) |
| 12 de octubre | Día de la Raza (trasladado) |
| 2 de noviembre | Todos los Santos (trasladado) |
| 16 de noviembre | Independencia de Cartagena (trasladado) |
| 8 de diciembre | Inmaculada Concepción |
| 25 de diciembre | Navidad |

### 2. Cálculo Automático

La calculadora se actualiza **en tiempo real** cuando el usuario:
- Selecciona o cambia la fecha de inicio
- Selecciona o cambia la fecha de fin
- Define o modifica el horario (hora inicio/fin)

### 3. Información Detallada

El sistema muestra:
- ✅ **Total de días** en el período
- 📊 **Días hábiles** (excluyendo fines de semana y festivos)
- 🏖️ **Fines de semana** dentro del período
- 🎉 **Festivos** con nombre y fecha
- ⏰ **Horas por día** según el horario establecido
- 📈 **Total de horas hábiles** calculadas

### 4. Sugerencia Automática de Horas

Cuando el cálculo está completo, el sistema **sugiere automáticamente** el total de horas hábiles calculadas para el campo "Horas" de la programación.

## 💻 Uso

### Al Crear una Nueva Programación

1. Ve a la sección **"Programación"**
2. Haz clic en **"+ Nueva Programación"**
3. Selecciona la **Fecha Inicio** y **Fecha Fin**
4. Define el **Horario** (Hora Inicio y Hora Fin)
5. La calculadora aparecerá automáticamente mostrando:
   - Días hábiles calculados
   - Festivos en el período
   - Total de horas hábiles
6. El sistema te preguntará si deseas usar las horas calculadas

### Al Editar una Programación

1. En la tabla de programaciones, haz clic en **"Editar"**
2. Modifica las fechas o el horario según necesites
3. La calculadora se actualizará automáticamente
4. Podrás ver el nuevo cálculo de días y horas hábiles

## 📊 Ejemplo de Uso

### Caso 1: Programación de 2 meses

**Datos de entrada:**
- Fecha inicio: 3 de febrero de 2026
- Fecha fin: 3 de abril de 2026
- Horario: 8:00 AM - 12:00 PM (4 horas diarias)

**Resultado:**
```
📊 Cálculo de Días Hábiles
Total de días: 59
Días hábiles: 41
Fines de semana: 16
Festivos: 2

⏰ Cálculo de Horas Hábiles
Horas por día: 4h
Total horas hábiles: 164h

🎉 Festivos en el período:
• Día de San José (trasladado) - 23 de marzo
• Jueves Santo - 2 de abril
```

### Caso 2: Programación en Semana Santa

**Datos de entrada:**
- Fecha inicio: 30 de marzo de 2026
- Fecha fin: 10 de abril de 2026
- Horario: 2:00 PM - 6:00 PM (4 horas diarias)

**Resultado:**
```
📊 Cálculo de Días Hábiles
Total de días: 12
Días hábiles: 6
Fines de semana: 4
Festivos: 2

⏰ Cálculo de Horas Hábiles
Horas por día: 4h
Total horas hábiles: 24h

🎉 Festivos en el período:
• Jueves Santo - 2 de abril
• Viernes Santo - 3 de abril
```

## 🔧 Archivos Modificados

### Nuevos Archivos

1. **`dias-habiles-colombia.js`**
   - Contiene todas las funciones de cálculo
   - Define los festivos de Colombia 2026
   - Lógica para identificar días hábiles
   - Formateo de resultados

### Archivos Modificados

1. **`index.html`**
   - Importación del script de días hábiles
   - Modificación del modal de programación
   - Agregado de div para mostrar cálculos
   - Funciones de event listeners
   - Actualización automática del cálculo

## 🎨 Diseño Visual

La calculadora muestra información con un diseño limpio y profesional:
- **Tarjeta con fondo claro** para separar visualmente
- **Iconos intuitivos** usando Lucide Icons
- **Colores semánticos**:
  - Verde para días hábiles
  - Gris para fines de semana
  - Naranja para festivos
  - Azul para totales
- **Responsive** y adaptado al modo oscuro

## ⚠️ Validaciones

El sistema incluye validaciones para:
- ✅ Fecha de fin posterior a fecha de inicio
- ✅ Hora de fin posterior a hora de inicio
- ✅ Campos obligatorios completos
- ✅ Confirmación antes de sobrescribir horas manualmente ingresadas

## 🚀 Beneficios

1. **Precisión**: Elimina errores de cálculo manual
2. **Eficiencia**: Ahorra tiempo al programar
3. **Transparencia**: Muestra festivos y días excluidos
4. **Cumplimiento**: Considera la legislación colombiana
5. **Planificación**: Ayuda a distribuir mejor las horas de formación

## 📝 Notas Importantes

- ⚠️ Los festivos están configurados específicamente para **2026**
- 📅 Para otros años, se debe actualizar el archivo `dias-habiles-colombia.js`
- 🔄 La calculadora se actualiza en tiempo real al cambiar fechas u horarios
- 💡 El cálculo de horas es una **sugerencia**, el usuario puede modificarlo manualmente

## 🔄 Actualizaciones Futuras

Para años posteriores a 2026:
1. Actualizar el array `FESTIVOS_COLOMBIA_2026` en `dias-habiles-colombia.js`
2. Cambiar el nombre de las constantes si es necesario
3. Verificar los festivos trasladados según la Ley Emiliani

## 📞 Soporte

Si tienes preguntas o sugerencias sobre esta funcionalidad, contacta al equipo de desarrollo.

---

**Desarrollado para:** Sistema de Gestión SENA  
**Fecha:** Febrero 2026  
**Versión:** 1.0
