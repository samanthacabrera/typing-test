import { useState, useEffect } from "react";
import { wutheringHeights } from "./wutheringHeights";

export default function App() {
  const [text, setText] = useState(""); 
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60); 
  const [typingSpeed, setTypingSpeed] = useState(0); 
  const [finalSpeed, setFinalSpeed] = useState(0);
  const [finalAccuracy, setFinalAccuracy] = useState(100);
  const [testActive, setTestActive] = useState(false);
  const [showModal, setShowModal] = useState(false);

  let usedSentences = new Set();

  const generateParagraph = () => {
    const chapters = Object.keys(wutheringHeights);
    const chapter = chapters[Math.floor(Math.random() * chapters.length)];
    const sentences = wutheringHeights[chapter];
    const newSentences = sentences.filter(s => !usedSentences.has(s));
    if (newSentences.length === 0) {
      usedSentences.clear();
      return generateParagraph();
    }
    const selected = newSentences.slice(0, 10);
    selected.forEach(s => usedSentences.add(s));
    return selected.join(" ");
  };

  const startTest = async () => {
    const newText = await generateParagraph();
    setText(newText);
    setUserInput("");
    setStartTime(Date.now());
    setTypingSpeed(0);
    setTimeLeft(60);
    setTestActive(true);
    setShowModal(false);
  };

  const accuracy =
    userInput.length === 0
      ? 100
      : Math.round(
          (userInput.split("").filter((char, idx) => char === text[idx])
            .length /
            userInput.length) *
            100
      );

  // Updates WPM and extends text as user types
  useEffect(() => {
    if (!testActive) return;
    const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
    const wpm = userInput.length / 5 / elapsedMinutes;
    setTypingSpeed(wpm);
    if (userInput.length >= text.length - 1) {
    generateParagraph().then(newFacts => setText(prev => prev + " " + newFacts));
    }
  }, [userInput, testActive, startTime, text]);

  // Countdown timer logic
  useEffect(() => {
    if (!testActive) return;
    if (timeLeft <= 0) {
      setFinalSpeed(typingSpeed);
        const finalAcc =
          userInput.length === 0
            ? 100
            : Math.round(
                (userInput.split("").filter((char, idx) => char === text[idx])
                  .length /
                  userInput.length) *
                  100
            );
      setFinalAccuracy(finalAcc);
      setTestActive(false);
      setShowModal(true);
      setText("");      
      setUserInput("");
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, testActive]);

  // Global key listener for typing input
  useEffect(() => {
    if (!testActive || timeLeft <= 0) return;

    const handleKey = (e) => {
      e.preventDefault();

      if (e.key.length > 1 && e.key !== "Backspace") return;
      if (e.key.length === 1) {
        setUserInput((prev) => prev + e.key);
      }
      if (e.key === "Backspace") {
        setUserInput((prev) => prev.slice(0, -1));
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [testActive, timeLeft]);

  // WPM to bg color mapping
  const bgColors = {
    30: "#f06292",     
    40: "#ff8a65",     
    50: "#ffb74d",  
    60: "#fff176",        
    70: "#aed581",   
    80: "#3dc1b4ff",   
    90: "#76d2f1ff",      
  };
  
  const getBackgroundColor = (wpm) => {
    if (wpm < 30) return bgColors[30];
    if (wpm < 50) return bgColors[40];
    if (wpm < 60) return bgColors[50];
    if (wpm < 70) return bgColors[60];
    if (wpm < 80) return bgColors[70];
    if (wpm < 90) return bgColors[80];
    return bgColors[90];
  };

  const speedLegend = [
    { color: bgColors[30], label: "<30 WPM" },
    { color: bgColors[40], label: "40 WPM" },
    { color: bgColors[50], label: "50 WPM" },
    { color: bgColors[60], label: "60 WPM" },
    { color: bgColors[70], label: "70 WPM" },
    { color: bgColors[80], label: "80 WPM" },
    { color: bgColors[90], label: ">90 WPM" },
  ];

  return (
    <div
      className="h-screen w-screen flex flex-col items-center"
      style={{ backgroundColor: getBackgroundColor(typingSpeed) }}
    >
      <header className="flex justify-between w-screen p-1 bg-white/30 text-sm">
        <h1 className="">WPM Typing Test</h1>
        <div className="flex flex-wrap justify-center gap-2">
          {speedLegend.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-1 px-1 py-0.5 rounded-md text-xs"
            >
              <div
                style={{ backgroundColor: item.color }}
                className="w-4 h-4 rounded-sm border border-black"
              ></div>
              <span className="whitespace-nowrap">{item.label}</span>
            </div>
          ))}
        </div>
      </header>

      {!testActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="opacity-30">
            Press [ Start ] to begin
          </p>
        </div>
      )}
      
      <div className="flex flex-1 w-full items-center justify-center">
        <div className="max-w-4xl p-4 text-center">
          <p className="text-lg leading-relaxed">
            {text.split("").map((char, idx) => {
              const isTyped = idx < userInput.length;
              const isCurrent = idx === userInput.length; 

              let color = "#000";
              if (isTyped) color = userInput[idx] === char ? "green" : "red";

              return (
                <span
                  key={idx}
                  style={{ color }}
                  className={isCurrent ? "cursor" : ""}
                >
                  {char}
                </span>
              );
            })}
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 w-full flex justify-center">
        <div className="flex items-center space-x-4 p-1 w-full bg-white/30 text-sm">
          <button
            onClick={startTest}
            className="hover:scale-110 transition"
          >
            [ Start ]
          </button>
          <p className="whitespace-nowrap">
            Speed: {typingSpeed.toFixed(0)} WPM
          </p>
          <p className="whitespace-nowrap">
            Accuracy: {accuracy}%
          </p>
          <p className="whitespace-nowrap">
            Time Left: {timeLeft} sec
          </p>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center"
          onClick={() => setShowModal(false)} 
        >
          <div
            className="bg-white p-8 rounded-lg text-center"
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="mt-2 space-y-2">
              <h2 className="text-xl">Typing Test Complete!</h2>
              <p>Your Speed: {finalSpeed.toFixed(0)} WPM</p>
              <p>Accuracy: {finalAccuracy}%</p>
              <p className="relative -bottom-4 text-xs opacity-50">
                Click anywhere outside this box to close
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
