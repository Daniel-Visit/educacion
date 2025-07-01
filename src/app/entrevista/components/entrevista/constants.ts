import { UserCircle, Info, HelpCircle, Calendar, Layers, BookOpen, Clock, Users, CheckCircle2 } from "lucide-react";

export const steps = [
  { key: "bienvenida", label: "Bienvenida", icon: UserCircle, tipo: "S" },
  { key: "introduccion", label: "Introducción", icon: Info, tipo: "S" },
  { key: "explicacion", label: "Explicación", icon: HelpCircle, tipo: "S" },
  { key: "anios", label: "Años en el colegio", icon: Calendar, tipo: "P" },
  { key: "nivel", label: "Nivel", icon: Layers, tipo: "P" },
  { key: "asignatura", label: "Asignatura", icon: BookOpen, tipo: "P" },
  { key: "horas", label: "Horas lectivas", icon: Clock, tipo: "P" },
  { key: "estudiantes", label: "Estudiantes promedio", icon: Users, tipo: "P" },
  { key: "final", label: "Resumen", icon: CheckCircle2, tipo: "S" },
  { key: "final2", label: "Cierre", icon: CheckCircle2, tipo: "S" },
];

export const preguntas = [
  "Hola Francisca, muy bienvenida. Soy tu tutora pedagógica virtual.",
  "Mi tarea es ayudarte a usar del modo más eficaz esta plataforma, la cual tiene como único propósito ponerse al servicio de tus necesidades como docente, ofreciéndote propuestas pedagógicas personalizadas en temas clave, de tal modo que, si así lo decides, te sirvan como insumo para mejorar tus prácticas pedagógicas y ahorrar tiempo.",
  "Para comenzar y antes de mostrarte lo que tengo preparado para ofrecerte, me gustaría que me ayudaras completando el siguiente cuestionario de inicio.",
  "¿Hace cuántos años que trabajas en el San Agustín?",
  "¿En qué nivel quieres que te apoye?",
  "¿En qué asignatura quieres que te apoye?",
  "¿Cuántas horas lectivas a la semana tienes para el nivel y asignatura que me informaste?",
  "¿Cuántos estudiantes tienes en promedio en tus cursos?",
  "¡Muchas gracias por tus respuestas!",
  "Antes de mostrarte cómo está estructurada la plataforma y cómo navegar por ella, solo comentarte, que estoy entrenada para que todo lo que hagamos juntas, sea privado, de tal modo que  con toda confianza me puedas \"usar\" para ir mejorando tus prácticas como docente y te sientas cada vez mejor preparada para cumplir con el rol insustituible que tienes en el aula.",
];

export const alternativas = {
  anios: Array.from({ length: 15 }, (_, i) => `${i + 1}`),
  nivel: [
    "1° Básico", "2° Básico", "3° Básico", "4° Básico", "5° Básico", "6° Básico", "7° Básico", "8° Básico",
    "1° Medio", "2° Medio", "3° Medio", "4° Medio"
  ],
  asignatura: [
    "Artes Visuales", "Ciencias Naturales", "Educación Física y Salud", "Historia, Geografía y Ciencias Sociales",
    "Inglés", "Lengua y Cultura de los Pueblos Originarios Ancestrales", "Lenguaje y Comunicación", "Lengua y Literatura",
    "Matemática", "Música", "Orientación", "Religión", "Tecnología"
  ],
  horas: Array.from({ length: 24 }, (_, i) => `${i + 1}`),
  estudiantes: Array.from({ length: 31 }, (_, i) => `${i + 10}`),
};

export const preguntaToStep = [
  "bienvenida", "introduccion", "explicacion", "anios", "nivel", "asignatura", "horas", "estudiantes", "final", "final2"
];

export type Respuestas = {
  anios: string;
  nivel: string;
  asignatura: string;
  horas: string;
  estudiantes: string;
  [key: string]: string;
}; 