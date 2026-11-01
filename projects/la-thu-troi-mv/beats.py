import sys, json, librosa, numpy as np
y, sr = librosa.load(sys.argv[1], sr=22050, mono=True)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units="time", tightness=120)
onset_env = librosa.onset.onset_strength(y=y, sr=sr)
rms = librosa.feature.rms(y=y)[0]
t_rms = librosa.times_like(rms, sr=sr)
print("tempo", float(np.atleast_1d(tempo)[0]), "beats", len(beats), "dur", len(y)/sr)
json.dump({"tempo": float(np.atleast_1d(tempo)[0]), "beats": [round(float(b), 3) for b in beats]}, open(sys.argv[2], "w"))
d = np.diff(beats); print("median beat", float(np.median(d)), "first beats", [round(float(b),2) for b in beats[:12]])
