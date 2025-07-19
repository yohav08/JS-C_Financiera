/**
 ** REPARTO PROPORCIONAL
 */
document.addEventListener('DOMContentLoaded', () => {
  const typeSelect = document.getElementById('type');
  const form = document.getElementById('form');
  const output = document.getElementById('output_1');
  const indicesContainer = document.getElementById('indices-container');
  const addBtn = document.getElementById('add');

  let currentType = typeSelect.value;

  function createIndiceBlock(index = 0) {
    const div = document.createElement('div');
    div.className = 'index-block';
    div.innerHTML = `
        <div class="indice-pair" style="display: no-wrap;">
          <div>
              <label>Índice 1:</label>
              <input type="number" name="indice1" required>
          </div> 
          <div class="indice2-container">
              <label>Índice 2:</label>
              <input type="number" name="indice2">
          </div>
          <div class="remove-container">
              <button type="button" class="remove-btn">Eliminar</button>
          </div>
        </div>
    `;
      // Asociar funcionalidad al botón de eliminar
    div.querySelector('.remove-btn').addEventListener('click', () => {
        div.remove();
    });

    indicesContainer.appendChild(div);
    toggleIndice2Fields();
  }

  function toggleIndice2Fields() {
    const show = !(currentType === 'directo-simple' || currentType === 'inverso-simple');
    document.querySelectorAll('.indice2-container').forEach(container => {
      container.style.display = show ? 'flex' : 'none';
    });
    document.querySelectorAll('[name="indice2"]').forEach(input => {
      input.required = show;
    });
  }

  function resetIndices() {
    indicesContainer.innerHTML = '';
    createIndiceBlock(); // Primer bloque por defecto
  }

  typeSelect.addEventListener('change', () => {
    currentType = typeSelect.value;
    toggleIndice2Fields();
  });

  addBtn.addEventListener('click', () => {
    createIndiceBlock();
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    calcular();
  });

  function calcular() {
    const tipo = currentType;
    const metodo = document.getElementById('method').value;
    const total = parseFloat(document.getElementById('total').value);

    const indice1s = Array.from(document.getElementsByName('indice1')).map(input => parseFloat(input.value));
    const indice2s = Array.from(document.getElementsByName('indice2')).map(input => parseFloat(input.value));

    let indices = [];

    if (tipo === 'directo-simple' || tipo === 'inverso-simple') {
      indices = indice1s.slice();
    } else if (tipo.endsWith('compuesto')) {
      indices = indice1s.map((v, i) => v * indice2s[i]);
    } else if (tipo === 'mixto') {
      indices = indice1s.map((v, i) => v * (1 / indice2s[i]));
    }

    // cálculo de proporciones
    let partes;
    if (metodo === 'unidad' || metodo === 'proporciones') {
      const suma = indices.reduce((a,b) => a + b, 0);
      partes = indices.map(idx => total * idx / suma);
    } else if (metodo === 'alicuotas') {
      const suma = indices.reduce((a,b) => a + b, 0);
      partes = indices.map(idx => (idx / suma) * total);
    }

    output.textContent = generarSalida(tipo, metodo, total, indices, partes);
  }

  function generarSalida(tipo, metodo, total, indices, partes) {
    const fmt = num => num.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const tdesc = {
      'directo-simple': 'Reparto Proporcional Directo simple',
      'directo-compuesto': 'Reparto Proporcional Directo compuesto',
      'inverso-simple': 'Reparto Proporcional Inverso simple',
      'inverso-compuesto': 'Reparto Proporcional Inverso compuesto',
      'mixto': 'Reparto Proporcional Mixto (Índice directo / Índice inverso)'
    }[tipo];

    let s = '';

    if (metodo === 'unidad') {
      s += `\n${tdesc}\n`;
      const suma = indices.reduce((a,b) => a + b, 0);
      const unidad = total / suma;
      s += `Valor a repartir= ${fmt(total)} / ${fmt(suma)} = ${fmt(unidad)}\n`;
      indices.forEach((idx,i) => {
        s += `* ${fmt(idx)} × ${fmt(unidad)} = ${fmt(partes[i])}\n`;
      });
    } else if (metodo === 'proporciones') {
      s += `\n${tdesc}\n`;
      const suma = indices.reduce((a,b) => a + b, 0);
      indices.forEach((idx,i) => {
        s += `${fmt(idx)} : ${fmt(suma)} :: X : ${fmt(total)} → X = ${fmt(partes[i])}\n`;
      });
    } else if (metodo === 'alicuotas') {
      const suma = indices.reduce((a,b) => a + b, 0);
      s += `\n${tdesc}\n`;
      s += `Índices simplificados: ${indices.map(fmt).join(', ')} (Total: ${fmt(suma)})\n`;
      indices.forEach((idx,i) => {
        s += `* ${fmt(idx)}/${fmt(suma)} × ${fmt(total)} = ${fmt(partes[i])}\n`;
      });
    }

    return s;
  }

  resetIndices(); // iniciar con 1 participante
});


