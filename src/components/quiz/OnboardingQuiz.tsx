import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const questions: Question[] = [
  {
    question: "Where should the tip of the tongue rest?",
    options: [
      "Behind the lower teeth",
      "On the incisive papilla ('the spot') behind upper front teeth",
      "On the teeth",
      "Flat on the floor of the mouth"
    ],
    correct: 1,
    explanation: "The tongue should rest on the 'spot' (incisive papilla) just behind the upper front teeth, with the entire tongue body against the roof of the mouth."
  },
  {
    question: "Why is nasal breathing preferred over mouth breathing?",
    options: [
      "It's just a preference",
      "Filters/humidifies air, produces nitric oxide, and improves oxygenation",
      "It's quieter",
      "Mouth breathing is actually better"
    ],
    correct: 1,
    explanation: "Nasal breathing filters and humidifies air, produces nitric oxide for better oxygen absorption, and supports proper facial development and health."
  },
  {
    question: "How often should you practice each module's exercises for best results?",
    options: [
      "Once per day",
      "Only when you remember",
      "Twice daily for the full module",
      "Three times per module"
    ],
    correct: 2,
    explanation: "For optimal results, exercises should be practiced twice daily, every day. Consistency is key to retraining muscle patterns and creating lasting change."
  }
];

interface OnboardingQuizProps {
  onComplete: () => void;
}

export function OnboardingQuiz({ onComplete }: OnboardingQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const handleSubmit = () => {
    if (selectedAnswer === null) {
      toast.error("Please select an answer");
      return;
    }

    setShowResult(true);
    
    if (selectedAnswer === questions[currentQuestion].correct) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz complete
      if (correctCount + (selectedAnswer === questions[currentQuestion].correct ? 1 : 0) >= 2) {
        toast.success("Great job! You're ready to start Week 1!");
        onComplete();
      } else {
        toast.error("Please review the material and try again");
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setCorrectCount(0);
      }
    }
  };

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correct;

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">
          Knowledge Check - Question {currentQuestion + 1} of {questions.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <p className="font-medium">{question.question}</p>
          
          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(value) => setSelectedAnswer(parseInt(value))}
            disabled={showResult}
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {showResult && (
            <div className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start gap-2">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-semibold ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                    {isCorrect ? 'Correct!' : 'Not quite.'}
                  </p>
                  <p className={`text-sm mt-1 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {question.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Score: {correctCount} / {currentQuestion + (showResult ? 1 : 0)}
          </div>
          {!showResult ? (
            <Button onClick={handleSubmit}>
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
