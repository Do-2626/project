import React, { useState } from "react";

interface PasswordPromptProps {
  onSuccess: () => void;
  label?: string;
  buttonText?: string;
}

const PasswordPrompt: React.FC<PasswordPromptProps> = ({ onSuccess, label = "كلمة المرور", buttonText = "تأكيد" }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/protect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPassword("");
        setError("");
        onSuccess();
      } else {
        setError("كلمة المرور غير صحيحة");
      }
    } catch {
      setError("حدث خطأ في الاتصال بالخادم");
    }
    setLoading(false);
  };

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-300">{label}</label>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5 mb-2"
        disabled={loading}
      />
      {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
      <button
        type="button"
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 w-full"
        onClick={handleCheck}
        disabled={loading}
      >
        {loading ? "...جاري التحقق" : buttonText}
      </button>
    </div>
  );
};

export default PasswordPrompt;
