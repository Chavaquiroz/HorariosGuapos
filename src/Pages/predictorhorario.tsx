/* eslint-disable @typescript-eslint/no-explicit-any */
import LF from './MatOblLF.json';
import IQS from './MatOblIQS.json';
import IF from './MatOblIF.json';
import IB from './MatOblIB.json';


function obtenerMapaClaves(): Record<string, Record<string, string>> {
  const carrera = localStorage.getItem("carrera");

  switch (carrera) {
    case "licf":
      return LF;
    case "ingf":
      return IF;
    case "ingb":
      return IB;
    case "ingqs":
      return IQS;
    default:
      throw new Error("Carrera no válida o no seleccionada");
  }
}




type Materia = {
  clave: string;
  nombre: string;
  grupo: string;
  creditos: number;
  hora: string;
  dia: string;
};

type Sesion = {
  dia: number;
  inicio: number;
  fin: number;
  nombre: string;
  grupo: string;
  creditos: number;
};

type Combinacion = {
  materias: Materia[];
  sesiones: Sesion[];
};

// Utilidades
function textoADia(dia: string): number {
  const dias: Record<string, number> = {
    "Domingo": 0,
    "Lunes": 1,
    "Martes": 2,
    "Miércoles": 3,
    "Jueves": 4,
    "Viernes": 5,
    "Sábado": 6
  };
  return dias[dia] ?? -1;
}

function convertirAHoraEnMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function convertirMateriasASesiones(materias: Materia[]): Sesion[] {
  const sesiones: Sesion[] = [];

  for (const materia of materias) {
    const bloques = materia.hora.split(" / ");
    for (const bloque of bloques) {
      const [diaTexto, ...resto] = bloque.trim().split(" ");
      const rango = resto.join(" ").trim();

      if (!diaTexto || !rango.includes(" - ")) continue;

      const [horaInicio, horaFin] = rango.split(" - ").map(s => s.trim());
      if (!horaInicio || !horaFin) continue;

      const dia = textoADia(diaTexto);
      const inicio = convertirAHoraEnMinutos(horaInicio);
      const fin = convertirAHoraEnMinutos(horaFin);

      if (dia === -1 || isNaN(inicio) || isNaN(fin)) continue;

      sesiones.push({
        dia,
        inicio,
        fin,
        nombre: materia.nombre,
        grupo: materia.grupo,
        creditos: materia.creditos,
      });
    }
  }

  return sesiones;
}

function sesionesSeTraslapan(s1: Sesion, s2: Sesion): boolean {
  if (s1.dia !== s2.dia) return false;
  return !(s1.fin <= s2.inicio || s2.fin <= s1.inicio);
}

function agruparPorMateria(materias: Materia[]): Map<string, Materia[]> {
  const mapa = new Map<string, Materia[]>();
  for (const m of materias) {
    if (!mapa.has(m.nombre)) mapa.set(m.nombre, []);
    mapa.get(m.nombre)!.push(m);
  }
  return mapa;
}

function obtenerCombinacionesValidas(materias: Materia[]): Combinacion[] {
  const gruposPorMateria = agruparPorMateria(materias);
  const nombres = Array.from(gruposPorMateria.keys());

  const resultados: Combinacion[] = [];

  function backtrack(idx: number, seleccion: Materia[], sesionesSeleccionadas: Sesion[]) {
    if (idx === nombres.length) {
      resultados.push({
        materias: [...seleccion],
        sesiones: [...sesionesSeleccionadas],
      });
      return;
    }

    const opciones = gruposPorMateria.get(nombres[idx])!;
    for (const materia of opciones) {
      const sesionesMateria = convertirMateriasASesiones([materia]);
      if (sesionesMateria.every(
        (sNueva) => !sesionesSeleccionadas.some((sExist) => sesionesSeTraslapan(sNueva, sExist))
      )) {
        backtrack(
          idx + 1,
          [...seleccion, materia],
          [...sesionesSeleccionadas, ...sesionesMateria]
        );
      }
    }
  }

  backtrack(0, [], []);
  return resultados;
}

function nombresObligatoriosSinOptativas(mapa: Record<string, Record<string, string>>): Set<string> {
  const nombres = new Set<string>();
  for (const semestre in mapa) {
    if (semestre === "9") continue;
    for (const nombre of Object.keys(mapa[semestre])) {
      nombres.add(nombre.toUpperCase());
    }
  }
  return nombres;
}

