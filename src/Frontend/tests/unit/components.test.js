
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '../../wwwroot/js/components/Footer.jsx'; // Load the component file which likely defines 'Footer' globally or we mock the import

// Mock useTranslation
// Since the app uses globals/hooks that might not be standard imports, we mock the hook mechanism if possible.
// Assuming Footer is defined in the global scope or exported. 
// However, the file just says "const Footer = ...". It doesn't export it.
// We need to simulate how the app loads it. 
// For this test, we might need to manually eval the file or modify the file to export.
// BUT, modifying the file is risky for the "No Build" constraint if not careful.
// A better approach for this "Script Tag" architecture is to read the file content and eval it, OR
// rely on the file assigning to window.Footer (which it doesn't).

// STRATEGY: We will read the file and inject it, or just copy the component logic for the test if isolation is hard.
// BETTER STRATEGY: Let's assume we can modify Footer.jsx to `window.Footer = Footer;` at the end
// if module.exports is not available.

// For now, I'll write the test assuming we can access `Footer`. 
// I will create a "shim" that loads the file content.

// Actually, let's just use a Virtual Component validation for now to avoid complexity of "eval".
// I will create a test that IMPORTS the component.
// To make it importable, we might need to change `const Footer` to `export const Footer` or `window.Footer` in the source.
// I'll assume I can modify Footer.jsx slightly to be testable (add `if (typeof module !== 'undefined') module.exports = Footer;`).

// Setup Mock for useTranslation
global.useTranslation = () => ({
    t: (key, defaultVal) => defaultVal || key,
    formatDate: (date) => '2023-01-01',
});

// Since we cannot easily import the file because it's not a module,
// I'll use a trick: require the file, but first I need to ensure the file *exports* something.
// I will modify Footer.jsx first to be test-friendly.

describe('Footer Component (Unit)', () => {
    let FooterComponent;

    beforeAll(() => {
        // Dynamic import simulation if needed, or just standard require after file mod
        FooterComponent = require('../../wwwroot/js/components/Footer.jsx');
        // Note: This requires the file to have module.exports
    });

    test('renders Quick Navigation and System Info', () => {
        const onNavigate = jest.fn();
        render(<FooterComponent currentPage="home" onNavigate={onNavigate} />);

        expect(screen.getByText('Quick Navigation')).toBeInTheDocument();
        expect(screen.getByText('System Info')).toBeInTheDocument();
        expect(screen.getByText('Online')).toBeInTheDocument();
    });

    test('calls onNavigate when a link is clicked', () => {
        const onNavigate = jest.fn();
        render(<FooterComponent currentPage="home" onNavigate={onNavigate} />);

        const managementLink = screen.getByText('nav.management'); // Our mock t returns the key or default. The default is 'nav.management' key if labelKey passed as second arg?
        // In code: t(link.labelKey, link.labelKey) -> so it returns the key.

        fireEvent.click(managementLink);
        expect(onNavigate).toHaveBeenCalledWith('management');
    });
});
