# Traffic Sign Classifier — static in-browser demo

A fully static demo of Noorullah Zamindar's traffic-sign CNN
([Noor-Khan/traffic-sign-classification](https://huggingface.co/Noor-Khan/traffic-sign-classification),
GTSRB, 43 classes, validation accuracy 0.9719). The model runs in the
visitor's browser with TensorFlow.js — no server, no paid service, no
Hugging Face PRO needed. Uploaded photos never leave the device.

## Files

| File | Size | What it is |
|---|---|---|
| `index.html` | 5.0 KB | Demo page (mobile-friendly) |
| `app.js` | 5.6 KB | Upload / sample / predict logic, top-3 with confidences |
| `tfjs_model/model.json` | 10 KB | Converted model topology + weight manifest |
| `tfjs_model/group1-shard1of1.bin` | 4.1 MB | Model weights (float32, ~1M params) |
| `samples/stop.png` | 4.4 KB | Sample: Stop sign (GTSRB class 14) |
| `samples/speed-limit-30.png` | 1.6 KB | Sample: Speed limit 30 km/h (class 1) |
| `samples/keep-right.png` | 1.9 KB | Sample: Keep right (class 38) |

Preprocessing matches training exactly (`train.py`): RGB, resize to
50×50, pixels scaled to [0, 1]. The 43 class names in `app.js` are
identical to `CLASS_NAMES` in `train.py` (verified by script).

## How it was built (14 Nov 2026)

Source model: `traffic_sign_cnn.keras` (Keras 3, ~12 MB — includes Adam
optimizer state; the TF.js weights alone are 4.1 MB).

1. Re-saved as `.h5` with Keras 3 (TF 2.18), then converted with the
   TF.js converter 4.22.0 (`--input_format=keras` →
   `--output_format=tfjs_layers_model`).
2. **model.json patch (required):** converter 4.22 passes Keras 3
   configs through unconverted — the InputLayer had `batch_shape`
   instead of `batchInputShape`, and every layer's `dtype` was a
   `DTypePolicy` object instead of the string `"float32"`. TF.js
   refuses to load the model otherwise ("An InputLayer should be passed
   either a `batchInputShape` or an `inputShape`"). Both were normalized
   mechanically in `model.json`; nothing else was changed.
3. Build tooling lives in `../hidden_files/tfjs-build/` (converter
   packages, SavedModel + `.h5` intermediates, Node headless test).

### Conversion warnings — honest notes

- `tensorflowjs_converter` printed: *"failed to lookup keras version
  from the file, this is likely a weight only file"*. Harmless — the
  conversion still produced a complete model, verified by inference
  below.
- No unsupported ops: the model is plain Conv2D / MaxPool / Dropout /
  Flatten / Dense(softmax) — all supported by TF.js.
- Environment friction (not a model problem): pip kept stalling on the
  645 MB `tensorflow` 2.19 wheel and the 16 MB
  `tensorflow_decision_forests` wheel (downloads stopped at the same
  byte count every time; curl fetched them fine). The converter was
  therefore run from the existing TF 2.18 venv with only the small
  `tensorflowjs` 4.22.0 + `tf-keras` 2.18.0 packages installed beside
  it, plus empty stubs for `tensorflow_decision_forests`,
  `tensorflow_hub`, and a patched optional `jax` import in the
  converter — all three are only imported for conversion paths this
  model never uses. `/tmp` is a 512 MB tmpfs (90% full) — the build
  was moved to `hidden_files/tfjs-build/` on the main disk.

## Verification (all done 14 Nov 2026)

- `model.json` is valid JSON: format `layers-model`, input
  `[null, 50, 50, 3]`, output `[null, 43]` (softmax).
- `node --check app.js` clean; `index.html` parses with no errors;
  every local `src`/`href` resolves to a file in this folder.
- **Headless inference test (Node, @tensorflow/tfjs + pngjs): the
  converted model loaded and scored 3/3 samples correct** — Stop
  99.4%, Speed limit (30km/h) 56.7%, Keep right 100.0%.
- Cross-checked against the original Keras model on the same three
  images: predictions match (Stop 65.2% vs 69.6% TF.js, same top-1;
  the other two agree on top-1 too). The first Stop sample tried was
  genuinely hard — the *original* model also called it "No entry"
  (65.2%) — so it was replaced with a clear Stop photo the model
  scores at 99.4%.
- Served locally over HTTP: `index.html`, `app.js`, `model.json`,
  shard and samples all return 200.

## Publishing (GitHub Pages, free)

The Portfolio repo already has GitHub Pages live at
`https://noorullahzamindar-007.github.io/Portfolio/`, so no setup is
needed — just push this folder into it:

```bash
# from a clone of NoorullahZamindar-007/Portfolio
cp -r traffic-sign-static-demo traffic-sign-demo
git add traffic-sign-demo
git commit -m "Add in-browser traffic-sign classifier demo (TF.js)"
git push origin main
```

Live URL after the push:

**https://noorullahzamindar-007.github.io/Portfolio/traffic-sign-demo/**

Notes:

- Keep the folder structure intact — `index.html` loads the model
  from the relative path `./tfjs_model/model.json`, so the page must
  be served from the folder root (works on GitHub Pages as-is).
- The TF.js library loads from the jsDelivr CDN
  (`cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0`) — pinned to the
  converter version that built the model, not `@latest`, so a future
  major release cannot break the demo. The page needs internet for
  that script, but inference itself runs locally.
- After publishing, link it from the Hugging Face model card
  (`Noor-Khan/traffic-sign-classification`) and from the eval dataset
  card, so visitors find the live demo.
- Alternative home: the `Traffic-Sign-Classification` repo — but its
  Pages site is not enabled, so that would need Pages turned on first.
