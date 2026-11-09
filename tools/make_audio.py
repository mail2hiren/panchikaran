#!/usr/bin/env python3
"""Generate narration MP3s + cue timings for chapters/stories that have no recorded audio yet.

Usage (needs internet, ffmpeg and `pip install edge-tts`):
    python3 tools/make_audio.py              # only keys missing from audio/cues.json
    python3 tools/make_audio.py seeker story_koshas   # specific keys (re-generates them)

Text comes from narr.js, so edit narr.js first, then run this.
Voices: generic Indian male voices, one per language."""
import asyncio, json, os, subprocess, sys, tempfile

VOICES = {'en': 'en-IN-PrabhatNeural', 'hi': 'hi-IN-MadhurNeural', 'gu': 'gu-IN-NiranjanNeural', 'mr': 'mr-IN-ManoharNeural'}
LANGS = ['en', 'hi', 'gu', 'mr']
GAP = 0.05
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def load_narr():
    js = "global.window={};require(%r);process.stdout.write(JSON.stringify(window.NARR))" % os.path.join(ROOT, 'narr.js')
    return json.loads(subprocess.check_output(['node', '-e', js]))

def duration(path):
    out = subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path])
    return float(out.strip())

async def say(text, voice, path):
    import edge_tts
    await edge_tts.Communicate(text, voice).save(path)

async def build(key, steps, cues):
    for li, lang in enumerate(LANGS):
        with tempfile.TemporaryDirectory() as tmp:
            parts, t, e, now = [], [], [], 0.0
            for i, step in enumerate(steps):
                p = os.path.join(tmp, '%02d.mp3' % i)
                await say(step[li], VOICES[lang], p)
                d = duration(p); t.append(round(now, 2)); e.append(round(now + d - GAP, 2)); now += d; parts.append(p)
            lst = os.path.join(tmp, 'list.txt')
            open(lst, 'w').write(''.join("file '%s'\n" % p for p in parts))
            out = os.path.join(ROOT, 'audio', lang, key + '.mp3')
            os.makedirs(os.path.dirname(out), exist_ok=True)
            subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-ac', '1', '-ar', '24000', '-b:a', '48k', out])
            cues.setdefault(lang, {})[key] = {'t': t, 'e': e}
            print('ok', lang, key, round(now, 1), 's')

def main():
    narr = load_narr()
    cues_path = os.path.join(ROOT, 'audio', 'cues.json')
    cues = json.load(open(cues_path)) if os.path.exists(cues_path) else {'v': 1}
    keys = sys.argv[1:] or [k for k in narr if k not in cues.get('en', {})]
    if not keys: print('Nothing to do: every narration key already has audio.'); return
    for k in keys:
        asyncio.run(build(k, narr[k], cues))
    cues['v'] = cues.get('v', 1) + 1
    json.dump(cues, open(cues_path, 'w'), ensure_ascii=False, separators=(', ', ': '))
    print('cues.json updated, version', cues['v'])

if __name__ == '__main__':
    main()
