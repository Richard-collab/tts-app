import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UploadProgressBar from '../UploadProgressBar';

describe('UploadProgressBar', () => {
    it('should not render when visible is false', () => {
        render(<UploadProgressBar visible={false} />);
        expect(screen.queryByLabelText('toggle progress bar')).not.toBeInTheDocument();
    });

    it('should render when visible is true', () => {
        render(
            <UploadProgressBar
                visible={true}
                isExpanded={false}
                uploadedCount={1}
                totalCount={10}
            />
        );
        expect(screen.getByText('1 / 10')).toBeInTheDocument();
    });

    it('should toggle expanded state', () => {
        const onToggleExpand = vi.fn();
        render(
            <UploadProgressBar
                visible={true}
                isExpanded={false}
                onToggleExpand={onToggleExpand}
            />
        );
        const button = screen.getByLabelText('toggle progress bar');
        fireEvent.click(button);
        expect(onToggleExpand).toHaveBeenCalled();
    });

    it('should show extended details when expanded', () => {
        render(
            <UploadProgressBar
                visible={true}
                isExpanded={true}
                targetScript={{ scriptName: 'Test Script' }}
                syncTextEnabled={true}
            />
        );
        expect(screen.getByText('目标话术：')).toBeInTheDocument();
        expect(screen.getByText('Test Script')).toBeInTheDocument();
        // The switch input has role="switch" based on the error output
        // <input checked="" ... role="switch" type="checkbox" />
        // And it has no name/label associated in accessibility tree apparently, despite inputProps.
        // Let's try finding by role 'switch' without name first.
        const switchEl = screen.getByRole('switch');
        expect(switchEl).toBeInTheDocument();
        expect(switchEl).toBeChecked();
    });

    it('should handle link script click', () => {
        const onLinkScript = vi.fn();
        render(
            <UploadProgressBar
                visible={true}
                isExpanded={true}
                onLinkScript={onLinkScript}
                targetScript={{ scriptName: 'Test Script' }}
            />
        );
        fireEvent.click(screen.getByText('Test Script'));
        expect(onLinkScript).toHaveBeenCalled();
    });
});
