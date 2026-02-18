export const parseDate = (dateString, dateFormat = 'DD-MM-YYYY') => {
  try {
    if (!dateString) return new Date();

    const format = localStorage.getItem('dateFormat') || 'DD-MM-YYYY';

    if (format === 'DD-MM-YYYY') {
      const parts = dateString.split(/[,\-\/]/).map((part) => part.trim());
      if (parts.length >= 3) {
        const day = parts[0].length === 3 ? parts[1] : parts[0];
        const month = parts[1]?.length === 3 ? parts[2] : parts[1];
        const year = parts[2]?.length === 3 ? parts[3] : parts[2];

        if (day && month && year) {
          return new Date(`${year}-${month}-${day}`);
        }
      }
    } else if (format === 'MM/DD/YYYY') {
      const parts = dateString.split(/[,\-\/]/).map((part) => part.trim());
      if (parts.length >= 3) {
        const month = parts[0];
        const day = parts[1];
        const year = parts[2];

        if (day && month && year) {
          return new Date(`${year}-${month}-${day}`);
        }
      }
    } else if (format === 'YYYY-MM-DD') {
      return new Date(dateString);
    }

    return new Date(dateString);
  } catch {
    return new Date();
  }
};

export const formatDate = (date, dateFormat = 'DD-MM-YYYY') => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;

  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = dayNames[d.getDay()];

  const format = localStorage.getItem('dateFormat') || 'DD-MM-YYYY';

  switch (format) {
    case 'DD-MM-YYYY':
      return `${dayName}, ${day}-${month}-${year}`;
    case 'MM/DD/YYYY':
      return `${dayName}, ${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
      return `${dayName}, ${day}/${month}/${year}`;
    default:
      return `${dayName}, ${day}-${month}-${year}`;
  }
};