function mapaNombreASemestre(mapa: Record<string, Record<string, string>>): Map<string, number> {
  const resultado = new Map<string, number>();
  for (const semestre in mapa) {
    if (semestre === "9") continue;
    for (const nombre in mapa[semestre]) {
      resultado.set(nombre.toUpperCase(), parseInt(semestre));
    }
  }
  return resultado;
}

function clavesAMaterias(materiasPropias: string[], mapa: Record<string, Record<string, string>>): string[] {
  const nombres: string[] = [];
  for (const clave of materiasPropias) {
    for (const semestre in mapa) {
      const materias = mapa[semestre];
      for (const nombre in materias) {
        if (materias[nombre] === clave) {
          nombres.push(nombre.toUpperCase());
        }
      }
    }
  }
  return nombres;
}

// Obtener la clave real desde MatOblLF
function obtenerClaveVerdadera(nombre: string, mapaClaves: Record<string, Record<string, string>>): string | null {
  const nombreMayus = nombre.toUpperCase();
  for (const semestre in mapaClaves) {
    const materias = mapaClaves[semestre];
    if (materias[nombreMayus]) return materias[nombreMayus];
  }
  return null;
}

// Obtener créditos desde clave real
function obtenerCreditosDesdeClave(clave: string): number {
  const match = clave.match(/\d{2}/);
  return match ? parseInt(match[0]) : 5;
}

function dayToText(day: number): string {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return dias[day] || 'Desconocido';
}

async function obtenerMateriasDisponibles(mapaClaves: Record<string, Record<string, string>>): Promise<Materia[]> {
  const response = await fetch("/data.json");
  const { courses } = await response.json();

  const materias: Materia[] = [];

  for (const curso of courses) {
    const { name, group, sessions } = curso;
    const nombreMayus = name.toUpperCase();
    const claveReal = obtenerClaveVerdadera(nombreMayus, mapaClaves) || "00000000";
    const creditos = obtenerCreditosDesdeClave(claveReal);

    const horarios = sessions
      .map((s: any) => `${dayToText(s.day)} ${s.begin} - ${s.end}`)
      .join(" / ");

    materias.push({
      clave: claveReal,
      nombre: nombreMayus,
      grupo: group,
      creditos,
      hora: horarios,
      dia: "",
    });
  }

  return materias;
}


function elegirMejorCombinacionPlan(
  combinaciones: Combinacion[],
  storedHorario: string
): Combinacion | undefined {
  if (combinaciones.length === 0) return undefined;

  let mejorCombinacion = combinaciones[0];

  const calcularInicioTotal = (sesiones: Sesion[]) =>
    sesiones.reduce((acc, s) => acc + s.inicio, 0);

  const calcularTiempoLibre = (sesiones: Sesion[]): number => {
    const sesionesPorDia: Map<number, Sesion[]> = new Map();

    for (const sesion of sesiones) {
      if (!sesionesPorDia.has(sesion.dia)) {
        sesionesPorDia.set(sesion.dia, []);
      }
      sesionesPorDia.get(sesion.dia)?.push(sesion);
    }

    let tiempoLibreTotal = 0;

    for (const sesionesDia of sesionesPorDia.values()) {
      const ordenadas = sesionesDia.sort((a, b) => a.inicio - b.inicio);
      for (let i = 0; i < ordenadas.length - 1; i++) {
        const finActual = ordenadas[i].fin;
        const inicioSiguiente = ordenadas[i + 1].inicio;
        tiempoLibreTotal += Math.max(0, inicioSiguiente - finActual);
      }
    }

    return tiempoLibreTotal;
  };

  const contarDias = (sesiones: Sesion[]): Set<number> => {
    const dias = new Set<number>();
    sesiones.forEach((s) => dias.add(s.dia));
    return dias;
  };

  if (storedHorario === "temprano" || storedHorario === "x") {
    let inicioTotalMin = calcularInicioTotal(mejorCombinacion.sesiones);
    for (const comb of combinaciones) {
      const inicioTotal = calcularInicioTotal(comb.sesiones);
      if (inicioTotal < inicioTotalMin) {
        inicioTotalMin = inicioTotal;
        mejorCombinacion = comb;
      }
    }
  } else if (storedHorario === "tarde") {
    let inicioTotalMax = calcularInicioTotal(mejorCombinacion.sesiones);
    for (const comb of combinaciones) {
      const inicioTotal = calcularInicioTotal(comb.sesiones);
      if (inicioTotal > inicioTotalMax) {
        inicioTotalMax = inicioTotal;
        mejorCombinacion = comb;
      }
    }
  } else if (storedHorario === "huecos") {
    let minTiempoLibre = calcularTiempoLibre(mejorCombinacion.sesiones);
    for (const comb of combinaciones) {
      const tiempoLibre = calcularTiempoLibre(comb.sesiones);
      if (tiempoLibre < minTiempoLibre) {
        minTiempoLibre = tiempoLibre;
        mejorCombinacion = comb;
      }
    }
  } else if (storedHorario === "menosdias") {
    let combinacionesMinDias: typeof combinaciones = [];
    let minDias = Infinity;

    for (const comb of combinaciones) {
      const diasUsados = contarDias(comb.sesiones);
      if (diasUsados.size < minDias) {
        minDias = diasUsados.size;
        combinacionesMinDias = [comb];
      } else if (diasUsados.size === minDias) {
        combinacionesMinDias.push(comb);
      }
    }

    const tieneDiasLibresConvenientes = (diasUsados: Set<number>) => {
      const diasSemana = new Set([1, 2, 3, 4, 5]);
      for (const dia of diasUsados) diasSemana.delete(dia);
      return diasSemana.has(1) || diasSemana.has(5);
    };

    mejorCombinacion =
      combinacionesMinDias.find((comb) =>
        tieneDiasLibresConvenientes(contarDias(comb.sesiones))
      ) || combinacionesMinDias[0];
  }

  return mejorCombinacion;
}

