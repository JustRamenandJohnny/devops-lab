import { render, screen } from '@testing-library/react';
import App from './App';

test('показывается заголовок "Библиотека"', () => {
  render(<App />);
  const heading = screen.getByText(/библиотека/i);
  expect(heading).toBeInTheDocument();
});