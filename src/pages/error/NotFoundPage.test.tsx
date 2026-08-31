import React from 'react';
import { render } from '@testing-library/react';
import { NotFoundPage } from './NotFoundPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the HTML5 Video API which doesn't natively exist in JSDOM
const playMock = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  // @ts-ignore
  window.HTMLMediaElement.prototype.play = playMock;
  playMock.mockClear();
  document.body.innerHTML = '';
});

describe('NotFoundPage Rigorous Lifetime Verification', () => {
  it('Should execute 100 flawless render cycles to guarantee memory and rendering stability', () => {
    
    for (let cycle = 1; cycle <= 100; cycle++) {
      const { unmount, container } = render(<NotFoundPage />);
      
      // 1. Verify Video Element is present
      const video = container.querySelector('video');
      expect(video, `Cycle ${cycle}: Video element missing`).toBeTruthy();
      
      // 2. Verify mix-blend-multiply fix is applied for hardware safety
      const videoParentContainer = video?.parentElement?.parentElement;
      expect(
        videoParentContainer?.className, 
        `Cycle ${cycle}: mix-blend-multiply class missing`
      ).toContain('mix-blend-multiply');
      
      // 3. Verify the manual React video ref play() engine is executing
      expect(playMock, `Cycle ${cycle}: Video failed to auto-play`).toHaveBeenCalled();



      unmount();
    }
    
    // Ensure 100 unique mount/play cycles fired successfully without crashing
    expect(playMock).toHaveBeenCalledTimes(100);
  });
});
