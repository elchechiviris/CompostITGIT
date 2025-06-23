import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type: 'text' | 'date' | 'number' | 'select';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  options?: Array<{ label: string; value: string | number }>;
  required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  options,
  required = false,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {type === 'select' && options ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all"
          required={required}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          required={required}
        />
      )}
    </div>
  );
};

export default FormField;