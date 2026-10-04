# ABC-First Composition Architecture

## Status

Design specification for evolving the MIDI Song Creation Tool into a composition-first music creation system with ABC notation as a first-class representation.

Target repository: `asabaal/midi_song_creation_tool`

Target branch: `develop`

---

## 1. Motivation

The current system is centered on direct MIDI note-event generation.

Its internal sequence model is effectively:

```text
Sequence
  ├── tempo
  ├── key
  ├── timeSignature
  └── notes[]
        ├── pitch
        ├── startTime
        ├── duration
        ├── velocity
        └── channel
```

This is useful for performance realization, piano-roll editing, channel assignment, drum programming, velocities, and MIDI export.

However, it does not provide a clean composition-level artifact between musical intent and rendered note events.

The addition of YuE2 creates a strong reason to introduce such an intermediate representation. YuE2 can consume an editable ABC composition plan describing melody, harmony, form, meter, tempo, and key before rendering full audio.

The system should therefore become composition-first rather than MIDI-first.

---

## 2. Architectural Principle

ABC becomes the canonical representation of the musical composition.

The existing MIDI event model remains the canonical representation of a detailed MIDI realization.

These are distinct layers and should not be collapsed into one representation.

```text
                    MUSIC CREATION SYSTEM

          ┌───────────────────────────────┐
          │    COMPOSITION / SCORE        │
          │                               │
          │          score.abc            │
          │ melody • harmony • form       │
          │ meter • tempo • key           │
          └───────────────┬───────────────┘
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
   ┌──────────────────┐      ┌──────────────────┐
   │ MIDI realization │      │ YuE2 realization │
   │                  │      │                  │
   │ bass             │      │ vocals           │
   │ drums            │      │ instrumentation  │
   │ voicings         │      │ production       │
   │ velocity         │      │ timbre            │
   │ channels         │      │ final audio       │
   └────────┬─────────┘      └────────┬─────────┘
            ▼                         ▼
          .mid                    .wav/audio
```

ABC is therefore not a replacement for MIDI.

It is the composition layer above MIDI.

---

## 3. Desired Project Model

A song project should eventually be representable approximately as:

```text
project/
    composition.abc
    arrangement.json
    composition.mid
    yue2/
        request.json
        output.wav
```

### `composition.abc`

Canonical composition artifact.

Contains, as appropriate:

- melody
- chord symbols / harmony
- musical form / section boundaries
- meter
- tempo
- key
- rests and rhythmic values
- optional YuE2-compatible Vocal and Ins voices

This file should be human-readable, diffable, editable by synthetic agents, and suitable for Git version control.

### `arrangement.json`

Detailed performance / MIDI realization data not naturally represented by the chosen ABC subset.

Examples:

- bassline realization
- drum patterns
- MIDI channels
- velocity
- explicit voicings
- instrument assignments
- articulation metadata
- other performance-specific information

The existing `MidiSequence` model can evolve into or back this representation.

### `composition.mid`

Cheap symbolic rendering of the composition / arrangement for audition in a DAW or MIDI player.

### `yue2/`

Artifacts required to render the same composition using YuE2.

This should include the request/style/lyrics metadata necessary for reproducibility and the resulting audio.

---

## 4. Core Operations

The system should support four primary transformations.

### 4.1 ABC → inspect / render / play

The system must be able to:

- load an ABC document
- parse and validate the supported subset
- expose useful structural information
- display or render notation
- provide inexpensive symbolic playback or MIDI preview

The browser UI should eventually offer an ABC/Score view alongside the existing piano roll.

### 4.2 ABC → MIDI realization

The composition should be renderable into the existing MIDI event representation.

This transformation may include arrangement decisions that are not encoded directly in ABC.

Examples:

- chord voicing
- bass pattern
- drum pattern
- octave placement
- instrument/channel assignment
- velocity
- accompaniment texture

This means multiple MIDI arrangements may legitimately derive from one ABC composition.

### 4.3 MIDI → ABC where representable

Where possible, existing MIDI content should be convertible back into a composition-level ABC representation.

This operation is necessarily lossy.

Do not attempt to force all MIDI semantics into ABC.

The conversion should preserve the composition-level information that can be represented meaningfully:

- melody
- rhythm
- key
- meter
- tempo
- harmony where it can be inferred or is already known

Detailed drum/performance/channel information should remain in the arrangement layer.

### 4.4 ABC → YuE2 audio

The same composition should be usable as the composition plan for YuE2.

The desired flow is:

```text
composition.abc
      ↓
YuE2 semantic generation
      ↓
acoustic synthesis
      ↓
VAE decode
      ↓
audio
```

The integration should preserve the separation between:

- musical composition in ABC
- lyrics
- style / production instructions
- rendered audio

