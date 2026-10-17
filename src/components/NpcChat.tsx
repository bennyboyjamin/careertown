import { useEffect, useRef, useState } from 'react';
import { npcReply, isMean, QUICK_SAYS, type ChatNpc } from '../data/npcChat';
import { sfx } from '../engine/sfx';

const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

/** Type (or tap) something to say to a town person; they answer. Nothing leaves the device. */
export function NpcChat({ npc, onMood }: { npc: ChatNpc; onMood?: (m: 'happy' | 'cheeky' | 'talk') => void }) {
  const [text, setText] = useState('');
  const [log, setLog] = useState<{ me: string; them: string }[]>([]);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [log]);
  const say = (raw: string) => {
    const s = raw.trim().slice(0, 80); if (!s) return;
    const them = npcReply(s, npc); const mean = isMean(s);
    setLog((l) => [...l.slice(-3), { me: s, them }]); setText('');
    sfx(mean ? 'beep' : 'pop'); onMood?.(mean ? 'cheeky' : 'talk');
    if (canSpeak()) { const sp = window.speechSynthesis; sp.cancel(); const u = new SpeechSynthesisUtterance(them.replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, '')); u.lang = 'en-US'; u.rate = 0.95; u.pitch = 1.1; sp.speak(u); }
  };
  return (
    <div className="npc-chat">
      {log.length > 0 && (
        <div className="npc-log">
          {log.map((m, i) => <div key={i}><div className="npc-me">{m.me}</div><div className="npc-them"><b>{npc.name}:</b> {m.them}</div></div>)}
          <div ref={end} />
        </div>
      )}
      <div className="npc-quick">{QUICK_SAYS.map((q) => <button key={q} onClick={() => say(q)}>{q}</button>)}</div>
      <form className="npc-input" onSubmit={(e) => { e.preventDefault(); say(text); }}>
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={80} placeholder={`Say something to ${npc.name}…`} aria-label={`Say something to ${npc.name}`}
          autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="send" />
        <button type="submit" aria-label="Send">💬</button>
      </form>
    </div>
  );
}
