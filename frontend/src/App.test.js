import { render, screen } from '@testing-library/react';
import Button from './components/common/Button';

describe('Button', () => {
  test('affiche le contenu enfant', () => {
    render(<Button>Valider</Button>);
    expect(screen.getByRole('button', { name: 'Valider' })).toBeInTheDocument();
  });

  test('affiche le texte de chargement quand loading=true', () => {
    render(<Button loading>Valider</Button>);
    expect(screen.getByRole('button', { name: /Chargement/i })).toBeDisabled();
  });
});
