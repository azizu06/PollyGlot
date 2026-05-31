import { useState } from "react";
import parrot from "./assets/figma/parrot.png";
import worldMap from "./assets/figma/world-map.svg";
import worldMapMask from "./assets/figma/world-map-mask.svg";
import frFlag from "./assets/figma/fr-flag.png";
import spFlag from "./assets/figma/sp-flag.png";
import jpnFlag from "./assets/figma/jpn-flag.png";
import sendIcon from "./assets/figma/send-btn.svg";

const languages = [
  { value: "French", label: "French", flag: frFlag },
  { value: "Spanish", label: "Spanish", flag: spFlag },
  { value: "Japanese", label: "Japanese", flag: jpnFlag },
];

export default function App() {
  const [lang, setLang] = useState("French");
  const [draft, setDraft] = useState("");
  const [chat, setChat] = useState([
    {
      role: "assistant",
      content:
        "Select the language you want me to translate into, type your text and hit send!",
    },
    {
      role: "user",
      content: "How are you?",
    },
    {
      role: "assistant",
      content: "Comment allez-vous?",
    },
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userInput = draft.trim();
    if (!userInput) return;

    setChat((prev) => [...prev, { role: "user", content: userInput }]);
    setDraft("");
    try {
      const response = await fetch("http://localhost:3000/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput,
          language: lang,
        }),
      });
      if (!response.ok) throw Error("Failed to translate");
      const data = await response.json();
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch {
      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn’t translate that. Please try again.",
        },
      ]);
    }
  };

  return (
    <main className="app-shell">
      <header className="hero">
        <div
          className="world-map"
          style={{
            WebkitMaskImage: `url(${worldMapMask})`,
            maskImage: `url(${worldMapMask})`,
          }}
        >
          <img src={worldMap} alt="" />
        </div>
        <div className="brand">
          <img className="parrot" src={parrot} alt="" />
          <div className="brand-copy">
            <h1>PollyGlot</h1>
            <p>Perfect Translation Every Time</p>
          </div>
        </div>
      </header>

      <section className="translator-card" aria-label="Translation chat">
        <div className="messages" aria-live="polite">
          {chat.map((c, i) => (
            <div
              key={i}
              className={`message ${c.role === "user" ? "message-user" : "message-assistant"}`}
            >
              {c.content}
            </div>
          ))}
        </div>

        <form className="composer" onSubmit={handleSubmit}>
          <label htmlFor="translate" className="input-row">
            <span className="sr-only">Text to translate</span>
            <input
              type="text"
              name="translate"
              id="translate"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              required
            />
            <button type="submit" className="send-button" aria-label="Send">
              <img src={sendIcon} alt="" />
            </button>
          </label>

          <div className="language-options" aria-label="Translation language">
            {languages.map((language) => (
              <label
                className={`flag-option ${lang === language.value ? "selected" : ""}`}
                htmlFor={`lang-${language.value.toLowerCase()}`}
                key={language.value}
              >
                <input
                  type="radio"
                  value={language.value}
                  checked={lang === language.value}
                  name="lang"
                  id={`lang-${language.value.toLowerCase()}`}
                  onChange={(e) => setLang(e.target.value)}
                  required
                />
                <img src={language.flag} alt={language.label} />
              </label>
            ))}
          </div>
        </form>
      </section>
    </main>
  );
}
