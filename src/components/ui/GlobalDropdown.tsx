'use client';
import { Listbox } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';

type Option =
  | string
  | { value: string; label: string; disabled?: boolean; tooltip?: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

function getOptionValue(option: Option): string {
  return typeof option === 'string' ? option : option.value;
}

function getOptionLabel(option: Option): string {
  return typeof option === 'string' ? option : option.label;
}

function isOptionDisabled(option: Option): boolean {
  return typeof option === 'string' ? false : option.disabled || false;
}

function getOptionTooltip(option: Option): string | undefined {
  return typeof option === 'string' ? undefined : option.tooltip;
}

export default function GlobalDropdown({
  value,
  onChange,
  options,
  placeholder = 'Selecciona una opción',
  className = '',
  disabled = false,
}: Props) {
  const [buttonEl, setButtonEl] = React.useState<HTMLDivElement | null>(null);
  const [menuStyle, setMenuStyle] = React.useState<React.CSSProperties>({});

  // Encontrar el label del valor actual
  const currentLabel = options.find(opt => getOptionValue(opt) === value);

  // Calcular posición y ancho del menú cuando se abre
  const handleOpenChange = React.useCallback(
    (isOpen: boolean) => {
      if (isOpen && buttonEl) {
        const rect = buttonEl.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const menuHeight = Math.min(options.length * 40 + 20, 240); // Altura estimada del menú (máx 240px)

        // Determinar si abrir hacia arriba o hacia abajo
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const shouldOpenUp = spaceBelow < menuHeight && spaceAbove > menuHeight;

        setMenuStyle({
          position: 'absolute',
          top: shouldOpenUp
            ? rect.top + window.scrollY - menuHeight
            : rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width, // igualar ancho al botón
          minWidth: rect.width,
          zIndex: 9999,
        });
      }
    },
    [buttonEl, options.length]
  );

  // Estado para controlar si el dropdown está abierto
  const [isOpen, setIsOpen] = React.useState(false);

  // Efecto para manejar cambios en el estado abierto
  React.useEffect(() => {
    handleOpenChange(isOpen);
  }, [isOpen, handleOpenChange]);

  // Estado para sincronizar con el Listbox
  const [listboxOpen, setListboxOpen] = React.useState(false);

  // Efecto para sincronizar el estado del Listbox
  React.useEffect(() => {
    if (listboxOpen !== isOpen) {
      setIsOpen(listboxOpen);
    }
  }, [listboxOpen, isOpen]);

  // Ref para evitar re-renders innecesarios del menuStyle
  const menuStyleRef = React.useRef<React.CSSProperties>({});
  const opensUpRef = React.useRef(false);

  return (
    <Listbox
      value={value}
      onChange={onChange}
      disabled={disabled}
      as={React.Fragment}
    >
      {({ open }) => {
        // Sincronizar el estado del Listbox de manera segura usando setTimeout
        if (open !== listboxOpen) {
          setTimeout(() => {
            setListboxOpen(open);
          }, 0);
        }

        // Usar el estilo del ref directamente para evitar setState durante render
        const currentMenuStyle =
          open && buttonEl
            ? (() => {
                const rect = buttonEl.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const menuHeight = Math.min(options.length * 40 + 20, 240);

                const spaceBelow = viewportHeight - rect.bottom;
                const spaceAbove = rect.top;
                const shouldOpenUp =
                  spaceBelow < menuHeight && spaceAbove > menuHeight;

                // Actualizar refs sin setState
                opensUpRef.current = shouldOpenUp;
                menuStyleRef.current = {
                  position: 'absolute' as const,
                  top: shouldOpenUp
                    ? rect.top + window.scrollY - menuHeight
                    : rect.bottom + window.scrollY,
                  left: rect.left + window.scrollX,
                  width: rect.width,
                  minWidth: rect.width,
                  zIndex: 9999,
                };

                return menuStyleRef.current;
              })()
            : menuStyle;

        return (
          <div className={`relative ${className}`} ref={setButtonEl}>
            <Listbox.Button className="w-full rounded-lg border px-3 py-2 bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="truncate whitespace-nowrap block max-w-full">
                {currentLabel ? (
                  getOptionLabel(currentLabel)
                ) : (
                  <span className="text-gray-400">{placeholder}</span>
                )}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 ml-2 transition-transform duration-200 ${opensUpRef.current ? 'rotate-180' : ''}`}
              />
            </Listbox.Button>
            {open &&
              buttonEl &&
              createPortal(
                <Listbox.Options
                  style={currentMenuStyle}
                  className="bg-white border rounded-lg shadow-lg max-h-60 overflow-auto"
                >
                  {options.map(option => {
                    const optValue = getOptionValue(option);
                    const optLabel = getOptionLabel(option);
                    const isDisabled = isOptionDisabled(option);
                    const tooltip = getOptionTooltip(option);

                    return (
                      <Listbox.Option
                        key={optValue}
                        value={optValue}
                        disabled={isDisabled}
                        className={({ active, selected }) =>
                          `select-none px-4 py-2 flex items-center gap-2 ${
                            isDisabled
                              ? 'cursor-not-allowed text-gray-400 bg-gray-50'
                              : 'cursor-pointer text-gray-900'
                          } ${active && !isDisabled ? 'bg-indigo-100 text-indigo-900' : ''} ${selected ? 'font-bold bg-indigo-50' : ''}`
                        }
                        title={tooltip}
                      >
                        {({ selected }) => (
                          <>
                            <span className="inline-flex items-center justify-center w-5 mr-0">
                              {selected && !isDisabled && (
                                <Check className="w-4 h-4 text-indigo-600" />
                              )}
                            </span>
                            <span className="flex-1 truncate text-base leading-6">
                              {optLabel}
                            </span>
                          </>
                        )}
                      </Listbox.Option>
                    );
                  })}
                </Listbox.Options>,
                document.body
              )}
          </div>
        );
      }}
    </Listbox>
  );
}
