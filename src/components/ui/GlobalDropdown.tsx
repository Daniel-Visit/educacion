"use client";
import { Listbox } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import React from "react";
import { createPortal } from "react-dom";

type Option = string | { value: string; label: string };

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

export default function GlobalDropdown({ 
  value, 
  onChange, 
  options, 
  placeholder = "Selecciona una opción", 
  className = "",
  disabled = false 
}: Props) {
  const [buttonEl, setButtonEl] = React.useState<HTMLDivElement | null>(null);
  const [menuStyle, setMenuStyle] = React.useState<React.CSSProperties>({});

  // Encontrar el label del valor actual
  const currentLabel = options.find(opt => getOptionValue(opt) === value);

  // Calcular posición y ancho del menú cuando se abre
  const handleOpenChange = React.useCallback((isOpen: boolean) => {
    if (isOpen && buttonEl) {
      const rect = buttonEl.getBoundingClientRect();
      setMenuStyle({
        position: 'absolute',
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width, // igualar ancho al botón
        minWidth: rect.width,
        zIndex: 9999
      });
    }
  }, [buttonEl]);

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled} as={React.Fragment}>
      {({ open }) => {
        // Usar useEffect para evitar setState durante render
        React.useEffect(() => {
          handleOpenChange(open);
        }, [open, handleOpenChange]);

        return (
          <div className={`relative ${className}`} ref={setButtonEl}>
            <Listbox.Button className="w-full rounded-lg border px-3 py-2 bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="truncate whitespace-nowrap block max-w-full">{currentLabel ? getOptionLabel(currentLabel) : <span className="text-gray-400">{placeholder}</span>}</span>
              <ChevronDown className="w-5 h-5 text-gray-400 ml-2" />
            </Listbox.Button>
            {open && buttonEl && createPortal(
              <Listbox.Options style={menuStyle} className="bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                {options.map((option) => {
                  const optValue = getOptionValue(option);
                  const optLabel = getOptionLabel(option);
                  return (
                    <Listbox.Option
                      key={optValue}
                      value={optValue}
                      className={({ active, selected }) =>
                        `cursor-pointer select-none px-4 py-2 flex items-center gap-2 ${active ? "bg-indigo-100 text-indigo-900" : "text-gray-900"} ${selected ? "font-bold bg-indigo-50" : ""}`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className="inline-flex items-center justify-center w-5 mr-0">
                            {selected && <Check className="w-4 h-4 text-indigo-600" />}
                          </span>
                          <span className="flex-1 truncate text-base leading-6">{optLabel}</span>
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