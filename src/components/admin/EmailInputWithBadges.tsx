'use client';

import { useState, useRef } from 'react';
import { X } from 'lucide-react';

interface EmailInputWithBadgesProps {
  value: string[];
  onChange: (emails: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function EmailInputWithBadges({
  value,
  onChange,
  placeholder = 'Ingresa emails separados por coma...',
  className = '',
}: EmailInputWithBadgesProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Función para validar email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  // Función para agregar email
  const addEmail = (email: string) => {
    const trimmedEmail = email.trim();
    if (
      trimmedEmail &&
      isValidEmail(trimmedEmail) &&
      !value.includes(trimmedEmail)
    ) {
      onChange([...value, trimmedEmail]);
      setInputValue('');
    }
  };

  // Función para eliminar email
  const removeEmail = (emailToRemove: string) => {
    onChange(value.filter(email => email !== emailToRemove));
  };

  // Manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Si contiene coma, procesar el email
    if (newValue.includes(',')) {
      const parts = newValue.split(',');
      const emailToAdd = parts[0];
      const remainingText = parts.slice(1).join(',');

      if (emailToAdd.trim()) {
        addEmail(emailToAdd);
        setInputValue(remainingText);
      }
    }
  };

  // Manejar keydown para validar con espacio
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ') {
      e.preventDefault();
      const currentEmail = inputValue.trim();
      if (currentEmail && isValidEmail(currentEmail)) {
        addEmail(currentEmail);
      }
    }
  };

  // Manejar foco
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Calcular el ancho del input basado en el contenido
  const getInputWidth = () => {
    if (!inputRef.current) return 'auto';
    const minWidth = 200;
    const textWidth = inputValue.length * 8; // Aproximación del ancho del texto
    return Math.max(minWidth, textWidth + 20) + 'px';
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          min-h-[42px] px-3 py-2 bg-white border rounded-lg cursor-text
          ${
            isFocused
              ? 'border-indigo-500 ring-2 ring-offset-2 ring-indigo-500'
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex flex-wrap items-center gap-2 min-h-[30px]">
          {/* Badges de emails */}
          {value.map((email, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm border border-gray-200"
            >
              {email}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  removeEmail(email);
                }}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={`Eliminar ${email}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Input de texto */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm placeholder-gray-400"
            style={{ width: getInputWidth() }}
          />
        </div>
      </div>
    </div>
  );
}
