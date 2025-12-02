import { useState, useEffect } from "react";
import sentences from "./sentences";

export default function App() {
  const [text, setText] = useState(""); 
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [typingSpeed, setTypingSpeed] = useState(0); 
  const [timeLeft, setTimeLeft] = useState(60); 
  const [gameActive, setGameActive] = useState(false);

  const generateParagraph = () => {
    let paragraph = "";
    while (paragraph.length < 200) {
      const random = sentences[Math.floor(Math.random() * sentences.length)];
      paragraph += random + " ";
    }
    return paragraph.trim();
  };

  const startGame = () => {
    setText(generateParagraph());
    setUserInput("");
    setStartTime(Date.now());
    setTypingSpeed(0);
    setTimeLeft(60);
    setGameActive(true);
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
    if (!gameActive) return;
    const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
    const wpm = userInput.length / 5 / elapsedMinutes;
    setTypingSpeed(wpm);
    if (userInput.length >= text.length - 1) {
      setText((prev) => prev + " " + generateParagraph());
    }
  }, [userInput, gameActive, startTime, text]);

  // Countdown timer logic
  useEffect(() => {
    if (!gameActive) return;
    if (timeLeft <= 0) {
      setGameActive(false);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameActive]);

  // Global key listener for typing input
  useEffect(() => {
    if (!gameActive || timeLeft <= 0) return;

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
  }, [gameActive, timeLeft]);

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

      {!gameActive && (
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
              let color = "#000"; 
              if (idx < userInput.length) {
                color = userInput[idx] === char ? "green" : "red";
              }
              return (
                <span key={idx} style={{ color }}>
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
            onClick={startGame}
            className="hover:scale-110 transition"
          >
            {gameActive ? "[ Restart ]" : "[ Start ]"}
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
    </div>
  );
}
