import { renderHook, act } from '@testing-library/react-native';
import { useBehaviorLogs } from '../useBehaviorLogs';

describe('useBehaviorLogs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('초기 상태가 모든 카운트 0으로 설정됨', () => {
    const { result } = renderHook(() => useBehaviorLogs());

    expect(result.current.behaviorLogs).toEqual({
      pauseCount: 0,
      rewindCount: 0,
      vocabLookupCount: 0,
      vocabSaveCount: 0,
    });
  });

  it('pauseCount를 증가시킴', () => {
    const { result } = renderHook(() => useBehaviorLogs());

    act(() => {
      result.current.incrementLog('pauseCount');
    });

    expect(result.current.behaviorLogs.pauseCount).toBe(1);
    expect(result.current.behaviorLogs.rewindCount).toBe(0);
    expect(result.current.behaviorLogs.vocabLookupCount).toBe(0);
    expect(result.current.behaviorLogs.vocabSaveCount).toBe(0);
  });

  it('rewindCount를 증가시킴', () => {
    const { result } = renderHook(() => useBehaviorLogs());

    act(() => {
      result.current.incrementLog('rewindCount');
    });

    expect(result.current.behaviorLogs.pauseCount).toBe(0);
    expect(result.current.behaviorLogs.rewindCount).toBe(1);
    expect(result.current.behaviorLogs.vocabLookupCount).toBe(0);
    expect(result.current.behaviorLogs.vocabSaveCount).toBe(0);
  });

  it('vocabLookupCount를 증가시킴', () => {
    const { result } = renderHook(() => useBehaviorLogs());

    act(() => {
      result.current.incrementLog('vocabLookupCount');
    });

    expect(result.current.behaviorLogs.pauseCount).toBe(0);
    expect(result.current.behaviorLogs.rewindCount).toBe(0);
    expect(result.current.behaviorLogs.vocabLookupCount).toBe(1);
    expect(result.current.behaviorLogs.vocabSaveCount).toBe(0);
  });

  it('vocabSaveCount를 증가시킴', () => {
    const { result } = renderHook(() => useBehaviorLogs());

    act(() => {
      result.current.incrementLog('vocabSaveCount');
    });

    expect(result.current.behaviorLogs.pauseCount).toBe(0);
    expect(result.current.behaviorLogs.rewindCount).toBe(0);
    expect(result.current.behaviorLogs.vocabLookupCount).toBe(0);
    expect(result.current.behaviorLogs.vocabSaveCount).toBe(1);
  });

  it('같은 카운트를 여러 번 증가시킴', () => {
    const { result } = renderHook(() => useBehaviorLogs());

    act(() => {
      result.current.incrementLog('pauseCount');
      result.current.incrementLog('pauseCount');
      result.current.incrementLog('pauseCount');
    });

    expect(result.current.behaviorLogs.pauseCount).toBe(3);
  });

  it('다른 카운트들을 각각 증가시킴', () => {
    const { result } = renderHook(() => useBehaviorLogs());

    act(() => {
      result.current.incrementLog('pauseCount');
      result.current.incrementLog('rewindCount');
      result.current.incrementLog('vocabLookupCount');
      result.current.incrementLog('vocabSaveCount');
    });

    expect(result.current.behaviorLogs).toEqual({
      pauseCount: 1,
      rewindCount: 1,
      vocabLookupCount: 1,
      vocabSaveCount: 1,
    });
  });

  it('커스텀 amount로 증가시킴', () => {
    const { result } = renderHook(() => useBehaviorLogs());

    act(() => {
      result.current.incrementLog('pauseCount', 5);
    });

    expect(result.current.behaviorLogs.pauseCount).toBe(5);
  });

  it('여러 다른 amount로 증가시킴', () => {
    const { result } = renderHook(() => useBehaviorLogs());

    act(() => {
      result.current.incrementLog('pauseCount', 3);
      result.current.incrementLog('pauseCount', 2);
      result.current.incrementLog('rewindCount', 10);
    });

    expect(result.current.behaviorLogs.pauseCount).toBe(5);
    expect(result.current.behaviorLogs.rewindCount).toBe(10);
  });

  it('로그를 리셋함', () => {
    const { result } = renderHook(() => useBehaviorLogs());

    act(() => {
      result.current.incrementLog('pauseCount', 5);
      result.current.incrementLog('rewindCount', 3);
      result.current.incrementLog('vocabLookupCount', 7);
      result.current.incrementLog('vocabSaveCount', 2);
    });

    expect(result.current.behaviorLogs).toEqual({
      pauseCount: 5,
      rewindCount: 3,
      vocabLookupCount: 7,
      vocabSaveCount: 2,
    });

    act(() => {
      result.current.resetLogs();
    });

    expect(result.current.behaviorLogs).toEqual({
      pauseCount: 0,
      rewindCount: 0,
      vocabLookupCount: 0,
      vocabSaveCount: 0,
    });
  });

  it('리셋 후 다시 증가시킬 수 있음', () => {
    const { result } = renderHook(() => useBehaviorLogs());

    act(() => {
      result.current.incrementLog('pauseCount', 5);
      result.current.resetLogs();
      result.current.incrementLog('pauseCount', 2);
    });

    expect(result.current.behaviorLogs.pauseCount).toBe(2);
  });

  it('증가 시 콘솔 로그를 출력함', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const { result } = renderHook(() => useBehaviorLogs());

    act(() => {
      result.current.incrementLog('pauseCount');
    });

    expect(consoleSpy).toHaveBeenCalledWith('📊 [behavior log] pauseCount: 1');
  });

  it('증가 시 업데이트된 값을 콘솔에 출력함', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const { result } = renderHook(() => useBehaviorLogs());

    act(() => {
      result.current.incrementLog('vocabLookupCount', 3);
      result.current.incrementLog('vocabLookupCount', 2);
    });

    expect(consoleSpy).toHaveBeenCalledWith('📊 [behavior log] vocabLookupCount: 3');
    expect(consoleSpy).toHaveBeenCalledWith('📊 [behavior log] vocabLookupCount: 5');
  });
});
