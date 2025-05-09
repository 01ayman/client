// import { LeccionesData } from "../pages/lecciones/Lecciones";

// Tipos base
export interface Ejercicio {
  id: number;
  titulo: string;
  descripcion: string;
  fenInicial: string;
  movimientoSolucion: string;
  nivel: number;
  idLeccion: number;
}

export interface Leccion {
  id: number;
  titulo: string;
  contenido: string;
  nivel: "principiante" | "intermedio" | "avanzado";
}

export interface ProgresoLeccion {
  id: number;
  usuario_id: number;
  leccion_id: number;
  estado: "en_progreso" | "completada";
}

// URL base
const API_URL = `${import.meta.env.VITE_API_URL}lecciones`;

// ---- Lecciones ----

export async function getLecciones(): Promise<Leccion[]> {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error("Error al obtener lecciones:", err);
    throw err;
  }
}

// ---- Ejercicios ----

export async function getEjercicios(): Promise<Ejercicio[]> {
  try {
    const res = await fetch(`${API_URL}/ejercicios`);
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error("Error al obtener ejercicios:", err);
    throw err;
  }
}

export async function getEjerciciosByLeccionId(
  leccionId: number
): Promise<Ejercicio[]> {
  try {
    const res = await fetch(`${API_URL}/${leccionId}/ejercicios`);
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error(
      `Error al obtener ejercicios de la lección ${leccionId}:`,
      err
    );
    throw err;
  }
}

// ---- Progreso ----

export async function updateLessonProgress(
  usuarioId: number,
  ejercicioId: number
): Promise<ProgresoLeccion> {
  try {
    const res = await fetch(`${API_URL}/ejercicios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario_id: usuarioId,
        ejercicio_id: ejercicioId,
      }),
    });

    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error(`Error al actualizar el progreso del ejercicio:`, err);
    throw err;
  }
}

export async function getProgresoLeccion(
  usuarioId: number,
  leccionId: number
): Promise<ProgresoLeccion[]> {
  try {
    const res = await fetch(`${API_URL}/${usuarioId}/${leccionId}`);
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    const data = await res.json();
    console.log(data);
    return data;
  } catch (err) {
    console.error(
      `Error al obtener progreso para el usuario ${usuarioId}:`,
      err
    );
    throw err;
  }
}

// ---- Carga completa para LeccionesData ----

export async function loadCompleteLeccionesData(usuarioId = 0): Promise<any> {
  try {
    const [lecciones, ejercicios] = await Promise.all([
      getLecciones(),
      getEjercicios(),
    ]);

    console.log(lecciones);

    const lessonsWithEjercicios = lecciones.map((leccion) => ({
      ...leccion,
      ejercicios: ejercicios.filter((e) => e.idLeccion === leccion.id),
    }));

    return {
      lessons: lessonsWithEjercicios,
      // En caso de necesitar incluir progreso:
      // progreso: await getProgresoLecciones(usuarioId)
    };
  } catch (err) {
    console.error("Error al cargar datos completos de lecciones:", err);
    throw err;
  }
}
