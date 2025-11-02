export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
  }
  return { valid: true };
};

export const validateRequired = (value: any, fieldName: string): { valid: boolean; message?: string } => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, message: `Vui lòng nhập ${fieldName}` };
  }
  return { valid: true };
};