/**
 ** INTERÉS SIMPLE 
 */
{
  const form = document.getElementById("interesForm");
  const porMes = document.getElementById("porMes");
  const porFechas = document.getElementById("porFechas");
  const resultadoDiv = document.getElementById("resultado2");

  // Alternar entre modo mes o fechas
  document.querySelectorAll('input[name="modo"]').forEach(input => {
    input.addEventListener("change", () => {
      if (input.value === "mes") {
        porMes.style.display = "block";
        porFechas.style.display = "none";
      } else {
        porMes.style.display = "none";
        porFechas.style.display = "block";
      }
    });
  });

  function esBisiesto(anio) {
    return (anio % 4 === 0 && (anio % 100 !== 0 || anio % 400 === 0));
  }

  function diasMes(mes, anio) {
    if (mes === 2) return esBisiesto(anio) ? 29 : 28;
    return [4, 6, 9, 11].includes(mes) ? 30 : 31;
  }

  function calcularIntereses(P, r, diasBancario, diasIdeal, anio) {
    const comercial = P * r * (30 / 360);
    const bancario = P * r * (diasBancario / 360);
    const racional = P * r * (diasBancario / (esBisiesto(anio) ? 366 : 365));
    const ideal = P * r * (diasIdeal / 365);
    return { comercial, bancario, racional, ideal };
  }

  form.addEventListener("submit", e => {
    e.preventDefault();

    const P = parseFloat(document.getElementById("capital").value);
    const r = parseFloat(document.getElementById("tasa").value) / 100;

    let diasBancario = 0;
    let diasIdeal = 0;
    let anio = 2024;

    const modoMes = document.querySelector('input[name="modo"]:checked').value === "mes";

    if (modoMes) {
      const mes = parseInt(document.getElementById("mes").value);
      anio = parseInt(document.getElementById("anioMes").value);

      const diasMesExacto = diasMes(mes, anio);
      diasBancario = diasMesExacto;
      diasIdeal = (mes === 2) ? 28 : diasMesExacto;

    } else {
      const desde = new Date(document.getElementById("desde").value);
      const hasta = new Date(document.getElementById("hasta").value);
      anio = desde.getFullYear();

      diasBancario = Math.ceil((hasta - desde) / (1000 * 60 * 60 * 24));
      diasIdeal = diasBancario;

      for (let y = desde.getFullYear(); y <= hasta.getFullYear(); y++) {
        if (esBisiesto(y)) {
          const fecha29 = new Date(`${y}-02-29`);
          if (fecha29 >= desde && fecha29 <= hasta) diasIdeal -= 1;
        }
      }
    }

    const intereses = calcularIntereses(P, r, diasBancario, diasIdeal, anio);

    resultadoDiv.innerHTML = `
      <h5>Resultado</h5>
      <p><strong>Días Bancarios:</strong> ${diasBancario} &nbsp;|&nbsp; <strong>Días para Ideal:</strong> ${diasIdeal}</p>
      <ul>
        <li><strong>Interés Comercial:</strong> $${intereses.comercial.toFixed(2)}</li>
        <li><strong>Interés Bancario:</strong> $${intereses.bancario.toFixed(2)}</li>
        <li><strong>Interés Racional:</strong> $${intereses.racional.toFixed(2)}</li>
        <li><strong>Interés Ideal:</strong> $${intereses.ideal.toFixed(2)}</li>
      </ul>
    `;
  });
}

/**
 ** INTERÉS COMPUESTO 
 */
