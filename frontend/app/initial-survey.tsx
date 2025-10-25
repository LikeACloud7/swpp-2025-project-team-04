import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';

import LevelSelector from '@/components/initial-survey/LevelSelector';
import ListeningAudioButton from '@/components/initial-survey/ListeningAudioButton';
import NavButtons from '@/components/initial-survey/NavButtons';
import PercentageSlider from '@/components/initial-survey/PercentageSlider';
import ProgressBar from '@/components/initial-survey/ProgressBar';
import TopicGrid from '@/components/initial-survey/TopicGrid';
import WelcomeStep from '@/components/initial-survey/WelcomeStep';
import {
  LISTENING_LEVELS,
  TOPIC_CATEGORIES,
  WELCOME_CONTENT,
  MAX_TOPIC_SELECTIONS,
  TOTAL_SURVEY_PAGES,
} from '@/constants/initialSurveyData';
import { submitInitialSurvey } from '@/api/initialSurvey';

export default function InitialSurveyScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState({
    proficiencyLevel: '',
    percent1: 50,
    percent2: 50,
    percent3: 50,
    percent4: 50,
    percent5: 50,
    selectedTopics: [] as string[],
  });

  const handleNext = () => {
    if (currentStep === TOTAL_SURVEY_PAGES) {
      handleSubmit();
      return;
    }
    // 레벨 선택 없이 Step 2로 넘어가기 방지
    if (currentStep === 1 && !userInput.proficiencyLevel) {
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    submitInitialSurvey(
      userInput.proficiencyLevel,
      [
        userInput.percent1,
        userInput.percent2,
        userInput.percent3,
        userInput.percent4,
        userInput.percent5,
      ],
      userInput.selectedTopics
    );
    router.replace('/(main)');
  };

  const handleTopicToggle = (topicId: string) => {
    const currentTopics = userInput.selectedTopics;
    if (currentTopics.includes(topicId)) {
      // Remove if already selected
      setUserInput({
        ...userInput,
        selectedTopics: currentTopics.filter((t) => t !== topicId),
      });
    } else if (currentTopics.length < MAX_TOPIC_SELECTIONS) {
      // Add if < 3
      setUserInput({
        ...userInput,
        selectedTopics: [...currentTopics, topicId],
      });
    }
  };

  const getNextButtonLabel = () => {
    if (currentStep === TOTAL_SURVEY_PAGES) return '완료';
    if (currentStep === 0) return '시작하기';
    return '다음';
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <WelcomeStep
            title={WELCOME_CONTENT.title}
            subtitle={WELCOME_CONTENT.subtitle}
            sections={WELCOME_CONTENT.sections}
          />
        );
      case 1:
        return (
          <LevelSelector
            levels={LISTENING_LEVELS}
            selectedLevel={userInput.proficiencyLevel}
            onSelect={(levelId) =>
              setUserInput({ ...userInput, proficiencyLevel: levelId })
            }
          />
        );
      case 2:
        return (
          <>
            <ListeningAudioButton
              level={userInput.proficiencyLevel}
              questionNumber={1}
            />
            <PercentageSlider
              value={userInput.percent1}
              onChange={(value) =>
                setUserInput({ ...userInput, percent1: value })
              }
              fileNumber={1}
            />
          </>
        );
      case 3:
        return (
          <>
            <ListeningAudioButton
              level={userInput.proficiencyLevel}
              questionNumber={2}
            />
            <PercentageSlider
              value={userInput.percent2}
              onChange={(value) =>
                setUserInput({ ...userInput, percent2: value })
              }
              fileNumber={2}
            />
          </>
        );
      case 4:
        return (
          <>
            <ListeningAudioButton
              level={userInput.proficiencyLevel}
              questionNumber={3}
            />
            <PercentageSlider
              value={userInput.percent3}
              onChange={(value) =>
                setUserInput({ ...userInput, percent3: value })
              }
              fileNumber={3}
            />
          </>
        );
      case 5:
        return (
          <>
            <ListeningAudioButton
              level={userInput.proficiencyLevel}
              questionNumber={4}
            />
            <PercentageSlider
              value={userInput.percent4}
              onChange={(value) =>
                setUserInput({ ...userInput, percent4: value })
              }
              fileNumber={4}
            />
          </>
        );
      case 6:
        return (
          <>
            <ListeningAudioButton
              level={userInput.proficiencyLevel}
              questionNumber={5}
            />
            <PercentageSlider
              value={userInput.percent5}
              onChange={(value) =>
                setUserInput({ ...userInput, percent5: value })
              }
              fileNumber={5}
            />
          </>
        );
      case 7:
        return (
          <TopicGrid
            categories={TOPIC_CATEGORIES}
            selectedTopics={userInput.selectedTopics}
            onToggle={handleTopicToggle}
            maxSelections={MAX_TOPIC_SELECTIONS}
          />
        );
      default:
        return null;
    }
  };

  // 마지막 페이지만 스크롤 가능
  const isLastPage = currentStep === TOTAL_SURVEY_PAGES;

  return (
    <View className="flex-1 bg-[#EBF4FB]">
      {isLastPage ? (
        <ScrollView className="flex-1" contentContainerClassName="p-6 pt-16">
          {currentStep > 0 && (
            <ProgressBar
              currentStep={currentStep}
              totalPages={TOTAL_SURVEY_PAGES}
            />
          )}
          {renderStep()}
        </ScrollView>
      ) : (
        <View className="flex-1 p-6 pt-16">
          {currentStep > 0 && (
            <ProgressBar
              currentStep={currentStep}
              totalPages={TOTAL_SURVEY_PAGES}
            />
          )}
          {renderStep()}
        </View>
      )}
      <NavButtons
        onNext={handleNext}
        onBack={handleBack}
        nextLabel={getNextButtonLabel()}
        showBackButton={currentStep > 0}
      />
    </View>
  );
}
