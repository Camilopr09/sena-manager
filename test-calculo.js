// Importar las funciones del archivo de días hábiles
const fs = require('fs');
const vm = require('vm');

// Leer el archivo de días hábiles
const scriptContent = fs.readFileSync('./dias-habiles-colombia.js', 'utf8');

// Ejecutar el script en un contexto
const context = {};
vm.createContext(context);
vm.runInContext(scriptContent, context);

// Hacer las funciones disponibles
const calcularHorasHabiles = context.calcularHorasHabiles;
const obtenerDetalleCalculo = context.obtenerDetalleCalculo;

// Probar el cálculo específico
console.log('=== PRUEBA: 30 marzo al 3 abril 2026, de 8:00 AM a 10:00 AM ===\n');

const resultado = calcularHorasHabiles('2026-03-30', '2026-04-03', '08:00', '10:00');
console.log('Resultado de calcularHorasHabiles:');
console.log(JSON.stringify(resultado, null, 2));

console.log('\n=== Detalle día por día ===');
const detalle = obtenerDetalleCalculo('2026-03-30', '2026-04-03');
console.log(`Total días en el rango: ${detalle.totalDias}`);
console.log(`Días hábiles: ${detalle.diasHabiles}`);
console.log(`Fines de semana: ${detalle.finesDeSemana}`);
console.log(`Festivos: ${detalle.festivos}`);

console.log('\nDetalle por día:');
detalle.detallesPorDia.forEach(dia => {
    const tipo = dia.esHabil ? '✅ Hábil' : 
                 dia.esFestivo ? '🎉 Festivo' : 
                 '🏖️ Fin de semana';
    console.log(`${dia.fecha} - ${dia.diaSemana}: ${tipo}${dia.nombreFestivo ? ' (' + dia.nombreFestivo + ')' : ''}`);
});

console.log('\n=== Cálculo de horas ===');
console.log(`Días hábiles: ${resultado.diasHabiles}`);
console.log(`Horas por día: ${resultado.horasPorDia}`);
console.log(`Total horas: ${resultado.totalHoras}`);
console.log(`\nEsperado: 3 días × 2 horas = 6 horas`);