function calcularInteres() {
  const tipo = document.getElementById('tipoCalculo').value;
  const valor = parseFloat(document.getElementById('valor4').value);
  const tasa = parseFloat(document.getElementById('tasa4').value)/100;
  const tiempo = parseInt(document.getElementById('tiempo4').value);
  const resultadoDiv = document.getElementById('resultado4');

  if (isNaN(valor) || isNaN(tasa) || isNaN(tiempo)) {
    resultadoDiv.innerHTML = '⚠️ Por favor, complete todos los campos correctamente.';
    return;
  }

  let resultado = 0;

  if (tipo === 'calcularS') {
    // S = P * (1 + i)^n
    resultado = valor * Math.pow(1 + tasa, tiempo);
    resultadoDiv.innerHTML = `🔢 Valor Futuro (S): <strong>$${resultado.toFixed(2)}</strong>`;
  } else {
    // P = S / (1 + i)^n
    resultado = valor / Math.pow(1 + tasa, tiempo);
    resultadoDiv.innerHTML = `💰 Valor Presente (P): <strong>$${resultado.toFixed(2)}</strong>`;
  }
}

/**
 ** DESCUENTO
 */
document.getElementById('discountForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const S = parseFloat(document.getElementById('valorFuturo').value);
  const d = parseFloat(document.getElementById('tasaDescuento').value) / 100;
  const fechaInicio = new Date(document.getElementById('fechaInicio_3').value);
  const fechaFin = new Date(document.getElementById('fechaFin_3').value);
  const tipoTasa = document.getElementById('tipoTasa_3').value;

  if (!S || !d || !fechaInicio || !fechaFin || fechaFin <= fechaInicio) {
    alert("Por favor, completa los campos correctamente y asegúrate de que la fecha de fin sea posterior a la fecha de inicio.");
    return;
  }

  // Cálculo exacto de días entre fechas
  const msPerDay = 1000 * 60 * 60 * 24;
  const diasExactos = Math.floor((fechaFin - fechaInicio) / msPerDay);

  // Determinar denominador base según tipo de tasa
  const esBisiesto = (year) => (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));
  const anioFin = fechaFin.getFullYear();

  let base;

  switch (tipoTasa) {
    case 'comercial':
    case 'bancario':
      base = 360;
      break;
    case 'racional':
      base = esBisiesto(anioFin) ? 366 : 365;
      break;
    case 'ideal':
      base = 365;
      break;
    default:
      alert("Tipo de tasa inválido");
      return;
  }

  // Cálculo de N y VT
  const N = diasExactos / base;
  const descuento = 1-(d*N)
  const VT = S * descuento;

  // Mostrar resultados con desglose
  document.getElementById('resultado_3').innerHTML = `
    <p style="color: white;"><strong>Días entre fechas:</strong> ${diasExactos}</p>
    <p style="color: white;"><strong>Valor Actual (VT):</strong> $${VT.toFixed(2)}</p>
  `;
});


/**
 ** CONVERSOR DE TASAS
 */
{
  const periodos = {
    "Mensual": 12,
    "Bimestral": 6,
    "Trimestral": 4,
    "Cuatrimestral": 3,
    "Semestral": 2,
    "Anual": 1
  };

  window.onload = () => {
    const selectOrigen = document.getElementById("periodoOrigen");
    const selectDestino = document.getElementById("periodoDestino");
    for (let p in periodos) {
      selectOrigen.innerHTML += `<option value="${p}">${p}</option>`;
      selectDestino.innerHTML += `<option value="${p}">${p}</option>`;
    }
  };

  function convertirTasa() {
    const tipoOrigen = document.getElementById("tipoOrigen").value;
    const tipoDestino = document.getElementById("tipoDestino").value;
    const periodoOrigen = document.getElementById("periodoOrigen").value;
    const periodoDestino = document.getElementById("periodoDestino").value;
    let tasa = parseFloat(document.getElementById("valorTasa5").value) / 100;

    const m1 = periodos[periodoOrigen];
    const m2 = periodos[periodoDestino];

    let resultado5;

    if (tipoOrigen === "i" && tipoDestino === "j" && m1 === m2) {
      resultado5 = tasa * m1;
    } else if (tipoOrigen === "j" && tipoDestino === "i" && m1 === m2) {
      resultado5 = tasa / m1;
    } else {
      let iOrigen;
      if (tipoOrigen === "i") {
        iOrigen = tasa;
      } else {
        iOrigen = tasa / m1;
      }

      let iEquivalente = Math.pow(1 + iOrigen, m1 / m2) - 1;

      if (tipoDestino === "i") {
        resultado5 = iEquivalente;
      } else {
        resultado5 = iEquivalente * m2;
      }
    }

    document.getElementById("resultado5").innerText = 
      `Tasa convertida: ${(resultado5 * 100).toFixed(4)}%`;
  }
}

