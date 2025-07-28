import React from 'react';
import { render, screen } from '@testing-library/react';
import GoogleLoginButton from './GoogleLoginButton';

describe('GoogleLoginButton', () => {
  test('renders login button container', () => {
    render(<GoogleLoginButton onLogin={() => {}} />);
    expect(screen.getByRole('generic')).toBeInTheDocument();
  });
});
