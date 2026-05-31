import { useState } from "react";
export default function App() {
  const [lang, setLang] = useState("");
  const [draft, setDraft] = useState("");
  const [chat, setChat] = useState([
    {
      role: "assistant",
      content:
        "Select the language you want me to translate into, type your text and hit send!",
    },
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChat((prev) => [...prev, { role: "user", content: draft }]);
    try {
      const response = await fetch("http://localhost:3000/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput: draft.trim(),
          language: lang,
        }),
      });
      if (!response.ok) throw Error("Failed to translate");
      const data = await response.json();
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
      setDraft("");
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
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 justify-center">
        <img src="#" alt="" />
        <div className="flex flex-col gap-1">
          <h1>PollyGlot</h1>
          <p>Perfect translation every time</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 border rounded-lg w-10/12 justify-center  mx-auto">
        <div className="flex flex-col gap-1">
          {chat.map((c, i) => (
            <div
              key={i}
              className={`flex border p-1 rounded-b-lg ${c.role === "user" ? "bg-green-500 text-black rounded-r-lg" : "bg-blue-500 text-white rounded-l-lg"}`}
            >
              {c.content}
            </div>
          ))}
        </div>
        <form className="flex flex-col gap-2 " onSubmit={handleSubmit}>
          <label htmlFor="translate" className="flex border rounded-lg">
            <input
              type="text"
              name="translate"
              className="flex grow pl-1"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              required
            />
            <button type="submit" className="cursor-pointer">
              <img src="#" alt="send" />
              Send
            </button>
          </label>
          <div className="flex justify-center gap-16">
            <label htmlFor="lang-french">
              <input
                type="radio"
                value="French"
                checked={lang === "French"}
                name="lang"
                id="lang-french"
                onChange={(e) => setLang(e.target.value)}
                required
              />
              French
            </label>
            <label htmlFor="lang-spanish">
              <input
                type="radio"
                value="Spanish"
                checked={lang === "Spanish"}
                name="lang"
                id="lang-spanish"
                onChange={(e) => setLang(e.target.value)}
              />
              Spanish
            </label>
            <label htmlFor="lang-japanese">
              <input
                type="radio"
                value="Japanese"
                checked={lang === "Japanese"}
                name="lang"
                id="lang-japanese"
                onChange={(e) => setLang(e.target.value)}
              />
              Japanese
            </label>
          </div>
        </form>
      </div>
    </div>
  );
}