/**
 ** ECUACIONES DE VALOR
*/
function agregarFila(tipo) {
  const div = document.createElement('div');
  div.className = 'grupo';
  div.innerHTML = `
    <label>Valor:</label>
    <input style="width: 25%;" type="number" class="valor${tipo}" placeholder="Valor">
    <label>Periodo:</label>
    <input style="width: 15%;" type="number" class="periodo${tipo}" placeholder="EJ: 2">
    <button onclick="this.parentNode.remove()">Eliminar</button>
  `;
  document.getElementById(tipo).appendChild(div);
}

function calcularValor() {
  const i = parseFloat(document.getElementById("interes_6").value) / 100;
  const focal = parseInt(document.getElementById("focal_6").value);
  const periodoX = parseInt(document.getElementById("periodoX").value);
  const tipoX = document.getElementById("tipoX").value;

  if (isNaN(i) || isNaN(focal) || isNaN(periodoX)) {
    alert("Por favor ingresa correctamente los valores requeridos.");
    return;
  }

  let totalDeudas = 0;
  let totalPagos = 0;

  // Procesar deudas
  document.querySelectorAll(".valordeudas").forEach((inputValor, index) => {
    const valor = parseFloat(inputValor.value);
    const periodo = parseInt(document.querySelectorAll(".periododeudas")[index].value);
    if (!isNaN(valor) && !isNaN(periodo)) {
      const n = focal - periodo;
      const equivalente = valor * Math.pow(1 + i, n);
      totalDeudas += equivalente;
    }
  });

  // Procesar pagos
  document.querySelectorAll(".valorpagos").forEach((inputValor, index) => {
    const valor = parseFloat(inputValor.value);
    const periodo = parseInt(document.querySelectorAll(".periodopagos")[index].value);
    if (!isNaN(valor) && !isNaN(periodo)) {
      const n = focal - periodo;
      const equivalente = valor * Math.pow(1 + i, n);
      totalPagos += equivalente;
    }
  });

  // Calcular X correctamente
  const nX = focal - periodoX;
  const factorX = Math.pow(1 + i, nX);
  let Xvalor;

  if (tipoX === "deuda") {
    Xvalor = (totalPagos - totalDeudas) / factorX;
  } else {
    Xvalor = (totalDeudas - totalPagos) / factorX;
  }

  let resultado_6 = `🧮 El valor de X (${tipoX}) en t=${periodoX} debe ser: <strong>$${Xvalor.toFixed(2)}</strong>`;

  document.getElementById("resultado_6").innerHTML = resultado_6;
  document.getElementById("detalle_6").innerText =
    `💡 Total deudas trasladadas a t=${focal}: $${totalDeudas.toFixed(2)}\n` +
    `💡 Total pagos trasladados a t=${focal}: $${totalPagos.toFixed(2)}\n` +
    `💡 Factor de traslado (1+i)^(${nX}): ${factorX.toFixed(6)}`;
}

// Inicialización
agregarFila('deudas');
agregarFila('pagos');