---

## 5. Composition-First Generation

The current model generally behaves like:

```text
musical request
      ↓
direct MIDI-note generation
      ↓
playback/export
```

The desired model is:

```text
song idea / musical request
      ↓
composition generation
      ↓
composition.abc
      ├──→ notation
      ├──→ symbolic preview
      ├──→ MIDI arrangement
      └──→ YuE2 audio rendering
```

The composition becomes a persistent artifact rather than an implicit result hidden inside generated note arrays.

---

## 6. Existing MIDI System Must Be Preserved

Do not remove the current MIDI framework.

The current system already contains useful capabilities including:

- note-level manipulation
- chord progression generation
- bassline generation
- drum pattern generation
- browser playback
- piano-roll visualization
- JSON import/export
- standard MIDI export

Those capabilities become realization tools underneath the composition layer.

For example, an ABC passage such as:

```abc
% chorus
"C" C8 E4 G4 |
"Am" A8 c4 e4 |
"F" F8 A4 c4 |
"G" G8 B4 d4 |
```

may define the composition.

The MIDI realization can independently produce:

- explicit bass notes
- drum events
- piano/guitar voicings
- velocities
- channels
- accompaniment patterns

YuE2 may render the same composition as a completely different production.

The composition is shared; the realizations differ.

---

## 7. Supported ABC Scope

Do not attempt to implement the entire ABC standard immediately.

Start with a deliberate supported subset sufficient for:

- YuE2-compatible composition planning
- melody
- chord symbols
- rests
- note durations
- key
- meter
- tempo
- bar lines
- section comments / structural markers
- named voices where needed

The parser and serializer should reject or preserve unknown constructs safely rather than silently corrupting music.

The exact supported subset should be documented with tests.

---

## 8. Internal Interfaces

Introduce an explicit composition abstraction rather than passing raw ABC strings everywhere.

A conceptual interface might contain:

```text
Composition
  metadata
    title
    key
    meter
    tempo

  sections[]

  voices[]
    notes/rests

  harmony[]
    chord symbol
    position

  source
    abcText
```

The exact implementation is flexible, but the architecture should allow:

```text
ABC text
   ↕
Composition model
   ↓
MIDI realization
   ↓
MidiSequence
```

and:

```text
Composition model
   ↓
ABC serializer
   ↓
YuE2
```

Avoid making either the YuE2 Python package or browser UI the only place where ABC semantics exist.

---

## 9. UI Evolution

The existing piano roll should remain.

Add a composition-oriented interface over time.

Desired views:

```text
[ ABC Source ] [ Score ] [ Piano Roll ] [ Render ]
```

### ABC Source

Editable plain text.

### Score

Rendered musical notation generated from ABC.

A browser library such as abcjs is a reasonable candidate, subject to dependency review.

### Piano Roll

Existing MIDI realization view.

### Render

Controls for:

- symbolic/MIDI realization
- MIDI export
- YuE2 audio rendering
- eventually alternate renderers

The UI does not need to implement every mode in the first patch.

---

## 10. YuE2 Integration Boundary

Do not embed YuE2 model internals throughout the Node application.

Create an adapter boundary.

Conceptually:

```text
YuE2Renderer.render({
    abc,
    lyrics,
    style,
    outputDirectory,
    options
})
```

The adapter may initially invoke the local YuE2 Python environment as a subprocess.

It should:

- use the existing local YuE2 installation
- avoid redownloading models
- write outputs to configured storage
- capture stdout/stderr
- return structured status and artifact paths
- fail clearly if YuE2 is unavailable
- keep model/runtime concerns separate from composition parsing

Do not make basic ABC/MIDI functionality depend on YuE2 being installed.

---

## 11. Repository / Branch Reality

The repository currently has an important historical split:

- `asabaal/music_creation` is a small older Python/Mido utility repository.
- `asabaal/midi_song_creation_tool` contains the substantially developed browser/API song-generation tool.
- the useful implementation currently lives on the `develop` branch.
- `main` is much older and largely documentation-only.

Before large-scale implementation, confirm that `develop` is still the intended canonical implementation branch and avoid accidentally rebuilding functionality from the older repository.

This design targets `asabaal/midi_song_creation_tool`.

---

## 12. Initial Implementation Milestone

The first implementation should prove the architecture with one end-to-end composition.

Minimum acceptable vertical slice:

1. Add ABC parsing and serialization for the supported subset.
2. Add an ABC composition fixture/example.
3. Load that ABC into the application.
4. Render a score/notation view or other inspectable representation.
5. Convert the ABC into the internal composition representation.
6. Produce a MIDI realization using the existing system.
7. Export a real `.mid` file.
8. Route the same ABC into the local YuE2 adapter.
9. Produce a short audio render.
10. Preserve both outputs as artifacts from the same composition source.

