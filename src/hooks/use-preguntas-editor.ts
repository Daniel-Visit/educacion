import { useState, useEffect } from 'react';
import { PreguntaExtraida } from '@/lib/extract-evaluacion';

// Interfaces para reemplazar tipos 'any'
interface FormData {
  respuestasCorrectas: { [key: number]: string };
  [key: string]: unknown;
}

interface SetFormDataFunction {
  (data: FormData | ((prev: FormData) => FormData)): void;
}

export function usePreguntasEditor() {
  const [editingPregunta, setEditingPregunta] = useState<{
    numero: number;
    field: 'texto' | 'alternativa';
    alternativaIndex?: number;
  } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [openDropdown, setOpenDropdown] = useState<{
    tipo: 'pregunta' | 'alternativa';
    numero: number;
    alternativaIndex?: number;
  } | null>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (openDropdown && !target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const handleStartEdit = (
    preguntaNumero: number,
    field: 'texto' | 'alternativa',
    alternativaIndex?: number
  ) => {
    setEditingPregunta({ numero: preguntaNumero, field, alternativaIndex });
    setEditValue('');
    setOpenDropdown(null);
  };

  const handleSaveEdit = (
    preguntasExtraidas: PreguntaExtraida[],
    setPreguntasExtraidas: (preguntas: PreguntaExtraida[]) => void
  ) => {
    if (!editingPregunta || !editValue.trim()) return;

    const nuevasPreguntas = [...preguntasExtraidas];
    const preguntaIndex = nuevasPreguntas.findIndex(
      p => p.numero === editingPregunta.numero
    );

    if (preguntaIndex === -1) return;

    if (editingPregunta.field === 'texto') {
      nuevasPreguntas[preguntaIndex] = {
        ...nuevasPreguntas[preguntaIndex],
        texto: editValue.trim(),
      };
    } else if (
      editingPregunta.field === 'alternativa' &&
      editingPregunta.alternativaIndex !== undefined
    ) {
      const nuevasAlternativas = [
        ...nuevasPreguntas[preguntaIndex].alternativas,
      ];
      nuevasAlternativas[editingPregunta.alternativaIndex] = {
        ...nuevasAlternativas[editingPregunta.alternativaIndex],
        texto: editValue.trim(),
      };
      nuevasPreguntas[preguntaIndex] = {
        ...nuevasPreguntas[preguntaIndex],
        alternativas: nuevasAlternativas,
      };
    }

    setPreguntasExtraidas(nuevasPreguntas);
    setEditingPregunta(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingPregunta(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // handleSaveEdit se llamará desde el componente padre
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleDeletePregunta = (
    preguntaNumero: number,
    preguntasExtraidas: PreguntaExtraida[],
    setPreguntasExtraidas: (preguntas: PreguntaExtraida[]) => void,
    formData: FormData,
    setFormData: SetFormDataFunction
  ) => {
    const nuevasPreguntas = preguntasExtraidas
      .filter(p => p.numero !== preguntaNumero)
      .map((p, index) => ({ ...p, numero: index + 1 }));

    setPreguntasExtraidas(nuevasPreguntas);

    // Actualizar respuestas correctas
    const nuevasRespuestas: { [key: number]: string } = {};
    nuevasPreguntas.forEach((p, index) => {
      const oldNum = preguntaNumero;
      if (formData.respuestasCorrectas[oldNum]) {
        nuevasRespuestas[index + 1] = formData.respuestasCorrectas[oldNum];
      }
    });

    setFormData((prev: FormData) => ({
      ...prev,
      respuestasCorrectas: nuevasRespuestas,
    }));

    setOpenDropdown(null);
  };

  const handleDeleteAlternativa = (
    preguntaNumero: number,
    alternativaIndex: number,
    preguntasExtraidas: PreguntaExtraida[],
    setPreguntasExtraidas: (preguntas: PreguntaExtraida[]) => void,
    formData: FormData,
    setFormData: SetFormDataFunction
  ) => {
    const nuevasPreguntas = [...preguntasExtraidas];
    const preguntaIndex = nuevasPreguntas.findIndex(
      p => p.numero === preguntaNumero
    );

    if (preguntaIndex === -1) return;

    const nuevasAlternativas = nuevasPreguntas[preguntaIndex].alternativas
      .filter((_, index) => index !== alternativaIndex)
      .map((alt, index) => ({
        ...alt,
        letra: String.fromCharCode(65 + index),
      }));

    nuevasPreguntas[preguntaIndex] = {
      ...nuevasPreguntas[preguntaIndex],
      alternativas: nuevasAlternativas,
    };

    setPreguntasExtraidas(nuevasPreguntas);

    // Actualizar respuesta correcta si la eliminada era la correcta
    const letraEliminada = String.fromCharCode(65 + alternativaIndex);
    if (formData.respuestasCorrectas[preguntaNumero] === letraEliminada) {
      setFormData((prev: FormData) => ({
        ...prev,
        respuestasCorrectas: {
          ...prev.respuestasCorrectas,
          [preguntaNumero]: '',
        },
      }));
    }

    setOpenDropdown(null);
  };

  const handleToggleDropdown = (
    tipo: 'pregunta' | 'alternativa',
    numero: number,
    alternativaIndex?: number
  ) => {
    const current = openDropdown;
    if (
      current &&
      current.tipo === tipo &&
      current.numero === numero &&
      current.alternativaIndex === alternativaIndex
    ) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown({ tipo, numero, alternativaIndex });
    }
  };

  const handleDropdownAction = (
    action: 'edit' | 'delete',
    tipo: 'pregunta' | 'alternativa',
    numero: number,
    alternativaIndex?: number,
    preguntasExtraidas?: PreguntaExtraida[],
    setPreguntasExtraidas?: (preguntas: PreguntaExtraida[]) => void,
    formData?: FormData,
    setFormData?: SetFormDataFunction
  ) => {
    if (action === 'edit') {
      if (tipo === 'pregunta') {
        const pregunta = preguntasExtraidas?.find(p => p.numero === numero);
        if (pregunta) {
          setEditValue(pregunta.texto);
          handleStartEdit(numero, 'texto');
        }
      } else if (tipo === 'alternativa' && alternativaIndex !== undefined) {
        const pregunta = preguntasExtraidas?.find(p => p.numero === numero);
        if (pregunta && pregunta.alternativas[alternativaIndex]) {
          setEditValue(pregunta.alternativas[alternativaIndex].texto);
          handleStartEdit(numero, 'alternativa', alternativaIndex);
        }
      }
    } else if (action === 'delete') {
      if (
        tipo === 'pregunta' &&
        setPreguntasExtraidas &&
        formData &&
        setFormData
      ) {
        handleDeletePregunta(
          numero,
          preguntasExtraidas!,
          setPreguntasExtraidas,
          formData,
          setFormData
        );
      } else if (
        tipo === 'alternativa' &&
        alternativaIndex !== undefined &&
        setPreguntasExtraidas &&
        formData &&
        setFormData
      ) {
        handleDeleteAlternativa(
          numero,
          alternativaIndex,
          preguntasExtraidas!,
          setPreguntasExtraidas,
          formData,
          setFormData
        );
      }
    }
    setOpenDropdown(null);
  };

  return {
    editingPregunta,
    editValue,
    openDropdown,
    setEditValue,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleKeyPress,
    handleDeletePregunta,
    handleDeleteAlternativa,
    handleToggleDropdown,
    handleDropdownAction,
  };
}
