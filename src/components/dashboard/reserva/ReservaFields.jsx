import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

export const Field = ({
  campo,
  label,
  type = 'text',
  placeholder,
  icon: Icon,
  required,
  autoComplete,
  value,
  onChange,
  error,
}) => (
  <div className="cr-field">
    <label className="cr-label">{label}{required && ' *'}</label>
    <div className={`cr-input-wrap${error ? ' error' : ''}`}>
      <Icon className="cr-icon-left" />
      <input
        type={type}
        className="cr-input"
        value={value}
        onChange={(e) => onChange(campo, e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        min={type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
      />
    </div>
    {error && <span className="cr-field-error"><FaExclamationTriangle />{error}</span>}
  </div>
);

export const SelectField = ({ campo, label, icon: Icon, required, value, onChange, error, children }) => (
  <div className="cr-field">
    <label className="cr-label">{label}{required && ' *'}</label>
    <div className={`cr-input-wrap${error ? ' error' : ''}`}>
      <Icon className="cr-icon-left" />
      <select
        className="cr-input cr-select"
        value={value}
        onChange={(e) => onChange(campo, e.target.value)}
      >
        {children}
      </select>
    </div>
    {error && <span className="cr-field-error"><FaExclamationTriangle />{error}</span>}
  </div>
);
