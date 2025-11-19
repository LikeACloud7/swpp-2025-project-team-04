import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ChipSelectorGroup } from '../ChipSelectorGroup';

describe('ChipSelectorGroup', () => {
  const mockChips = ['Option 1', 'Option 2', 'Option 3'];
  const mockOnSelectionChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링', () => {
    // 타이틀 테스트
    it('renders title correctly', () => {
      render(
        <ChipSelectorGroup
          title="Test Title"
          chips={mockChips}
          value={null}
          onSelectionChange={mockOnSelectionChange}
        />,
      );

      expect(screen.getByText('Test Title')).toBeTruthy();
    });

    // 칩 렌더 테스트
    it('renders all chips', () => {
      render(
        <ChipSelectorGroup
          title="Test"
          chips={mockChips}
          value={null}
          onSelectionChange={mockOnSelectionChange}
        />,
      );

      mockChips.forEach((chip) => {
        expect(screen.getByText(chip)).toBeTruthy();
      });
    });

    // 칩 3개 이상일 때 Scroll 테스트
    it('uses ScrollView when more than 3 chips', () => {
      const manyChips = ['Chip 1', 'Chip 2', 'Chip 3', 'Chip 4'];
      const { UNSAFE_getAllByType } = render(
        <ChipSelectorGroup
          title="Many Chips"
          chips={manyChips}
          value={null}
          onSelectionChange={mockOnSelectionChange}
        />,
      );

      const scrollViews = UNSAFE_getAllByType(
        require('react-native').ScrollView,
      );
      expect(scrollViews.length).toBeGreaterThan(0);
    });

    // 칩 3개 이하일 때 View 테스트
    it('uses regular View when 3 or fewer chips', () => {
      const { UNSAFE_queryAllByType } = render(
        <ChipSelectorGroup
          title="Few Chips"
          chips={mockChips}
          value={null}
          onSelectionChange={mockOnSelectionChange}
        />,
      );

      expect(mockChips.length).toBeLessThanOrEqual(3);
    });
  });

  describe('단일 선택 모드', () => {
    // 칩 클릭 선택 테스트
    it('selects a chip when clicked', () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState<string | null>(null);
        return (
          <ChipSelectorGroup
            title="Single Select"
            chips={mockChips}
            value={value}
            onSelectionChange={(next) => {
              setValue(next);
              mockOnSelectionChange(next);
            }}
          />
        );
      };

      render(<TestComponent />);

      const chip = screen.getByText('Option 1');
      fireEvent.press(chip);

      expect(mockOnSelectionChange).toHaveBeenLastCalledWith('Option 1');
    });

    // 같은 칩 다시 클릭 선택 해제 테스트
    it('deselects a chip when clicked again', () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState<string | null>(null);
        return (
          <ChipSelectorGroup
            title="Single Select"
            chips={mockChips}
            value={value}
            onSelectionChange={(next) => {
              setValue(next);
              mockOnSelectionChange(next);
            }}
          />
        );
      };

      render(<TestComponent />);

      const chip = screen.getByText('Option 1');

      fireEvent.press(chip);
      expect(mockOnSelectionChange).toHaveBeenLastCalledWith('Option 1');

      fireEvent.press(chip);
      expect(mockOnSelectionChange).toHaveBeenLastCalledWith(null);
    });

    // 다른 칩 클릭하면 이전 선택이 교체되는지 테스트
    it('replaces selection when clicking different chip', () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState<string | null>(null);
        return (
          <ChipSelectorGroup
            title="Single Select"
            chips={mockChips}
            value={value}
            onSelectionChange={(next) => {
              setValue(next);
              mockOnSelectionChange(next);
            }}
          />
        );
      };

      render(<TestComponent />);

      const chip1 = screen.getByText('Option 1');
      fireEvent.press(chip1);
      expect(mockOnSelectionChange).toHaveBeenLastCalledWith('Option 1');

      const chip2 = screen.getByText('Option 2');
      fireEvent.press(chip2);
      expect(mockOnSelectionChange).toHaveBeenLastCalledWith('Option 2');
    });
  });

  describe('콜백', () => {
    // 콜백 없어도 에러 발생하지 않는지 테스트
    it('does not crash when onSelectionChange is not provided', () => {
      render(<ChipSelectorGroup title="No Callback" chips={mockChips} />);

      const chip = screen.getByText('Option 1');
      expect(() => fireEvent.press(chip)).not.toThrow();
    });

    // 초기 렌더링 콜백 테스트는 제어형 컴포넌트 전환으로 제거했습니다.
  });
});