/**
 ** ANUALIDADES
*/
document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formAnualidad");
  const resultado7 = document.getElementById("resultado7");
  const tipoSelect = document.getElementById("tipo");
  const calculoSelect = document.getElementById("calculo");
  const kField = document.getElementById("kField");

  tipoSelect.addEventListener("change", () => {
    const tipo = tipoSelect.value;
    kField.style.display = tipo === "diferida" ? "block" : "none";
  });

  calculoSelect.addEventListener("change", () => {
    if (tipoSelect.value === "perpetua" && calculoSelect.value === "S") {
      alert("❌ En la anualidad perpetua no se puede calcular el Valor Futuro.");
      calculoSelect.value = "P";
    }
  });

  formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const tipo = tipoSelect.value;
    const calculo = calculoSelect.value;
    const A = parseFloat(formulario.A.value);
    const i = parseFloat(formulario.i.value)/100;
    const n = parseInt(formulario.n.value);
    const k = parseInt(formulario.k.value || 0);

    if (isNaN(A) || isNaN(i) || isNaN(n) || (tipo === "diferida" && isNaN(k))) {
      resultado7.innerHTML = "❗Completa todos los campos requeridos.";
      return;
    }

    let valor = 0;

    switch (tipo) {
      case "ordinaria":
      case "general":
        if (calculo === "P") {
          valor = A * ((1 - Math.pow(1 + i, -n)) / i);
        } else {
          valor = A * ((Math.pow(1 + i, n) - 1) / i);
        }
        break;

      case "anticipada":
        if (calculo === "P") {
          valor = A * ((1 - Math.pow(1 + i, -n)) / i) * (1 + i);
        } else {
          valor = A * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
        }
        break;

      case "diferida":
        if (calculo === "P") {
          valor = A * ((1 - Math.pow(1 + i, -n)) / i) * Math.pow(1 + i, -k);
        } else {
          valor = A * ((Math.pow(1 + i, n) - 1) / i) * Math.pow(1 + i, k);
        }
        break;

      case "perpetua":
        if (calculo === "P") {
          valor = A / i;
        } else {
          resultado7.innerHTML = "❌ No se puede calcular el Valor Futuro para una anualidad perpetua.";
          return;
        }
        break;
    }

    const simbolo = calculo === "P" ? "Valor Presente (P)" : "Valor Futuro (S)";
    resultado7.innerHTML = `✔️ ${simbolo}: <strong>${valor.toFixed(2)}</strong>`;
  });
});

document.getElementById('tipoAnualidad').addEventListener('change', mostrarInputK);
window.addEventListener('DOMContentLoaded', mostrarInputK);

function mostrarInputK() {
  const tipo = document.getElementById('tipoAnualidad').value;
  const kContainer = document.getElementById('kContainer');
  kContainer.style.display = tipo === 'diferida' ? 'block' : 'none';
}

document.getElementById('anualidadForm').addEventListener('submit', function (e) {
  e.preventDefault();
  calcularAnualidad();
});

function calcularAnualidad() {
  const tipo = document.getElementById('tipoAnualidad').value;
  const tipoValor = document.getElementById('tipoValor').value;
  const valor = parseFloat(document.getElementById('valor_71').value);
  const i = parseFloat(document.getElementById('i_71').value)/100;
  const n = parseInt(document.getElementById('n_71').value);
  const k = parseInt(document.getElementById('k_71').value) || 0;

  let A = null;

  if (tipoValor === 'presente') {
    if (tipo === 'ordinaria' || tipo === 'general') {
      A = valor / ((1 - Math.pow(1 + i, -n)) / i);
    } else if (tipo === 'anticipada') {
      A = valor / (((1 - Math.pow(1 + i, -n)) / i) * (1 + i));
    } else if (tipo === 'diferida') {
      const anualidadOrdinaria = (1 - Math.pow(1 + i, -n)) / i;
      const descuento = Math.pow(1 + i, -k);
      A = valor / (anualidadOrdinaria * descuento);
    }
  }

  else if (tipoValor === 'futuro') {
    if (tipo === 'ordinaria' || tipo === 'general') {
      A = valor / ((Math.pow(1 + i, n) - 1) / i);
    } else if (tipo === 'anticipada') {
      A = valor / (((Math.pow(1 + i, n) - 1) / i) * (1 + i));
    } else if (tipo === 'diferida') {
      const anualidadOrdinaria = (Math.pow(1 + i, n) - 1) / i;
      const capitalizacion = Math.pow(1 + i, k);
      A = valor / (anualidadOrdinaria * capitalizacion);
    }
  }

  const resultado = document.getElementById('resultado_71');
  if (!isNaN(A)) {
    resultado.innerHTML = `🔢 Valor de A: <strong>${A.toFixed(2)}</strong>`;
  } else {
    resultado.innerHTML = `❗ Error al calcular. Revisa los datos ingresados.`;
  }
}



/**
 ** AMORTIZACIÓN
*/

