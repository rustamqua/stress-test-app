"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { testData } from "../data/testData";

const StressTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (value) => {
    if (currentQuestion + 1 === 1) {
      // Для первого вопроса просто сохраняем введенное значение
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion + 1]: value,
      }));
    } else {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion + 1]: value,
      }));
    }
  };

  const calculateCategoryScore = (category) => {
    const categoryQuestions = category.questions;
    const totalPoints = categoryQuestions.reduce((acc, qId) => {
      const answer = answers[qId];
      if (qId === 1) {
        return acc + (parseInt(answer) || 0);
      }
      const question = testData.questions.find((q) => q.id === qId);
      const option = question?.options?.find((opt) => opt.value === answer);
      return acc + (option?.points || 0);
    }, 0);

    return {
      percentage: (totalPoints / category.maxPoints) * 100,
      points: totalPoints,
      maxPoints: category.maxPoints,
    };
  };

  const calculateTotalScore = () => {
    const totalPoints = Object.entries(answers).reduce((acc, [qId, answer]) => {
      if (qId === "1") {
        return acc + parseInt(answer);
      }
      const question = testData.questions.find((q) => q.id === parseInt(qId));
      const option = question?.options?.find((opt) => opt.value === answer);
      return acc + (option?.points || 0);
    }, 0);

    const result = testData.results.find(
      (r) => totalPoints >= r.range[0] && totalPoints <= r.range[1]
    );

    return {
      points: totalPoints,
      description: result?.description,
    };
  };

  const renderQuestion = () => {
    const question = testData.questions[currentQuestion];

    if (question.type === "number") {
      return (
        <div>
          <Input
            type="number"
            min={question.min}
            max={question.max}
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
            className="w-full p-3"
            placeholder={`Введите число от ${question.min} до ${question.max}`}
          />
          {answers[question.id] &&
            (parseInt(answers[question.id]) < 1 ||
              parseInt(answers[question.id]) > 10) && (
              <p className="text-red-500 text-sm mt-2">
                Пожалуйста, введите число от 1 до 10
              </p>
            )}
        </div>
      );
    }

    if (question.type === "radio") {
      return (
        <RadioGroup
          value={answers[question.id] || ""}
          onValueChange={handleAnswer}
          className="space-y-3"
        >
          {question.options.map((option) => (
            <div key={option.value} className="flex items-center space-x-3">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value} className="text-sm">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );
    }
  };

  const renderResults = () => {
    const totalScore = calculateTotalScore();
    const categoryScores = testData.categories.map((category) => ({
      ...category,
      score: calculateCategoryScore(category),
    }));

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">Результаты теста</h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Общий результат</h3>
            <p className="text-lg mb-2">Всего баллов: {totalScore.points}</p>
            <p className="text-lg mb-4">{totalScore.description}</p>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Результаты по категориям</h3>
            {categoryScores.map((category) => (
              <div key={category.id} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{category.name}</span>
                  <span>{Math.round(category.score.percentage)}%</span>
                </div>
                <Progress value={category.score.percentage} className="h-2" />
                <p className="text-sm text-gray-600">
                  {category.score.points} из {category.score.maxPoints} баллов
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleNext = () => {
    if (currentQuestion < testData.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  if (showResults) {
    return renderResults();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <Progress
                value={
                  (currentQuestion + 1) * (100 / testData.questions.length)
                }
                className="mb-2"
              />
              <p className="text-sm text-gray-500 text-right">
                Вопрос {currentQuestion + 1} из {testData.questions.length}
              </p>
            </div>

            <h2 className="text-xl font-semibold mb-4">
              {testData.questions[currentQuestion].text}
            </h2>

            {testData.questions[currentQuestion].description && (
              <p className="text-gray-600 mb-6 text-sm">
                {testData.questions[currentQuestion].description}
              </p>
            )}

            <div className="mb-8">{renderQuestion()}</div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentQuestion === 0}
                className="w-28"
              >
                Назад
              </Button>
              <Button
                onClick={handleNext}
                disabled={
                  currentQuestion === 0
                    ? !answers[1] ||
                      parseInt(answers[1]) < 1 ||
                      parseInt(answers[1]) > 10 ||
                      isNaN(parseInt(answers[1]))
                    : !answers[testData.questions[currentQuestion].id]
                }
                className="w-28"
              >
                {currentQuestion === testData.questions.length - 1
                  ? "Завершить"
                  : "Далее"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StressTest;