// FUNCIÓN PRINCIPAL
export async function generador(materiasPropias: string[]): Promise<{
  
  materiasPrimerFiltro: Materia[],
  segundoFiltro: Materia[],
  sesiones: Sesion[],
  combinacionOptima?: Combinacion
}> {
  console.log("Iniciando búsqueda de materias...");
  const mapaClaves: Record<string, Record<string, string>> = obtenerMapaClaves();
  const nombresYaTomadas = clavesAMaterias(materiasPropias, mapaClaves);
  const nombresObligatorios = nombresObligatoriosSinOptativas(mapaClaves);
  const mapaNombreSemestre = mapaNombreASemestre(mapaClaves);
  const disponibles = await obtenerMateriasDisponibles(mapaClaves);


  const materiasPrimerFiltro = disponibles.filter(
    (materia) =>
      !nombresYaTomadas.includes(materia.nombre) &&
      nombresObligatorios.has(materia.nombre)
  );

  const storedSemestre = localStorage.getItem("semestre");
  const storedOptimizacion = localStorage.getItem("optimizacion");
  const storedHorario = localStorage.getItem("horario") ?? "temprano";
  const semestreActual = parseInt(storedSemestre || "9");
  const optimizacionElegida = storedOptimizacion || "plan";

  let segundoFiltro: Materia[] = [];
  let mejorCombinacion: Combinacion | undefined;

  // Al final de tu función `generador`
  if (optimizacionElegida === "corriente") {
  const materiasPorSemestre = new Map<number, Materia[]>();

    for (const materia of materiasPrimerFiltro) {
      const semestreMateria = mapaNombreSemestre.get(materia.nombre);
      if (semestreMateria !== undefined && semestreMateria < semestreActual) {
        if (!materiasPorSemestre.has(semestreMateria)) {
          materiasPorSemestre.set(semestreMateria, []);
        }
        materiasPorSemestre.get(semestreMateria)!.push(materia);
      }
    }

    const semestresOrdenados = [...materiasPorSemestre.keys()].sort((a, b) => a - b);
    let combinacionActual: Combinacion = { materias: [], sesiones: [] };
    //let totalCreditos = 0;

    for (const semestre of semestresOrdenados) {
      const materiasSemestre = materiasPorSemestre.get(semestre)!;

      // Limitar a máximo 8 materias en total
      if (combinacionActual.materias.length >= 8) break;

      // Ordenar por cantidad de grupos (más grupos, más posibilidades)
      const nombresUnicos = Array.from(
        agruparPorMateria(materiasSemestre).values()
      ).sort((a, b) => b.length - a.length)
        .flat();

      const nuevasMaterias: Materia[] = [];
      for (const mat of nombresUnicos) {
        if (nuevasMaterias.length + combinacionActual.materias.length >= 8) break;
        nuevasMaterias.push(mat);
      }

      const posiblesCombinaciones = obtenerCombinacionesValidas(nuevasMaterias);

      let combinacionCompatible: Combinacion | null = null;

      for (const nuevaComb of posiblesCombinaciones) {
        const sesionesTotales: Sesion[] = [...combinacionActual.sesiones, ...nuevaComb.sesiones];
        const materiasTotales: Materia[] = [...combinacionActual.materias, ...nuevaComb.materias];
        const creditosTotales = materiasTotales.reduce((acc: any, m: { creditos: any; }) => acc + m.creditos, 0);

        if (creditosTotales > 38) continue;

        // Validar que no haya empalmes
        const valido = sesionesTotales.every((sNueva: Sesion, i: any) =>
          sesionesTotales.every((sOtra: Sesion, j: any) => i === j || !sesionesSeTraslapan(sNueva, sOtra))
        );

        if (valido) {
          combinacionCompatible = {
            materias: materiasTotales,
            sesiones: sesionesTotales,
          };
          //totalCreditos = creditosTotales;
          break;
        }
      }

      if (combinacionCompatible) {
        combinacionActual = combinacionCompatible;
      } else {
        // Intentar con subconjuntos más pequeños
        let reducido = nombresUnicos;

        while (reducido.length > 0) {
          reducido = reducido.slice(0, -1); // quitar última materia

          const combinacionesReducidas = obtenerCombinacionesValidas(reducido);

          for (const comb of combinacionesReducidas) {
            const sesionesTotales: Sesion[] = [...combinacionActual.sesiones, ...comb.sesiones];
            const materiasTotales: Materia[] = [...combinacionActual.materias, ...comb.materias];
            const creditosTotales = materiasTotales.reduce((acc: any, m: { creditos: any; }) => acc + m.creditos, 0);

            if (creditosTotales > 38) continue;

            const valido = sesionesTotales.every((sNueva: Sesion, i: any) =>
              sesionesTotales.every((sOtra: Sesion, j: any) => i === j || !sesionesSeTraslapan(sNueva, sOtra))
            );

            if (valido) {
              combinacionActual = {
                materias: materiasTotales,
                sesiones: sesionesTotales,
              };
              //totalCreditos = creditosTotales;
              break;
            }
          }

          if (combinacionActual.materias.length > 0) break;
        }
      }
    }

    // --------------------------------------------
    // Intentar agregar materias extra una por una
    // --------------------------------------------

    // Armar lista de materias descartadas
    
    const materiasDescartadas: Materia[] = materiasPrimerFiltro.filter(m =>
      !combinacionActual.materias.includes(m)
    );

    // Incluir también materias del semestre actual
    const materiasActuales = materiasPrimerFiltro.filter(m =>
      mapaNombreSemestre.get(m.nombre) === semestreActual &&
      !combinacionActual.materias.includes(m)
    );

    const materiasCandidatas = [...materiasDescartadas, ...materiasActuales];

    // Ordenar por semestre (menor primero)
    materiasCandidatas.sort((a, b) => {
      const sa = mapaNombreSemestre.get(a.nombre) ?? 99;
      const sb = mapaNombreSemestre.get(b.nombre) ?? 99;
      return sa - sb;
    });

    for (const materiaExtra of materiasCandidatas) {
      if (combinacionActual.materias.length >= 6) break;

      const combinacionesMateria = obtenerCombinacionesValidas([materiaExtra]);

      let combinacionExtendida: Combinacion | null = null;

      for (const combExtra of combinacionesMateria) {
        const sesionesTotales = [...combinacionActual.sesiones, ...combExtra.sesiones];
        const materiasTotales = [...combinacionActual.materias, ...combExtra.materias];
        const creditosTotales = materiasTotales.reduce((acc: any, m: { creditos: any; }) => acc + m.creditos, 0);

        if (creditosTotales > 38) continue;

        const valido = sesionesTotales.every((sNueva: Sesion, i: any) =>
          sesionesTotales.every((sOtra: Sesion, j: any) => i === j || !sesionesSeTraslapan(sNueva, sOtra))
        );

        if (valido) {
          combinacionExtendida = {
            materias: materiasTotales,
            sesiones: sesionesTotales,
          };
          break;
        }
      }

      if (combinacionExtendida) {
        combinacionActual = combinacionExtendida;
        // Intentamos seguir agregando más
      }
    }

    const combinacionesFinalesPostExt = obtenerCombinacionesValidas(combinacionActual.materias);
    mejorCombinacion = elegirMejorCombinacionPlan(combinacionesFinalesPostExt, storedHorario);

    if (mejorCombinacion) {
      console.log("Combinación optimizada (corriente):", mejorCombinacion);
      console.log("Total de materias:", mejorCombinacion.materias.length);
      console.log("Total créditos:", mejorCombinacion.materias.reduce((acc, m) => acc + m.creditos, 0));
      segundoFiltro = mejorCombinacion.materias;
    } else {
      segundoFiltro = combinacionActual.materias;
    }
  }
 else if (optimizacionElegida === "adelantar") {
    // Primero, obtener materias sólo del semestre actual
    const materiasSemestreActual = materiasPrimerFiltro.filter((materia) => {
      const semestreMateria = mapaNombreSemestre.get(materia.nombre);
      return semestreMateria === semestreActual;
    });

    // Obtener combinaciones válidas y la mejor combinación del semestre actual
    const combinacionesActual = obtenerCombinacionesValidas(materiasSemestreActual);
    let mejorCombinacionActual: Combinacion | undefined = undefined;
    if (combinacionesActual.length > 0) {
      mejorCombinacionActual = elegirMejorCombinacionPlan(combinacionesActual, storedHorario);
    } else {
      mejorCombinacionActual = undefined;
    }

    // Luego obtener materias del semestre siguiente
    const semestreSiguiente = semestreActual + 1;
    const materiasSemestreSiguiente = materiasPrimerFiltro.filter((materia) => {
      const semestreMateria = mapaNombreSemestre.get(materia.nombre);
      return semestreMateria === semestreSiguiente;
    });

    // Ahora, agregamos a la mejor combinacion actual las materias del siguiente semestre
    // que no se empalmen y no hagan pasar los 38 créditos totales

    if (mejorCombinacionActual) {
      const sesionesAcumuladas = [...mejorCombinacionActual.sesiones];
      const materiasAcumuladas = [...mejorCombinacionActual.materias];
      let creditosAcumulados = materiasAcumuladas.reduce((acc, m) => acc + m.creditos, 0);

      for (const materia of materiasSemestreSiguiente) {
        // Sesiones de esta materia
        const sesionesMateria = convertirMateriasASesiones([materia]);

        // Verificar si alguna sesion empalma con las ya acumuladas
        const empalma = sesionesMateria.some(sNueva =>
          sesionesAcumuladas.some(sExist => sesionesSeTraslapan(sNueva, sExist))
        );

        if (!empalma && (creditosAcumulados + materia.creditos) <= 38) {
          // Agregar esta materia y sus sesiones
          materiasAcumuladas.push(materia);
          sesionesAcumuladas.push(...sesionesMateria);
          creditosAcumulados += materia.creditos;
        }
      }

      segundoFiltro = materiasAcumuladas;

    } else {
      // No hay combinacion valida en semestre actual, entonces solo tomamos las materias del semestre actual
      segundoFiltro = materiasSemestreActual;
    }
  } else if (optimizacionElegida === "plan") {
    segundoFiltro = materiasPrimerFiltro.filter((materia) => {
      const semestreMateria = mapaNombreSemestre.get(materia.nombre);
      return semestreMateria === semestreActual;
    });

    const combinaciones = obtenerCombinacionesValidas(segundoFiltro);
    mejorCombinacion = elegirMejorCombinacionPlan(combinaciones, storedHorario || "");

    if (mejorCombinacion) {
      console.log("Mejor combinación (plan curricular):", mejorCombinacion);
      segundoFiltro = mejorCombinacion.materias;
    }
  } else {
    segundoFiltro = materiasPrimerFiltro;
  }

  const sesiones = convertirMateriasASesiones(segundoFiltro);

  console.log("Primer filtro:", materiasPrimerFiltro);
  console.log("Segundo filtro:", segundoFiltro);
  console.log("Sesiones:", sesiones);

  return {
    materiasPrimerFiltro,
    segundoFiltro,
    sesiones,
    combinacionOptima: optimizacionElegida === "plan" ? mejorCombinacion : undefined
  };
}
