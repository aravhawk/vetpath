import React, { useState } from 'react';
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
    <div className="min-h-screen flex flex-col">
      <Header onLogoClick={handleStartOver} />

      {currentStep > 1 && currentStep < 6 && (
        <div className="max-w-4xl mx-auto px-4 pt-8 w-full">
          <ProgressStepper
            steps={STEPS.slice(1, -1)}
            currentStep={currentStep - 1}
          />
        </div>
      )}

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        {renderStep()}
      </main>

      <footer className="border-t border-navy-800/50 bg-navy-950/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-flag-red to-flag-red/80 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-5 h-5">
                  <path
                    d="M50 15 L80 28 L80 55 C80 72 50 88 50 88 C50 88 20 72 20 55 L20 28 Z"
                    fill="none"
                    stroke="white"
                    strokeWidth="5"
                  />
                  <path
                    d="M50 30 L53 40 L64 40 L55 47 L58 57 L50 51 L42 57 L45 47 L36 40 L47 40 Z"
                    fill="white"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold">VetPath</p>
                <p className="text-navy-400 text-xs">Strengthening America's Workforce</p>
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-navy-300 text-sm">
                Built to support American veterans in their transition to civilian careers.
              </p>
              <p className="text-navy-500 text-xs mt-1">
                Powered by U.S.-based AI technology • Supporting American jobs
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-6 pt-6 border-t border-navy-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-navy-500">
            <div className="flex items-center gap-4">
              <span>© 2026 VetPath</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">🇺🇸</span>
              <span>Made in the USA</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
