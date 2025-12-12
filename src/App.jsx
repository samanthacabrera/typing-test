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
  const [bgPalette, setBgPalette] = useState("blue");
  const [currentChapter, setCurrentChapter] = useState("");

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
      return { text: selected.join(" "), chapter };
  };

  const startTest = async () => {
    const { text: newText, chapter } = await generateParagraph(); 
    setText(newText);        
    setCurrentChapter(chapter);
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
  const palettes = {
    blue: { 30: "#4f7ecf", 40: "#5f8fe0", 50: "#7ab0f5", 60: "#9cc9ff", 70: "#b7d9ff", 80: "#cfe6ff", 90: "#e6f2ff" },
    purple: { 30: "#5d3a7d", 40: "#754a9d", 50: "#9061c4", 60: "#ab80dc", 70: "#c8a0f0", 80: "#dec1f7", 90: "#f3e3ff" },
    green: { 30: "#2e7d32", 40: "#388e3c", 50: "#4caf50", 60: "#81c784", 70: "#a5d6a7", 80: "#c8e6c9", 90: "#e8f5e9" },
    orange: { 30: "#e65100", 40: "#ef6c00", 50: "#ff9800", 60: "#ffb74d", 70: "#ffc947", 80: "#ffe0b2", 90: "#fff3e0" },
    red: { 30: "#b71c1c", 40: "#c62828", 50: "#d32f2f", 60: "#e57373", 70: "#ef9a9a", 80: "#ffcdd2", 90: "#ffebee" },
  };

  const getBackgroundColor = (wpm) => {
    const colors = palettes[bgPalette];
    if (wpm < 30) return colors[30];
    if (wpm < 50) return colors[40];
    if (wpm < 60) return colors[50];
    if (wpm < 70) return colors[60];
    if (wpm < 80) return colors[70];
    if (wpm < 90) return colors[80];
    return colors[90];
  };

  const speedLegend = Object.entries(palettes[bgPalette]).map(([wpm, color]) => {
    let label;
    if (wpm === "30") label = "<30 WPM";
    else if (wpm === "90") label = ">90 WPM";
    else label = `${wpm} WPM`;
    return { color, label };
  });

  return (
    <div
      className="h-screen w-screen flex flex-col items-center"
      style={{ backgroundColor: getBackgroundColor(typingSpeed) }}
    >
      <header className="flex justify-between w-screen p-1 bg-white/30 text-lg">
        <h1 className="tracking-wide font-bold">WPM Typing Test</h1>
        <div className="flex flex-wrap justify-center gap-2">
          {speedLegend.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-1 px-1 py-0.5"
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

      {currentChapter && (
        <div  className="flex flex-col items-center mt-4 text-sm">
          <p>
            Excerpt from Wuthering Heights by <span className="tracking-wide">E</span>mily Brontë
          </p>
          <p>Chapter: {currentChapter}</p>
        </div>
      )}

      {!testActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-lg text-white">
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
        <div className="flex items-center space-x-4 p-1 w-full bg-white/30 text-lg">
          <button
            onClick={startTest}
            className="rounded hover:bg-white/50 hover:text-black transition focus:ring-0 focus:outline-none"
          >
            {testActive ? "[ Restart ]" : "[ Start ]"}
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
          <div className="fixed right-2 flex items-center space-x-2">
            {Object.keys(palettes).map((key) => (
              <button
                key={key}
                onClick={() => setBgPalette(key)}
                className={`w-6 h-6 rounded-full border border-black/50 transition ${
                  bgPalette === key ? "ring-1 ring-black/50" : ""
                }`}
                style={{ backgroundColor: palettes[key][60] }}
                title={`${key.charAt(0).toUpperCase() + key.slice(1)} Palette`}
              ></button>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center"
          onClick={() => {
            setShowModal(false);
            setText("");
            setUserInput("");
            setCurrentChapter("");
            setTypingSpeed(0);
          }}
        >
          <div
            className="bg-white p-8 rounded-lg text-center"
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="mt-2 space-y-2">
              <h2 className="text-xl">Typing Test Complete!</h2>
              <p>Your Speed: {finalSpeed.toFixed(0)} WPM</p>
              <p>Accuracy: {finalAccuracy}%</p>
              <p className="relative -bottom-4 opacity-70">
                Click anywhere outside this box to close
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
