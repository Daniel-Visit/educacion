"use client";
import { Listbox } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import React from "react";

type Option = string | { value: string; label: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
};

function getOptionValue(option: Option): string {
  return typeof option === 'string' ? option : option.value;
}
function getOptionLabel(option: Option): string {
  return typeof option === 'string' ? option : option.label;
}

export default function Dropdown({ value, onChange, options, placeholder = "Selecciona una opción", className = "" }: Props) {
  // Encontrar el label del valor actual
  const currentLabel = options.find(opt => getOptionValue(opt) === value);
  return (
    <Listbox value={value} onChange={onChange}>
      <div className={`relative ${className}`}>
        <Listbox.Button className="w-full rounded-lg border px-3 py-2 bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <span>{currentLabel ? getOptionLabel(currentLabel) : <span className="text-gray-400">{placeholder}</span>}</span>
          <ChevronDown className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => {
            const optValue = getOptionValue(option);
            const optLabel = getOptionLabel(option);
            return (
              <Listbox.Option
                key={optValue}
                value={optValue}
                className={({ active, selected }) =>
                  `cursor-pointer select-none px-4 py-2 ${active ? "bg-indigo-100 text-indigo-900" : "text-gray-900"} ${selected ? "font-bold bg-indigo-50" : ""}`
                }
              >
                {({ selected }) => (
                  <div className="flex items-center">
                    {selected && <Check className="w-4 h-4 text-indigo-600 mr-2" />}
                    <span>{optLabel}</span>
                  </div>
                )}
              </Listbox.Option>
            );
          })}
        </Listbox.Options>
      </div>
    </Listbox>
  );
} 