The milestone is successful when the relationship is visibly:

```text
one composition.abc
      ├──→ MIDI output
      └──→ YuE2 audio output
```

---

## 13. Testing Requirements

Tests should cover at least:

- ABC header parsing
- note/rest parsing
- duration handling
- octave handling
- chord-symbol parsing
- measure boundaries
- serialization round trips
- ABC → internal composition
- internal composition → ABC
- ABC → MIDI realization
- malformed ABC rejection
- unsupported construct behavior
- preservation of existing MIDI behavior
- YuE2 adapter command construction without requiring full model execution in ordinary unit tests

Add at least one integration test using a small deterministic ABC fixture.

Do not make the full YuE2 model a requirement for the normal test suite.

---

## 14. Non-Goals for the First Iteration

Do not attempt all of the following at once:

- full ABC 2.x compatibility
- replacing the existing MIDI sequence model
- full DAW functionality
- perfect MIDI-to-ABC transcription
- full multitrack orchestration semantics in ABC
- long-form YuE2 benchmarking
- replacing every existing generator

The goal is architectural integration and a working vertical slice.

---

## 15. Long-Term Direction

The intended long-term workflow is:

```text
SONG CONCEPT
     ↓
composition agent
     ↓
ABC
     ↓
visual score + cheap MIDI preview
     ↓
human/agent analysis
     ↓
ABC revisions
     ↓
composition approval
     ↓
renderer selection
   ┌───────────────┬────────────────┐
   ↓               ↓                ↓
MIDI/DAW         YuE2          future renderer
   ↓               ↓
performance      finished audio
```

Because ABC is plain text, it becomes a strong agentic composition medium:

- easy to version
- easy to diff
- easy to generate
- easy to critique
- easy to mutate
- easy to inspect
- renderer-independent

This architecture should make the repository a composition system rather than merely a MIDI note generator.


---

## 16. Vocal Composition, Lyrics, and Alignment

This section extends the architecture after the initial ABC-first implementation and supersedes earlier project-layout examples where they omit explicit lyric artifacts.

### 16.1 Core rule

The vocal part has two distinct musical artifacts:

1. **Vocal melody** — pitch, rhythm, rests, phrasing boundaries, and musical placement. This belongs in `composition.abc`, normally in a named vocal voice such as `V: Vocal`.
2. **Lyrics** — the words to be sung. These are a first-class sibling artifact and must not be treated as incidental prompt text.

For YuE2 integration specifically, lyrics must remain separate from the ABC passed to the renderer. The application should not depend on ABC `w:` lyric fields for YuE2 rendering.

Conceptually:

```text
                  SONG PROJECT

     composition.abc             lyrics.txt
     melody • harmony            canonical words
     form • vocal notes          sections / lines
             │                       │
             └──────────┬────────────┘
                        │
             vocal-alignment.json
                 (optional)
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
        MIDI / score             YuE2
                                  │
                                  ▼
                              sung audio
```

### 16.2 Revised project layout

The preferred project shape becomes:

```text
project/
    composition.abc
    lyrics.txt
    vocal-alignment.json      # optional
    arrangement.json
    composition.mid
    yue2/
        request.json
        output.wav
```

#### `composition.abc`

Canonical musical composition.

For vocal songs it should include the vocal tune in a named voice, for example:

```abc
V: Vocal clef=treble name="Vocal Melody"
"C" G4 A4 c8 |
"Am" c4 B4 A8 |
```

The ABC owns the notes. It does not own the canonical lyric text.

#### `lyrics.txt`

Canonical textual lyric artifact.

It should preserve human-meaningful song structure such as sections and line breaks. The format should stay intentionally simple and diffable.

Example:

```text
[Verse 1]
I hear the sound
I feel it move

[Chorus]
Sound and feeling
Carry me through
```

Lyrics must remain editable independently from pitch/rhythm so a songwriter or synthetic agent can revise wording without rewriting the score representation.

#### `vocal-alignment.json`

Optional explicit mapping between lyric units and the vocal melody.

This exists for cases where section/line ordering alone is insufficient and deliberate syllable-to-note placement matters.

Do not require this file for every song. YuE2 may perform its own alignment when explicit alignment is absent.

The initial schema should be simple, versioned, and stable. A recommended shape is:

