// app/chat-module-sb/components/ChatInput.tsx
export default function ChatInput({ value, onChange, onSend }: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
}) {
  return (
    <div className="flex gap-2">
      <input
        className="border rounded p-2 flex-1"
        type="text"
        value={value}
        onChange={onChange}
        placeholder="質問を入力してください"
      />
      <button className="bg-blue-500 text-white rounded px-4" onClick={onSend}>
        送信
      </button>
    </div>
  );
}
