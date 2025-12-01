import { useState, useEffect, useRef } from "react";
import sentences from "./sentences";

export default function App() {
  const [text, setText] = useState(""); 
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [typingSpeed, setTypingSpeed] = useState(0); 
  const [timeLeft, setTimeLeft] = useState(60); 
  const [gameActive, setGameActive] = useState(false);

  const textareaRef = useRef(null);

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
    textareaRef.current.focus();
  };

  const handleKeyDown = () => {
    if (!gameActive) {
      startGame();
    }
  };

  useEffect(() => {
    if (!gameActive || !userInput) return;

    const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
    const wpm = userInput.length / 5 / elapsedMinutes;
    setTypingSpeed(wpm);

    if (userInput.length >= text.length - 1) {
      setText((prev) => prev + " " + generateParagraph());
    }
  }, [userInput]);

  useEffect(() => {
    if (!gameActive) return;
    if (timeLeft <= 0) {
      setGameActive(false);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameActive]);

  const bgColors = {
    "<30": "#ff4d4d", 
    30: "#ff6666",
    35: "#ff7f66",
    40: "#ff9966",
    45: "#ffb366",
    50: "#ffcc66",
    55: "#ffe066",
    60: "#ffff66",
    65: "#e6ff66",
    70: "#ccff66",
    75: "#b3ff66",
    80: "#99ff66",
    85: "#80ff66",
    90: "#66ff66",
    ">90": "#33ff33", 
  };

  const getBackgroundColor = (wpm) => {
    if (wpm < 30) return bgColors["<30"];
    if (wpm > 90) return bgColors[">90"];

    const step = Math.floor(wpm / 5) * 5;
    return bgColors[step] || "#ffffff"; 
  };

  const speedLegend = [
    { color: bgColors["<30"], label: "<30 WPM" },
    { color: bgColors[30], label: "30 WPM" },
    { color: bgColors[35], label: "35 WPM" },
    { color: bgColors[40], label: "40 WPM" },
    { color: bgColors[45], label: "45 WPM" },
    { color: bgColors[50], label: "50 WPM" },
    { color: bgColors[55], label: "55 WPM" },
    { color: bgColors[60], label: "60 WPM" },
    { color: bgColors[65], label: "65 WPM" },
    { color: bgColors[70], label: "70 WPM" },
    { color: bgColors[75], label: "75 WPM" },
    { color: bgColors[80], label: "80 WPM" },
    { color: bgColors[85], label: "85 WPM" },
    { color: bgColors[90], label: "90 WPM" },
    { color: bgColors[">90"], label: ">90 WPM" },
  ];

  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-between p-4"
      style={{ backgroundColor: getBackgroundColor(typingSpeed) }}
      onKeyDown={handleKeyDown}
    >
      <div className="flex flex-col md:flex-row flex-wrap items-start">
        {speedLegend.map((item, idx) => (
          <div key={idx} className="flex items-center mb-1">
            <div
              style={{ backgroundColor: item.color }}
              className="w-6 h-6 border border-black mr-2"
            ></div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <h1 className="text-3xl mb-6">Typing Game</h1>

      <div className="w-full max-w-4xl mb-4 p-4">
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

      <textarea
        ref={textareaRef}
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder={gameActive ? "Start typing..." : "Press any key to start"}
        disabled={timeLeft <= 0}
        rows={5}
        cols={60}
        className="w-full max-w-4xl p-3 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <div className="flex flex-col space-y-2 items-center">
        <p>Speed: {typingSpeed.toFixed(0)} WPM</p>
        <p>Time Left: {timeLeft} sec</p>

        <button
          onClick={startGame}
          className="px-2 m-2 bg-white border border-black rounded"
        >
          Restart
        </button>
      </div>
    </div>
  );
}