function calcularAmortizacion() {
  const P_8 = parseFloat(document.getElementById("valorPresente").value);
  const tasa8 = parseFloat(document.getElementById("tasaInteres").value) / 100;
  const n_8 = parseInt(document.getElementById("numPeriodos").value);
  const tipo = parseInt(document.getElementById("tipoCaso").value);
  const periodoAbono = parseInt(document.getElementById("periodoAbono").value);
  const valorAbono = parseFloat(document.getElementById("valorAbono").value) || 0;

  const tablaBody = document.querySelector("#tablaAmortizacion");
  tablaBody.innerHTML = "";

  let saldo = P_8;
  let cuotaFija = (P_8 * tasa8) / (1 - Math.pow(1 + tasa8, -n_8));
  let periodoActual = 0;

  tablaBody.innerHTML += `
    <thead>
      <tr>
        <th>Periodo</th>
        <th>Saldo</th>
        <th>Interés</th>
        <th>Cuota</th>
        <th>Amortización</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>0</td>
        <td>${saldo.toFixed(2)}</td>
        <td>---</td>
        <td>---</td>
        <td>---</td>
      </tr>
    </tbody>
  `;

  switch (tipo) {
    case 1: // ✅ Caso normal
      for (let i = 1; i <= n_8; i++) {
        let interes = saldo * tasa8;
        let amortizacion = cuotaFija - interes;
        saldo -= amortizacion;
        if (saldo < 0.01) saldo = 0;

        tablaBody.innerHTML += `
          <tr>
            <td>${i}</td>
            <td>${saldo.toFixed(2)}</td>
            <td>${interes.toFixed(2)}</td>
            <td>${cuotaFija.toFixed(2)}</td>
            <td>${amortizacion.toFixed(2)}</td>
          </tr>
        `;
      }
      break;

    case 2: // ✅ Caso abono reduce tiempo
      let continuar = true;
      let cuota = cuotaFija;
      while (saldo > 0.01 && continuar) {
        periodoActual++;
        let interes = saldo * tasa8;
        let amortizacion = cuotaFija - interes;

        // En periodo del abono: sumamos el abono a la cuota
        if (periodoActual === periodoAbono) {
          let cuotaAbono = cuotaFija + valorAbono;
          amortizacion = cuotaAbono - interes;
          saldo -= amortizacion;

          tablaBody.innerHTML += `
            <tr>
              <td>${periodoActual}</td>
              <td>${saldo.toFixed(2)}</td>
              <td>${interes.toFixed(2)}</td>
              <td>${cuotaAbono.toFixed(2)}</td>
              <td>${amortizacion.toFixed(2)}</td>
            </tr>
          `;
        } else {
          saldo -= amortizacion;
          tablaBody.innerHTML += `
            <tr>
              <td>${periodoActual}</td>
              <td>${saldo.toFixed(2)}</td>
              <td>${interes.toFixed(2)}</td>
              <td>${cuotaFija.toFixed(2)}</td>
              <td>${amortizacion.toFixed(2)}</td>
            </tr>
          `;
        }

        if (saldo < cuotaFija) {
          let interesFinal = saldo * tasa8;
          let cuotaFinal = saldo + interesFinal;

          tablaBody.innerHTML += `
            <tr>
              <td>${periodoActual + 1}</td>
              <td>0.00</td>
              <td>${interesFinal.toFixed(2)}</td>
              <td>${cuotaFinal.toFixed(2)}</td>
              <td>${saldo.toFixed(2)}</td>
            </tr>
          `;
          continuar = false;
        }
      }
      break;

    case 3: // ✅ Caso abono reduce cuota
      let cuotaActual = cuotaFija;
      let restante = n_8;
      let nuevaCuotaAplicada = false;

      while (saldo > 0.01 && restante > 0) {
        periodoActual++;
        let interes = saldo * tasa8;

        if (periodoActual === periodoAbono) {
          let cuotaConAbono = cuotaFija + valorAbono;
          let amortizacion = cuotaConAbono - interes;
          saldo -= amortizacion;

          // Recalcular cuota con nuevo saldo y periodos restantes
          let nuevosPeriodos = n_8 - periodoActual;
          if (nuevosPeriodos > 0) {
            cuotaActual = (saldo * tasa8) / (1 - Math.pow(1 + tasa8, -nuevosPeriodos));
            nuevaCuotaAplicada = true;
          }

          tablaBody.innerHTML += `
            <tr>
              <td>${periodoActual}</td>
              <td>${saldo.toFixed(2)}</td>
              <td>${interes.toFixed(2)}</td>
              <td>${cuotaConAbono.toFixed(2)}</td>
              <td>${amortizacion.toFixed(2)}</td>
            </tr>
          `;
        } else {
          let amortizacion = cuotaActual - interes;
          saldo -= amortizacion;
          if (saldo < 0.01) saldo = 0;

          tablaBody.innerHTML += `
            <tr>
              <td>${periodoActual}</td>
              <td>${saldo.toFixed(2)}</td>
              <td>${interes.toFixed(2)}</td>
              <td>${cuotaActual.toFixed(2)}</td>
              <td>${amortizacion.toFixed(2)}</td>
            </tr>
          `;
        }

        restante--;
      }
      break;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const tipoSelect = document.getElementById("tipo");
  const campoK = document.getElementById("campoK");

  const toggleCampoK = () => {
    campoK.style.display = tipoSelect.value === "diferida" ? "block" : "none";
  };

  tipoSelect.addEventListener("change", toggleCampoK);
  toggleCampoK(); // Ejecutar al cargar para estado inicial
});
function calcularA() {
  const tipo = document.getElementById("tipo_71").value;
  const basadoEn = document.getElementById("basadoEn").value;
  const valor = parseFloat(document.getElementById("valor_71").value);
  const interes = parseFloat(document.getElementById("interes_71").value) / 100;
  const n = parseInt(document.getElementById("n_71").value);
  const k = parseInt(document.getElementById("k_71").value);

  let A;

  const factorPresente = (i, n) => (1 - Math.pow(1 + i, -n)) / i;
  const factorFuturo = (i, n) => (Math.pow(1 + i, n) - 1) / i;

  if (basadoEn === "P") {
    switch (tipo) {
      case "ordinaria":
      case "general":
        A = valor / factorPresente(interes, n);
        break;
      case "anticipada":
        A = (valor / factorPresente(interes, n)) * (1 + interes);
        break;
      case "diferida":
        A = (valor / factorPresente(interes, n)) * Math.pow(1 + interes, -k);
        break;
    }
  } else if (basadoEn === "S") {
    switch (tipo) {
      case "ordinaria":
      case "general":
        A = valor / factorFuturo(interes, n);
        break;
      case "anticipada":
        A = (valor / factorFuturo(interes, n)) * (1 + interes);
        break;
      case "diferida":
        A = (valor / factorFuturo(interes, n)) * Math.pow(1 + interes, k);
        break;
    }
  }

  document.getElementById("resultado_71").textContent = `La cuota periódica A es: ${A.toFixed(2)}`;
}

