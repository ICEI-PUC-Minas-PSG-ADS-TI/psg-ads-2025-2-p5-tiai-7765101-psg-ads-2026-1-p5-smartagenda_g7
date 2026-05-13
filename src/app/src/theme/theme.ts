export type ThemeType = 'dark' | 'light';

export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
  agenda: any;
}

export interface Theme {
  type: ThemeType;
  colors: ThemeColors;
}

const darkAgendaTheme = {
  reservationsBackgroundColor: '#121212',
  backgroundColor: '#121212',
  calendarBackground: '#1E1E1E',
  textSectionTitleColor: '#b6c1cd',
  selectedDayBackgroundColor: '#BB86FC',
  selectedDayTextColor: '#ffffff',
  todayTextColor: '#BB86FC',
  dayTextColor: '#d9e1e8',
  textDisabledColor: '#555555',
  dotColor: '#BB86FC',
  selectedDotColor: '#ffffff',
  arrowColor: '#FFFFFF',
  disabledArrowColor: '#fafafaff',
  monthTextColor: 'white',
  indicatorColor: 'white',
  agendaDayTextColor: '#A59EC0',
  agendaDayNumColor: '#A59EC0',
  agendaTodayColor: '#BB86FC',
  agendaKnobColor: '#BB86FC'
};

const lightAgendaTheme = {
  reservationsBackgroundColor: '#F5F5F5',
  backgroundColor: '#F5F5F5',
  calendarBackground: '#FFFFFF',
  textSectionTitleColor: '#3b3b3bff',
  selectedDayBackgroundColor: '#9F7CFA',
  selectedDayTextColor: '#ffffff',
  todayTextColor: '#9F7CFA',
  dayTextColor: '#000000',
  textDisabledColor: '#0e0e0eff',
  dotColor: '#9F7CFA',
  selectedDotColor: '#ffffff',
  arrowColor: '#000000',
  disabledArrowColor: '#E0E0E0',
  monthTextColor: '#000000',
  indicatorColor: '#9F7CFA',
  agendaDayTextColor: '#000000ff',
  agendaDayNumColor: '#666666',
  agendaTodayColor: '#9F7CFA',
  agendaKnobColor: '#9F7CFA'
};

export const darkTheme: Theme = {
  type: 'dark',
  colors: {
    primary: '#9F7CFA',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#A59EC0',
    border: '#2D2D2D',
    success: '#4caf50',
    error: '#f44336',
    agenda: darkAgendaTheme
  }
};

export const lightTheme: Theme = {
  type: 'light',
  colors: {
    primary: '#9F7CFA',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    surfaceVariant: '#E0E0E0',
    text: '#000000',
    textSecondary: '#666666',
    border: '#E0E0E0',
    success: '#4caf50',
    error: '#f44336',
    agenda: lightAgendaTheme
  }
};
