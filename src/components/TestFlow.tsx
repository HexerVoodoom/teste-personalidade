"use client";

import { useState } from "react";
import Onboarding from "@/components/Onboarding";
import Quiz from "@/components/Quiz";
import Results from "@/components/Results";
import { Answers } from "@/lib/personality/types";
import { randomAnswers, randomOnboarding } from "@/lib/debug/random";
import { buildSoulProfile, OnboardingData, SoulProfile } from "@/lib/profile";

type Stage = "onboarding" | "quiz" | "results";

export default function TestFlow() {
  const [stage, setStage] = useState<Stage>("onboarding");
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [profile, setProfile] = useState<SoulProfile | null>(null);

  const goRandom = () => {
    const data = randomOnboarding();
    const random = randomAnswers();
    setOnboarding(data);
    setAnswers(random);
    setProfile(buildSoulProfile(data, random));
    setStage("results");
  };

  if (stage === "onboarding") {
    return (
      <Onboarding
        onSubmit={(data) => {
          setOnboarding(data);
          setStage("quiz");
        }}
        onRandom={goRandom}
      />
    );
  }

  if (stage === "quiz" && onboarding) {
    return (
      <Quiz
        answers={answers}
        onChange={setAnswers}
        onBack={() => setStage("onboarding")}
        onFinish={() => {
          setProfile(buildSoulProfile(onboarding, answers));
          setStage("results");
        }}
      />
    );
  }

  if (stage === "results" && profile) {
    return (
      <Results
        profile={profile}
        onRestart={() => {
          setAnswers({});
          setProfile(null);
          setStage("onboarding");
        }}
        onRandom={goRandom}
      />
    );
  }

  return null;
}