```json
{
  "version": 1,
  "voice": "Vocal",
  "units": [
    {
      "text": "Sound",
      "section": "chorus",
      "line": 1,
      "syllable": 1,
      "noteStart": 24,
      "noteCount": 1
    },
    {
      "text": "and",
      "section": "chorus",
      "line": 1,
      "syllable": 2,
      "noteStart": 25,
      "noteCount": 1
    },
    {
      "text": "feel-",
      "section": "chorus",
      "line": 1,
      "syllable": 3,
      "noteStart": 26,
      "noteCount": 1
    },
    {
      "text": "-ing",
      "section": "chorus",
      "line": 1,
      "syllable": 4,
      "noteStart": 27,
      "noteCount": 2
    }
  ]
}
```

The exact indexing representation may evolve during implementation, but it must use stable references into the parsed vocal voice rather than brittle character offsets into raw ABC text.

The alignment model must allow:

- one syllable across multiple notes (melisma)
- multiple syllables across successive notes
- rests between lyric units
- lyric lines / sections
- instrumental passages with no lyric assignment
- repeated lyric sections without ambiguity

### 16.3 Standard ABC lyric fields

Standard ABC supports lyric fields such as `w:`, and the application may eventually support import/export of these for interoperability.

However:

- `w:` is not the canonical lyric store for this architecture.
- YuE2 rendering must not depend on `w:`.
- importing ABC with `w:` may populate or propose `lyrics.txt` and alignment data.
- exporting general-purpose ABC may optionally emit `w:` derived from canonical lyrics/alignment.
- lossless round-trip behavior must be documented before treating `w:` as supported.

This preserves interoperability without coupling the internal project model to a notation-specific lyric encoding.

### 16.4 Composition model extension

The internal composition abstraction should clearly identify vocal voices.

Conceptually:

```text
Composition
  metadata
  sections[]
  voices[]
    id
    role                 # vocal | instrumental | other
    notes/rests
  harmony[]
  source
    abcText

SongProject
  composition
  lyrics
  vocalAlignment?
  arrangement?
  renderMetadata?
```

Do not force lyrics into the base `Composition` object if doing so makes instrumental compositions awkward. A higher-level `SongProject` or equivalent aggregate is preferred for combining composition, lyrics, alignment, arrangement, and renderer metadata.

### 16.5 YuE2 adapter contract

The YuE2 boundary should explicitly accept separate composition and lyric inputs:

```text
YuE2Renderer.render({
    abc,
    lyrics,
    vocalAlignment,
    style,
    outputDirectory,
    options
})
```

`vocalAlignment` may initially be advisory or unsupported by the underlying YuE2 runtime; the adapter must not pretend the model consumes controls it does not actually consume.

The adapter should always preserve the requested alignment artifact alongside the render so future renderers or later YuE2 capabilities can use it.

The renderer must construct YuE2 input according to YuE2's actual supported interface:

- vocal melody/harmony/form from ABC
- lyric text through the separate lyric input
- style/production instructions through the style input

### 16.6 UI requirements

The composition UI should evolve to make vocals inspectable and editable without conflating notes and words.

Desired views become approximately:

```text
[ ABC Source ] [ Score ] [ Lyrics ] [ Vocal Alignment ] [ Piano Roll ] [ Render ]
```

For the next implementation milestone, minimum useful support is:

- display/edit `lyrics.txt`
- identify the vocal ABC voice
- render the vocal melody in the score
- show whether an alignment sidecar exists
- pass lyrics separately to YuE2

A graphical syllable-to-note alignment editor can come later.

### 16.7 Validation rules

Add validation across the song project, not just individual files.

At minimum:

- configured vocal voice must exist in the parsed composition
- lyric file must be readable when a vocal render requires lyrics
- alignment references must point to existing vocal notes
- alignment must not reference instrumental voices as vocal notes
- overlapping/conflicting alignment ranges should be rejected unless explicitly supported
- melismatic mappings must be legal
- absence of alignment must remain valid
- instrumental compositions must remain valid without lyrics

### 16.8 Tests

Add tests for:

- detection of a named vocal voice
- vocal melody preserved through ABC parse/serialize
- loading/saving canonical lyrics
- section and line preservation in lyrics
- optional alignment loading
- one-syllable/one-note alignment
- melisma (one syllable to multiple notes)
- invalid note references
- missing vocal voice
- songs with lyrics but no explicit alignment
- instrumental songs with no lyrics
- YuE2 adapter receives lyrics separately from ABC
- YuE2 adapter does not inject `w:` lines as a substitute for its lyric input

### 16.9 Next vertical slice

The next end-to-end proof should be a short vocal song:

```text
composition.abc
    └── V: Vocal melody

lyrics.txt
    └── canonical words

vocal-alignment.json
    └── optional note/syllable mapping

        ↓

same song project
   ├──→ rendered score
   ├──→ MIDI preview of vocal melody/harmony
   └──→ YuE2 sung audio
```

Success means the project can revise **what is sung** and **how it is sung melodically** as separate version-controlled artifacts, then combine them reproducibly at render time.
