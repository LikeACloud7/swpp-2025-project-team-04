// src/components/common/AuthInput.tsx
import React, {
  forwardRef,
  useMemo,
  useState,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  TextInput,
  View,
  Text,
  TextInputProps,
  Pressable,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
  TextInputSubmitEditingEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type AuthInputProps = Omit<
  TextInputProps,
  'onChange' | 'onChangeText'
> & {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  /** 비밀번호 입력 시 보기/가리기 토글 노출 여부 (기본 true) */
  showSecureToggle?: boolean;
  containerClassName?: string;
  inputClassName?: string;
  hideLabel?: boolean;
};

export type AuthInputHandle = {
  focus: () => void;
  blur: () => void;
  clear: () => void;
};

const AuthInput = forwardRef<AuthInputHandle, AuthInputProps>(
  (
    {
      label,
      value,
      onChangeText,
      leftIcon,
      showSecureToggle = true,
      containerClassName,
      inputClassName,
      hideLabel = false,
      secureTextEntry,
      onSubmitEditing,
      returnKeyType,
      editable = true,
      placeholderTextColor = '#9ca3af',
      ...rest
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const [isSecure, setIsSecure] = useState(!!secureTextEntry);
    const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => inputRef.current?.clear(),
    }));

    const borderClass = useMemo(() => {
      if (!editable) return 'border-neutral-200';
      return focused ? 'border-blue-300' : 'border-neutral-200';
    }, [focused, editable]);

    return (
      <View className={containerClassName}>
        {!hideLabel && label ? (
          <Text className="mb-2 text-[13px] font-semibold text-neutral-700">
            {label}
          </Text>
        ) : null}

        <View
          className={`flex-row items-center overflow-hidden rounded-xl border-2 bg-neutral-50 ${borderClass}`}
        >
          {leftIcon ? (
            <View className="pl-3 pr-1">
              <Ionicons
                name={leftIcon}
                size={18}
                color={focused ? '#0EA5E9' : '#64748B'}
              />
            </View>
          ) : null}

          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            secureTextEntry={isSecure}
            placeholderTextColor={placeholderTextColor}
            editable={editable}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            className={`flex-1 px-4 py-3.5 text-[15px] text-neutral-900 ${inputClassName ?? ''}`}
            {...rest}
          />

          {secureTextEntry && showSecureToggle && (
            <Pressable
              onPress={() => setIsSecure((s) => !s)}
              hitSlop={8}
              className="px-3 py-2 active:opacity-80"
            >
              <Ionicons
                name={isSecure ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#64748B"
              />
            </Pressable>
          )}
        </View>
      </View>
    );
  },
);

export default AuthInput;
