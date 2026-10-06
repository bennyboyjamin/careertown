# CareerTown — MVP vertical slice

A kid-friendly (ages 6–12) open-ended town where children create characters, play pretend
in rooms, and explore careers through short missions. All art, characters and sounds are
original (SVG + synthesized WebAudio). No accounts, chat, ads or real purchases.

## Publish on GitHub Pages
`.github/workflows/deploy.yml` builds the game and publishes it on every push to `main`.
One-time setup: in your GitHub repo open *Settings → Pages* and set **Source** to **GitHub Actions**.
Your game will be at `https://YOUR-USERNAME.github.io/REPO-NAME/`.

## Publish on GitLab
The included `.gitlab-ci.yml` builds the game and deploys it to **GitLab Pages** whenever you push
to the default branch. After the first pipeline finishes, find the link under
*Deploy → Pages* in your GitLab project.

## Run it
```bash
npm install
npm run dev      # local dev server
npm run build    # production build (dist/)
npm run typecheck  # optional TypeScript check
```
`tools/build-single.mjs` bundles everything into one self-contained HTML file (used for the hosted preview).

## What's playable
- **Town map**: 5 playable buildings, 5 "Soon" buildings, hidden balloon secret.
- **Home**: kitchen, bedroom, living room, bathroom. Fridge/cupboard/toy box open to take things
  out; cook on the stove (egg → fried egg, corn → popcorn, mix → pancakes); wash food in the sink;
  feed characters; sit, sleep, shower; brush teeth; hold objects; walk through doors between
  rooms; TV, lamp, day/night window; closet opens a wardrobe.
- **School**: desks, chalkboard drawing (saved), bell, globe, secret clock.
- **Hospital**: free-play exam room + *Check-up for Pip* (temperature, heartbeat counting, clean →
  bandage, body parts, healthy habits).
- **Courthouse**: free-play courtroom + *The Missing Science Trophy* (statements, evidence,
  fact vs opinion, contradiction, questions, strongest evidence, claim/evidence/reasoning, verdict).
- **Engineering Lab**: block stacking + *The River Bridge* (Ask, Imagine, Plan, Build, Test, Improve
  with materials, shapes, supports, beams, budget and a car-load test).
- **Animal Hospital**: free-play pet clinic with visiting patients (Clover the bunny, Rex the puppy)
  + *Clover’s Clinic Visit* (fast bunny heartbeat, clean 4 muddy paws, brush out tangles, bandage,
  animal needs, match foods to animals). Unlocks a pet bunny.
- **Technology Lab**: free-play coding lab + *Robot to the Charger*, 4 levels of block coding
  (Forward, Turn left, Turn right, Repeat) teaching sequence, logic, loops and debugging.
- **Character creator**: kids & grown-ups, 8 skin tones, 3 face shapes, 5 eyes, 8 hairstyles,
  10 hair colors, 9 tops (3 career outfits unlock), 5 bottoms, shoes, glasses, hats, accessories.
- **Pets**: puppy (doctor mission), kitten (lawyer mission) and bunny (vet mission) wander, follow, eat, nap, play.
- **Progress**: coins, XP/levels, career levels, badges, 6 secrets, daily challenge, shop,
  Career Passport with "What we noticed" discovery (never "you should become…").
- Autosaves to localStorage.

## Architecture
```
src/
  engine/
    types.ts         All game types (Entity, GameState, Reward, Screen…)
    store.tsx        Reducer: entities, rewards, missions, events, daily, secrets, shop
    interactions.ts  Drop rules: what happens when X is dropped on Y (tags-driven)
    save.ts          SaveAdapter interface + localStorage impl + Supabase sketch
    sfx.ts           Synthesized sound effects
  data/              ← most expansion happens here
    items.ts         Every object: size, art, tags, tap behavior
    scenes.ts        Room backdrops + starting layouts
    buildings.ts     Map placement, rooms, missions per building
    careers.ts       Career titles, blurbs, discovery sentences
    missions.ts      Mission metadata + rewards
    catalog.ts       Wardrobe options & unlocks, shop, badges, secrets, pet accessories
    daily.ts         Daily challenges
  components/
    Room.tsx         Generic drag-and-drop room engine (pointer events, touch-first)
    art/             Character, Pet, Furniture SVG renderers
  scenes/            TownMap, SceneScreen, CharacterCreator, Menus (Building, Passport, Shop)
  missions/          Lawyer, Engineer, Doctor, Vet, Robot missions + MissionShell
  ui/                kit (HUD, buttons, modals, rewards), DragChip (drag-or-tap)
```

### Add a new building / career
1. `data/careers.ts`: add or flip `available: true`.
2. `data/scenes.ts`: add a SceneId, backdrop and `initialScene` layout.
3. `data/items.ts`: add furniture (tags like `seat`, `bed`, `table` give free behaviors).
4. `data/buildings.ts`: set `playable: true`, `rooms`, `missions`.
5. Mission: add metadata in `data/missions.ts`, a component in `missions/`, and one line in
   `MISSION_VIEWS` in `App.tsx`.

### Adding Supabase later
Implement `SaveAdapter` (see the sketch in `engine/save.ts`) and pass it to
`<GameProvider adapter={…}>`. Suggested tables: `parents`, `child_profiles`, `saves`
(profile_id, state jsonb), `purchases`, with row-level security per family.

## Safety
No free-text sharing, no multiplayer, no external links, no ads. Character names stay on device.
Medical and legal content is pretend, simple and clearly framed as play.
