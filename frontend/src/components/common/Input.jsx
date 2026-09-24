import React, { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      type = 'text',
      error,
      helperText,
      icon: Icon,
      className = '',
      id,
      name,
      placeholder,
      required = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || name;

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            placeholder={placeholder}
            className={`w-full rounded-lg border text-sm transition-colors py-2 px-3 focus:outline-none focus:ring-2 ${
              Icon ? 'pl-9' : ''
            } ${
              error
                ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-rose-200'
                : 'border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-200'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
