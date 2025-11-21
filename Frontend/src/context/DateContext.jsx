import { createContext, useContext, useState } from 'react';

const DateContext = createContext();

export const DateProvider = ({ children }) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
    endDate: new Date(), // Today
    label: 'Last 30 days'
  });

  return (
    <DateContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </DateContext.Provider>
  );
};

export const useDateRange = () => {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error('useDateRange must be used within DateProvider');
  }
  return context;
};