/**
 ** CAPITALIZACIÓN
*/

function calcularCapitalizacion(event) {
  event.preventDefault();

  const S = parseFloat(document.getElementById('s_9').value);
  const iPercent = parseFloat(document.getElementById('i_9').value);
  const n = parseInt(document.getElementById('n_9').value);
  const i = iPercent / 100;

  // Cuota con fórmula actualizada
  const A = S / ((Math.pow(1 + i, n) - 1) / i);

  let resultadoHTML = `
    <table id="tablaAmortizacion">
      <thead>
        <tr>
          <th>Periodo</th>
          <th>Saldo</th>
          <th>Interés</th>
          <th>Cuota</th>
          <th>Incremento</th>
        </tr>
      </thead>
      <tbody>
  `;

  let saldoAnterior = 0;
  let saldoActual = 0;

  for (let periodo = 1; periodo <= n; periodo++) {
    let interes = '';
    let incremento = 0;

    if (periodo === 1) {
      incremento = A;
      saldoActual = incremento;
    } else if (periodo < n) {
      interes = saldoAnterior * i;
      incremento = A + interes;
      saldoActual = saldoAnterior + incremento;
    } else {
      // Último período, forzar saldo final
      interes = saldoAnterior * i;
      incremento = A + interes;
      saldoActual = S;
    }

    resultadoHTML += `
      <tr>
        <td>${periodo}</td>
        <td>${saldoActual.toLocaleString('es-CO', {minimumFractionDigits: 2})}</td>
        <td>${periodo === 1 ? '' : interes.toLocaleString('es-CO', {minimumFractionDigits: 2})}</td>
        <td>${A.toLocaleString('es-CO', {minimumFractionDigits: 2})}</td>
        <td>${incremento.toLocaleString('es-CO', {minimumFractionDigits: 2})}</td>
      </tr>
    `;

    saldoAnterior = saldoActual;
  }

  resultadoHTML += '</tbody></table>';
  document.getElementById('resultado9').innerHTML = resultadoHTML;
}
document.getElementById('capitalForm').addEventListener('submit', calcularCapitalizacion);
