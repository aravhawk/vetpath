import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Welcome from './components/Welcome';
import ServiceEntry from './components/ServiceEntry';
import SkillsReview from './components/SkillsReview';
import CareerMatches from './components/CareerMatches';
import GapAnalysis from './components/GapAnalysis';
import ResumeGenerator from './components/ResumeGenerator';
import ProgressStepper from './components/ProgressStepper';

const STEPS = [
  { id: 1, name: 'Welcome' },
  { id: 2, name: 'Service Entry' },
  { id: 3, name: 'Skills Review' },
  { id: 4, name: 'Career Matches' },
  { id: 5, name: 'Gap Analysis' },
  { id: 6, name: 'Resume' },
];

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState(null);
  const [parsedSkills, setParsedSkills] = useState(null);
  const [careerMatches, setCareerMatches] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [resume, setResume] = useState(null);

  // Reset flow when going back to start
  const handleStartOver = () => {
    setCurrentStep(1);
    setProfile(null);
    setParsedSkills(null);
    setCareerMatches([]);
    setSelectedCareer(null);
    setGapAnalysis(null);
    setResume(null);
  };

  const goToStep = (step) => {
    if (step >= 1 && step <= 6) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => goToStep(currentStep + 1);
  const prevStep = () => goToStep(currentStep - 1);

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Welcome
            onGetStarted={() => setCurrentStep(2)}
          />
        );

      case 2:
        return (
          <ServiceEntry
            profile={profile}
            onProfileSubmit={(newProfile, skills) => {
              setProfile(newProfile);
              setParsedSkills(skills);
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 3:
        return (
          <SkillsReview
            skills={parsedSkills}
            onSkillsConfirm={(updatedSkills, matches) => {
              setParsedSkills(updatedSkills);
              setCareerMatches(matches);
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 4:
        return (
          <CareerMatches
            matches={careerMatches}
            skills={parsedSkills}
            onSelectCareer={(career) => {
              setSelectedCareer(career);
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 5:
        return (
          <GapAnalysis
            skills={parsedSkills}
            career={selectedCareer}
            analysis={gapAnalysis}
            onAnalysisComplete={(analysis) => {
              setGapAnalysis(analysis);
            }}
            onContinue={nextStep}
            onBack={prevStep}
          />
        );

      case 6:
        return (
          <ResumeGenerator
            profile={profile}
            skills={parsedSkills}
            career={selectedCareer}
            resume={resume}
            onResumeGenerated={(generatedResume) => {
              setResume(generatedResume);
            }}
            onStartOver={handleStartOver}
            onBack={prevStep}
          />
        );

      default:
        return <Welcome onGetStarted={() => setCurrentStep(2)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header onLogoClick={handleStartOver} />

      {currentStep > 1 && currentStep < 6 && (
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <ProgressStepper
            steps={STEPS.slice(1, -1)}
            currentStep={currentStep - 1}
          />
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-8">
        {renderStep()}
      </main>

      <footer className="text-center py-8 text-gray-500 text-sm">
        <p>VetPath - Built to support American veterans in their transition to civilian careers.</p>
        <p className="mt-2">Powered by American AI technology</p>
      </footer>
    </div>
  );
}

export default App;
