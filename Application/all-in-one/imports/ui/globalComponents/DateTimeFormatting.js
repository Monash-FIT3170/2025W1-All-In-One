// Format date for display
export const formatDisplayDate = (dateString) => {
  const date = new Date(dateString);
  const options = { month: 'long', day: 'numeric'}
  const options_year = {year: 'numeric'};
  return date.toLocaleDateString('en-US', options) + getOrdinalSuffix(date.getDate()) + ", " + date.toLocaleDateString('en-us', options_year);
};

// Format time for display
export const formatTime = (start, end) => {
  const startTime = new Date(start).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  const endTime = new Date(end).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  return `${startTime} - ${endTime}`;
};

// Get ordinal suffix for date
export const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};