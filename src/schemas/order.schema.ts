export const validateOrderData = (data: any) => {
  const errors: string[] = [];
  if (!data.customerName || typeof data.customerName !== 'string') {
    errors.push("Поле customerName є обов'язковим");
  }
  if (!data.phone || typeof data.phone !== 'string') {
    errors.push("Поле phone є обов'язковим");
  }
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push("Масив items не може бути порожнім");
  }
  return errors;
};