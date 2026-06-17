const fieldClassName =
  "w-full rounded-xl border border-lumina-500/25 bg-surface px-4 py-3 text-foreground placeholder:text-muted focus:border-lumina-500 focus:outline-none focus:ring-2 focus:ring-lumina-100/50";

interface InputProps {
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Input({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  required,
  minLength,
  value,
  onChange,
}: Readonly<InputProps>) {
  return (
    <div>
      <label
        className="mb-1.5 block text-sm font-medium text-foreground"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        autoComplete={autoComplete}
        className={fieldClassName}
        id={id}
        minLength={minLength}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </div>
  );
}
