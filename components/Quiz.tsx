import { useState, useEffect } from 'react';
import treesData from '@/data/trees.json';
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const generateQuestions = () => {
    // Generate 5 random questions
    const shuffledTrees = [...treesData].sort(() => 0.5 - Math.random());
    const selectedTrees = shuffledTrees.slice(0, 5);

    const newQuestions = selectedTrees.map((tree) => {
      const isIdentification = Math.random() > 0.5;
      
      let questionText = '';
      let correctAnswer = tree.name;
      let options = [tree.name];

      if (isIdentification) {
        const randomTrait = tree.identification[Math.floor(Math.random() * tree.identification.length)];
        questionText = `Which tree is identified by: "${randomTrait}"?`;
      } else {
        questionText = `Which tree has the fun fact: "${tree.funFact}"?`;
      }

      // Add 3 wrong options
      while (options.length < 4) {
        const randomTree = treesData[Math.floor(Math.random() * treesData.length)];
        if (!options.includes(randomTree.name)) {
          options.push(randomTree.name);
        }
      }

      return {
        question: questionText,
        options: options.sort(() => 0.5 - Math.random()),
        answer: correctAnswer,
      };
    });

    setQuestions(newQuestions);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    generateQuestions();
  }, []);

  const handleAnswer = (option: string) => {
    if (selectedAnswer) return; // Prevent multiple clicks

    setSelectedAnswer(option);
    const correct = option === questions[currentQuestion].answer;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  if (questions.length === 0) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif font-semibold text-[#1A3622]">Arborist Quiz</h2>

      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.div
            key="question"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-[#E5E0D8] space-y-6"
          >
            <div className="flex justify-between items-center text-sm font-medium text-[#8FBC8F] uppercase tracking-wider">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>Score: {score}</span>
            </div>

            <h3 className="text-xl font-serif font-semibold text-[#1A3622] leading-snug">
              {questions[currentQuestion].question}
            </h3>

            <div className="space-y-3">
              {questions[currentQuestion].options.map((option: string, index: number) => {
                let buttonClass = "w-full text-left p-4 rounded-xl border-2 transition-all font-medium flex justify-between items-center ";
                
                if (selectedAnswer === null) {
                  buttonClass += "border-[#E5E0D8] hover:border-[#8FBC8F] text-[#5A6D60] hover:bg-[#F9F6F0]";
                } else if (option === questions[currentQuestion].answer) {
                  buttonClass += "border-[#2C5535] bg-[#E8F0EA] text-[#2C5535]";
                } else if (option === selectedAnswer && !isCorrect) {
                  buttonClass += "border-red-300 bg-red-50 text-red-800";
                } else {
                  buttonClass += "border-[#E5E0D8] text-[#A0AAB2] opacity-50";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    disabled={selectedAnswer !== null}
                    className={buttonClass}
                  >
                    <span>{option}</span>
                    {selectedAnswer !== null && option === questions[currentQuestion].answer && (
                      <CheckCircle2 size={20} className="text-[#2C5535]" />
                    )}
                    {selectedAnswer === option && !isCorrect && (
                      <XCircle size={20} className="text-red-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-[#E5E0D8] text-center space-y-6"
          >
            <div className="w-24 h-24 bg-[#E8F0EA] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} className="text-[#2C5535]" />
            </div>
            <h3 className="text-3xl font-serif font-bold text-[#1A3622]">Quiz Complete!</h3>
            <p className="text-[#5A6D60] text-lg">
              You scored <span className="font-bold text-[#2C5535]">{score}</span> out of {questions.length}.
            </p>
            <button
              onClick={generateQuestions}
              className="w-full bg-[#2C5535] text-[#F9F6F0] py-4 rounded-2xl font-semibold tracking-wide shadow-md hover:bg-[#1A3622] transition-colors flex items-center justify-center gap-2 mt-8"
            >
              <RefreshCw size={20} /> Play Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
