import React from 'react';
import { render, screen } from '@testing-library/react-native';
import WelcomeStep from '../WelcomeStep';

describe('WelcomeStep', () => {
  const mockSections = [
    {
      heading: '테스트 제목',
      content: '테스트 내용',
      highlight: '강조 문구',
    },
    {
      content: '제목 없는 섹션',
    },
  ];

  it('renders title and subtitle', () => {
    render(
      <WelcomeStep
        title="환영합니다"
        subtitle="부제목입니다"
        sections={mockSections}
      />,
    );

    expect(screen.getByText('환영합니다')).toBeTruthy();
    expect(screen.getByText('부제목입니다')).toBeTruthy();
  });

  it('renders all sections', () => {
    render(
      <WelcomeStep
        title="환영합니다"
        subtitle="부제목"
        sections={mockSections}
      />,
    );

    expect(screen.getByText('테스트 제목')).toBeTruthy();
    expect(screen.getByText('테스트 내용')).toBeTruthy();
    expect(screen.getByText('제목 없는 섹션')).toBeTruthy();
  });

  it('renders section with heading', () => {
    render(
      <WelcomeStep
        title="환영합니다"
        subtitle="부제목"
        sections={mockSections}
      />,
    );

    expect(screen.getByText('테스트 제목')).toBeTruthy();
  });

  it('renders section without heading', () => {
    const sectionsWithoutHeading = [
      {
        content: '제목 없는 내용',
      },
    ];

    render(
      <WelcomeStep
        title="환영합니다"
        subtitle="부제목"
        sections={sectionsWithoutHeading}
      />,
    );

    expect(screen.getByText('제목 없는 내용')).toBeTruthy();
  });

  it('renders section with highlight', () => {
    render(
      <WelcomeStep
        title="환영합니다"
        subtitle="부제목"
        sections={mockSections}
      />,
    );

    expect(screen.getByText('강조 문구')).toBeTruthy();
  });

  it('renders section without highlight', () => {
    const sectionsWithoutHighlight = [
      {
        heading: '제목만',
        content: '내용만',
      },
    ];

    render(
      <WelcomeStep
        title="환영합니다"
        subtitle="부제목"
        sections={sectionsWithoutHighlight}
      />,
    );

    expect(screen.getByText('제목만')).toBeTruthy();
    expect(screen.getByText('내용만')).toBeTruthy();
  });

  it('renders multiple sections correctly', () => {
    const multipleSections = [
      { heading: '섹션 1', content: '내용 1' },
      { heading: '섹션 2', content: '내용 2' },
      { heading: '섹션 3', content: '내용 3' },
    ];

    render(
      <WelcomeStep
        title="환영합니다"
        subtitle="부제목"
        sections={multipleSections}
      />,
    );

    expect(screen.getByText('섹션 1')).toBeTruthy();
    expect(screen.getByText('섹션 2')).toBeTruthy();
    expect(screen.getByText('섹션 3')).toBeTruthy();
  });

  it('renders empty sections array', () => {
    render(<WelcomeStep title="환영합니다" subtitle="부제목" sections={[]} />);

    expect(screen.getByText('환영합니다')).toBeTruthy();
  });
});
