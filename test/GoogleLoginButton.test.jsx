import React from 'react';
import { render, screen } from '@testing-library/react';
import GoogleLoginButton from '../src/components/GoogleLoginButton';

describe('GoogleLoginButton', () => {
  test('renders login button container', () => {
    render(<GoogleLoginButton onLogin={() => { }} />);
    const elements = screen.getAllByRole('generic');
    expect(elements.length).toBeGreaterThan(0);
  });
});
