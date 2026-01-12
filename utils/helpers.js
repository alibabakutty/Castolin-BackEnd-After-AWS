export const toOracleDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) return val;

  // Accept YYYY-MM-DD safely
  const d = new Date(val);
  return isNaN(d) ? null : d;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateOrderNumber = (latestOrderNo) => {
  let nextSequence = '0001';
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const year = today.getFullYear().toString().slice(-2);

  if (latestOrderNo) {
    const parts = latestOrderNo.split('-');
    if (parts.length >= 5) {
      const lastDate = `${parts[1]}-${parts[2]}-${parts[3]}`;
      const currentDate = `${day}-${month}-${year}`;

      if (lastDate === currentDate) {
        const lastSequence = parseInt(parts[4]) || 0;
        nextSequence = (lastSequence + 1).toString().padStart(4, '0');
      }
    }
  }

  return `SQ-${day}-${month}-${year}-${nextSequence}`;
};