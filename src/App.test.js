import { render, screen } from '@testing-library/react';
import App from './App';

beforeAll(() => {
    window.scrollTo = () => {};
    global.ResizeObserver = class {
        observe() {}
        disconnect() {}
    };
});

test('renders name and outbound links', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /amogh gulati/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /google scholar/i })[0]).toHaveAttribute(
        'href',
        expect.stringContaining('scholar.google.com')
    );
});
