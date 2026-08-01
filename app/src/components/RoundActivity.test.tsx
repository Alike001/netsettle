import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RoundActivity } from './RoundActivity';

describe('RoundActivity', () => {
  it('explains an activity read failure instead of calling it zero verified events', () => {
    const onRetry = vi.fn();
    render(
      <RoundActivity
        configured
        error={new Error('Both Sepolia providers failed')}
        events={[]}
        onRetry={onRetry}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /round activity/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('Activity could not be verified');
    fireEvent.click(screen.getByRole('button', { name: 'Retry activity read' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
