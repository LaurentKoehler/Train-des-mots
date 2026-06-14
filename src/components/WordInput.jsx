import { useState, useRef, useEffect } from 'react';

export default function WordInput({ onSubmit, disabled }) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const inputRef = useRef(null);

  // Focus au montage et après chaque soumission
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleSubmit = () => {
    if (!value.trim() || disabled) return;

    const valid = onSubmit(value);

    if (valid) {
      setStatus('success');
      setTimeout(() => {
        setStatus(null);
        inputRef.current?.focus();
      }, 600);
    } else {
      setStatus('error');
      setTimeout(() => {
        setStatus(null);
        inputRef.current?.focus();
      }, 800);
    }

    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="word-input-container">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`word-input${status ? ` word-input--${status}` : ''}`}
        placeholder="Tape un mot…"
        disabled={disabled}
        autoComplete="off"
        spellCheck="false"
      />
      <button
        onClick={handleSubmit}
        className="validate-btn"
        disabled={disabled || !value.trim()}
      >
        Valider
      </button>
    </div>
  );
}
