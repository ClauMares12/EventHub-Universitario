export function required(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

export function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export function positiveNumber(value) {
  return Number(value) > 0;
}

export function validDate(value) {
  return required(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

export function minLength(value, length) {
  return String(value || "").trim().length >= length;
}

export function validate(fields) {
  const errors = [];
  fields.forEach((field) => {
    if (field.rule && !field.rule(field.value)) errors.push(field.message);
  });
  return errors;
}
