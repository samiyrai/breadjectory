(function(){'use strict';
/* BREADJECTORY: quick guide for changing the game
   - Timers ........ CFG.modes.<easy|medium|hard>.seconds  (and CFG.timeBonus for seconds won per hit)
   - Points ........ CFG.pointsPerHit, CFG.comboBonus, CFG.comboFrom
   - Lives ......... CFG.lives (and CFG.collapseAt = wrong layers that topple the tower)
   - Physics ....... CFG.gravity, CFG.mass, CFG.barrel, CFG.angle / velocity / distance ranges
   - Recipes ....... CFG.recipes (the ingredient list of every sandwich; one of each builds it)
   - Decoys ........ CFG.modes.<mode>.decoyChance (layers from other recipes)
   - Finish bonus .. CFG.finishBonusPerSecond, CFG.finishBonusPerLife
   - Stack ......... CFG.stackLayers (layers kept in the endless tower) and CFG.layerHeight
   - Rotten ........ CFG.modes.hard.rottenChance (chance a new layer is rotten), CFG.rottenLivesLost (99 = lose every life)
   - Hide-arrow .... CFG.hideArrowDefault (the setup screen toggle starts like this)
   - Character ..... CFG.character (add hats, hair, outfits, skin tones, accessories)
   - Leaderboard ... NAME_KEY / SCORES_KEY (browser storage keys) in section 12
*/
/* ===================================================================
   1. SETTINGS  (edit these numbers to tune the game)
   =================================================================== */
const ALLING = ['bread', 'cheese', 'ham', 'lettuce', 'tomato', 'onion', 'butter', 'cucumber', 'peanutbutter', 'jelly', 'chicken'];
const CFG = {
  hideArrowDefault: false,   // true = the yellow target arrow starts hidden
  stackLayers: 10,           // layers in the endless tower (it refills after every hit)
  rottenLivesLost: 99,       // lives lost when a rotten layer is hit (99 = all of them)
  lives: 3,            // lives per round
  pointsPerHit: 100,   // points for a correct layer
  comboBonus: 30,      // extra points while on a streak
  comboFrom: 3,        // streak length where the bonus starts
  timeBonus: 2,        // seconds added per correct layer
  collapseAt: 3,       // wrong layers that topple the tower
  gravity: 9.8,        // m/s^2
  mass: 2,             // kg (constant, so a = F / m)
  barrel: 2,           // m, launcher length s in v = sqrt(2 a s)
  muzzleHeight: 1.2,   // m above the counter
  ballRadius: 0.35,    // m
  towerWidth: 4,       // m
  layerHeight: 1.2,    // m
  angle:    { min: 5,  max: 85, step: 1,   def: 45 },
  velocity: { min: 4,  max: 26, step: 0.5, def: 15 },
  distance: { min: 8,  max: 24, step: 0.5, def: 14 },
  finishBonusPerSecond: 2,   // points for every second left when the sandwich is complete
  finishBonusPerLife: 150,   // points for every life left when the sandwich is complete
  sound: { volume: 0.5 },    // master volume for the synthesized sound effects (0 to 1). Players can mute with the speaker button
  character: {               // wardrobe catalog: add an item to any list and it shows up in the Profile screen
    tabs: [{ id: 'hat', label: 'Hat' }, { id: 'hair', label: 'Hair' }, { id: 'outfit', label: 'Outfit' }, { id: 'skin', label: 'Skin tone' }, { id: 'accessory', label: 'Accessory' }],
    hat: [{ id: 'none', name: 'None' }, { id: 'cap', name: 'Cap', color: '#e8452c' }, { id: 'beanie', name: 'Beanie', color: '#3f7fd0' }, { id: 'tophat', name: 'Top hat', color: '#3b2016' }, { id: 'crown', name: 'Crown', color: '#ffb703' }, { id: 'party', name: 'Party hat', color: '#a05ad0' }, { id: 'chef', name: 'Chef hat', color: '#ffffff' }, { id: 'cowboy', name: 'Cowboy hat', color: '#b8793a' }, { id: 'headband', name: 'Headband', color: '#e8452c' }, { id: 'catears', name: 'Cat ears', color: '#8a8f9c' }, { id: 'bunny', name: 'Bunny ears', color: '#f4d9e0' }, { id: 'flower', name: 'Flower', color: '#f58ca8' }, { id: 'wizard', name: 'Wizard hat', color: '#5a4acb' }, { id: 'beret', name: 'Beret', color: '#c8322f' }],
    hair: [{ id: 'short', name: 'Short brown', style: 'short', color: '#5a3520' }, { id: 'shortb', name: 'Short black', style: 'short', color: '#1f1a1a' }, { id: 'shortg', name: 'Ginger', style: 'short', color: '#c8642a' }, { id: 'long', name: 'Long blonde', style: 'long', color: '#e9c15a' }, { id: 'longb', name: 'Long black', style: 'long', color: '#1f1a1a' }, { id: 'bun', name: 'Red bun', style: 'bun', color: '#b8431f' }, { id: 'curly', name: 'Curly', style: 'curly', color: '#1f1a1a' }, { id: 'curlys', name: 'Silver curls', style: 'curly', color: '#cfd3da' }, { id: 'ponytail', name: 'Ponytail', style: 'ponytail', color: '#5a3520' }, { id: 'pigtails', name: 'Pink pigtails', style: 'pigtails', color: '#f28bb0' }, { id: 'spiky', name: 'Blue spikes', style: 'spiky', color: '#3f7fd0' }, { id: 'mohawk', name: 'Green mohawk', style: 'mohawk', color: '#4aa84a' }, { id: 'bald', name: 'No hair', style: 'none', color: '#000000' }],
    outfit: [{ id: 'tee', name: 'Red tee', color: '#e8452c', style: 'plain' }, { id: 'blue', name: 'Blue tee', color: '#3f7fd0', style: 'plain' }, { id: 'mint', name: 'Mint tee', color: '#7fd1b9', style: 'plain' }, { id: 'apron', name: 'Green apron', color: '#3f9a44', style: 'apron' }, { id: 'stripe', name: 'Stripes', color: '#ffb703', style: 'stripe' }, { id: 'hood', name: 'Purple hoodie', color: '#7a5ac8', style: 'plain' }, { id: 'hoodo', name: 'Orange hoodie', color: '#f08a3c', style: 'plain' }, { id: 'overalls', name: 'Overalls', color: '#3f7fd0', style: 'overalls' }, { id: 'chefc', name: 'Chef coat', color: '#ffffff', style: 'chef' }, { id: 'dots', name: 'Polka dots', color: '#f28bb0', style: 'dots' }, { id: 'sailor', name: 'Sailor', color: '#2f4f9a', style: 'sailor' }],
    skin: [{ id: 's1', name: 'Light', color: '#ffdcb8' }, { id: 's5', name: 'Rosy', color: '#f7c4b4' }, { id: 's2', name: 'Tan', color: '#e9b98a' }, { id: 's6', name: 'Olive', color: '#d9a877' }, { id: 's3', name: 'Brown', color: '#b9805a' }, { id: 's4', name: 'Deep', color: '#7a4a30' }, { id: 's7', name: 'Mint', color: '#bfe8c8' }, { id: 's8', name: 'Lavender', color: '#d9c7f2' }],
    accessory: [{ id: 'none', name: 'None' }, { id: 'glasses', name: 'Glasses' }, { id: 'shades', name: 'Sunglasses' }, { id: 'bow', name: 'Bow tie', color: '#e8452c' }, { id: 'scarf', name: 'Scarf', color: '#ffb703' }, { id: 'mustache', name: 'Mustache', color: '#3b2a1c' }, { id: 'freckles', name: 'Freckles', color: '#b8663a' }, { id: 'headphones', name: 'Headphones', color: '#3b3f4a' }, { id: 'necklace', name: 'Necklace', color: '#ffd23f' }],
    default: { hat: 'none', hair: 'short', outfit: 'tee', skin: 's1', accessory: 'none' }
  },
  mascot: {                  // the tutorial guide. Change the name here; each expression points at a sprite in MASCOT_IMG
    name: 'Sandy',
    titleLines: ['Ready to cook?', "Let's build a sandwich!", 'Fork it over!', 'Aim high!', 'Psst, try the tutorial!'],   // what she says when tapped on the title screen
    expressions: {
      idle:     { sprite: 'idle' },
      happy:    { sprite: 'happy' },
      welcome:  { sprite: 'welcome' },
      success:  { sprite: 'success' },
      sad:      { sprite: 'sad' },
      confused: { sprite: 'confused' }
    }
  },
  quiz: {                    // Quiz with Sandy: tune the count, levels, concepts, her lines, and add question templates
    count: 5,                // questions per quiz
    points: { correct: 10, withHint: 7, retry: 5, lateSkip: 0.5, perfect: 10, streakEvery: 5, streakBonus: 5, mode: { easy: 1, medium: 1.5, hard: 2 } },   // quiz points per answer (times the mode multiplier). lateSkip = share earned when a skipped question is answered in the summary
    levels: { easy: { hints: 3 }, medium: { hints: 2 }, hard: { hints: 1 } },   // hints allowed per question for each game mode
    concepts: {              // shown in the recap
      accel:        { name: 'Acceleration', practice: 'Open the Physics Lab and slide the launch speed. Watch how acceleration changes (a = v² ÷ 2s).' },
      force:        { name: 'Force', practice: 'In the Lab, compare force and acceleration. They rise together because F = m · a.' },
      mass:         { name: 'Mass', practice: 'Remember a = F ÷ m: for the same push, a heavier object speeds up less.' },
      speed:        { name: 'Launch speed', practice: 'Try a small and a big launch speed at the same angle and compare how far the fork goes.' },
      velocity:     { name: 'Speed and distance', practice: 'Keep the angle the same and only change the speed. Notice how much farther a faster fork flies.' },
      angle:        { name: 'Launch angle', practice: 'Try 30°, 50° and 70° at the same speed and watch the arc and the time in the air.' },
      range:        { name: 'Range', practice: 'Find the angle that sends the fork farthest. Then use x = vₓ · t on a hit.' },
      gravity:      { name: 'Gravity', practice: 'Gravity pulls everything down at the same rate, whatever its mass. Only the arc depends on your launch.' },
      independence: { name: 'Sideways vs. up and down', practice: 'Watch the dotted path: sideways speed stays the same while gravity bends the path down.' },
      height:       { name: 'Highest point', practice: 'Launch steeply and check the top of the arc against h = h₀ + vᵧ² ÷ 2g.' }
    },
    lines: {
      intro:   ["Let's see what you learned! I made these questions from your own shots.", 'Quiz time! These come from the shots you just took.'],
      next:    ['Next question!', 'Here we go!', 'Ready for another one?'],
      skip:    ["No problem, we'll look at that one together at the end.", "Skipped! We'll go over it in the summary."],
      correct: ['Yes! Great thinking!', 'You got it!', 'Brilliant, that is right!'],
      retry:   ['Almost! Have another go.', 'Not quite. Try once more, or tap Hint.'],
      wrong:   ["Good try! Here's how it works.", "No worries, let me show you."],
      hint:    ['Hmm, here is a little nudge.', 'Think about it step by step.'],
      done:    { high: 'Wow, you really know your physics! Try a harder mode next.', mid: 'Nice work! A few more rounds and these will feel easy.', low: "That's how we learn! Play another round and try again." }
    },
    /* Each template: { id, concept, minLevel (0 easy, 1 medium, 2 hard), make(d, level) } and returns a question or null.
       d = numbers from the player's own shot (angle, v, D, t, x, vx, vy, a, F, miss). Use QH.num / QH.choice to build questions. */
    templates: [
      { id: 'accel', concept: 'accel', minLevel: 0, make: (d, lv) => QH.num(lv, {
        text: d.lead + ', the fork left the launcher at ' + nf(d.v) + ' m/s. The barrel is ' + CFG.barrel + ' m long. Using v² = 2·a·s, what acceleration did the launcher give it?',
        answer: accelOf(d.v), wrongs: [d.v * d.v / CFG.barrel, d.v / (2 * CFG.barrel), d.v * d.v], unit: 'm/s²', dp: 1, tol: 0.03,
        hints: ['Rearrange v² = 2·a·s to get a = v² ÷ (2·s).', 'Square the speed first: ' + nf(d.v) + ' × ' + nf(d.v) + ' = ' + nf(d.v * d.v) + '.', 'Divide by 2·s = ' + nf(2 * CFG.barrel) + '.'],
        formula: 'a = v² ÷ (2 · s)',
        work: ['v² = ' + nf(d.v) + ' × ' + nf(d.v) + ' = ' + nf(d.v * d.v), '2·s = 2 × ' + CFG.barrel + ' = ' + nf(2 * CFG.barrel), 'a = ' + nf(d.v * d.v) + ' ÷ ' + nf(2 * CFG.barrel) + ' = ' + nf(accelOf(d.v)) + ' m/s²'],
        why: 'The launcher pushes the fork along its barrel, so the fork speeds up over that distance. A faster launch needs a bigger acceleration.',
        tip: 'Next round, slide the launch speed up and watch the acceleration number in the Lab.' }) },
      { id: 'force', concept: 'force', minLevel: 0, make: (d, lv) => QH.num(lv, {
        text: 'The launcher gave your ' + CFG.mass + ' kg fork an acceleration of ' + nf(d.a) + ' m/s². Using F = m·a, how big was the push (force)?',
        answer: d.F, wrongs: [d.a / CFG.mass, d.a + CFG.mass, d.F * CFG.mass], unit: 'N', dp: 1, tol: 0.03,
        hints: ['Force is mass times acceleration.', 'Multiply ' + CFG.mass + ' kg by ' + nf(d.a) + ' m/s².'],
        formula: 'F = m · a', work: ['F = ' + CFG.mass + ' × ' + nf(d.a) + ' = ' + nf(d.F) + ' N'],
        why: 'A bigger force on the same mass makes a bigger acceleration. One newton is the push that gives 1 kg an acceleration of 1 m/s².',
        tip: 'Open the Lab and compare the force and acceleration readouts as you change the speed.' }) },
      { id: 'mass', concept: 'mass', minLevel: 0, make: d => QH.choice({
        text: 'Imagine the launcher pushes with the same force (' + nf(d.F) + ' N), but the fork is twice as heavy (' + CFG.mass * 2 + ' kg). What happens to the acceleration? (a = F ÷ m)',
        hints: ['Use a = F ÷ m with the new mass.', 'The mass is in the bottom of the fraction. What does a bigger bottom do?'],
        formula: 'a = F ÷ m', work: ['Now: a = ' + nf(d.F) + ' ÷ ' + CFG.mass * 2 + ' = ' + nf(d.F / (CFG.mass * 2)) + ' m/s²', 'Before: a = ' + nf(d.a) + ' m/s²', 'Doubling the mass halves the acceleration.'],
        why: 'For the same push, a heavier object is harder to speed up, so its acceleration is smaller.', tip: 'Think of pushing an empty shopping cart and a full one with the same effort.' },
        ['It is half as big (' + nf(d.a / 2) + ' m/s²)', 'It stays the same (' + nf(d.a) + ' m/s²)', 'It is twice as big (' + nf(d.a * 2) + ' m/s²)', 'It becomes zero'], 0) },
      { id: 'range-hit', concept: 'range', minLevel: 0, make: (d, lv) => d.end !== 'hit' ? null : QH.num(lv, {
        text: d.lead + ', the fork left at ' + d.angle + '° and ' + nf(d.v) + ' m/s and was in the air for ' + nf(d.t, 2) + ' s before it hit. Its sideways speed is vₓ = v·cos(θ) = ' + nf(d.vx) + ' m/s. How far did it travel sideways (x = vₓ · t)?',
        answer: d.vx * d.t, wrongs: [d.v * d.t, d.vy * d.t, d.vx + d.t], unit: 'm', dp: 1, tol: 0.03,
        hints: ['Sideways distance = sideways speed × time.', 'Multiply ' + nf(d.vx) + ' by ' + nf(d.t, 2) + '.'],
        formula: 'x = vₓ · t', work: ['vₓ = ' + nf(d.v) + ' × cos(' + d.angle + '°) = ' + nf(d.vx) + ' m/s', 'x = ' + nf(d.vx) + ' × ' + nf(d.t, 2) + ' = ' + nf(d.vx * d.t) + ' m'],
        why: 'Sideways speed does not change in flight, so distance is just speed times time.', tip: 'After a hit, read the feedback text. It shows this same sum with your numbers.' }) },
      { id: 'angle-time', concept: 'angle', minLevel: 0, make: d => { const set = pick([[15, 40, 65], [20, 45, 70], [25, 50, 75]]), ts = set.map(a => landing(a, d.v).t), ci = ts.indexOf(Math.max.apply(null, ts));
        return QH.choice({ text: 'You launch at ' + nf(d.v) + ' m/s each time. Which launch angle keeps the fork in the air the longest?',
          hints: ['Time in the air depends on the upward part of the speed.', 'Which angle gives the biggest upward speed vᵧ = v·sin(θ)?'],
          formula: 'vᵧ = v · sin(θ)', work: set.map((a, i) => a + '°: vᵧ = ' + nf(d.v * Math.sin(a * Math.PI / 180)) + ' m/s, about ' + nf(ts[i], 2) + ' s in the air'),
          why: 'A steeper launch sends the fork up faster, so gravity takes longer to bring it back down.', tip: 'Try 30° and then 70° at the same speed and compare the time in the air.' }, set.map(a => a + '°'), ci); } },
      { id: 'angle-range', concept: 'range', minLevel: 0, make: d => { const set = pick([[25, 45, 65], [30, 45, 60], [20, 45, 75]]), xs = set.map(a => landing(a, d.v).x), ci = xs.indexOf(Math.max.apply(null, xs));
        return QH.choice({ text: 'At ' + nf(d.v) + ' m/s on a flat counter, which launch angle sends the fork the farthest before it lands?',
          hints: ['Too flat and it lands quickly. Too steep and it goes mostly up.', 'The best angle is somewhere in the middle.'],
          formula: 'x = vₓ · t = v·cos(θ) · t', work: set.map((a, i) => a + '°: it lands about ' + nf(xs[i]) + ' m away'),
          why: 'A middle angle balances time in the air (steeper is better) and sideways speed (flatter is better), so it goes farthest.', tip: 'Find the angle that goes farthest at one speed, then try it at another speed.' }, set.map(a => a + '°'), ci); } },
      { id: 'speed-compare', concept: 'velocity', minLevel: 0, make: d => { const vb = d.v + 4 <= CFG.velocity.max ? d.v + 4 : d.v - 4, xa = landing(d.angle, d.v).x, xb = landing(d.angle, vb).x, ci = xa > xb ? 0 : 1;
        return QH.choice({ text: 'Both shots use ' + d.angle + '°. Shot A leaves at ' + nf(d.v) + ' m/s and shot B at ' + nf(vb) + ' m/s. Which one lands farther away?',
          hints: ['Only the speed is different.', 'A faster fork covers more sideways distance and stays up longer.'],
          formula: 'x = vₓ · t', work: ['Shot A lands about ' + nf(xa) + ' m away.', 'Shot B lands about ' + nf(xb) + ' m away.'],
          why: 'More launch speed gives more sideways speed and more upward speed, so the fork goes farther.', tip: 'Keep the angle fixed, change only the speed, and see the preview arc stretch.' },
          ['Shot A (' + nf(d.v) + ' m/s)', 'Shot B (' + nf(vb) + ' m/s)', 'They land the same distance'], ci); } },
      { id: 'gravity', concept: 'gravity', minLevel: 0, make: () => QH.choice({
        text: 'True or false: in this game a heavier fork would fall to the ground faster than a lighter one once it is flying (no air).',
        hints: ['Look at the height formula. Is mass in it?', 'Gravity speeds every object up by the same amount each second.'],
        formula: 'y = h₀ + vᵧ·t − ½·g·t²', work: ['The formula only has g = ' + CFG.gravity + ' m/s², not the mass.', 'So every fork falls the same way.'],
        why: 'Gravity gives all objects the same acceleration, whatever their mass. Mass only changed the launch (a = F ÷ m).', tip: 'Nothing to change in the game for this one: the arc is the same for any mass.' }, ['True', 'False'], 1) },
      { id: 'independence', concept: 'independence', minLevel: 0, make: d => QH.choice({
        text: 'True or false: while the fork flies, gravity slowly reduces its sideways speed (' + nf(d.vx) + ' m/s).',
        hints: ['Which direction does gravity pull?', 'There is no air in this game to slow the fork down.'],
        formula: 'vₓ = v · cos(θ)  (stays constant)', work: ['Gravity pulls straight down, so it only changes vᵧ.', 'vₓ stays ' + nf(d.vx) + ' m/s for the whole flight.'],
        why: 'Sideways and up/down motion are separate. Gravity only affects the up/down part, which is why the path is a curve.', tip: 'Watch the dotted preview: it bends down but keeps moving steadily to the right.' }, ['True', 'False'], 1) },
      { id: 'peak', concept: 'height', minLevel: 1, make: (d, lv) => QH.num(lv, {
        text: 'A fork starts ' + CFG.muzzleHeight + ' m up and leaves with an upward speed of vᵧ = ' + nf(d.vy) + ' m/s. With g = ' + CFG.gravity + ' m/s², how high does it get? (h = h₀ + vᵧ² ÷ 2g)',
        answer: CFG.muzzleHeight + d.vy * d.vy / (2 * CFG.gravity), wrongs: [d.vy * d.vy / (2 * CFG.gravity), d.vy * d.vy / CFG.gravity, d.vy / CFG.gravity], unit: 'm', dp: 1, tol: 0.05,
        hints: ['At the top the fork stops rising for a moment.', 'Square vᵧ, divide by 2g, then add the starting height.'],
        formula: 'h = h₀ + vᵧ² ÷ (2·g)', work: ['vᵧ² = ' + nf(d.vy * d.vy), '2·g = ' + nf(2 * CFG.gravity), 'rise = ' + nf(d.vy * d.vy) + ' ÷ ' + nf(2 * CFG.gravity) + ' = ' + nf(d.vy * d.vy / (2 * CFG.gravity)) + ' m', 'h = ' + CFG.muzzleHeight + ' + ' + nf(d.vy * d.vy / (2 * CFG.gravity)) + ' = ' + nf(CFG.muzzleHeight + d.vy * d.vy / (2 * CFG.gravity)) + ' m'],
        why: 'Gravity slows the upward speed until it reaches zero at the top. The rise depends on vᵧ squared.', tip: 'Launch at 80° and look at how high the fork goes compared with 40°.' }) },
      { id: 'speed-force', concept: 'speed', minLevel: 1, make: (d, lv) => QH.num(lv, {
        text: 'A launcher pushes with ' + nf(d.F) + ' N on the ' + CFG.mass + ' kg fork over the ' + CFG.barrel + ' m barrel. First a = F ÷ m, then v = √(2·a·s). What launch speed does the fork get?',
        answer: d.v, wrongs: [d.a, d.F / CFG.mass / 2, Math.sqrt(d.F)], unit: 'm/s', dp: 1, tol: 0.03,
        hints: ['Start with a = F ÷ m.', 'Then put a and s = ' + CFG.barrel + ' m into v = √(2·a·s).'],
        formula: 'a = F ÷ m,  v = √(2 · a · s)', work: ['a = ' + nf(d.F) + ' ÷ ' + CFG.mass + ' = ' + nf(d.F / CFG.mass) + ' m/s²', 'v = √(2 × ' + nf(d.F / CFG.mass) + ' × ' + CFG.barrel + ') = ' + nf(d.v) + ' m/s'],
        why: 'The force makes the acceleration, and the acceleration over the barrel length makes the launch speed.', tip: 'In the Lab, change the force and watch the speed follow.' }) },
      { id: 'miss-read', concept: 'range', minLevel: 0, make: d => { const m = d.miss; if (!m) return null; const sm = simulate(m.angle, m.v, m.D, m.n), short = sm.end === 'ground' && sm.x < m.D, long = sm.end === 'out' || (sm.end === 'ground' && sm.x > m.D + CFG.towerWidth); if (!short && !long) return null;
        return QH.choice({ text: 'On one of your shots (' + m.angle + '° at ' + nf(m.v) + ' m/s) the tower was ' + nf(m.D) + ' m away, but the fork ' + (short ? 'landed about ' + nf(sm.x) + ' m away.' : 'flew over the whole tower.') + ' What should you change?',
          hints: ['Compare where the fork landed with where the tower was.', short ? 'It did not reach the tower.' : 'It went past the tower.'],
          formula: 'range grows with launch speed', work: [short ? nf(sm.x) + ' m is less than ' + nf(m.D) + ' m, so the shot was too short.' : 'The fork went past ' + nf(m.D + CFG.towerWidth) + ' m (the far side of the tower), so it was too long.'],
          why: short ? 'The fork landed before the tower. More speed (or a better angle) makes it go farther.' : 'The fork was too fast or too high. Less speed makes it land sooner.', tip: 'Use the preview arc and adjust the speed until the dots end on the tower.' },
          short ? ['Make it go farther (more speed)', 'Make it go shorter (less speed)', 'Nothing, it was perfect'] : ['Make it go shorter (less speed)', 'Make it go farther (more speed)', 'Nothing, it was perfect'], 0); } }
    ]
  },
  recipes: {                 // collect one of each ingredient to finish the sandwich
    classic: { name: 'Classic sandwich', ingredients: ['bread', 'ham', 'cheese', 'lettuce', 'tomato'], unlockAt: 400 },   // unlockAt = quiz points needed (0 = open from the start)
    grilled: { name: 'Grilled cheese',   ingredients: ['bread', 'cheese', 'butter'], unlockAt: 40 },
    veggie:  { name: 'Veggie sandwich',  ingredients: ['bread', 'lettuce', 'tomato', 'onion', 'cucumber'], unlockAt: 240 },
    pbj:     { name: 'PB&J',             ingredients: ['bread', 'peanutbutter', 'jelly'], unlockAt: 0 },
    chicken: { name: 'Chicken sandwich', ingredients: ['bread', 'chicken', 'lettuce', 'tomato'], unlockAt: 120 }
  },
  modes: {                   // decoyChance: chance a layer is an ingredient from another recipe
    easy:   { name: 'Easy',   seconds: 180, decoyChance: 0,    rottenChance: 0 },
    medium: { name: 'Medium', seconds: 120, decoyChance: 0.25, rottenChance: 0 },
    hard:   { name: 'Hard',   seconds: 60,  decoyChance: 0.25, rottenChance: 0.22 }   // rottenChance: 0 to 1
  }
};

/* canvas world: 30 px = 1 m, cannon pivot is the origin of every shot */
const W = 1120, H = 540, S = 30, GROUND = 480, OX = 70, P2X = W - 92;   /* P2X = centre of the right-hand sandwich plate */
const OY = GROUND - CFG.muzzleHeight * S;

/* ===================================================================
   2. HELPERS AND PHYSICS
   =================================================================== */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
function shuffle(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const NAMES = { bread: 'Bread', cheese: 'Cheese', ham: 'Ham', lettuce: 'Lettuce', tomato: 'Tomato', onion: 'Onion', butter: 'Butter', cucumber: 'Cucumber', peanutbutter: 'Peanut butter', jelly: 'Jelly', chicken: 'Chicken' };
const labelOf = L => (L.rotten ? 'rotten ' : '') + NAMES[L.ing].toLowerCase();
const labelCap = L => (L.rotten ? 'Rotten ' : '') + NAMES[L.ing];

/* a = F / m,  v = sqrt(2 a s)  and the reverse */
const accelOf = v => v * v / (2 * CFG.barrel);
const forceOf = v => CFG.mass * accelOf(v);
const speedFromAccel = a => Math.sqrt(2 * a * CFG.barrel);
const speedFromForce = f => speedFromAccel(f / CFG.mass);
const LIM = {
  force: [forceOf(CFG.velocity.min), forceOf(CFG.velocity.max)],
  accel: [accelOf(CFG.velocity.min), accelOf(CFG.velocity.max)]
};

/* time the fork is in the air until it lands (analytic) */
function landing(angle, v) {
  const th = angle * Math.PI / 180, vy = v * Math.sin(th), g = CFG.gravity;
  const t = (vy + Math.sqrt(vy * vy + 2 * g * (CFG.muzzleHeight - CFG.ballRadius))) / g;
  return { t, x: v * Math.cos(th) * t };
}
function heightAtX(angle, v, x) {
  const th = angle * Math.PI / 180, t = x / (v * Math.cos(th));
  return CFG.muzzleHeight + v * Math.sin(th) * t - 0.5 * CFG.gravity * t * t;
}

/* x = v cos(th) t,  y = h0 + v sin(th) t - g t^2 / 2, checked against every layer */
function simulate(angle, v, D, n) {
  const th = angle * Math.PI / 180, vx = v * Math.cos(th), vy = v * Math.sin(th);
  const g = CFG.gravity, r = CFG.ballRadius, h0 = CFG.muzzleHeight, lh = CFG.layerHeight;
  const left = D, right = D + CFG.towerWidth, top = n * lh;
  const dt = 1 / 240, pts = [];
  let end = 'out', layer = -1, x = 0, y = h0, t = 0;
  for (let i = 0; i < 4000; i++) {
    t = i * dt; x = vx * t; y = h0 + vy * t - 0.5 * g * t * t;
    pts.push(x, y);
    if (i > 0 && y <= r) { y = r; end = 'ground'; break; }
    if (x + r > left && x - r < right && y - r < top) {
      const cx = clamp(x, left, right), cy = clamp(y, 0, top);
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy <= r * r) { layer = Math.min(n - 1, Math.floor(cy / lh)); end = 'hit'; break; }
    }
    if (x > 34) { end = 'out'; break; }
  }
  return { end, layer, x, y, t, pts };
}

/* ===================================================================
   3. DRAWING THE INGREDIENTS (canvas shapes only)
   =================================================================== */
function rr(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
function wavy(c, x, y, w, h, amp, freq, phase) {
  c.beginPath();
  c.moveTo(x, y + amp * Math.sin(phase));
  for (let px = 0; px <= w; px += 4) c.lineTo(x + px, y + amp * Math.sin(phase + px * freq));
  for (let px = w; px >= 0; px -= 4) c.lineTo(x + px, y + h + amp * Math.sin(phase + px * freq + 1.7));
  c.closePath();
}
function dot(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
const seed = n => { const s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); };

function drawIngredient(c, type, rotten, x, y, w, h) {
  const P = (fresh, off) => (rotten ? off : fresh);
  c.save();
  c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = '#5e3322';
  switch (type) {
    case 'bread':
      rr(c, x, y, w, h, 14); c.fillStyle = P('#b8743a', '#76673a'); c.fill(); c.stroke();
      rr(c, x + 5, y + 5, w - 10, h - 10, 10); c.fillStyle = P('#f2c98a', '#bdb06c'); c.fill();
      c.fillStyle = P('#e3ab62', '#8b8946');
      for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(x + 14 + seed(i) * (w - 28), y + 11 + seed(i + 9) * (h - 22), 2.6, 1.7, 0, 0, 6.28); c.fill(); }
      break;
    case 'cheese':
      rr(c, x - 4, y + 2, w + 8, h - 4, 6); c.fillStyle = P('#ffd23f', '#b6bb45'); c.fill(); c.stroke();
      c.fillStyle = P('#f0a91c', '#78862c');
      [[.2, .5, 5], [.5, .38, 4], [.78, .58, 5.5]].forEach(a => dot(c, x + w * a[0], y + h * a[1], a[2]));
      break;
    case 'lettuce':
      wavy(c, x - 8, y + 3, w + 16, h - 8, 5, 0.22, 0); c.fillStyle = P('#62bb46', '#6c7d39'); c.fill(); c.stroke();
      c.beginPath();
      for (let px = 0; px <= w + 16; px += 4) { const yy = y + h * 0.5 + 3 * Math.sin(px * 0.3 + 1); px ? c.lineTo(x - 8 + px, yy) : c.moveTo(x - 8, yy); }
      c.strokeStyle = P('#a6e57c', '#a8a25a'); c.lineWidth = 3; c.stroke();
      break;
    case 'tomato':
      rr(c, x - 2, y + 2, w + 4, h - 4, 12); c.fillStyle = P('#c8321f', '#7b3a2d'); c.fill(); c.stroke();
      rr(c, x + 6, y + 8, w - 12, h - 16, 7); c.fillStyle = P('#ff7b5f', '#a25a45'); c.fill();
      c.fillStyle = P('#ffe08a', '#b3ae64');
      for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(x + 16 + i * ((w - 32) / 6), y + h / 2 + (i % 2 ? 3 : -3), 3.2, 2, 0.6, 0, 6.28); c.fill(); }
      break;
    case 'ham':
      wavy(c, x - 5, y + 3, w + 10, h - 6, 2.5, 0.18, 0.6); c.fillStyle = P('#f4a0ae', '#a58a7b'); c.fill(); c.stroke();
      c.strokeStyle = P('#fbd0d6', '#cdb19e'); c.lineWidth = 2.5;
      for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(x + 10, y + 11 + i * 9); c.bezierCurveTo(x + w * .3, y + 7 + i * 9, x + w * .6, y + 17 + i * 9, x + w - 10, y + 10 + i * 9); c.stroke(); }
      break;
    case 'onion':
      rr(c, x, y + 2, w, h - 4, 14); c.fillStyle = P('#f6eaf7', '#c7cd94'); c.fill(); c.stroke();
      c.strokeStyle = P('#bd7fc9', '#85914a'); c.lineWidth = 2.5;
      for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(x + w * (0.16 + i * 0.225), y + h / 2, w * 0.1, h * 0.28, 0, 0, 6.28); c.stroke(); }
      break;
    case 'butter':
      rr(c, x + 6, y + 3, w - 12, h - 6, 8); c.fillStyle = P('#ffe27a', '#b6ae5e'); c.fill(); c.stroke();
      rr(c, x + 14, y + 8, w - 34, 7, 3.5); c.fillStyle = P('#fff4b8', '#cfc88a'); c.fill();
      c.strokeStyle = P('#e6bc3a', '#8d8444'); c.lineWidth = 2;
      for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(x + w * (0.3 + i * 0.2), y + h - 13); c.lineTo(x + w * (0.3 + i * 0.2) + 9, y + h - 8); c.stroke(); }
      break;
    case 'cucumber':
      for (let i = 0; i < 4; i++) {
        const ex = x + w * (0.14 + i * 0.24);
        c.beginPath(); c.ellipse(ex, y + h / 2, w * 0.13, h * 0.44, 0, 0, 6.28); c.fillStyle = P('#6fb55e', '#6b7f3d'); c.fill(); c.stroke();
        c.beginPath(); c.ellipse(ex, y + h / 2, w * 0.085, h * 0.3, 0, 0, 6.28); c.fillStyle = P('#d3eeb0', '#a5a96a'); c.fill();
        c.fillStyle = P('#8cc46f', '#7a7f45'); dot(c, ex - 3, y + h / 2, 1.6); dot(c, ex + 3, y + h / 2 + 2, 1.6);
      }
      break;
    case 'peanutbutter':
      rr(c, x - 4, y + 3, w + 8, h - 6, 10); c.fillStyle = P('#c68a4e', '#7e6a3b'); c.fill(); c.stroke();
      c.strokeStyle = P('#e0aa72', '#a39052'); c.lineWidth = 3;
      c.beginPath(); c.moveTo(x + 10, y + h * 0.4); c.bezierCurveTo(x + w * 0.3, y + 4, x + w * 0.5, y + h - 6, x + w * 0.7, y + h * 0.45); c.bezierCurveTo(x + w * 0.8, y + 6, x + w - 14, y + 10, x + w - 8, y + h * 0.5); c.stroke();
      c.fillStyle = P('#9b6532', '#6a5a30'); [[.2, .7], [.5, .3], [.8, .7]].forEach(a => dot(c, x + w * a[0], y + h * a[1], 2));
      break;
    case 'jelly':
      rr(c, x - 4, y + 3, w + 8, h - 6, 10); c.fillStyle = P('#9a2f8d', '#6b4a58'); c.fill(); c.stroke();
      c.fillStyle = P('#cf6fc0', '#8d6b78'); rr(c, x + 8, y + 8, w - 30, 7, 3.5); c.fill();
      c.fillStyle = 'rgba(255,255,255,.7)'; dot(c, x + w * 0.74, y + h * 0.6, 3); dot(c, x + w * 0.84, y + h * 0.42, 2);
      break;
    case 'chicken':
      wavy(c, x - 6, y + 2, w + 12, h - 4, 2, 0.25, 0); c.fillStyle = P('#e6a64a', '#8a7a42'); c.fill(); c.stroke();
      c.fillStyle = P('#b9732a', '#5f5a2c');
      for (let i = 0; i < 12; i++) dot(c, x + 6 + seed(i + 30) * (w - 12), y + 8 + seed(i + 50) * (h - 16), 1.8);
      c.fillStyle = P('#f6cf85', '#b3a56a'); rr(c, x + 10, y + 8, w - 30, 6, 3); c.fill();
      break;
  }
  if (rotten) {
    for (let i = 0; i < 6; i++) {
      const mx = x + 12 + seed(i + 3) * (w - 24), my = y + 9 + seed(i + 11) * (h - 18), mr = 3 + seed(i + 21) * 4;
      c.fillStyle = '#2f4a22'; dot(c, mx, my, mr);
      c.fillStyle = '#9bbd45'; dot(c, mx - 1, my - 1, mr * 0.45);
    }
  }
  c.restore();
}

/* flies and stink lines for rotten layers, drawn after the whole stack */
function drawRottenFx(c, x, y, w, h, time) {
  c.save();
  c.strokeStyle = 'rgba(95,130,40,.75)'; c.lineWidth = 2.5; c.lineCap = 'round';
  for (let i = 0; i < 2; i++) {
    const bx = x + w + 10 + i * 9;
    c.beginPath();
    for (let k = 0; k <= 12; k++) {
      const yy = y + h * 0.7 - k * 2.2, xx = bx + Math.sin(time * 4 + k * 0.7 + i * 2) * 3;
      k ? c.lineTo(xx, yy) : c.moveTo(xx, yy);
    }
    c.stroke();
  }
  c.fillStyle = '#5e3322';
  for (let i = 0; i < 2; i++) dot(c, x + w * 0.5 + Math.cos(time * 5 + i * 3) * (w * 0.4), y - 2 + Math.sin(time * 7 + i * 2) * 7, 2.2);
  c.restore();
}

/* small icon of an ingredient for the order ticket */
function drawIcon(canvas, layer) {
  const c = canvas.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, canvas.width, canvas.height);
  if (!layer) return;
  c.setTransform(2, 0, 0, 2, 0, 0);
  drawIngredient(c, layer.ing, layer.rotten, 8, 0, 104, 45);
}
/* ===================================================================
   4. GAME STATE AND FLOW
   =================================================================== */
const REDUCED = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const dpr = Math.min(window.devicePixelRatio || 1, 2);
canvas.width = W * dpr; canvas.height = H * dpr;

const G = {
  phase: 'menu',            // menu | play | paused | ending | ended
  mode: 'medium',
  layers: [], order: [], orderIdx: 0,
  timeLeft: 120, timeMax: 120,
  score: 0, lives: CFG.lives, combo: 0, bestCombo: 0, shots: 0, hits: 0, wrong: 0,
  angle: CFG.angle.def, v: CFG.velocity.def, distance: CFG.distance.def,
  flight: null, preview: null, previewMode: 'full', lastFlight: null,
  wobble: 0, tilt: 0, shake: 0, recoil: 0, bonusFlash: 0,
  collapse: false, parts: [], floats: [], trail: [],
  endReason: null, endTimer: 0
};
const towerCX = () => OX + (G.distance + CFG.towerWidth / 2) * S;

function newRound(key) {
  const m = CFG.modes[key];
  ensureRecipe(); G.mode = key; G.recipe = chosenRecipe;
  G.need = CFG.recipes[G.recipe].ingredients.slice(); G.have = []; G.finish = { t: 0, l: 0 };
  G.layers = Array.from({ length: CFG.stackLayers }, (_, i) => makeLayer(m, i));
  G.tower = G.layers.map((_, i) => i); ensureNeeded();
  G.order = [pickTicket()];
  Object.assign(G, {
    orderIdx: 0, timeLeft: m.seconds, timeMax: m.seconds, score: 0, lives: CFG.lives,
    combo: 0, bestCombo: 0, shots: 0, hits: 0, wrong: 0, flight: null, lastFlight: null,
    wobble: 0, tilt: 0, shake: 0, recoil: 0, bonusFlash: 0, collapse: false,
    parts: [], floats: [], trail: [], endReason: null, endTimer: 0,
    tower: G.layers.map((_, i) => i), sandwich: [], flyers: [], stuck: [], celebrate: 0, drag: null, hover: null, sandbox: false, pose: { k: 'idle', t: 0 }, log: []
  });
  refreshPreview();
}

function refreshPreview() {
  G.preview = simulate(G.angle, G.v, G.distance, G.tower.length);
}

function startGame(key) {
  newRound(key);
  G.phase = 'play';
  setFeedback('Let\'s go!', 'Build the ' + CFG.recipes[G.recipe].name.toLowerCase() + ': one of each of its ' + G.need.length + ' ingredients. Start with the ' + labelOf(G.layers[G.order[0]]) + '.', '');
  syncOverlays();
  lockControls(false);
}

function launch() {
  if (G.phase !== 'play' || G.flight) return;
  pose('fire', 0.55); sfx('launch');
  const sim = simulate(G.angle, G.v, G.distance, G.tower.length);
  G.flight = { sim, t: 0, charge: 0.12, angle: G.angle, v: G.v, D: G.distance, fired: false };
  G.trail = []; G.drag = null;
  lockControls(true);
}

function setCombo(n) { G.combo = n; }

function resolveShot(f) { resolveShot0(f); if (G.sandbox) { G.lives = CFG.lives; G.wrong = 0; G.timeLeft = G.timeMax; } }   /* tutorial sandbox: nothing is ever lost */
function resolveShot0(f) {
  const sim = f.sim, layers = G.layers, lh = CFG.layerHeight;
  const target = G.order[G.orderIdx], tl = layers[target];
  const left = f.D, right = f.D + CFG.towerWidth, top = G.tower.length * lh;
  const px = OX + sim.x * S, py = GROUND - sim.y * S;
  G.shots++; G.flight = null; G.lastFlight = sim.t;
  G.log.push({ angle: f.angle, v: f.v, D: f.D, n: G.tower.length, end: sim.end, ok: false });   /* quiz material */
  if (sim.end !== 'out') G.stuck.push({ x: px, y: py, rot: forkDir(f, sim.t), life: 0 });
  lockControls(false);

  if (sim.end === 'hit') {
    const L = layers[G.tower[sim.layer]];
    if (L.rotten) {
      /* rotten layer: lose lives at once (CFG.rottenLivesLost) and the tower falls */
      L.flash = 1; L.flashColor = '#7a8a2a';
      setCombo(0); G.lives = Math.max(0, G.lives - CFG.rottenLivesLost); G.wrong++;
      G.wobble = 0.09; G.shake = 12;
      burst(px, py, 22, ['#7a8a2a', '#5e3322', '#c9d86b']);
      float(px, py - 14, 'ROTTEN!', '#7a8a2a');
      setFeedback('Yuck, rotten!', 'Yuck! That ' + labelOf(L) + ' was rotten, so ' + (G.lives <= 0 ? 'all your lives are gone' : 'you lost ' + CFG.rottenLivesLost + ' lives') + '. Only hit the fresh layers.', 'bad');
      if (G.lives <= 0) endGame('rotten'); else if (G.wrong >= CFG.collapseAt) endGame('collapse');
      refreshPreview(); return;
    }
    if (G.need.includes(L.ing) && !L.done) {   /* any fresh layer of an ingredient still missing counts */
      /* correct layer */
      L.done = true; detach(L);   /* flies to the right plate, tower closes the gap */
      G.log[G.log.length - 1].ok = true;
      G.orderIdx++; G.hits++; setCombo(G.combo + 1);
      G.bestCombo = Math.max(G.bestCombo, G.combo);
      const bonus = G.combo >= CFG.comboFrom ? CFG.comboBonus : 0;
      const pts = CFG.pointsPerHit + bonus;
      G.score += pts; G.timeLeft += CFG.timeBonus; G.bonusFlash = 0.8;
      G.wobble = 0.05;
      burst(px, py, 26, ['#ffd23f', '#ffffff', '#62bb46']); ring(px, py);
      float(px, py - 14, '+' + pts, '#3f9a44');
      float(px, py - 42, '+' + CFG.timeBonus + ' s', '#5e3322');
      if (bonus) float(px, py - 70, 'COMBO x' + G.combo, '#c8321f');
      const vx = f.v * Math.cos(f.angle * Math.PI / 180);
      setFeedback('Nice shot!', 'You hit the ' + labelOf(L) + ' after ' + sim.t.toFixed(2) + ' s in the air. Sideways: x = vₓ · t = ' +
        vx.toFixed(1) + ' × ' + sim.t.toFixed(2) + ' = ' + sim.x.toFixed(1) + ' m.' + (bonus ? ' Combo bonus +' + bonus + '!' : ''), 'ok');
      G.need = G.need.filter(x => x !== L.ing); G.have.push(L.ing);
      if (!G.need.length && G.sandbox) { G.need = CFG.recipes[G.recipe].ingredients.slice(); G.have = []; G.sandwich = []; G.flyers = []; refill(); } else if (!G.need.length) endGame('win'); else refill();   /* new layer drops in, new ticket */
    } else {
      /* wrong layer */
      L.flash = 1; L.flashColor = '#c8321f';
      setCombo(0); G.lives--; G.wrong++;
      G.wobble = 0.09; G.shake = 10;
      burst(px, py, 18, ['#c8321f', '#5e3322', '#ffb703']);
      float(px, py - 14, 'Wrong layer', '#c8321f');
      let msg;
      if (L.done) {
        msg = 'The ' + labelOf(L) + ' is already on the sandwich. The order needs the ' + labelOf(tl) + '.';
      } else {
        const tc = (G.tower.indexOf(target) + 0.5) * lh, dy = sim.y - tc;
        msg = 'You hit the ' + labelOf(L) + (G.have.includes(L.ing) ? ', but you already have that one. ' : ', but it is not in this recipe. ') + 'The ticket asks for the ' + labelOf(tl) + '. The fork arrived at ' + sim.y.toFixed(1) +
          ' m and the ' + NAMES[tl.ing].toLowerCase() + ' sits near ' + tc.toFixed(1) + ' m, so it was ' + Math.abs(dy).toFixed(1) + ' m too ' +
          (dy > 0 ? 'high. Lower the angle or reduce the velocity.' : 'low. Raise the angle or add velocity.');
        if (L.rotten) msg = 'Yuck, that one was rotten. ' + msg;
      }
      setFeedback('Not that one', msg, 'bad');
      if (G.wrong >= CFG.collapseAt) endGame('collapse');
      else if (G.lives <= 0) endGame('lives');
    }
  } else {
    /* miss */
    setCombo(0); G.lives--; G.shake = 7;
    const land = landing(f.angle, f.v);
    let msg;
    if (land.x < left) {
      msg = 'The fork landed ' + land.x.toFixed(1) + ' m from the cannon, ' + (left - land.x).toFixed(1) + ' m short of the tower. Add velocity or raise the angle.';
      burst(OX + land.x * S, GROUND, 12, ['#c9e0e9', '#ffffff'], 120);
      setFeedback('Too little velocity', msg, 'bad');
    } else {
      const clear = heightAtX(f.angle, f.v, left) - top;
      msg = 'The fork overshot the tower by ' + (land.x - right).toFixed(1) + ' m and passed ' + Math.max(0, clear).toFixed(1) +
        ' m above the top. Reduce the velocity or lower the angle.';
      setFeedback('Too much velocity', msg, 'bad');
    }
    float(clamp(px, 60, W - 80), clamp(py, 60, GROUND - 20), 'Miss', '#c8321f');
    if (G.lives <= 0) endGame('lives');
  }
  refreshPreview();
}

function endGame(reason) {
  if (G.phase !== 'play' || G.sandbox) return;
  G.phase = 'ending'; G.endReason = reason; G.flight = null;
  sfx(reason === 'win' ? 'win' : 'lose', 0, reason === 'collapse' || reason === 'rotten' ? 0.8 : 0);
  G.endTimer = (reason === 'collapse' || reason === 'rotten') ? 2.1 : (reason === 'win' ? 2.6 : 0.9);
  if (reason === 'collapse' || reason === 'rotten') startCollapse();
  if (reason === 'win') {
    G.finish = { t: Math.round(G.timeLeft) * CFG.finishBonusPerSecond, l: G.lives * CFG.finishBonusPerLife };
    G.score += G.finish.t + G.finish.l; confetti(); G.celebrate = 0.001;
    setFeedback('Sandwich done!', 'Sandwich complete! Finish bonus: +' + (G.finish.t + G.finish.l) + ' points.', 'ok');
  }
  if (reason === 'time') setFeedback('Time is up', 'The clock ran out. Check the end screen for your score.', 'bad');
  if (reason === 'lives') setFeedback('Out of lives', 'All three lives are gone.', 'bad');
  if (reason === 'collapse') setFeedback('The tower is falling!', 'Three wrong layers knocked the sandwich off balance.', 'bad');
  lockControls(true);
}

function startCollapse() {
  G.collapse = true; G.shake = 16; sfx('collapse');
  const cx = towerCX(), h = CFG.layerHeight * S;
  G.tower.forEach((li, i) => {
    const L = G.layers[li];
    L.fall = { x: cx, y: GROUND - (L.h + 0.5) * h, rot: G.tilt, vx: rand(50, 130) + i * 24, vy: -rand(60, 220), vr: rand(0.7, 2.3) * (i % 2 ? 1 : -1) };
  });
  burst(cx, GROUND - 30, 40, ['#ffffff', '#c9e0e9', '#ffb703'], 260);
}

/* ===================================================================
   5. PARTICLES, FLOATING TEXT
   =================================================================== */
function burst(x, y, n, colors, speed) {
  speed = speed || 230;
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2), s = rand(0.3, 1) * speed;
    G.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80, life: 0, max: rand(0.45, 0.95), size: rand(2.5, 5.5), color: pick(colors) });
  }
}
function confetti() {
  for (let i = 0; i < 70; i++) {
    G.parts.push({ x: rand(100, W - 100), y: rand(-30, 40), vx: rand(-60, 60), vy: rand(40, 160), life: 0, max: rand(1.4, 2.4), size: rand(4, 7), color: pick(['#ffb703', '#c8321f', '#62bb46', '#5e3322', '#ffffff']) });
  }
}
function float(x, y, text, color) { G.floats.push({ x, y, text, color, life: 0, max: 1.4 }); }

/* ===================================================================
   6. UPDATE LOOP
   =================================================================== */
function updateWorld(dt) {
  if (G.phase === 'play') {
    if (!G.sandbox) G.timeLeft -= dt;
    { const sec = Math.ceil(G.timeLeft); if (!G.sandbox && sec <= 10 && sec > 0 && sec !== G.tickSec) { G.tickSec = sec; sfx('tick'); } }   /* last 10 seconds */
    if (G.timeLeft <= 0) { G.timeLeft = 0; endGame('time'); }
  }
  if (G.flight) {
    const f = G.flight;
    if (f.charge > 0) {
      f.charge -= dt;
      if (f.charge <= 0 && !f.fired) {
        f.fired = true; G.recoil = 1;
        const th = f.angle * Math.PI / 180;
        burst(OX + Math.cos(th) * 66, OY - Math.sin(th) * 66, 14, ['#ffb703', '#ffffff', '#c8321f'], 200);
      }
    } else {
      f.t += dt;
      const bx = OX + f.v * Math.cos(f.angle * Math.PI / 180) * Math.min(f.t, f.sim.t) * S;
      const by = GROUND - heightAtX2(f, Math.min(f.t, f.sim.t)) * S;
      G.trail.push([bx, by]); if (G.trail.length > 16) G.trail.shift();
      if (f.t >= f.sim.t) resolveShot(f);
    }
  }
  updatePlate2(dt);
  if (G.pose.t > 0 && (G.pose.t -= dt) <= 0) G.pose.k = 'idle';
  if (G.fx) { G.fx.forEach(f => { f.t += dt; }); G.fx = G.fx.filter(f => f.t < 0.7); }
  /* tower motion */
  G.wobble *= Math.exp(-dt * 3.2);
  G.tilt = G.wrong * 0.014;
  G.shake *= Math.exp(-dt * 7);
  G.recoil *= Math.exp(-dt * 9);
  G.bonusFlash = Math.max(0, G.bonusFlash - dt);
  G.layers.forEach(L => {
    L.flash = Math.max(0, L.flash - dt * 2.2);
    const ti = G.tower.indexOf(G.layers.indexOf(L));   /* layers above a removed one drop down */
    if (ti >= 0 && L.h > ti) { L.vh += 40 * dt; L.h = REDUCED ? ti : Math.max(ti, L.h - L.vh * dt); if (L.h === ti) L.vh = 0; } else if (ti >= 0) L.h = ti;
    if (L.fall) {
      const f = L.fall, floor = GROUND - 14;
      f.vy += 1500 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vr * dt;
      if (f.y > floor) { f.y = floor; f.vy = -f.vy * 0.35; f.vx *= 0.7; f.vr *= 0.7; if (Math.abs(f.vy) < 40) f.vy = 0; }
    }
  });
  for (let i = G.parts.length - 1; i >= 0; i--) {
    const p = G.parts[i]; p.life += dt;
    p.vy += 600 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.life >= p.max) G.parts.splice(i, 1);
  }
  for (let i = G.floats.length - 1; i >= 0; i--) {
    const q = G.floats[i]; q.life += dt; q.y -= 38 * dt;
    if (q.life >= q.max) G.floats.splice(i, 1);
  }
  if (G.phase === 'ending') {
    G.endTimer -= dt;
    if (G.endTimer <= 0) { G.phase = 'ended'; showEnd(); }
  }
}
function heightAtX2(f, t) {
  const th = f.angle * Math.PI / 180;
  return CFG.muzzleHeight + f.v * Math.sin(th) * t - 0.5 * CFG.gravity * t * t;
}

let lastStamp = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - lastStamp) / 1000);
  lastStamp = now;
  if (G.phase !== 'paused') updateWorld(dt);
  render(now / 1000);
  updateHud();
  requestAnimationFrame(frame);
}

/* ===================================================================
   7. RENDERING
   =================================================================== */
const cloth = (() => {   /* pink gingham tablecloth */
  const p = document.createElement('canvas'); p.width = p.height = 40;
  const c = p.getContext('2d');
  c.fillStyle = '#fff7f0'; c.fillRect(0, 0, 40, 40);
  c.fillStyle = 'rgba(235,110,125,.34)'; c.fillRect(0, 0, 20, 40); c.fillRect(0, 0, 40, 20);
  return ctx.createPattern(p, 'repeat');
})();

function drawBackground(c) {
  const g = c.createLinearGradient(0, 0, 0, GROUND); g.addColorStop(0, '#fff1d6'); g.addColorStop(1, '#ffd9c4'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.fillStyle = '#cfeee6'; c.fillRect(0, GROUND - 5 * S, W, 5 * S);   /* mint tile backsplash */
  /* tiled kitchen wall: the tile lines double as the metre grid */
  c.lineWidth = 1;
  for (let x = OX % S; x <= W; x += S) {
    const major = Math.round((x - OX) / S) % 5 === 0;
    c.strokeStyle = major ? '#e0b676' : '#f1d3a4';
    c.beginPath(); c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, GROUND); c.stroke();
  }
  for (let y = GROUND; y >= 0; y -= S) {
    const major = Math.round((GROUND - y) / S) % 5 === 0;
    c.strokeStyle = major ? '#e0b676' : '#f1d3a4';
    c.beginPath(); c.moveTo(0, y + 0.5); c.lineTo(W, y + 0.5); c.stroke();
  }
  c.fillStyle = '#7a5a44'; c.font = '500 11px "DM Mono", monospace'; c.textAlign = 'left';
  for (let k = 5; k <= 15; k += 5) c.fillText(k + ' m', 6, GROUND - k * S - 4);
  kitchenWindow(c, 175, 120, 110, 140);               /* sunny window */
  drawUtensils(c, 560, 64); drawHerbPot(c, 190, GROUND);
  /* warm string lights */
  const cols = ['#ffd23f', '#ff7b5f', '#fff3dc', '#8fd36a'];
  c.strokeStyle = '#5e3322'; c.lineWidth = 1.5; c.beginPath();
  for (let i = 0; i <= 56; i++) { const x = i * W / 56, y = 6 + Math.sin(i / 56 * Math.PI * 4) * 6 + 8; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  for (let i = 0; i <= 28; i++) { const x = i * W / 28, y = 6 + Math.sin(i / 28 * Math.PI * 4) * 6 + 8; c.globalAlpha = 0.3; c.fillStyle = cols[i % 4]; dot(c, x, y + 6, 8); c.globalAlpha = 1; dot(c, x, y + 6, 4); }
  /* wooden counter */
  c.fillStyle = cloth; c.fillRect(0, GROUND, W, H - GROUND);
  c.fillStyle = '#5e3322'; c.fillRect(0, GROUND - 1, W, 4);

  /* ruler */
  const ry = GROUND + 8;
  c.fillStyle = '#ffe08a'; c.strokeStyle = '#5e3322'; c.lineWidth = 2;
  rr(c, OX, ry, W - OX - 12, 28, 4); c.fill(); c.stroke();
  c.fillStyle = '#5e3322'; c.textAlign = 'center'; c.font = '500 11px "DM Mono", monospace';
  for (let k = 0; OX + k * S < W - 14; k++) {
    const x = OX + k * S, len = k % 5 === 0 ? 13 : 6;
    c.fillRect(x - 0.75, ry, 1.5, len);
    if (k % 5 === 0) c.fillText(k === 0 ? '0 m' : String(k), x + (k === 0 ? 10 : 0), ry + 25);
  }
  c.textAlign = 'left';
}

function drawDimension(c) {
  const y = GROUND + 52, x0 = OX, x1 = OX + G.distance * S;
  c.save(); c.globalAlpha = 0.55; c.fillStyle = '#ffb703'; c.fillRect(x0, GROUND + 8, x1 - x0, 28); c.restore();   /* ruler highlight */
  c.strokeStyle = '#5e3322'; c.fillStyle = '#5e3322'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
  [[x0, 1], [x1, -1]].forEach(a => {
    c.beginPath(); c.moveTo(a[0], y); c.lineTo(a[0] + a[1] * 9, y - 5); c.lineTo(a[0] + a[1] * 9, y + 5); c.closePath(); c.fill();
    c.fillRect(a[0] - 1, y - 9, 2, 18);
  });
  const label = 'd = ' + G.distance.toFixed(1) + ' m';
  c.font = '600 13px "DM Mono", monospace';
  const tw = c.measureText(label).width + 14, mx = (x0 + x1) / 2;
  rr(c, mx - tw / 2, y - 10, tw, 20, 6); c.fillStyle = '#ffffff'; c.fill(); c.stroke();
  c.fillStyle = '#5e3322'; c.textAlign = 'center'; c.fillText(label, mx, y + 4.5); c.textAlign = 'left';
}

function drawPreview(c) {
  if (G.previewMode === 'off' || !G.preview || G.phase !== 'play' || G.flight) return;
  const pts = G.preview.pts, total = pts.length / 2;
  const limit = G.previewMode === 'short' ? Math.floor(total * 0.4) : total;
  c.fillStyle = 'rgba(23,38,59,.7)';
  for (let i = 12; i < limit; i += 14) dot(c, OX + pts[i * 2] * S, GROUND - pts[i * 2 + 1] * S, 3);
  if (G.previewMode === 'full' && G.preview.end !== 'out') {
    const ex = OX + G.preview.x * S, ey = GROUND - G.preview.y * S;
    c.strokeStyle = '#c8321f'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(ex - 6, ey - 6); c.lineTo(ex + 6, ey + 6); c.moveTo(ex + 6, ey - 6); c.lineTo(ex - 6, ey + 6); c.stroke();
  }
}

function drawCannon(c) {
  const th = G.angle * Math.PI / 180;
  c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = '#5e3322';
  /* stand and carriage */
  c.fillStyle = '#8a5a34';
  c.beginPath(); c.moveTo(OX - 16, GROUND - 26); c.lineTo(OX + 16, GROUND - 26); c.lineTo(OX + 8, OY); c.lineTo(OX - 8, OY); c.closePath(); c.fill(); c.stroke();
  rr(c, OX - 36, GROUND - 28, 72, 22, 8); c.fill(); c.stroke();
  c.fillStyle = '#5e3322'; dot(c, OX - 20, GROUND - 10, 11); dot(c, OX + 20, GROUND - 10, 11);
  c.fillStyle = '#ffb703'; dot(c, OX - 20, GROUND - 10, 4); dot(c, OX + 20, GROUND - 10, 4);
  /* barrel */
  c.save(); c.translate(OX, OY); c.rotate(-th);
  const off = -G.recoil * 9, L = 64, T = 28;
  rr(c, off - 8, -T / 2, L + 8, T, 8); c.fillStyle = '#b8652a'; c.fill(); c.stroke();
  c.fillStyle = '#e59a55'; c.fillRect(off + 2, -T / 2 + 4, L - 14, 5);
  rr(c, off + L - 8, -T / 2 - 4, 13, T + 8, 4); c.fillStyle = '#f2c36b'; c.fill(); c.stroke();
  c.fillStyle = '#8a4a1f'; rr(c, off + 12, -T / 2 - 9, 24, 9, 4); c.fill(); c.stroke(); rr(c, off + 12, T / 2, 24, 9, 4); c.fill(); c.stroke();   /* pot handles */
  c.fillStyle = '#f2c36b'; dot(c, off + 6, 0, 2.5); dot(c, off + 44, -5, 2.5); dot(c, off + 44, 5, 2.5);
  c.restore();
  c.fillStyle = '#ffb703'; dot(c, OX, OY, 10); c.stroke();
  c.beginPath(); c.arc(OX, OY, 10, 0, 6.28); c.stroke();
}

function drawBall(c, x, y) {
  const r = CFG.ballRadius * S;
  c.fillStyle = '#3d3d1c'; c.strokeStyle = '#5e3322'; c.lineWidth = 2.5;
  c.beginPath(); c.arc(x, y, r, 0, 6.28); c.fill(); c.stroke();
  c.fillStyle = '#8c8a3c'; dot(c, x - r * 0.35, y - r * 0.35, r * 0.28);
  c.fillStyle = '#c8321f'; c.beginPath(); c.ellipse(x + r * 0.3, y + r * 0.15, r * 0.34, r * 0.24, 0.5, 0, 6.28); c.fill();
}

function drawTower(c, time) {
  const n = G.layers.length, w = CFG.towerWidth * S, h = CFG.layerHeight * S, cx = towerCX();
  /* plate */
  c.fillStyle = '#ffffff'; c.strokeStyle = '#5e3322'; c.lineWidth = 3;
  c.beginPath(); c.ellipse(cx, GROUND + 2, w * 0.64, 10, 0, 0, 6.28); c.fill(); c.stroke();

  if (!G.collapse) {
    const tilt = G.tilt + (REDUCED ? 0 : Math.sin(time * 24) * G.wobble);
    c.save(); c.translate(cx, GROUND); c.rotate(tilt);
    G.tower.forEach(li => {
      const L = G.layers[li], k = L.h;
      const x = -w / 2, y = -(k + 1) * h;
      c.save(); if (!REDUCED) { c.translate(x + w / 2, y + h / 2); c.rotate(Math.sin(time * 1.6 + li) * 0.012); c.translate(-x - w / 2, -y - h / 2); }   /* soft wobble */
      drawIngredient(c, L.ing, L.rotten, x, y, w, h); c.restore();
      if (L.done) {
        c.globalAlpha = 0.38; c.fillStyle = '#ffffff'; rr(c, x - 4, y + 1, w + 8, h - 2, 8); c.fill(); c.globalAlpha = 1;
        c.fillStyle = '#3f9a44'; c.strokeStyle = '#5e3322'; c.lineWidth = 2.5;
        c.beginPath(); c.arc(x + w - 18, y + h / 2, 11, 0, 6.28); c.fill(); c.stroke();
        c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.lineCap = 'round';
        c.beginPath(); c.moveTo(x + w - 23, y + h / 2); c.lineTo(x + w - 19, y + h / 2 + 4); c.lineTo(x + w - 12, y + h / 2 - 4); c.stroke(); c.lineCap = 'butt';
      }
      if (L.flash > 0) {
        c.globalAlpha = L.flash * 0.7; c.fillStyle = L.flashColor; rr(c, x - 4, y + 1, w + 8, h - 2, 8); c.fill(); c.globalAlpha = 1;
      }
    });
    G.tower.forEach(li => { const L = G.layers[li]; if (L.rotten) drawRottenFx(c, -w / 2, -(L.h + 1) * h, w, h, time); });
    /* marker for the layer on the ticket */
    if (G.phase === 'play' && G.orderIdx < G.order.length && !hideArrow) {
      const t = G.order[G.orderIdx], bob = REDUCED ? 0 : Math.sin(time * 5) * 4;
      const mx = -w / 2 - 28 + bob, my = -(G.layers[t].h + 0.5) * h;
      c.fillStyle = '#ffb703'; c.strokeStyle = '#5e3322'; c.lineWidth = 2.5;
      c.beginPath(); c.moveTo(mx, my - 11); c.lineTo(mx + 18, my); c.lineTo(mx, my + 11); c.closePath(); c.fill(); c.stroke();
    }
    c.restore();
  } else {
    G.layers.forEach(L => {
      const f = L.fall; if (!f) return;
      c.save(); c.translate(f.x, f.y); c.rotate(f.rot);
      drawIngredient(c, L.ing, L.rotten, -w / 2, -h / 2, w, h);
      c.restore();
    });
  }
}

function render(time) {
  const c = ctx;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.save();
  if (G.shake > 0.3 && !REDUCED) c.translate(rand(-G.shake, G.shake) * 0.5, rand(-G.shake, G.shake) * 0.5);
  drawBackground(c);
  drawDimension(c);
  drawPreview(c);
  /* fork trail and ball sit under the cannon so it leaves the barrel */
    if (G.flight && G.flight.charge <= 0) {
    G.trail.forEach((p, i) => { c.globalAlpha = (i + 1) / G.trail.length * 0.45; c.fillStyle = '#b89a82'; dot(c, p[0], p[1], 3 + i * 0.12); });
    c.globalAlpha = 1;
    const f = G.flight, tt = Math.min(f.t, f.sim.t);
    const fx = OX + f.v * Math.cos(f.angle * Math.PI / 180) * tt * S, fy = GROUND - heightAtX2(f, tt) * S;
    if (Math.hypot(fx - OX, fy - OY) >= 34) drawFork(c, fx, fy, forkDir(f, tt) + Math.sin(tt * 9) * 0.3);   /* comes out of the barrel */
  }
  drawCharacter(c, 26, GROUND - 2, 0.8, look, G.pose.k, time);
  drawCannon(c);
  drawTower(c, time);
  drawPlate2(c, time); drawFlyers(c); drawStuck(c); drawFx(c); drawHandles(c, time);
  G.parts.forEach(p => {
    c.globalAlpha = clamp(1 - p.life / p.max, 0, 1); c.fillStyle = p.color;
    c.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  });
  c.globalAlpha = 1;
  c.font = '700 24px \"Baloo 2\", "Trebuchet MS", sans-serif'; c.textAlign = 'center'; c.lineJoin = 'round';
  G.floats.forEach(q => {
    c.globalAlpha = clamp(1 - (q.life / q.max) * (q.life / q.max), 0, 1);
    c.lineWidth = 5; c.strokeStyle = '#ffffff'; c.strokeText(q.text, q.x, q.y);
    c.fillStyle = q.color; c.fillText(q.text, q.x, q.y);
  });
  c.globalAlpha = 1; c.textAlign = 'left';
  c.restore();
}
/* ===================================================================
   8. INTERFACE: HUD, CONTROLS, MENUS
   =================================================================== */
const $ = id => document.getElementById(id);
const el = {
  timer: $('timerCard'), time: $('timeText'), bar: $('timeBar'), score: $('scoreText'),
  combo: $('comboText'), comboSub: $('comboSub'), hearts: $('hearts'), wrongSub: $('wrongSub'),
  orderIcon: $('orderIcon'), orderName: $('orderName'), pips: $('pips'),
  feedback: $('feedback'), paused: $('pausedSheet'), end: $('end'),
  pauseBtn: $('pauseBtn'), launchBtn: $('launchBtn'), previewBtn: $('previewBtn'), controls: $('controls')
};
const hud = {};           /* last values written, so the DOM is only touched on change */
function setText(node, key, value) { if (hud[key] !== value) { hud[key] = value; node.textContent = value; } }

function fmtTime(s) {
  s = Math.max(0, Math.ceil(s));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

let fbTimer = 0;
function setFeedback(lead, text, kind) {
  if (kind === 'ok') { pose('cheer', 1.4); if (!/done/i.test(lead)) sfx('hit', G.combo); } else if (kind === 'bad') { pose('wince', 1.2); if (/rotten/i.test(lead)) sfx('rotten'); else if (/velocity/i.test(lead)) sfx('thud'); else if (!/falling|lives|time is up/i.test(lead)) sfx('wrong'); }
  el.feedback.className = 'feedback show' + (kind ? ' ' + kind : '');
  el.feedback.innerHTML = '';
  const b = document.createElement('b'); b.textContent = lead;
  const s = document.createElement('span'); s.textContent = text;
  el.feedback.append(b, s);
  clearTimeout(fbTimer); fbTimer = setTimeout(() => el.feedback.classList.remove('show'), 7000);
}

const HEART = '<svg viewBox="0 0 24 22" aria-hidden="true"><path d="M12 20.5S2.5 14.8 2.5 8.4A5.3 5.3 0 0 1 12 5.6a5.3 5.3 0 0 1 9.5 2.8c0 6.4-9.500 12.100-9.500 12.100z" fill="FILL" stroke="#5e3322" stroke-width="2" stroke-linejoin="round"/></svg>';

function updateHud() {
  const low = G.phase === 'play' && G.timeLeft <= 10;
  el.timer.classList.toggle('low', low);
  el.timer.classList.toggle('bonus', G.bonusFlash > 0);
  setText(el.time, 'time', fmtTime(G.timeLeft));
  const pct = Math.round(clamp(G.timeLeft / G.timeMax, 0, 1) * 100) + '%';
  if (hud.bar !== pct) { hud.bar = pct; el.bar.style.width = pct; }
  setText(el.score, 'score', String(G.score));
  setText(el.combo, 'combo', String(G.combo));
  setText(el.comboSub, 'comboSub', G.combo >= CFG.comboFrom ? 'Bonus +' + CFG.comboBonus + ' active' : (G.combo === CFG.comboFrom - 1 ? 'Next hit: bonus' : ' '));
  setText(el.wrongSub, 'wrongSub', G.wrong ? 'Wrong layers ' + G.wrong + '/' + CFG.collapseAt : ' ');
  const hk = 'hearts' + G.lives;
  if (hud.hearts !== hk) {
    hud.hearts = hk; let html = '';
    for (let i = 0; i < CFG.lives; i++) html += HEART.replace('FILL', i < G.lives ? '#c8321f' : '#ffffff');
    el.hearts.innerHTML = html;
    el.hearts.setAttribute('aria-label', G.lives + ' lives left');
  }
  /* order ticket */
  const idx = G.orderIdx, done = G.orderIdx >= G.order.length;
  const ok = 'order' + G.mode + idx + G.phase + G.order.join('') + G.have.join() + G.recipe;
  if (hud.order !== ok) {
    hud.order = ok;
    const L = done ? null : G.layers[G.order[idx]];
    drawIcon(el.orderIcon, L);
    el.orderName.textContent = done ? 'All done!' : labelCap(L);
    el.orderName.classList.toggle('rot', !!(L && L.rotten));
    el.pips.innerHTML = '';
    CFG.recipes[G.recipe].ingredients.forEach(ing => {   /* recipe checklist */
      const got = G.have.includes(ing), cv = document.createElement('canvas'); cv.width = 84; cv.height = 34; cv.className = 'ri' + (got ? ' got' : ''); cv.title = NAMES[ing];
      const x = cv.getContext('2d'); x.setTransform(0.72, 0, 0, 0.72, 0, 0); drawIngredient(x, ing, false, 8, 0, 104, 45);
      if (got) { x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = '#3f9a44'; x.strokeStyle = '#5e3322'; x.lineWidth = 2.5; dot(x, 42, 17, 11); x.beginPath(); x.arc(42, 17, 11, 0, 6.28); x.stroke(); x.strokeStyle = '#fff'; x.lineWidth = 3; x.beginPath(); x.moveTo(36, 17); x.lineTo(41, 22); x.lineTo(49, 11); x.stroke(); }
      el.pips.appendChild(cv);
    });
  }
  el.launchBtn.disabled = !(G.phase === 'play' && !G.flight);
  el.pauseBtn.disabled = G.phase !== 'play' || G.sandbox;
}

/* ---- controls ---- */
const CONTROLS = [
  { id: 'angle',    label: 'Angle',        unit: '°',    min: CFG.angle.min,    max: CFG.angle.max,    step: CFG.angle.step,    dec: 0 },
  { id: 'force',    label: 'Force',        unit: 'N',    min: Math.ceil(LIM.force[0]), max: Math.floor(LIM.force[1]), step: 1,  dec: 1 },
  { id: 'accel',    label: 'Acceleration', unit: 'm/s²', min: LIM.accel[0],     max: LIM.accel[1],     step: 0.5,               dec: 1 },
  { id: 'distance', label: 'Distance',     unit: 'm',    min: CFG.distance.min, max: CFG.distance.max, step: CFG.distance.step, dec: 1 },
  { id: 'velocity', label: 'Velocity',     unit: 'm/s',  min: CFG.velocity.min, max: CFG.velocity.max, step: CFG.velocity.step, dec: 1 }
];
const ctl = {};
function buildControls() {
  CONTROLS.forEach(d => {
    const wrap = document.createElement('div'); wrap.className = 'ctl';
    wrap.innerHTML =
      '<div class="head"><label for="in-' + d.id + '">' + d.label + '</label><span class="v" id="v-' + d.id + '"></span></div>' +
      '<div class="row"><button class="btn step" type="button" data-id="' + d.id + '" data-dir="-1" aria-label="Decrease ' + d.label.toLowerCase() + '">−</button>' +
      '<input type="range" id="in-' + d.id + '" min="' + d.min + '" max="' + d.max + '" step="' + d.step + '">' +
      '<button class="btn step" type="button" data-id="' + d.id + '" data-dir="1" aria-label="Increase ' + d.label.toLowerCase() + '">+</button></div>';
    el.controls.appendChild(wrap);
    ctl[d.id] = { def: d, input: wrap.querySelector('input'), out: wrap.querySelector('.v'), btns: wrap.querySelectorAll('button') };
    ctl[d.id].input.addEventListener('input', () => applyControl(d.id, parseFloat(ctl[d.id].input.value)));
  });
  el.controls.querySelectorAll('.step').forEach(b => {
    let timer = null, rep = null;
    const nudge = () => {
      const c = ctl[b.dataset.id], d = c.def, dir = parseFloat(b.dataset.dir);
      const val = clamp(parseFloat(c.input.value) + dir * d.step, d.min, d.max);
      c.input.value = val; applyControl(d.id, val);
    };
    const stop = () => { clearTimeout(timer); clearInterval(rep); timer = rep = null; };
    b.addEventListener('pointerdown', e => { if (b.disabled) return; e.preventDefault(); nudge(); timer = setTimeout(() => { rep = setInterval(nudge, 70); }, 380); });
    ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach(ev => b.addEventListener(ev, stop));
    b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nudge(); } });
  });
}

function applyControl(id, val) {
  const vmin = CFG.velocity.min, vmax = CFG.velocity.max;
  if (id === 'angle') G.angle = val;
  else if (id === 'distance') G.distance = val;
  else if (id === 'velocity') G.v = val;
  else if (id === 'force') G.v = clamp(speedFromForce(val), vmin, vmax);
  else if (id === 'accel') G.v = clamp(speedFromAccel(val), vmin, vmax);
  syncControls(id);
  refreshPreview();
  updateLab();
}

function syncControls(skip) {
  const values = {
    angle: G.angle, distance: G.distance, velocity: G.v,
    force: forceOf(G.v), accel: accelOf(G.v)
  };
  CONTROLS.forEach(d => {
    const c = ctl[d.id], v = values[d.id];
    if (d.id !== skip) c.input.value = v;
    const shown = d.id === 'angle' ? Math.round(v) : v.toFixed(d.dec);
    c.out.textContent = shown + ' ' + d.unit;
    c.input.style.setProperty('--p', ((parseFloat(c.input.value) - d.min) / (d.max - d.min) * 100) + '%');
  });
}

function lockControls(locked) {
  Object.keys(ctl).forEach(k => { ctl[k].input.disabled = locked; ctl[k].btns.forEach(b => { b.disabled = locked; }); });
}

function updateLab() {
  const th = G.angle * Math.PI / 180, a = accelOf(G.v), F = forceOf(G.v);
  const vx = G.v * Math.cos(th), vy = G.v * Math.sin(th), t = G.distance / vx;
  $('rdA').textContent = a.toFixed(1) + ' m/s²';
  $('rdAf').textContent = 'a = ' + F.toFixed(1) + ' ÷ ' + CFG.mass + ' (F ÷ m)';
  $('rdV').textContent = G.v.toFixed(1) + ' m/s';
  $('rdVf').textContent = 'v = √(2 × ' + a.toFixed(1) + ' × ' + CFG.barrel + ')';
  $('rdVx').textContent = vx.toFixed(1) + ' m/s';
  $('rdVxf').textContent = 'vₓ = ' + G.v.toFixed(1) + ' × cos ' + Math.round(G.angle) + '°';
  $('rdVy').textContent = vy.toFixed(1) + ' m/s';
  $('rdVyf').textContent = 'v_y = ' + G.v.toFixed(1) + ' × sin ' + Math.round(G.angle) + '°';
  $('rdT').textContent = t.toFixed(2) + ' s';
  $('rdTf').textContent = 't = ' + G.distance.toFixed(1) + ' ÷ ' + vx.toFixed(1) + ' (d ÷ vₓ)';
}
/* the "last flight" box refreshes whenever a shot lands */
function updateLast() {
  $('rdLast').textContent = G.lastFlight == null ? 'none yet' : G.lastFlight.toFixed(2) + ' s';
}

/* ---- overlays and menus ---- */
let chosenMode = 'medium', chosenRecipe = 'pbj';
function syncOverlays() {
  el.paused.hidden = G.phase !== 'paused';
  el.end.hidden = G.phase !== 'ended';
}

const BEST_KEY = 'breadjectory-best';
function readBest() { try { return JSON.parse(localStorage.getItem(BEST_KEY)) || {}; } catch (e) { return {}; } }
function writeBest(b) { try { localStorage.setItem(BEST_KEY, JSON.stringify(b)); } catch (e) { /* storage unavailable */ } }

function showEnd() {
  const win = G.endReason === 'win';
  const titles = { win: 'Sandwich complete!', time: "Time's up!", lives: 'Out of lives', collapse: 'The tower collapsed!', rotten: 'Rotten!' };
  const texts = {
    win: 'Great job! Every ingredient is on the plate.',
    rotten: 'You hit a rotten layer and lost all your lives.',
    time: 'The clock ran out before the sandwich was done.',
    lives: 'Three misses or wrong layers is the limit.',
    collapse: 'Three wrong layers knocked the whole sandwich over.'
  };
  $('endTitle').textContent = titles[G.endReason];
  $('endText').textContent = texts[G.endReason];
  const best = readBest(), prev = best[G.mode] || 0, isBest = G.score > prev;
  if (isBest) { best[G.mode] = G.score; writeBest(best); }
  const acc = G.shots ? Math.round(G.hits / G.shots * 100) + '%' : '0%';
  if (G.score <= 0 && !win) $('endLb').textContent = 'No points this round, so nothing was saved.';
  else {
  $('endLb').textContent = 'Saving your score…';
  lbSubmit({ name: playerName || 'Player', mode: G.mode, score: G.score, acc: G.shots ? Math.round(G.hits / G.shots * 100) : 0, date: new Date().toISOString(), nohint: hideArrow, recipe: G.recipe })
    .then(() => { $('endLb').textContent = (LB.db && !LB.warn) ? 'Score saved to the shared leaderboard.' : 'Score saved on this device only.'; if (!scr.lb.hidden) renderLB(); });
  }
  const rows = [
    ['Score', String(G.score) + (isBest && G.score > 0 ? '<span class="newbest">New best</span>' : '')],
    ['Accuracy', acc + ' (' + G.hits + '/' + G.shots + ')'],
    ['Layers stacked', String(G.hits)],
    ...(win ? [['Finish bonus', '+' + (G.finish.t + G.finish.l)]] : []),
    ['Best streak', String(G.bestCombo)],
    [win ? 'Time left' : 'Best score', win ? fmtTime(G.timeLeft) : String(Math.max(prev, G.score))]
  ];
  $('endGrid').innerHTML = rows.map(r => '<div><small class="label">' + r[0] + '</small><b>' + r[1] + '</b></div>').join('');
  syncOverlays();
  paintChars(win ? 'cheer' : 'wince');
  openQuiz();   /* the quiz is part of every real round */
}

function togglePause() {
  if (G.phase === 'play') { G.phase = 'paused'; }
  else if (G.phase === 'paused') { G.phase = 'play'; lastStamp = performance.now(); }
  else return;
  el.pauseBtn.textContent = G.phase === 'paused' ? 'Resume' : 'Pause';
  syncOverlays();
}

function setPreview(mode) {
  G.previewMode = mode;
  el.previewBtn.textContent = 'Preview: ' + mode.charAt(0).toUpperCase() + mode.slice(1);
}

/* ===================================================================
   9. SECOND PLATE: hit layers fly here and stack in the order hit
   =================================================================== */
function detach(L) {
  const h = CFG.layerHeight * S, slot = G.sandwich.length + G.flyers.length;
  G.flyers.push({ L, t: 0, dur: REDUCED ? 0.25 : 0.85, x0: towerCX(), y0: GROUND - (L.h + 0.5) * h,
    x1: P2X, y1: GROUND - (slot + 0.5) * h * plateSc(slot + 1), arc: REDUCED ? 0 : 150 });
  G.tower = G.tower.filter(i => G.layers[i] !== L);   /* layers above drop down in updateWorld */
}
function updatePlate2(dt) {
  if (G.celebrate) G.celebrate += dt;
  for (let i = G.flyers.length - 1; i >= 0; i--) {
    const f = G.flyers[i]; f.t += dt;
    if (f.t >= f.dur) { G.flyers.splice(i, 1); G.sandwich.push({ L: f.L, b: 1 }); burst(f.x1, f.y1, 10, ['#ffd23f', '#ffffff'], 140); ring(f.x1, f.y1); sfx('pop'); }
  }
  G.sandwich.forEach(s => { s.b *= Math.exp(-dt * 9); });
  for (let i = G.stuck.length - 1; i >= 0; i--) { G.stuck[i].life += dt; if (G.stuck[i].life > 1) G.stuck.splice(i, 1); }
  if (G.celebrate && !REDUCED && Math.random() < dt * 8) burst(P2X + rand(-60, 60), GROUND - rand(60, 260), 3, ['#ffb703', '#ffffff', '#c8321f', '#62bb46'], 100);
}
function drawPlate2(c, time) {
  const w = CFG.towerWidth * S, h = CFG.layerHeight * S;
  c.fillStyle = '#ffffff'; c.strokeStyle = '#5e3322'; c.lineWidth = 3;
  c.beginPath(); c.ellipse(P2X, GROUND + 2, w * 0.64, 10, 0, 0, 6.28); c.fill(); c.stroke();
  if (!G.sandwich.length && !G.flyers.length) {
    c.fillStyle = '#7a5a44'; c.font = '600 13px "Baloo 2", sans-serif'; c.textAlign = 'center';
    c.fillText('YOUR SANDWICH', P2X, GROUND - 14); c.textAlign = 'left';
  }
  G.sandwich.forEach((s, i) => {
    const hop = G.celebrate && !REDUCED ? -Math.abs(Math.sin(time * 7 - i * 0.55)) * 16 : 0;
    const sc = plateSc(G.sandwich.length + G.flyers.length);
    c.save(); c.translate(P2X, GROUND - (i + 0.5) * h * sc + hop * sc); c.scale(sc * (1 + 0.08 * s.b), sc * (1 - 0.14 * s.b));
    drawIngredient(c, s.L.ing, s.L.rotten, -w / 2, -h / 2, w, h); c.restore();
  });
  if (G.celebrate && G.phase !== 'play') {   /* the finished sandwich gets its top bread slice */
    const n = G.sandwich.length, sc = plateSc(n + 1), k = clamp(G.celebrate / 0.4, 0, 1), hop = REDUCED ? 0 : -Math.abs(Math.sin(time * 7 - n * 0.55)) * 16;
    c.save(); c.translate(P2X, GROUND - (n + 0.5) * h * sc + hop * sc - (1 - k) * 140); c.scale(sc, sc);
    drawIngredient(c, 'bread', false, -w / 2, -h / 2, w, h); c.restore();
  }
}
function drawFlyers(c) {
  const w = CFG.towerWidth * S, h = CFG.layerHeight * S;
  G.flyers.forEach(f => {
    const k = Math.min(1, f.t / f.dur), e = k * k * (3 - 2 * k);
    c.save(); c.translate(f.x0 + (f.x1 - f.x0) * e, f.y0 + (f.y1 - f.y0) * e - Math.sin(Math.PI * k) * f.arc);
    if (!REDUCED) c.rotate(e * 6.2832);
    const fs = 1 + (plateSc(G.sandwich.length + G.flyers.length) - 1) * e; c.scale(fs, fs);
    drawIngredient(c, f.L.ing, f.L.rotten, -w / 2, -h / 2, w, h); c.restore();
  });
}

/* ===================================================================
   10. DRAG HANDLES: angle arc + label, distance label, grab glow
   =================================================================== */
function chip(c, text, x, y, hot) {
  c.save(); c.font = '600 15px "DM Mono", monospace'; c.textAlign = 'center';
  const tw = c.measureText(text).width + 16;
  rr(c, x - tw / 2, y - 12, tw, 24, 8); c.fillStyle = hot ? '#ffb703' : '#ffffff'; c.fill();
  c.strokeStyle = '#5e3322'; c.lineWidth = 2.5; c.stroke();
  c.fillStyle = '#5e3322'; c.fillText(text, x, y + 5.5); c.restore();
}
function drawHandles(c, time) {
  const th = G.angle * Math.PI / 180, act = G.drag ? G.drag.kind : G.hover;
  const can = G.phase === 'play' && !G.flight, pulse = REDUCED ? 0.5 : 0.5 + 0.5 * Math.sin(time * 4);
  /* angle arc from the horizontal, with a live label */
  c.save();
  c.strokeStyle = '#5e3322'; c.lineWidth = 2; c.setLineDash([5, 5]);
  c.beginPath(); c.moveTo(OX + 12, OY); c.lineTo(OX + 120, OY); c.stroke(); c.setLineDash([]);
  c.strokeStyle = '#c8321f'; c.lineWidth = 4; c.beginPath(); c.arc(OX, OY, 54, -th, 0); c.stroke();
  c.restore();
  chip(c, Math.round(G.angle) + '°', OX + Math.cos(th / 2) * 118 + 8, OY - Math.sin(th / 2) * 118, act === 'cannon');
  if (can) {
    const hx = OX + Math.cos(th) * 74, hy = OY - Math.sin(th) * 74, on = act === 'cannon';
    c.save();
    if (on) { c.shadowColor = '#ffb703'; c.shadowBlur = 22; }
    c.globalAlpha = on ? 0.9 : 0.25 + 0.25 * pulse; c.fillStyle = '#ffb703';
    c.beginPath(); c.arc(hx, hy, on ? 22 : 17 + 3 * pulse, 0, 6.28); c.fill(); c.globalAlpha = 1;
    c.fillStyle = '#ffb703'; c.strokeStyle = '#5e3322'; c.lineWidth = 3;
    c.beginPath(); c.arc(hx, hy, 9, 0, 6.28); c.fill(); c.stroke();
    c.restore();
    /* plate handle: glow ring and side arrows */
    const cx = towerCX(), rx = CFG.towerWidth * S * 0.64, pOn = act === 'plate';
    c.save();
    if (pOn) { c.shadowColor = '#ffb703'; c.shadowBlur = 22; }
    c.strokeStyle = '#ffb703'; c.lineWidth = pOn ? 6 : 3; c.globalAlpha = pOn ? 1 : 0.45 + 0.35 * pulse;
    c.beginPath(); c.ellipse(cx, GROUND + 2, rx + 4, 14, 0, 0, 6.28); c.stroke();
    c.globalAlpha = 1; c.fillStyle = '#ffb703'; c.strokeStyle = '#5e3322'; c.lineWidth = 2.5;
    [[-1], [1]].forEach(a => {
      const ax = cx + a[0] * (rx + 20);
      c.beginPath(); c.moveTo(ax + a[0] * 11, GROUND + 2); c.lineTo(ax - a[0] * 5, GROUND - 9); c.lineTo(ax - a[0] * 5, GROUND + 13); c.closePath(); c.fill(); c.stroke();
    });
    c.restore();
  }
}

/* ===================================================================
   11. DRAGGING THE CANNON AND THE PLATE (mouse + touch)
   =================================================================== */
const canDrag = () => G.phase === 'play' && !G.flight;
function toWorld(e) { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; }
function hitTest(p) {
  const th = G.angle * Math.PI / 180, ex = OX + Math.cos(th) * 74, ey = OY - Math.sin(th) * 74;
  const pad = matchMedia('(pointer:coarse)').matches ? 18 : 8;
  const dx = ex - OX, dy = ey - OY, t = clamp(((p.x - OX) * dx + (p.y - OY) * dy) / (dx * dx + dy * dy), 0, 1);
  if (Math.hypot(p.x - (OX + t * dx), p.y - (OY + t * dy)) <= 16 + pad || Math.hypot(p.x - ex, p.y - ey) <= 22 + pad) return 'cannon';
  const w = CFG.towerWidth * S, top = G.tower.length * CFG.layerHeight * S;
  if (Math.abs(p.x - towerCX()) <= w * 0.64 + pad && p.y >= GROUND - top - pad && p.y <= GROUND + 16 + pad) return 'plate';
  return null;
}
function dragSet(id, val) { const d = ctl[id].def; val = clamp(Math.round(val / d.step) * d.step, d.min, d.max); ctl[id].input.value = val; applyControl(id, val); }
function setCursor() { canvas.style.cursor = G.drag ? 'grabbing' : (G.hover && canDrag() ? 'grab' : 'default'); }
function wireDrag() {
  canvas.addEventListener('pointerdown', e => {
    if (!canDrag()) return;
    const p = toWorld(e), k = hitTest(p); if (!k) return;
    G.drag = { kind: k, off: k === 'plate' ? p.x - towerCX() : 0 };
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    e.preventDefault(); setCursor();
  });
  canvas.addEventListener('pointermove', e => {
    const p = toWorld(e);
    if (G.drag) {
      if (!canDrag()) { G.drag = null; setCursor(); return; }
      if (G.drag.kind === 'cannon') dragSet('angle', Math.atan2(OY - p.y, p.x - OX) * 180 / Math.PI);
      else dragSet('distance', (p.x - G.drag.off - OX) / S - CFG.towerWidth / 2);
    } else G.hover = canDrag() ? hitTest(p) : null;
    setCursor();
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => canvas.addEventListener(ev, () => { G.drag = null; setCursor(); }));
  canvas.addEventListener('pointerleave', () => { if (!G.drag) { G.hover = null; setCursor(); } });
}

/* ===================================================================
   12. LEADERBOARD: shared (db) when available, otherwise this device only
   =================================================================== */
const NAME_KEY = 'breadjectory-name', SCORES_KEY = 'breadjectory-scores-v1';
const LB = { db: null, shared: false, warn: false };
(async () => { try { if (window.claude && claude.use) LB.db = await claude.use('db'); } catch (e) { LB.db = null; } })();
function localScores() { try { return JSON.parse(localStorage.getItem(SCORES_KEY)) || []; } catch (e) { return []; } }
function saveLocal(a) { try { localStorage.setItem(SCORES_KEY, JSON.stringify(a)); } catch (e) { /* storage unavailable */ } }
const lbKey = (mode, name, nh, rc) => mode + (nh ? 'N' : 'H') + (rc || 'x') + '_' + Array.from(name.toLowerCase()).map(ch => ch.codePointAt(0).toString(36)).join('-');
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
async function lbSubmit(e) {
  const arr = localScores();
  const i = arr.findIndex(r => r.mode === e.mode && r.name.toLowerCase() === e.name.toLowerCase() && !!r.nohint === !!e.nohint && (r.recipe || '') === (e.recipe || ''));
  if (i < 0) arr.push(e); else if (e.score > arr[i].score) arr[i] = e;      /* best per player per mode */
  saveLocal(arr);
  if (LB.db) {
    try {
      const ref = LB.db.collection('scores').doc(lbKey(e.mode, e.name, e.nohint, e.recipe)), s = await ref.get();
      if (!s.exists || e.score > s.data().score) await ref.set(e);
      LB.shared = true; LB.warn = false;
    } catch (err) { LB.shared = false; LB.warn = true; }
  }
}
async function lbRows(mode) {
  let rows = localScores();
  if (LB.db) {
    try { rows = (await LB.db.collection('scores').where('mode', '==', mode).get()).docs.map(d => d.data()); LB.shared = !LB.warn; } catch (err) { LB.shared = false; }
  }
  return rows.filter(r => r.mode === mode).sort((a, b) => b.score - a.score || b.acc - a.acc);
}
let lbMode = 'medium', lbRecipe = 'all';
async function renderLB() {
  document.querySelectorAll('.lbtab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.mode === lbMode)));
  document.querySelectorAll('#lbChips .chip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.r === lbRecipe)));
  const all = (await lbRows(lbMode)).filter(r => lbRecipe === 'all' || r.recipe === lbRecipe), me = (playerName || cleanName()).toLowerCase();
  const row = (r, rank) => '<tr class="' + (r.name.toLowerCase() === me ? 'me' : '') + '"><td class="n">' + rank + '</td><td>' + esc(r.name) + (r.nohint ? ' <span class="nh">no-hint</span>' : '') +
    '</td><td>' + esc(r.recipe && CFG.recipes[r.recipe] ? CFG.recipes[r.recipe].name : '-') + '</td><td>' + r.score + '</td><td>' + r.acc + '%</td><td>' + esc(new Date(r.date).toLocaleDateString()) + '</td></tr>';
  let html = all.slice(0, 10).map((r, i) => row(r, i + 1)).join('');
  const mi = all.findIndex(r => r.name.toLowerCase() === me);
  if (mi >= 10) html += '<tr><td colspan="6" class="empty" style="padding:2px">…</td></tr>' + row(all[mi], mi + 1);
  $('lbBody').innerHTML = all.length
    ? '<table class="lb"><thead><tr><th>#</th><th>Name</th><th>Sandwich</th><th>Score</th><th>Acc.</th><th>Date</th></tr></thead><tbody>' + html + '</tbody></table>'
    : '<p class="empty">No scores yet in ' + CFG.modes[lbMode].name + '. Be the first!</p>';
  $('lbNote').textContent = lbNoteText();
}
function lbNoteText() {
  if (LB.db && !LB.warn) return 'Shared leaderboard: everyone who opens this link sees and competes on the same scores.';
  if (LB.db && LB.warn) return 'The shared board could not be updated from this account (posting needs Contributor access), so your scores are only tracked on this device.';
  return 'This leaderboard only tracks scores on this device (saved in your browser).';
}
function openLB(mode) { lbMode = mode || chosenMode; scr.lb.hidden = false; renderLB(); }

/* ===================================================================
   13. SCREENS: title -> setup -> game
   =================================================================== */
const scr = { title: $('titleScreen'), setup: $('setupScreen'), game: $('gameScreen'), kitchen: $('kitchenScreen'), how: $('howScreen'), lb: $('lbScreen') };
const nameInput = $('nameInput'), board = $('board');
let playerName = '', rotDismissed = false;
const readName = () => { try { return localStorage.getItem(NAME_KEY) || ''; } catch (e) { return ''; } };
const cleanName = () => nameInput.value.trim().replace(/\s+/g, ' ').slice(0, 14);

function show(which) {
  scr.title.hidden = which !== 'title'; scr.setup.hidden = which !== 'setup'; scr.game.hidden = which !== 'game'; scr.kitchen.hidden = which !== 'kitchen';
  if (which === 'game') layout();
  if (which === 'kitchen') { buildKitchen(); kitchenDraw(); }
  if (which === 'setup') paintChars('idle');
  intro.run(which === 'title'); rotateCheck();
}
function resetToMenu() {
  G.phase = 'menu'; newRound(chosenMode); el.pauseBtn.textContent = 'Pause';
  syncOverlays(); lockControls(false); $('labDrawer').hidden = true; $('labBtn').setAttribute('aria-expanded', 'false');
}
const goSetup = () => wave(() => { resetToMenu(); show('setup'); }, -1);
const goTitle = () => wave(() => { resetToMenu(); show('title'); }, -1);
function beginPlay() {
  const n = cleanName();
  if (!n) { nameInput.classList.add('err'); $('nameErr').hidden = false; nameInput.focus(); return; }
  playerName = n; try { localStorage.setItem(NAME_KEY, n); } catch (e) { /* ignore */ }
  hideArrow = $('hideArrow').checked; try { localStorage.setItem('breadjectory-hidearrow', hideArrow ? '1' : '0'); } catch (e) { /* ignore */ }
  wave(() => show('kitchen'), 1);
}
function cook() {
  wave(() => { show('game'); el.pauseBtn.textContent = 'Pause'; startGame(chosenMode); updateLast(); layout(); }, 1);
}
const goKitchen = () => wave(() => { resetToMenu(); show('kitchen'); }, -1);
function rotateCheck() { $('rotate').hidden = scr.game.hidden || rotDismissed || !(innerHeight > innerWidth && innerWidth < 620); }

/* pick side panel or bottom bar, whichever leaves the biggest game board */
function layout() {
  const sh = scr.game; if (sh.hidden) return;
  const cs = getComputedStyle(sh);
  const aw = sh.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const ah = sh.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const panel = $('panel'), ring = 10;
  sh.classList.toggle('compact', innerHeight < 480 || innerWidth < 560);
  sh.classList.remove('side'); sh.classList.add('bottom');
  const bh = panel.offsetHeight, sB = Math.min((aw - ring) / W, (ah - bh - 8 - ring) / H);
  sh.classList.remove('bottom'); sh.classList.add('side');
  const pw = panel.offsetWidth, sS = Math.min((aw - pw - 8 - ring) / W, (ah - ring) / H);
  const side = sS >= sB, s = Math.max(0.15, side ? sS : sB);
  sh.classList.toggle('side', side); sh.classList.toggle('bottom', !side);
  sh.style.setProperty('--ph', panel.offsetHeight + 'px'); panel.style.setProperty('--pw', side ? '' : '250px');
  board.style.width = Math.floor(W * s) + 'px'; board.style.height = Math.floor(H * s) + 'px'; board.style.setProperty('--u', s);
}

/* ===================================================================
   14. TITLE SCREEN ANIMATION (parallax, self-firing cannon, confetti)
   =================================================================== */
const intro = (() => {
  const cv = $('intro'), c = cv.getContext('2d');
  let w = 0, h = 0, u = 1, runs = false, t = 0, last = 0, fireT = 0.6, breadT = 0.3, px = 0, tx = 0, hasPtr = false, aim = 0.8, recoil = 0;
  const fly = [], sp = [];
  const flo = Array.from({ length: 10 }, (_, i) => ({ k: ALLING[i % 11], x: (i * 0.37 + 0.08) % 1, y: 0.1 + ((i * 0.53) % 1) * 0.55, p: i * 1.7, s: 0.5 + (i % 3) * 0.16 }));
  const cx0 = () => w * 0.11, cy0 = () => h * 0.9 - 40 * u;
  /* Sandy on the title screen: stands on the counter at the bottom right (clear of the logo, tagline and buttons), bobs, blinks, changes pose, waves, hops in, and chats when tapped */
  const sandy = { dirty: true, ok: false, x: 0, y: 0, sh: 0, sw: 0, enter: 0, pose: 'welcome', poseT: 2.5, hop: 1, wave: 0, waveT: 7, blinkT: 2.2, blinkLeft: 0, sayAt: -1e9, tapUntil: 0, line: 0, box: null, text: '' };
  function layoutSandy() {   /* measured once per resize, never per frame */
    const parts = [$('brand'), document.querySelector('#titleScreen .tagline'), document.querySelector('#titleScreen .actions')].map(e => e.getBoundingClientRect());
    if (!parts[0].width) return;
    sandy.dirty = false; const hitEl = $('sandyHit');
    sandy.box = parts.map(p => ({ l: p.left, t: p.top, r: p.right, b: p.bottom }));   /* logo, tagline and buttons are checked one by one */
    const by = h * 0.9;
    for (let sh = Math.min(h * 0.41, w * 0.58, 380); sh >= 90; sh *= 0.92) {
      const sw = sh * 0.62, x1 = w - sw - 12, y1 = by - sh;
      if (!sandy.box.some(q => x1 + sw >= q.l - 10 && x1 <= q.r + 10 && y1 + sh >= q.t - 10 && y1 <= q.b + 10)) {
        Object.assign(sandy, { ok: true, sh, sw, x: x1 + sw / 2, y: by + 6 });
        hitEl.style.cssText = 'display:block;left:' + x1 + 'px;top:' + y1 + 'px;width:' + sw + 'px;height:' + sh + 'px'; return;
      }
    }
    sandy.ok = false; hitEl.style.display = 'none';
  }
  function updateSandy(dt) {
    const S = sandy; S.enter = Math.min(1, S.enter + dt / 1.1); S.hop = Math.min(1, S.hop + dt / 0.45);
    if ((S.blinkT -= dt) <= 0) { S.blinkT = rand(2.5, 4.5); S.blinkLeft = 0.14; } else if (S.blinkLeft > 0) S.blinkLeft -= dt;
    if (S.wave > 0) S.wave -= dt; else if ((S.waveT -= dt) <= 0) { S.waveT = rand(8, 13); S.wave = 1.5; S.hop = 0; }
    if (performance.now() > S.tapUntil && S.wave <= 0 && (S.poseT -= dt) <= 0) { S.poseT = rand(3, 5); S.pose = pick(['welcome', 'happy', 'idle'].filter(k => k !== S.pose)); S.hop = 0; }
  }
  function tapSandy() {
    const S = sandy, now = performance.now(); sfx('squeak'); S.sayAt = now; S.tapUntil = now + 1600; S.hop = 0;
    const lines = CFG.mascot.titleLines; S.text = lines[S.line++ % lines.length];
    if (!runs) { draw(2); setTimeout(() => { if (!runs) draw(2); }, 3100); }   /* static (reduced motion) redraw */
  }
  function drawSandy(tm) {
    const S = sandy; if (S.dirty && !scr.title.hidden) layoutSandy(); if (!S.ok) return;
    const now = performance.now(), still = REDUCED, key = still ? 'welcome' : now < S.tapUntil ? 'success' : S.wave > 0 ? 'happy' : S.pose, o = outlinedSprite(key); if (!o) return;
    const e = still ? 1 : S.enter, ease = 1 - Math.pow(1 - e, 3), hopC = still ? 0 : Math.sin(Math.PI * S.hop), k = S.sh / o.nh, wd = o.cv.width * k, hd = o.cv.height * k;
    const bob = still ? 0 : Math.sin(tm * 2.4) * S.sh * 0.012, arrive = still ? 0 : -Math.abs(Math.sin(e * Math.PI * 3)) * S.sh * 0.1 * (1 - e);
    const off = still ? 0 : (1 - ease) * (S.sw + 40), tilt = !still && S.wave > 0 ? Math.sin(tm * 9) * 0.07 : 0;
    c.save(); c.translate(S.x + off, S.y + bob + arrive - hopC * S.sh * 0.08); c.rotate(tilt); c.scale(still ? 1 : 1 - 0.07 * hopC, still ? 1 : 1 + 0.1 * hopC);
    const dx = -wd / 2, dy = -(o.pad + o.nh) * k; c.drawImage(o.cv, dx, dy, wd, hd);
    if (!still && S.blinkLeft > 0 && (key === 'idle' || key === 'happy')) drawBlink(c, o, dx, dy, k);
    c.restore();
    const age = (now - S.sayAt) / 1000;
    if (age < 3 && S.text) {   /* speech bubble: left of her head, or above it if that would touch the title */
      const fs = Math.round(clamp(S.sh * 0.065, 13, 20)); c.font = '700 ' + fs + 'px "Baloo 2", sans-serif';
      const bw = c.measureText(S.text).width + 26, bh = fs + 18, hits = (x, y) => S.box.some(q => x + bw >= q.l - 6 && x <= q.r + 6 && y + bh >= q.t - 6 && y <= q.b + 6);
      let bx = S.x - S.sw / 2 - bw - 6, byy = S.y - S.sh * 0.9, tail = 'r';
      if (bx < 6 || hits(bx, byy)) { bx = clamp(S.x - bw / 2, 6, w - bw - 6); byy = S.y - S.sh - bh - 12; tail = 'b'; }
      if (byy > 4 && bx >= 6 && !hits(bx, byy)) {
        const pop = still ? 1 : Math.min(1, age / 0.18), fade = clamp((3 - age) / 0.4, 0, 1);
        c.save(); c.globalAlpha = fade; c.translate(bx + bw / 2, byy + bh / 2); c.scale(0.6 + 0.4 * pop, 0.6 + 0.4 * pop);
        c.lineJoin = 'round'; c.lineWidth = 2.5; c.strokeStyle = '#5e3322'; c.fillStyle = '#fff'; rr(c, -bw / 2, -bh / 2, bw, bh, 12); c.fill(); c.stroke();
        c.beginPath(); if (tail === 'r') { c.moveTo(bw / 2 - 1, -4); c.lineTo(bw / 2 + 9, 4); c.lineTo(bw / 2 - 1, 8); } else { c.moveTo(-6, bh / 2 - 1); c.lineTo(2, bh / 2 + 9); c.lineTo(8, bh / 2 - 1); }
        c.fillStyle = '#fff'; c.fill(); c.stroke(); rr(c, -bw / 2 + 3, -bh / 2 + 3, bw - 6, bh - 6, 9); c.fill();
        c.fillStyle = '#5e3322'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(S.text, 0, 1); c.restore(); c.textBaseline = 'alphabetic'; c.textAlign = 'left';
      }
    }
  }
  function size() {
    const d = Math.min(devicePixelRatio || 1, 2); w = innerWidth; h = innerHeight; u = Math.max(0.5, Math.min(w, h * 1.5) / 760);
    cv.width = w * d; cv.height = h * d; c.setTransform(d, 0, 0, d, 0, 0); sandy.dirty = true; if (!runs) draw(2);
  }
  function fire() {
    const a = aim, v = (540 + Math.random() * 160) * u, bx = cx0() + Math.cos(a) * 72 * u, by = cy0() - Math.sin(a) * 72 * u;
    fly.push({ k: 'fork', x: bx, y: by, vx: Math.cos(a) * v * 1.15, vy: -Math.sin(a) * v * 1.15, r: 0, vr: 0 });
    for (let i = 0; i < 14; i++) { const q = Math.random() * 6.283, s = Math.random() * 200 * u; sp.push({ x: bx, y: by, vx: Math.cos(q) * s + Math.cos(a) * 160, vy: Math.sin(q) * s - Math.sin(a) * 160, l: 0, m: 0.5 + Math.random() * 0.4, c: pick(['#ffb703', '#ffffff', '#c8321f']), z: 2 + Math.random() * 3 }); }
    recoil = 1;
  }
  function update(dt) {
    t += dt; px += ((hasPtr ? tx : Math.sin(t * 0.25) * 0.35) - px) * Math.min(1, dt * 3);
    aim = 0.78 + Math.sin(t * 0.9) * 0.26; recoil *= Math.exp(-dt * 8);
    if ((fireT -= dt) <= 0) { fireT = 1.7; fire(); }
    if ((breadT -= dt) <= 0) { breadT = 0.9 + Math.random() * 0.8; fly.push({ k: pick(ALLING), x: rand(0.05, 0.95) * w, y: h + 40, vx: rand(-150, 150) * u, vy: -rand(700, 980) * u, r: 0, vr: rand(-4, 4) }); }
    if (Math.random() < dt * 7) sp.push({ x: rand(0, w), y: -10, vx: rand(-30, 30), vy: rand(40, 120), l: 0, m: 7, c: pick(['#ffb703', '#c8321f', '#62bb46', '#ffffff', '#4aa3df']), z: 6, conf: 1 });
    for (let i = fly.length - 1; i >= 0; i--) { const f = fly[i]; f.vy += 1100 * u * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.r += f.vr * dt; if (f.y > h + 80 || f.x > w + 80 || f.x < -80) fly.splice(i, 1); }
    for (let i = sp.length - 1; i >= 0; i--) { const p = sp[i]; p.l += dt; p.vy += (p.conf ? 0 : 600) * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.l > p.m || p.y > h + 20) sp.splice(i, 1); }
    updateSandy(dt);
  }
  function cloud(x, y, s) { c.fillStyle = 'rgba(255,255,255,.9)'; [[0, 0, 34], [32, 8, 28], [-32, 10, 26], [60, 14, 20]].forEach(a => { c.beginPath(); c.arc(x + a[0] * s, y + a[1] * s, a[2] * s, 0, 6.283); c.fill(); }); }
  function hill(base, col, amp, f, off) { c.fillStyle = col; c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= w + 10; x += 10) c.lineTo(x, h * base + Math.sin((x + off) * f) * h * amp); c.lineTo(w, h); c.closePath(); c.fill(); }
  function star(x, y, r) { c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr2 = i % 2 ? r * 0.35 : r; c.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } c.closePath(); c.fill(); }
  function draw(tm) {
    const X = px, g = c.createLinearGradient(0, 0, 0, h), by = h * 0.9;
    g.addColorStop(0, '#fff1d6'); g.addColorStop(0.5, '#ffe3cc'); g.addColorStop(0.8, '#ffd0b8'); g.addColorStop(1, '#ffe2b8'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = '#cfeee6'; c.fillRect(0, h * 0.55, w, by - h * 0.55); c.strokeStyle = '#fff'; c.lineWidth = 2;   /* mint tile wall */
    for (let x = 0; x < w; x += 48 * u) { c.beginPath(); c.moveTo(x, h * 0.55); c.lineTo(x, by); c.stroke(); }
    for (let y = h * 0.55; y < by; y += 48 * u) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    kitchenWindow(c, w * 0.07 - X * 10, h * 0.1, 120 * u, 150 * u); drawUtensils(c, w * 0.68, 26 * u);
    /* wooden counter */
    c.fillStyle = cloth; c.fillRect(0, by, w, h - by);
    c.fillStyle = '#5e3322'; c.fillRect(0, by - 2, w, 4);
    flo.forEach(f => { c.save(); c.translate(f.x * w + Math.sin(tm * 0.7 + f.p) * 22 * u - X * 80 * f.s, f.y * h * 0.8 + Math.sin(tm * 1.1 + f.p) * 14 * u); c.rotate(Math.sin(tm * 0.8 + f.p) * 0.4); c.scale(f.s * u * 0.9, f.s * u * 0.9); c.globalAlpha = 0.95; drawIngredient(c, f.k, false, -60, -22, 120, 45); c.restore(); });
    /* warm string lights */
    const lc = ['#ffd23f', '#ff7b5f', '#fff3dc', '#8fd36a']; c.strokeStyle = '#5e3322'; c.lineWidth = 2; c.beginPath();
    for (let i = 0; i <= 46; i++) { const x = i * w / 46, y = 14 * u + Math.sin(i / 46 * Math.PI * 4) * 16 * u; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    for (let i = 0; i <= 23; i++) { const x = i * w / 23, y = 14 * u + Math.sin(i / 23 * Math.PI * 4) * 16 * u + 6 * u, a = 0.65 + 0.35 * Math.sin(tm * 3 + i * 1.7); c.globalAlpha = 0.3 * a; c.fillStyle = lc[i % 4]; dot(c, x, y, 11 * u); c.globalAlpha = 1; dot(c, x, y, 5 * u); }
    c.fillStyle = '#fff'; for (let i = 0; i < 18; i++) { const a = 0.5 + 0.5 * Math.sin(tm * 3 + i * 1.3); star(seed(i + 90) * w - X * 30, seed(i + 120) * h * 0.7, (3 + seed(i + 9) * 6) * u * a); }
    /* the cannon */
    const cxp = cx0(), cyp = cy0(); c.save(); c.translate(cxp, cyp); c.scale(u, u); c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = '#5e3322';
    c.fillStyle = '#8a5a34'; rr(c, -40, 14, 80, 24, 8); c.fill(); c.stroke();
    c.save(); c.rotate(-aim); const off = -recoil * 10; rr(c, off - 8, -16, 90, 32, 9); c.fillStyle = '#b8652a'; c.fill(); c.stroke(); c.fillStyle = '#e59a55'; c.fillRect(off + 2, -11, 70, 5); rr(c, off + 62, -20, 15, 40, 4); c.fillStyle = '#f2c36b'; c.fill(); c.stroke(); c.fillStyle = '#8a4a1f'; rr(c, off + 12, -25, 24, 9, 4); c.fill(); c.stroke(); rr(c, off + 12, 16, 24, 9, 4); c.fill(); c.stroke(); c.restore();
    c.fillStyle = '#5e3322'; dot(c, -24, 38, 13); dot(c, 24, 38, 13); c.fillStyle = '#f2c36b'; dot(c, -24, 38, 5); dot(c, 24, 38, 5); dot(c, 0, 0, 11); c.restore();
    drawSandy(tm);
    fly.forEach(f => {
      c.save(); c.translate(f.x, f.y);
      if (f.k === 'fork') { c.rotate(Math.atan2(f.vy, f.vx) + Math.sin(t * 8 + f.x) * 0.3); c.scale(0.85 * u, 0.85 * u); drawFork(c, 0, 0, 0); }
      else { c.rotate(f.r); c.scale(0.6 * u, 0.6 * u); drawIngredient(c, f.k, false, -60, -22, 120, 45); }
      c.restore();
    });
    sp.forEach(p => { c.globalAlpha = clamp(1 - p.l / p.m, 0, 1); c.fillStyle = p.c; c.fillRect(p.x - p.z / 2, p.y - p.z / 2, p.z, p.conf ? p.z * 0.6 : p.z); }); c.globalAlpha = 1;
  }
  function loop(now) { if (!runs) return; const dt = Math.min(0.05, (now - last) / 1000); last = now; update(dt); draw(t); requestAnimationFrame(loop); }
  scr.title.addEventListener('pointermove', e => { hasPtr = true; tx = e.clientX / innerWidth - 0.5; });
  return { size, tapSandy, run(on) { if (on && !REDUCED && !runs) { runs = true; last = performance.now(); requestAnimationFrame(loop); } else if (!on) runs = false; else if (REDUCED) { size(); } } };
})();

function buildBrand() {
  const cols = ['#c8321f', '#f2b134', '#fff3dc', '#d9822b', '#e85d3a', '#7aa63e'];
  $('brand').innerHTML = Array.from('BREADJECTORY').map((ch, i) =>
    '<span aria-hidden="true" style="--c:' + cols[i % cols.length] + ';--i:' + i + ';--r:' + (i % 2 ? 4 : -4) + 'deg">' + ch + '</span>').join('');
}

/* ===================================================================
   15. ENDLESS STACK, WAVE TRANSITION
   =================================================================== */
let hideArrow = CFG.hideArrowDefault;

/* a cute fork, drawn around its own centre, pointing along +x */
function drawFork(c, x, y, rot) {
  c.save(); c.translate(x, y); c.rotate(rot); c.lineJoin = 'round'; c.lineWidth = 2.5; c.strokeStyle = '#5e3322';
  rr(c, -32, -3.5, 28, 7, 3.5); c.fillStyle = '#ffb703'; c.fill(); c.stroke();
  c.beginPath(); c.moveTo(-6, -2); c.lineTo(4, -7); c.lineTo(4, 7); c.lineTo(-6, 2); c.closePath(); c.fillStyle = '#dfe7ee'; c.fill(); c.stroke();
  rr(c, 3, -8, 9, 16, 3); c.fill(); c.stroke();
  [-6.5, 0, 6.5].forEach(yy => { rr(c, 10, yy - 1.8, 22, 3.6, 1.8); c.fill(); c.stroke(); });
  c.restore();
}
/* screen direction of the fork at time t of a flight */
function forkDir(f, t) { const th = f.angle * Math.PI / 180; return Math.atan2(-(f.v * Math.sin(th) - CFG.gravity * t), f.v * Math.cos(th)); }

function drawStuck(c) {
  G.stuck.forEach(s => {
    const a = clamp(1 - (s.life - 0.55) / 0.45, 0, 1), r = s.rot + Math.sin(s.life * 38) * 0.12 * Math.exp(-s.life * 6);
    c.save(); c.globalAlpha = a; drawFork(c, s.x - Math.cos(s.rot) * 24, s.y - Math.sin(s.rot) * 24, r); c.restore();
  });
}

/* one new layer: an ingredient of the chosen recipe, or a decoy from another recipe */
function makeLayer(m, h) {
  const rc = CFG.recipes[G.recipe].ingredients, decoys = ALLING.filter(x => !rc.includes(x));
  const ing = Math.random() < m.decoyChance ? pick(decoys) : pick(rc);
  return { ing, rotten: Math.random() < (m.rottenChance || 0), done: false, flash: 0, flashColor: '#fff', fall: null, h, vh: 0 };
}
/* every missing ingredient must have at least one fresh layer in the tower, so a round never gets stuck */
function ensureNeeded(prefer) {
  const fresh = ing => G.tower.filter(i => G.layers[i].ing === ing && !G.layers[i].rotten);
  G.need.forEach(ing => {
    if (fresh(ing).length) return;
    const pool = prefer && prefer.length ? prefer : G.tower;
    const ok = pool.filter(i => { const L = G.layers[i]; return !(G.need.includes(L.ing) && !L.rotten && fresh(L.ing).length <= 1); });
    const i = ok.length ? pick(ok) : G.tower[G.tower.length - 1];
    G.layers[i].ing = ing; G.layers[i].rotten = false;
  });
}
const pickTicket = () => pick(G.tower.filter(i => !G.layers[i].rotten && G.need.includes(G.layers[i].ing)));   /* never rotten, never one we already have */
/* endless stack: top the tower up (new layers drop in from above) and pick a new ticket */
function refill() {
  const m = CFG.modes[G.mode], added = [];
  while (G.tower.length < CFG.stackLayers) { G.layers.push(makeLayer(m, G.tower.length + 2)); G.tower.push(G.layers.length - 1); added.push(G.layers.length - 1); }
  ensureNeeded(added);
  G.order.push(pickTicket());
}

/* ===================================================================
   THE KITCHEN: pick a sandwich
   =================================================================== */
function drawSandwichPic(cv, ings) {
  const c = cv.getContext('2d'), seq = ['bread'].concat(ings.filter(i => i !== 'bread'), ['bread']), h = Math.min(30, 138 / seq.length), w = 124;
  c.clearRect(0, 0, 240, 170);
  c.fillStyle = '#ffffff'; c.strokeStyle = '#5e3322'; c.lineWidth = 3; c.beginPath(); c.ellipse(120, 152, 88, 12, 0, 0, 6.28); c.fill(); c.stroke();
  seq.forEach((ing, i) => drawIngredient(c, ing, false, 120 - w / 2, 150 - (i + 1) * h, w, h));
}
function buildKitchen() {
  ensureRecipe();
  const box = $('cards'), st = readQ(), order = recipeOrder(); box.innerHTML = '';
  const fresh = order.filter(k => isUnlocked(k) && (CFG.recipes[k].unlockAt || 0) > 0 && !st.seen.includes(k));
  order.forEach(key => {
    const r = CFG.recipes[key], open = isUnlocked(key), b = document.createElement('button');
    b.type = 'button'; b.className = 'rcard' + (key === chosenRecipe ? ' sel' : '') + (open ? '' : ' locked'); b.setAttribute('aria-pressed', String(key === chosenRecipe));
    if (!open) { b.setAttribute('aria-disabled', 'true'); b.setAttribute('aria-label', r.name + ', locked. Needs ' + r.unlockAt + ' quiz points.'); }
    const pic = document.createElement('canvas'); pic.width = 240; pic.height = 170; pic.className = 'rc-pic'; drawSandwichPic(pic, r.ingredients);
    const name = document.createElement('b'); name.textContent = r.name;
    const ings = document.createElement('div'); ings.className = 'rc-ings';
    r.ingredients.forEach(ing => { const c2 = document.createElement('canvas'); c2.width = 64; c2.height = 28; c2.title = NAMES[ing]; const x = c2.getContext('2d'); x.setTransform(0.55, 0, 0, 0.55, 0, 0); drawIngredient(x, ing, false, 6, 3, 104, 45); ings.appendChild(c2); });
    b.append(pic, name, ings);
    if (!open) { const lk = document.createElement('span'); lk.className = 'lock'; lk.textContent = '🔒 ' + r.unlockAt + ' points'; b.appendChild(lk); }
    if (fresh.includes(key)) { const nw = document.createElement('span'); nw.className = 'newtag'; nw.textContent = 'NEW'; b.appendChild(nw); }
    b.addEventListener('click', () => {
      if (!open) { $('kStatus').textContent = r.name + ' unlocks at ' + r.unlockAt + ' quiz points. You have ' + st.points + '. Answer quiz questions after a round to earn more!'; return; }
      $('kStatus').textContent = ''; chosenRecipe = key; box.querySelectorAll('.rcard').forEach(o => { o.classList.toggle('sel', o === b); o.setAttribute('aria-pressed', String(o === b)); });
    });
    box.appendChild(b);
  });
  const nxt = order.find(k => !isUnlocked(k)), prev = order.filter(isUnlocked).map(k => CFG.recipes[k].unlockAt || 0).pop() || 0, hi = nxt ? CFG.recipes[nxt].unlockAt : prev;
  const pct = nxt ? Math.round(clamp((st.points - prev) / Math.max(1, hi - prev), 0, 1) * 100) : 100;
  $('kProg').innerHTML = '<span class="kp"></span><div class="pbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="Progress to the next sandwich"><i style="width:' + pct + '%"></i></div>';
  $('kProg').firstChild.textContent = '★ ' + st.points + ' quiz points · ' + (nxt ? 'next: ' + CFG.recipes[nxt].name + ' at ' + CFG.recipes[nxt].unlockAt : 'every sandwich unlocked!');
  st.seen = order.filter(isUnlocked); saveQ(st);
}
function kitchenWindow(c, x, y, w, h) {
  c.save(); c.lineJoin = 'round'; c.lineWidth = 4; c.strokeStyle = '#5e3322';
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#bfe6f5'); g.addColorStop(1, '#fff3dc');
  c.fillStyle = g; rr(c, x, y, w, h, 8); c.fill(); c.save(); c.clip();
  c.fillStyle = '#ffd23f'; dot(c, x + w * 0.7, y + h * 0.28, w * 0.12);
  c.fillStyle = '#8fd36a'; c.beginPath(); c.arc(x + w * 0.3, y + h * 1.1, w * 0.6, Math.PI, 0); c.fill();
  c.restore(); rr(c, x, y, w, h, 8); c.stroke();
  c.fillStyle = '#ef7f8e'; [x - 10, x + w * 0.74 + 10].forEach(cx => { rr(c, cx, y - 8, w * 0.26, h * 0.8, 6); c.fill(); c.stroke(); c.fillStyle = '#fff'; for (let k = 0; k < 6; k++) dot(c, cx + w * 0.07 + (k % 2) * w * 0.11, y + 8 + k * h * 0.12, 2.5); c.fillStyle = '#ef7f8e'; });   /* curtains */
  c.fillStyle = '#c98a4b'; rr(c, x - 8, y + h - 1, w + 16, 9, 3); c.fill(); c.stroke();   /* wooden sill */
  c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.moveTo(x, y + h * 0.5); c.lineTo(x + w, y + h * 0.5); c.stroke();
  c.restore();
}
function kitchenDraw() {
  const cv = $('kitchenBg'), c = cv.getContext('2d'), d = Math.min(devicePixelRatio || 1, 2), w = innerWidth, h = innerHeight, u = Math.max(0.6, Math.min(w, h * 1.5) / 800);
  cv.width = w * d; cv.height = h * d; c.setTransform(d, 0, 0, d, 0, 0);
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffe7c2'); g.addColorStop(1, '#ffd0a0'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.strokeStyle = 'rgba(190,120,60,.2)'; c.lineWidth = 1; const ts = 46 * u;
  for (let x = 0; x < w; x += ts) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
  for (let y = 0; y < h; y += ts) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  const sideW = (w - Math.min(1000, w)) / 2 - w * 0.03 - 14, winW = Math.min(150 * u, sideW);
  if (winW > 50) kitchenWindow(c, w * 0.03, h * 0.2, winW, winW * 1.25);
  /* simple valance */
  c.fillStyle = '#f2b134'; c.fillRect(0, 0, w, 26 * u); c.fillStyle = '#5e3322'; c.fillRect(0, 26 * u, w, 3);
  drawUtensils(c, w * 0.62, 40 * u); drawHerbPot(c, w * 0.04, h * 0.92);
  /* counter */
  c.fillStyle = cloth; c.fillRect(0, h * 0.92, w, h * 0.08);
  c.fillStyle = '#5e3322'; c.fillRect(0, h * 0.92 - 2, w, 4);
}

/* the right plate shrinks the stack a little once it gets tall */
const plateSc = n => (n <= 7 ? 1 : 7 / n);

/* liquid wave screen transition. dir 1 = rises from the bottom, -1 = pours down from the top */
const waveCv = $('wave'), wc = waveCv.getContext('2d');
let waving = false;
const easeOutBack = k => 1 + 2.9 * Math.pow(k - 1, 3) + 1.9 * Math.pow(k - 1, 2);
const easeInBack = k => 2.9 * k * k * k - 1.9 * k * k;
function wave(mid, dir) {
  if (waving) return; waving = true; dir = dir || 1; sfx('whoosh');
  if (REDUCED) {
    const f = $('fade'); f.classList.add('go'); f.style.opacity = 1;
    setTimeout(() => { mid(); f.style.opacity = 0; setTimeout(() => { f.classList.remove('go'); waving = false; }, 200); }, 200);
    return;
  }
  const d = Math.min(devicePixelRatio || 1, 2), w = innerWidth, h = innerHeight, A = Math.max(14, Math.min(34, h * 0.045)), T = 1200, t0 = performance.now();
  waveCv.width = w * d; waveCv.height = h * d; wc.setTransform(d, 0, 0, d, 0, 0); waveCv.classList.add('go');
  let midDone = false;
  const Y = y => (dir > 0 ? y : h - y);
  function step(now) {
    const k = (now - t0) / T;
    wc.clearRect(0, 0, w, h);
    if (k >= 1) { waveCv.classList.remove('go'); waving = false; return; }
    const cover = k < 0.46 ? easeOutBack(k / 0.46) : (k < 0.54 ? 1 : 1 - easeInBack((k - 0.54) / 0.46));
    if (k >= 0.46 && !midDone) { midDone = true; mid(); }
    const ph = now / 170, base = h + A * 1.6 - cover * (h + A * 3.2);
    const surf = (x, off) => base + (off || 0) + A * (0.6 * Math.sin(x * 0.011 + ph) + 0.4 * Math.sin(x * 0.027 - ph * 1.3));
    const far = dir > 0 ? h + 10 : -10;
    const body = (col, off, pp) => { wc.fillStyle = col; wc.beginPath(); wc.moveTo(0, Y(surf(0, off)));
      for (let x = 8; x <= w + 8; x += 8) wc.lineTo(x, Y(surf(x + pp, off))); wc.lineTo(w, far); wc.lineTo(0, far); wc.closePath(); wc.fill(); };
    body('#a8300f', -16, 90); body('#d9501f', 0, 0);
    /* foam edge + blobs */
    wc.lineCap = 'round'; wc.strokeStyle = '#ffe2b8'; wc.lineWidth = 11; wc.beginPath();
    for (let x = 0; x <= w + 8; x += 8) { const yy = Y(surf(x)); x ? wc.lineTo(x, yy) : wc.moveTo(x, yy); } wc.stroke();
    wc.fillStyle = '#ffe2b8';
    for (let x = 10; x < w; x += 46) { wc.beginPath(); wc.arc(x + Math.sin(ph + x) * 6, Y(surf(x)) + (dir > 0 ? 6 : -6), 7 + 3 * Math.sin(x), 0, 6.283); wc.fill(); }
    /* bubbles rising inside the water */
    wc.lineWidth = 2.5; wc.strokeStyle = 'rgba(255,255,255,.75)';
    for (let i = 0; i < 18; i++) {
      const bx = seed(i + 1) * w, rise = ((seed(i + 40) * 1.4 * h - now * (0.06 + seed(i) * 0.1)) % (h * 1.2) + h * 1.2) % (h * 1.2), by = surf(bx) + 24 + rise, r = 4 + seed(i + 80) * 11;
      if (by > surf(bx) + 14 && by < h + 20) {
        wc.beginPath(); wc.arc(bx, Y(by), r, 0, 6.283); wc.stroke();
        wc.fillStyle = 'rgba(255,255,255,.8)'; wc.beginPath(); wc.arc(bx - r * 0.35, Y(by) - r * 0.35, r * 0.22, 0, 6.283); wc.fill();
      }
    }
    /* chef hats and herb sprigs bobbing on top */
    for (let i = 0; i < 6; i++) {
      const bx = (0.08 + i * 0.17 + 0.04 * Math.sin(ph * 0.4 + i)) * w, by = Y(surf(bx)) - (dir > 0 ? 12 : -12) + Math.sin(ph * 1.6 + i * 2) * 4;
      if (by < -40 || by > h + 40) continue;
      wc.save(); wc.translate(bx, by); wc.rotate(Math.sin(ph + i * 1.7) * 0.25); wc.lineWidth = 2.5; wc.strokeStyle = '#5e3322';
      if (i % 2 === 0) {
        wc.fillStyle = '#ffffff'; wc.beginPath(); wc.arc(-9, -12, 9, 0, 6.283); wc.arc(0, -17, 10, 0, 6.283); wc.arc(9, -12, 9, 0, 6.283); wc.fill(); wc.stroke();
        rr(wc, -13, -8, 26, 14, 3); wc.fill(); wc.stroke();
      } else {
        wc.fillStyle = '#4a9a3a';
        [-1, 1].forEach(sg => { wc.beginPath(); wc.ellipse(sg * 9, -4, 11, 5, sg * -0.5, 0, 6.283); wc.fill(); wc.stroke(); });
        wc.beginPath(); wc.ellipse(0, -11, 5, 10, 0, 0, 6.283); wc.fill(); wc.stroke();
      }
      wc.restore();
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}


/* ===================================================================
   16. CHARACTER: the person next to the cannon (profile, drawing, poses)
   =================================================================== */
const LOOK_KEY = 'breadjectory-look';
const look = (() => { try { return Object.assign({}, CFG.character.default, JSON.parse(localStorage.getItem(LOOK_KEY)) || {}); } catch (e) { return Object.assign({}, CFG.character.default); } })();
const saveLook = () => { try { localStorage.setItem(LOOK_KEY, JSON.stringify(look)); } catch (e) { /* storage unavailable */ } };
function pose(k, d) { G.pose = { k, t: d }; }   /* idle | fire | cheer | wince (set by launch and by feedback) */

/* feet at (x, y). pose: idle, fire (arm pulls the lever), cheer (jumps), wince (squints). Everything is canvas shapes. */
function drawCharacter(c, x, y, s, lk, ps, tm) {
  const F = k => CFG.character[k].find(i => i.id === lk[k]) || CFG.character[k][0];
  const hat = F('hat'), hair = F('hair'), fit = F('outfit'), skin = F('skin'), acc = F('accessory');
  const bob = REDUCED ? 0 : Math.sin(tm * 3) * 1.5, jump = ps === 'cheer' && !REDUCED ? -Math.abs(Math.sin(tm * 10)) * 8 : 0, hy = -66 + bob;
  c.save(); c.translate(x, y + jump); c.scale(s, s); c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = 2.5; c.strokeStyle = '#5e3322';
  c.fillStyle = '#3b4a6b'; rr(c, -11, -22, 9, 22, 3); c.fill(); c.stroke(); rr(c, 2, -22, 9, 22, 3); c.fill(); c.stroke();
  const arm = (sx, a) => { c.save(); c.translate(sx, -48 + bob); c.rotate(a); c.fillStyle = skin.color; rr(c, -4, -2, 8, 22, 4); c.fill(); c.stroke(); c.restore(); };
  arm(-15, ps === 'cheer' ? Math.PI - 0.4 : 0.15);
  c.fillStyle = fit.color; rr(c, -15, -52 + bob, 30, 34, 8); c.fill(); c.stroke();
  if (fit.style === 'apron') { c.fillStyle = '#fff'; rr(c, -10, -44 + bob, 20, 26, 5); c.fill(); c.stroke(); }
  if (fit.style === 'overalls') { c.fillStyle = '#fff'; rr(c, -15, -52 + bob, 30, 13, 6); c.fill(); c.stroke(); c.fillStyle = fit.color; rr(c, -10, -52 + bob, 5, 14, 2); c.fill(); rr(c, 5, -52 + bob, 5, 14, 2); c.fill(); c.fillStyle = '#ffd23f'; dot(c, -7.5, -41 + bob, 2); dot(c, 7.5, -41 + bob, 2); }
  if (fit.style === 'chef') { c.fillStyle = '#5e3322'; dot(c, -4, -44 + bob, 2); dot(c, -4, -35 + bob, 2); dot(c, 4, -44 + bob, 2); dot(c, 4, -35 + bob, 2); }
  if (fit.style === 'dots') { c.fillStyle = '#fff'; [[-8, -46], [4, -48], [9, -38], [-3, -36], [-10, -30]].forEach(p => dot(c, p[0], p[1] + bob, 2.4)); }
  if (fit.style === 'sailor') { c.fillStyle = '#fff'; rr(c, -15, -52 + bob, 30, 34, 8); c.fill(); c.stroke(); c.fillStyle = fit.color; [0, 1, 2].forEach(k => c.fillRect(-14, -44 + bob + k * 9, 28, 4)); c.beginPath(); c.moveTo(-10, -52 + bob); c.lineTo(0, -40 + bob); c.lineTo(10, -52 + bob); c.closePath(); c.fill(); c.stroke(); }
  if (fit.style === 'stripe') { c.fillStyle = '#fff'; [0, 1, 2].forEach(k => c.fillRect(-14, -46 + bob + k * 10, 28, 4)); }
  arm(15, ps === 'cheer' ? Math.PI + 0.4 : ps === 'fire' ? -1.3 : -0.15);
  if (hair.style === 'long') { c.fillStyle = hair.color; rr(c, -21, hy - 19, 42, 48, 14); c.fill(); c.stroke(); }
  c.save(); c.translate(0, hy); c.scale(1.2, 1.2); c.translate(0, -hy);   /* rounder, bigger head */
  c.fillStyle = skin.color; dot(c, 0, hy, 15); c.stroke(); c.fillStyle = 'rgba(240,138,160,.5)'; dot(c, -9, hy + 6, 3.2); dot(c, 9, hy + 6, 3.2);
  if (hair.style !== 'none') { c.fillStyle = hair.color; c.beginPath(); c.arc(0, hy - 2, 16, Math.PI, 0); c.closePath(); c.fill(); c.stroke(); }
  if (hair.style === 'bun') { c.fillStyle = hair.color; dot(c, 0, hy - 22, 7); c.stroke(); }
  if (hair.style === 'curly') { c.fillStyle = hair.color; [-12, -4, 4, 12].forEach(px => { dot(c, px, hy - 13, 6); c.stroke(); }); }
  if (hair.style === 'ponytail') { c.fillStyle = hair.color; c.beginPath(); c.ellipse(-18, hy + 5, 6, 14, 0.3, 0, 6.28); c.fill(); c.stroke(); }
  if (hair.style === 'pigtails') { c.fillStyle = hair.color; [-1, 1].forEach(sg => { c.beginPath(); c.ellipse(sg * 18, hy + 6, 5.5, 13, sg * -0.25, 0, 6.28); c.fill(); c.stroke(); }); }
  if (hair.style === 'spiky') { c.fillStyle = hair.color; [-10, -3.5, 3.5, 10].forEach(k => { c.beginPath(); c.moveTo(k - 4, hy - 14); c.lineTo(k, hy - 27); c.lineTo(k + 4, hy - 14); c.closePath(); c.fill(); c.stroke(); }); }
  if (hair.style === 'mohawk') { c.fillStyle = hair.color; rr(c, -3.5, hy - 29, 7, 17, 3); c.fill(); c.stroke(); }
  c.fillStyle = '#5e3322'; c.lineWidth = 2;
  [-5, 5].forEach(px => {
    c.beginPath();
    if (ps === 'wince') { c.moveTo(px - 3, hy - 3); c.lineTo(px + 3, hy + 1); c.stroke(); }
    else if (ps === 'cheer') { c.arc(px, hy - 1, 3, Math.PI, 0); c.stroke(); }
    else { c.arc(px, hy - 1, 2.2, 0, 6.28); c.fill(); }
  });
  c.beginPath();
  if (ps === 'wince') { c.moveTo(-4, hy + 8); c.lineTo(-1, hy + 6); c.lineTo(2, hy + 8); c.lineTo(5, hy + 6); c.stroke(); }
  else if (ps === 'cheer') { c.arc(0, hy + 4, 5, 0, Math.PI); c.fill(); }
  else if (ps === 'fire') { c.moveTo(-4, hy + 7); c.lineTo(4, hy + 7); c.stroke(); }
  else { c.arc(0, hy + 3, 5, 0.2, Math.PI - 0.2); c.stroke(); }
  c.lineWidth = 2.5;
  if (acc.id === 'glasses') { c.beginPath(); c.arc(-5.5, hy - 1, 5, 0, 6.28); c.moveTo(10.5, hy - 1); c.arc(5.5, hy - 1, 5, 0, 6.28); c.moveTo(-0.5, hy - 1); c.lineTo(0.5, hy - 1); c.stroke(); }
  if (acc.id === 'shades') { c.fillStyle = '#1f1a1a'; rr(c, -12, hy - 5, 10, 7, 2); c.fill(); rr(c, 2, hy - 5, 10, 7, 2); c.fill(); c.stroke(); }
  if (acc.id === 'bow') { c.fillStyle = acc.color; c.beginPath(); c.moveTo(0, -50 + bob); c.lineTo(-9, -56 + bob); c.lineTo(-9, -44 + bob); c.closePath(); c.moveTo(0, -50 + bob); c.lineTo(9, -56 + bob); c.lineTo(9, -44 + bob); c.closePath(); c.fill(); c.stroke(); }
  if (acc.id === 'scarf') { c.fillStyle = acc.color; rr(c, -16, -55 + bob, 32, 8, 4); c.fill(); c.stroke(); }
  if (acc.id === 'mustache') { c.fillStyle = acc.color; [-1, 1].forEach(sg => { c.beginPath(); c.ellipse(sg * 4.5, hy + 7, 5, 2.6, sg * 0.25, 0, 6.28); c.fill(); c.stroke(); }); }
  if (acc.id === 'freckles') { c.fillStyle = acc.color; [[-11, 6], [-8, 8], [-13, 9], [11, 6], [8, 8], [13, 9]].forEach(p => dot(c, p[0], hy + p[1], 1.1)); }
  if (acc.id === 'headphones') { c.strokeStyle = acc.color; c.lineWidth = 3.5; c.beginPath(); c.arc(0, hy - 1, 17, Math.PI, 0); c.stroke(); c.strokeStyle = '#5e3322'; c.lineWidth = 2.5; c.fillStyle = acc.color; rr(c, -21, hy - 5, 7, 13, 3); c.fill(); c.stroke(); rr(c, 14, hy - 5, 7, 13, 3); c.fill(); c.stroke(); }
  if (acc.id === 'necklace') { c.fillStyle = acc.color; for (let k = -3; k <= 3; k++) dot(c, k * 3.6, -50 + bob + 4.5 - Math.abs(k) * -0.9 - 4.5 + (3 - Math.abs(k)) * 1.2, 1.8); }
  c.fillStyle = hat.color || '#fff';
  if (hat.id === 'cap') { c.beginPath(); c.arc(0, hy - 3, 16, Math.PI, 0); c.closePath(); c.fill(); c.stroke(); rr(c, 2, hy - 5, 22, 5, 2.5); c.fill(); c.stroke(); }
  else if (hat.id === 'beanie') { c.beginPath(); c.arc(0, hy - 3, 17, Math.PI, 0); c.closePath(); c.fill(); c.stroke(); rr(c, -17, hy - 9, 34, 7, 3); c.fill(); c.stroke(); dot(c, 0, hy - 22, 5); c.stroke(); }
  else if (hat.id === 'tophat') { rr(c, -12, hy - 36, 24, 28, 3); c.fill(); c.stroke(); rr(c, -19, hy - 10, 38, 6, 3); c.fill(); c.stroke(); }
  else if (hat.id === 'crown') { c.beginPath(); c.moveTo(-14, hy - 8); c.lineTo(-14, hy - 26); c.lineTo(-7, hy - 17); c.lineTo(0, hy - 28); c.lineTo(7, hy - 17); c.lineTo(14, hy - 26); c.lineTo(14, hy - 8); c.closePath(); c.fill(); c.stroke(); }
  else if (hat.id === 'chef') { [[-9, 22], [0, 27], [9, 22]].forEach(p => { dot(c, p[0], hy - p[1], 9); c.stroke(); }); rr(c, -14, hy - 19, 28, 12, 3); c.fill(); c.stroke(); }
  else if (hat.id === 'cowboy') { c.beginPath(); c.ellipse(0, hy - 8, 25, 5.5, 0, 0, 6.28); c.fill(); c.stroke(); rr(c, -11, hy - 25, 22, 19, 7); c.fill(); c.stroke(); }
  else if (hat.id === 'headband') { rr(c, -16.5, hy - 12, 33, 6, 3); c.fill(); c.stroke(); }
  else if (hat.id === 'catears') { [-1, 1].forEach(sg => { c.beginPath(); c.moveTo(sg * 4, hy - 14); c.lineTo(sg * 13, hy - 29); c.lineTo(sg * 15, hy - 9); c.closePath(); c.fill(); c.stroke(); }); }
  else if (hat.id === 'bunny') { [-1, 1].forEach(sg => { c.beginPath(); c.ellipse(sg * 7, hy - 30, 4.5, 14, sg * 0.12, 0, 6.28); c.fill(); c.stroke(); }); }
  else if (hat.id === 'flower') { for (let k = 0; k < 5; k++) { const a = k * 1.2566; dot(c, -10 + Math.cos(a) * 5, hy - 13 + Math.sin(a) * 5, 3.6); c.stroke(); } c.fillStyle = '#ffd23f'; dot(c, -10, hy - 13, 3); c.stroke(); }
  else if (hat.id === 'wizard') { c.beginPath(); c.moveTo(-14, hy - 8); c.lineTo(2, hy - 46); c.lineTo(14, hy - 8); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.ellipse(0, hy - 8, 20, 4.5, 0, 0, 6.28); c.fill(); c.stroke(); c.fillStyle = '#ffd23f'; sparkle(c, 3, hy - 27, 4); }
  else if (hat.id === 'beret') { c.beginPath(); c.ellipse(2, hy - 13, 17, 8, -0.1, 0, 6.28); c.fill(); c.stroke(); dot(c, 3, hy - 21, 2.5); c.stroke(); }
  else if (hat.id === 'party') { c.beginPath(); c.moveTo(-11, hy - 10); c.lineTo(0, hy - 38); c.lineTo(11, hy - 10); c.closePath(); c.fill(); c.stroke(); dot(c, 0, hy - 38, 3.5); c.stroke(); }
  c.restore(); c.restore();
}
function paintChars(ps) {
  ['setupChar', 'endChar'].forEach(id => {
    const cv = $(id), c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
    drawCharacter(c, 45, 104, 1, look, ps || 'idle', 0);
  });
}
let pfTab = 'hat', pfPose = 'idle', pfN = 0;
function pfRender() {
  const tabs = $('pfTabs'), grid = $('pfGrid'); tabs.innerHTML = ''; grid.innerHTML = '';
  CFG.character.tabs.forEach(t => {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(t.id === pfTab)); b.textContent = t.label;
    b.addEventListener('click', () => { pfTab = t.id; pfRender(); }); tabs.appendChild(b);
  });
  CFG.character[pfTab].forEach(it => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pf-item'; b.setAttribute('aria-pressed', String(look[pfTab] === it.id));
    const sw = document.createElement('i'); sw.style.background = it.color || '#fff'; if (!it.color) sw.textContent = '∅';
    const nm = document.createElement('span'); nm.textContent = it.name; b.append(sw, nm);
    b.addEventListener('click', () => { look[pfTab] = it.id; saveLook(); pfRender(); paintChars('idle'); }); grid.appendChild(b);
  });
}
function pfDraw() {
  const cv = $('pfCanvas'), c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
  c.fillStyle = '#e6bd84'; c.fillRect(0, 196, cv.width, 24);
  drawCharacter(c, 90, 200, 1.7, look, pfPose, performance.now() / 1000);
}

/* ===================================================================
   18. TUTORIAL: guided sandbox (no timer, no lives lost, no score saved)
   =================================================================== */
const TUT_KEY = 'breadjectory-tutorial', ASK_KEY = 'breadjectory-tut-asked';
const tutDone = () => { try { return localStorage.getItem(TUT_KEY) === '1'; } catch (e) { return false; } };
const tutAsked = () => { try { return localStorage.getItem(ASK_KEY) === '1'; } catch (e) { return false; } };
const markAsked = () => { try { localStorage.setItem(ASK_KEY, '1'); } catch (e) { /* ignore */ } };
const updateTutBtn = () => { $('tutBtn').textContent = tutDone() ? 'Replay tutorial' : 'Tutorial'; };
const TUT = { on: false, i: 0, base: null };
const worldRect = (x, y, w, h) => { const r = canvas.getBoundingClientRect(), k = r.width / W; return { l: r.left + x * k, t: r.top + y * k, w: w * k, h: h * k }; };
const domRect = sel => { const r = document.querySelector(sel).getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; };
const towerH = () => G.tower.length * CFG.layerHeight * S;
const TUT_STEPS = [
  { say: "Hi, I'm " + CFG.mascot.name + "! Your goal: launch forks from the cannon to hit ingredients and build a sandwich. Nothing you do in this tutorial counts, so experiment!", target: null },
  { say: 'This is the order ticket. It shows the ingredient to hit next, and the dots are the recipe checklist: one of each fills the sandwich.', target: () => domRect('#orderCard') },
  { say: 'Drag the cannon barrel up or down to aim it. Try it now!', target: () => worldRect(OX - 50, OY - 120, 200, 170), wait: () => Math.abs(G.angle - TUT.base.angle) >= 3 },
  { say: "Now drag the tower's plate left or right to change the distance. The sliders do the same thing.", target: () => worldRect(towerCX() - 90, GROUND - towerH() - 10, 180, towerH() + 40), wait: () => Math.abs(G.distance - TUT.base.d) >= 1 },
  { say: 'Force, acceleration and velocity are linked: a = F ÷ m and v = √(2·a·s). Tap Lab to open the Physics Lab and watch the numbers change.', target: () => domRect('#labBtn'), wait: () => !$('labDrawer').hidden },
  { say: 'Line up the yellow arrow, then press LAUNCH and hit the layer on your ticket!', target: () => domRect('#launchBtn'), wait: () => G.hits > TUT.base.hits },
  { say: 'In a real round a miss or a wrong layer costs a life and resets your combo. A right hit gives points, a combo bonus and extra time.', target: () => domRect('.hud') },
  { say: "That's everything. After each round " + CFG.mascot.name + " quizzes you: right answers earn points that unlock fancier sandwiches. You're ready to cook!", target: null, last: true }
];
/* Sandy: the tutorial guide, using the supplied artwork (transparent WebP data URIs; swap a string to change a pose, add a key to add one) */
const MASCOT_IMG = {"idle": "data:image/webp;base64,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", "happy": "data:image/webp;base64,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", "welcome": "data:image/webp;base64,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", "success": "data:image/webp;base64,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", "sad": "data:image/webp;base64,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", "confused": "data:image/webp;base64,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"};
const mascotImgs = {}; Object.keys(MASCOT_IMG).forEach(k => { const im = new Image(); im.addEventListener('load', () => { if (REDUCED && !scr.title.hidden) intro.size(); }); im.src = MASCOT_IMG[k]; mascotImgs[k] = im; });
/* white sticker outline baked once per sprite onto a small offscreen canvas (cached), plus a soft offset shadow */
function outlinedSprite(key) {
  const cache = outlinedSprite.c || (outlinedSprite.c = {});
  const name = (CFG.mascot.expressions[key] || {}).sprite || key, im = mascotImgs[name];
  if (!im || !im.complete || !im.naturalWidth) return null;
  if (cache[name]) return cache[name];
  const nw = im.naturalWidth, nh = im.naturalHeight, pad = Math.max(4, Math.round(nh * 0.014)), W2 = nw + pad * 2, H2 = nh + pad * 3;
  const mk = () => { const q = document.createElement('canvas'); q.width = W2; q.height = H2; return q; };
  const sil = mk(), g = sil.getContext('2d');
  [pad, pad * 0.55].forEach(r => { for (let i = 0; i < 28; i++) { const a = i / 28 * 6.2832; g.drawImage(im, pad + Math.cos(a) * r, pad + Math.sin(a) * r); } });
  g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fff'; g.fillRect(0, 0, W2, H2);
  const sh = mk(), g2 = sh.getContext('2d'); g2.drawImage(sil, 0, 0); g2.globalCompositeOperation = 'source-in'; g2.fillStyle = 'rgba(90,50,30,.28)'; g2.fillRect(0, 0, W2, H2);
  const cv = mk(), c = cv.getContext('2d'); c.drawImage(sh, 0, pad * 0.8); c.drawImage(sil, 0, 0); c.drawImage(im, pad, pad);
  return (cache[name] = { cv, pad, nw, nh, eyes: findEyes(im) });
}
/* locate the two blue irises in the art (used for the title-screen blink) */
function findEyes(im) {
  try {
    const w = im.naturalWidth, h = im.naturalHeight, lim = Math.round(h * 0.6), t = document.createElement('canvas'); t.width = w; t.height = h;
    const g = t.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, w, lim).data, L = [], R = [];
    for (let y = 0; y < lim; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, r = d[i], gg = d[i + 1], b = d[i + 2]; if (d[i + 3] > 200 && b > 150 && b > r + 25 && b >= gg - 5) (x < w / 2 ? L : R).push([x, y]); }
    if (L.length < 25 || R.length < 25) return null;
    const box = a => { const xs = a.map(p => p[0]), ys = a.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys); return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, r: Math.max(x1 - x0, y1 - y0) / 2 + 1 }; };
    const e1 = box(L), e2 = box(R), sx = Math.round((e1.x + e2.x) / 2), sy = Math.round((e1.y + e2.y) / 2), p = g.getImageData(sx, sy, 1, 1).data;
    return { pts: [e1, e2], skin: 'rgb(' + p[0] + ',' + p[1] + ',' + p[2] + ')' };
  } catch (e) { return null; }
}
function drawBlink(c, o, dx, dy, k) {   /* a skin-coloured lid and a lash line over each eye */
  if (!o.eyes) return;
  c.fillStyle = o.eyes.skin; c.strokeStyle = '#8a3b2a'; c.lineCap = 'round';
  o.eyes.pts.forEach(e => {
    const x = dx + (o.pad + e.x) * k, y = dy + (o.pad + e.y) * k, r = e.r * k; c.lineWidth = Math.max(1.2, r * 0.3);
    c.beginPath(); c.ellipse(x, y, r * 1.55, r * 1.5, 0, 0, 6.2832); c.fill();
    c.beginPath(); c.arc(x, y - r * 0.15, r * 0.95, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
  });
}
function drawMascot(c, x, y, s, key, tm) {   /* feet-centred at (x, y); scales to fill the canvas */
  const E = CFG.mascot.expressions[key] || CFG.mascot.expressions.idle, im = mascotImgs[E.sprite];
  if (!im || !im.complete || !im.naturalWidth) return;
  const k = Math.min((c.canvas.height - 12) / im.naturalHeight, (c.canvas.width - 8) / im.naturalWidth) * s, w = im.naturalWidth * k, h = im.naturalHeight * k;
  const bob = REDUCED ? 0 : Math.sin(tm * 2.4) * 2;   /* gentle idle bob (off under reduced motion) */
  const o = outlinedSprite(key);   /* the white outlined version, falling back to the plain sprite */
  if (o) { const k2 = Math.min((c.canvas.height - 12) / o.cv.height, (c.canvas.width - 8) / o.cv.width) * s; c.drawImage(o.cv, x - o.cv.width * k2 / 2, y + bob - (o.pad + o.nh) * k2, o.cv.width * k2, o.cv.height * k2); }
  else c.drawImage(im, x - w / 2, y - h + bob, w, h);
}
const TUT_FACES = ['welcome', 'happy', 'happy', 'happy', 'confused', 'happy', 'sad', 'success'];
TUT_STEPS.forEach((st, i) => { st.face = TUT_FACES[i]; });
/* gentle touches: a sparkle ring when a layer is hit or lands */
function ring(x, y) { (G.fx = G.fx || []).push({ x, y, t: 0 }); }
function sparkle(c, x, y, r) { c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, q = i % 2 ? r * 0.35 : r; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); c.fill(); }
function drawFx(c) {
  (G.fx || []).forEach(f => {
    const k = f.t / 0.7, a = clamp(1 - k, 0, 1);
    c.save(); c.globalAlpha = a; c.strokeStyle = '#ffd23f'; c.lineWidth = 4 * a + 1; c.beginPath(); c.arc(f.x, f.y, 10 + (REDUCED ? 14 : k * 34), 0, 6.28); c.stroke();
    c.fillStyle = '#fff6b0'; for (let i = 0; i < 4; i++) { const an = i * 1.5708 + (REDUCED ? 0 : k * 2), r = 16 + (REDUCED ? 10 : k * 30); sparkle(c, f.x + Math.cos(an) * r, f.y + Math.sin(an) * r, 6 * a + 2); }
    c.restore();
  });
}
/* homey kitchen props */
function drawUtensils(c, x, y) {
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#5e3322'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 170, y); c.stroke();
  [[28, 's'], [85, 'w'], [142, 'l']].forEach(a => {
    const px = x + a[0]; c.lineWidth = 2.5; c.beginPath(); c.moveTo(px, y); c.lineTo(px, y + 16); c.stroke();
    c.fillStyle = a[1] === 'w' ? '#dfe7ee' : '#d49a5a'; rr(c, px - 2.5, y + 16, 5, 40, 2.5); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(px, y + 68, a[1] === 'w' ? 9 : a[1] === 'l' ? 11 : 9, a[1] === 'w' ? 17 : a[1] === 'l' ? 9 : 12, 0, 0, 6.28); c.fill(); c.stroke();
  });
  c.restore();
}
function drawHerbPot(c, x, y) {
  c.save(); c.lineJoin = 'round'; c.lineWidth = 2.5; c.strokeStyle = '#5e3322'; c.fillStyle = '#4a9a3a';
  [[-8, -34, -0.5], [0, -42, 0], [8, -34, 0.5]].forEach(a => { c.beginPath(); c.ellipse(x + a[0], y + a[1], 5, 12, a[2], 0, 6.28); c.fill(); c.stroke(); });
  c.fillStyle = '#c8693a'; c.beginPath(); c.moveTo(x - 15, y - 24); c.lineTo(x + 15, y - 24); c.lineTo(x + 11, y); c.lineTo(x - 11, y); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#e08a55'; rr(c, x - 17, y - 28, 34, 8, 3); c.fill(); c.stroke(); c.restore();
}
function startTutorial() {
  chosenRecipe = recipeOrder()[0];
  wave(() => {
    show('game'); el.pauseBtn.textContent = 'Pause'; newRound('easy'); G.sandbox = true; G.phase = 'play';
    lockControls(false); $('labDrawer').hidden = true; layout();
    setFeedback('Tutorial', 'A safe sandbox: no timer, no lives lost, no score saved.', '');
    $('tutorial').hidden = false; TUT.on = true; TUT.i = 0; tutShow();
  }, 1);
}
function tutShow() {
  const s = TUT_STEPS[TUT.i]; TUT.base = { angle: G.angle, d: G.distance, hits: G.hits };
  $('tutStep').textContent = CFG.mascot.name + ' · Step ' + (TUT.i + 1) + ' of ' + TUT_STEPS.length;
  $('tutSay').textContent = s.say; $('tutNext').textContent = s.last ? "Let's play!" : 'Next';
  if (s.onEnter) s.onEnter();
  tutTick();
}
function tutTick() {
  if (!TUT.on) return;
  const s = TUT_STEPS[TUT.i], sp = $('tutSpot'), b = $('tutBubble'), r = s.target ? s.target() : null;
  if (r) { const p = 8; sp.style.cssText = 'left:' + (r.l - p) + 'px;top:' + (r.t - p) + 'px;width:' + (r.w + 2 * p) + 'px;height:' + (r.h + 2 * p) + 'px'; }
  else sp.style.cssText = 'left:50%;top:50%;width:0;height:0;border-width:0';
  const lower = r && r.t + r.h / 2 > innerHeight * 0.5;
  b.style.top = lower ? 'calc(10px + env(safe-area-inset-top, 0px))' : 'auto'; b.style.bottom = lower ? 'auto' : 'calc(10px + env(safe-area-inset-bottom, 0px))';
  const ok = !(s.wait && !s.wait());
  $('tutNext').disabled = !ok;   /* Next unlocks once the player has done the task */
  const cv = $('tutChef'), mc = cv.getContext('2d'); mc.clearRect(0, 0, cv.width, cv.height);
  drawMascot(mc, cv.width / 2, cv.height - 4, 1, s.wait && ok ? 'success' : s.face, performance.now() / 1000);
}
function endTutorial(done) {
  TUT.on = false; $('tutorial').hidden = true; G.sandbox = false;
  if (done) { try { localStorage.setItem(TUT_KEY, '1'); } catch (e) { /* ignore */ } }
  updateTutBtn(); goSetup();   /* skipping or finishing both land on the setup screen */
}
function wireExtras() {
  const open = () => { $('profileScreen').hidden = false; pfRender(); };
  $('profileBtn').addEventListener('click', open); $('profileBtn2').addEventListener('click', open);
  $('pfRandom').addEventListener('click', () => { CFG.character.tabs.forEach(t => { look[t.id] = pick(CFG.character[t.id]).id; }); saveLook(); pfRender(); paintChars('idle'); });
  $('pfPose').addEventListener('click', () => { pfPose = ['fire', 'cheer', 'wince'][pfN++ % 3]; setTimeout(() => { pfPose = 'idle'; }, 1200); });
  $('tutBtn').addEventListener('click', startTutorial);
  $('sandyHit').addEventListener('click', () => intro.tapSandy());
  $('tutNext').addEventListener('click', () => { if (TUT_STEPS[TUT.i].last) endTutorial(true); else { TUT.i++; tutShow(); } });
  $('tutSkip').addEventListener('click', () => endTutorial(false));
  setInterval(() => { if (!$('profileScreen').hidden) pfDraw(); }, 50); setInterval(tutTick, 100);
  $('tutAskText').textContent = 'Take a quick, safe tutorial with ' + CFG.mascot.name + ', or jump straight in.';
  wireSfx(); wireQuiz(); updateTutBtn(); paintChars('idle');
}


/* ===================================================================
   19. QUIZ WITH SANDY: questions built from the player's own shots (templates live in CFG.quiz)
   =================================================================== */
const QKEY = 'breadjectory-quiz';
const qBlank = () => ({ points: 0, streak: 0, last: [], c: {}, seen: [] });
const readQ = () => { let raw = null; try { raw = JSON.parse(localStorage.getItem(QKEY)); } catch (e) { raw = null; } const o = Object.assign(qBlank(), raw); if (raw && typeof raw.points !== 'number') o.points = Number(raw.stars) || 0; return o; };   /* old quiz stars carry over as points */
const saveQ = o => { try { localStorage.setItem(QKEY, JSON.stringify(o)); } catch (e) { /* storage unavailable */ } };
const nf = (x, d) => String(+x.toFixed(d === undefined ? 1 : d));
const QH = {
  choice(q, texts, ci) { return Object.assign(q, { type: 'mc', options: shuffle(texts.map((t, i) => ({ t, ok: i === ci }))) }); },
  /* a numeric question: pick the answer from a list on Easy, type it on Medium and Hard */
  num(lv, q) {
    if (lv !== 'easy') return Object.assign(q, { type: 'num' });
    const seen = {}, texts = [];
    [q.answer].concat(q.wrongs).forEach(v => { const t = nf(v, q.dp) + ' ' + q.unit; if (!seen[t]) { seen[t] = 1; texts.push(t); } });
    return texts.length < 3 ? null : QH.choice(q, texts, 0);
  },
  valid(q) {
    if (!q || !q.text || !q.hints || !q.work || !q.formula) return false;
    if (q.type === 'num') return isFinite(q.answer) && q.tol > 0;
    const t = q.options.map(o => o.t);
    return q.options.length >= 2 && q.options.filter(o => o.ok).length === 1 && new Set(t).size === t.length;
  }
};
function quizData() {   /* numbers from the round that just ended (or a typical shot if nothing was fired) */
  const log = G.log || [], hits = log.filter(x => x.ok), last = hits[hits.length - 1] || log[log.length - 1], real = !!last;
  const sh = last || { angle: CFG.angle.def, v: CFG.velocity.def, D: CFG.distance.def, n: CFG.stackLayers };
  const sim = simulate(sh.angle, sh.v, sh.D, sh.n), th = sh.angle * Math.PI / 180;
  const misses = log.filter(x => x.end !== 'hit');
  return { real, lead: real ? (last.ok ? 'On your last hit' : 'On your last shot') : 'Imagine a shot', angle: sh.angle, v: sh.v, D: sh.D, end: sim.end, t: sim.t, x: sim.x,
    vx: sh.v * Math.cos(th), vy: sh.v * Math.sin(th), a: accelOf(sh.v), F: forceOf(sh.v), miss: misses[misses.length - 1] || null };
}
function pickQuestions(d, mode) {
  const st = readQ(), L = ['easy', 'medium', 'hard'].indexOf(mode), made = [];
  CFG.quiz.templates.forEach(t => { if (t.minLevel > L) return; let q = null; try { q = t.make(d, mode); } catch (e) { q = null; } if (QH.valid(q)) made.push(Object.assign(q, { id: t.id, concept: t.concept })); });
  const need = c => { const r = st.c[c]; return r ? (r.w + 1) / (r.r + r.w + 2) : 0.5; };   /* higher = needs more practice */
  const fresh = made.filter(q => !st.last.includes(q.id)), base = fresh.length >= CFG.quiz.count ? fresh : made;
  const sorted = base.map(q => [need(q.concept) + Math.random() * 0.35, q]).sort((a, b) => b[0] - a[0]).map(x => x[1]), out = [], seen = {};
  sorted.forEach(q => { if (out.length < CFG.quiz.count && !seen[q.concept]) { seen[q.concept] = 1; out.push(q); } });
  sorted.forEach(q => { if (out.length < CFG.quiz.count && !out.includes(q)) out.push(q); });
  return shuffle(out);
}
const Q = { list: [], i: 0, tries: 0, hints: 0, hmax: 0, done: false, res: [], expr: 'welcome', open: false, start: 0, review: -1, perfectDone: false };
const cur = () => Q.list[Q.review >= 0 ? Q.review : Q.i];
const sayQ = (txt, expr) => { $('qSay').textContent = txt; if (expr) Q.expr = expr; };
const ptsLabel = () => '★ ' + readQ().points + ' Quiz points';
const setEnd = locked => ['againBtn', 'endKitchenBtn', 'changeBtn', 'endLbBtn', 'endTitleBtn'].forEach(id => { $(id).disabled = locked; });
const ansText = q => q.type === 'num' ? nf(q.answer, q.dp) + ' ' + q.unit : q.options.find(o => o.ok).t;
/* sandwiches unlock from the simplest to the best as quiz points grow (CFG.recipes[x].unlockAt) */
const recipeOrder = () => Object.keys(CFG.recipes).sort((a, b) => (CFG.recipes[a].unlockAt || 0) - (CFG.recipes[b].unlockAt || 0));
const isUnlocked = key => readQ().points >= (CFG.recipes[key].unlockAt || 0);
function ensureRecipe() { if (!CFG.recipes[chosenRecipe] || !isUnlocked(chosenRecipe)) chosenRecipe = recipeOrder().find(isUnlocked) || recipeOrder()[0]; }
function openQuiz() {   /* runs automatically after every real round */
  Q.list = pickQuestions(quizData(), G.mode); Q.i = 0; Q.res = []; Q.review = -1; Q.perfectDone = false; Q.start = readQ().points; Q.open = true;
  setEnd(true); $('endQuizNote').textContent = 'Quiz time! Answer to earn points and unlock new sandwiches.';
  document.querySelector('.qname').textContent = CFG.mascot.name; $('qRecap').hidden = true; $('qBody').hidden = false; $('quizScreen').hidden = false;
  if (!Q.list.length) { closeQuiz(); return; }
  renderQ();
}
function closeQuiz() { Q.open = false; $('quizScreen').hidden = true; setEnd(false); $('endQuizNote').textContent = 'Quiz done! You have ' + readQ().points + ' quiz points.'; $('againBtn').focus({ preventScroll: true }); }
function renderQ() {
  const q = cur(), rev = Q.review >= 0; Q.tries = 0; Q.hints = 0; Q.done = false; Q.hmax = Math.min(q.hints.length, CFG.quiz.levels[G.mode].hints);
  $('qProg').textContent = rev ? 'Skipped question' : 'Question ' + (Q.i + 1) + ' of ' + Q.list.length; $('qStars').textContent = ptsLabel();
  $('qText').textContent = q.text; $('qHints').innerHTML = ''; $('qStatus').textContent = ''; $('qExp').hidden = true; $('qNext').hidden = true;
  const hb = $('qHint'); hb.hidden = false; hb.disabled = Q.hmax === 0; hb.textContent = 'Hint (' + Q.hmax + ')';
  const sk = $('qSkipQ'); sk.hidden = false; sk.textContent = rev ? 'Back to summary' : 'Skip question';
  const box = $('qOpts'); box.innerHTML = ''; box.hidden = q.type !== 'mc'; $('qNumRow').hidden = q.type !== 'num';
  if (q.type === 'mc') q.options.forEach((o, k) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'qopt'; b.dataset.k = k;
    b.innerHTML = '<b></b><span></span><i class="mark"></i>'; b.children[0].textContent = 'ABCD'[k]; b.children[1].textContent = o.t; b.addEventListener('click', () => judge(o.ok, k)); box.appendChild(b);
  });
  else { $('qUnit').textContent = q.unit; $('qNum').value = ''; $('qNum').disabled = false; $('qCheck').disabled = false; }
  if (rev) sayQ('Take your time. This one is worth half points.', 'happy'); else sayQ(Q.i === 0 ? pick(CFG.quiz.lines.intro) : pick(CFG.quiz.lines.next), Q.i === 0 ? 'welcome' : 'idle');
  $('qText').focus({ preventScroll: true });
}
function markOpt(k, state) { const b = $('qOpts').children[k]; if (!b) return; b.dataset.state = state; b.querySelector('.mark').textContent = state === 'right' ? '✓ Correct' : '✗ Not this one'; if (state === 'wrong') b.disabled = true; }
function checkNum() {
  if (Q.done) return; const q = cur(), x = parseFloat(String($('qNum').value).replace(',', '.'));
  if (!isFinite(x)) { $('qStatus').textContent = 'Type a number first.'; return; }
  judge(Math.abs(x - q.answer) <= q.tol * Math.abs(q.answer), -1);
}
function judge(ok, k) {
  if (Q.done) return; const q = cur();
  if (ok) { Q.done = true; sfx('correct'); endQ(true, k); return; }
  Q.tries++; sfx('softwrong'); if (q.type === 'mc') markOpt(k, 'wrong');
  if (Q.tries < 2) { sayQ(pick(CFG.quiz.lines.retry), 'sad'); $('qStatus').textContent = '✗ Not quite. Try once more!'; }
  else { Q.done = true; endQ(false, k); }
}
function endQ(ok) {
  const q = cur(), late = Q.review >= 0, st = readQ(), r = st.c[q.concept] || { r: 0, w: 0, s: 0 }, P = CFG.quiz.points, mult = P.mode[G.mode] || 1;
  let pts = 0;
  if (ok) {
    pts = Math.round((Q.tries === 0 ? (Q.hints === 0 ? P.correct : P.withHint) : P.retry) * mult * (late ? P.lateSkip : 1)); r.r++;
    if (!late) { r.s++; st.streak++; if (st.streak % P.streakEvery === 0) pts += Math.round(P.streakBonus * mult); }
  } else { r.w++; if (!late) { r.s = 0; st.streak = 0; } }
  st.points += pts; st.c[q.concept] = r; saveQ(st); $('qStars').textContent = ptsLabel();   /* saved after every answer, so nothing is lost if the tab closes */
  const entry = { q, status: ok ? 'right' : 'wrong', pts, late }; if (late) Q.res[Q.review] = entry; else Q.res.push(entry);
  if (q.type === 'mc') { q.options.forEach((o, i) => { if (o.ok) markOpt(i, 'right'); }); [].forEach.call($('qOpts').children, b => { b.disabled = true; }); } else { $('qNum').disabled = true; $('qCheck').disabled = true; }
  sayQ(pick(ok ? CFG.quiz.lines.correct : CFG.quiz.lines.wrong), ok ? 'success' : 'sad');
  $('qStatus').textContent = ok ? '✓ Correct! +' + pts + (pts === 1 ? ' point' : ' points') : '✗ The answer is ' + ansText(q) + '.';
  const e = $('qExp'); e.innerHTML = '<div class="formula"></div><ol class="work"></ol><p class="why"></p><p class="tip"></p>';
  e.querySelector('.formula').textContent = q.formula; q.work.forEach(w => { const li = document.createElement('li'); li.textContent = w; e.querySelector('.work').appendChild(li); });
  e.querySelector('.why').textContent = q.why; e.querySelector('.tip').textContent = 'Try it in the game: ' + q.tip;
  e.hidden = false; $('qHint').hidden = true; $('qSkipQ').hidden = true; const nx = $('qNext'); nx.hidden = false;
  nx.textContent = late ? 'Back to summary' : Q.i + 1 < Q.list.length ? 'Next question' : 'See my summary'; nx.focus({ preventScroll: true });
}
function hintQ() {
  if (Q.done || Q.hints >= Q.hmax) return; const q = cur(), li = document.createElement('li'); li.textContent = q.hints[Q.hints++]; $('qHints').appendChild(li);
  sfx('blip'); sayQ(pick(CFG.quiz.lines.hint), 'confused'); const hb = $('qHint'), left = Q.hmax - Q.hints; hb.textContent = 'Hint (' + left + ')'; hb.disabled = left === 0;
}
function skipQ() {
  if (Q.review >= 0) { Q.review = -1; recapQ(); return; }   /* "Back to summary" while reviewing a skipped question */
  sfx('swish'); Q.res.push({ q: cur(), status: 'skipped', pts: 0 }); nextQ(); if ($('qRecap').hidden) sayQ(pick(CFG.quiz.lines.skip), 'idle');
}
function nextQ() { if (Q.review >= 0) { Q.review = -1; recapQ(); return; } if (Q.i + 1 < Q.list.length) { Q.i++; renderQ(); } else recapQ(); }
function recapQ() {
  const C = CFG.quiz.concepts, P = CFG.quiz.points, mult = P.mode[G.mode] || 1, st0 = readQ();
  const perfect = Q.res.length > 0 && Q.res.every(r => r.status === 'right' && !r.late);
  if (perfect && !Q.perfectDone) { Q.perfectDone = true; st0.points += Math.round(P.perfect * mult); saveQ(st0); }
  const st = readQ(), gained = st.points - Q.start, count = k => Q.res.filter(r => r.status === k).length, order = recipeOrder();
  st.last = Q.res.map(r => r.q.id); const nowIds = order.filter(isUnlocked); st.seen = st.seen.filter(k => !nowIds.includes(k) || true); saveQ(st);
  const fresh = order.filter(k => Q.start < (CFG.recipes[k].unlockAt || 0) && st.points >= (CFG.recipes[k].unlockAt || 0)), nxt = order.find(k => !isUnlocked(k));
  const weak = Q.res.filter(r => r.status !== 'right').map(r => r.q.concept).filter((c, i, a) => a.indexOf(c) === i);
  $('qBody').hidden = true; const rc = $('qRecap'); rc.hidden = false; $('qProg').textContent = 'Summary'; $('qStars').textContent = ptsLabel();
  rc.innerHTML = '<h3 id="qDone"></h3><p class="qscore"></p><div class="qunlock" role="status" hidden></div><div class="qlist"></div><div class="qrev"></div><div class="actions"></div>';
  rc.querySelector('#qDone').textContent = count('right') + ' right · ' + count('wrong') + ' wrong · ' + count('skipped') + ' skipped';
  rc.querySelector('.qscore').textContent = '+' + gained + ' quiz points this round' + (perfect ? ' (perfect quiz bonus!)' : '') + ' · ' + st.points + ' in total · ' + (nxt ? 'next sandwich: ' + CFG.recipes[nxt].name + ' at ' + CFG.recipes[nxt].unlockAt + ' points (' + (CFG.recipes[nxt].unlockAt - st.points) + ' to go)' : 'every sandwich is unlocked!');
  const ub = rc.querySelector('.qunlock'); if (fresh.length) { ub.hidden = false; ub.textContent = '✨ New sandwich unlocked: ' + fresh.map(k => CFG.recipes[k].name).join(', ') + '! ✨'; }
  Q.res.forEach((r, i) => {
    const q = r.q, d = document.createElement('details'), sm = document.createElement('summary'), body = document.createElement('div'); d.className = 'qrow'; body.className = 'qexp';
    sm.textContent = (r.status === 'right' ? '✓ Right' : r.status === 'wrong' ? '✗ Wrong' : '– Skipped') + ' · ' + C[q.concept].name + (r.pts ? ' · +' + r.pts + ' pts' : '');
    body.innerHTML = '<p class="qq"></p><p class="qa"></p><div class="formula"></div><ol class="work"></ol><p class="why"></p><p class="tip"></p>';
    body.querySelector('.qq').textContent = q.text; body.querySelector('.qa').textContent = 'Answer: ' + ansText(q); body.querySelector('.formula').textContent = q.formula;
    q.work.forEach(w => { const li = document.createElement('li'); li.textContent = w; body.querySelector('.work').appendChild(li); });
    body.querySelector('.why').textContent = q.why; body.querySelector('.tip').textContent = 'Try it in the game: ' + q.tip;
    if (r.status === 'skipped') { d.open = true; const b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-primary'; b.textContent = 'Answer now (half points)'; b.addEventListener('click', () => { Q.review = i; $('qRecap').hidden = true; $('qBody').hidden = false; renderQ(); }); body.appendChild(b); }
    d.append(sm, body); rc.querySelector('.qlist').appendChild(d);
  });
  const rev = rc.querySelector('.qrev'); if (weak.length) { const p = document.createElement('p'); p.textContent = 'Sandy suggests practising:'; rev.appendChild(p); weak.slice(0, 2).forEach(c => { const t = document.createElement('p'); t.className = 'tip'; t.textContent = C[c].name + ': ' + C[c].practice; rev.appendChild(t); }); }
  const act = rc.querySelector('.actions'), mk = (id, label, cls, fn) => { const b = document.createElement('button'); b.type = 'button'; b.id = id; b.className = 'btn' + (cls ? ' ' + cls : ''); b.textContent = label; b.addEventListener('click', fn); act.appendChild(b); return b; };
  const done = mk('qClose', 'Done', fresh.length ? '' : 'btn-primary', closeQuiz);
  if (fresh.length) mk('qKitchen', 'Go to the kitchen', 'btn-primary', () => { closeQuiz(); $('endKitchenBtn').click(); });
  mk('qAgain', 'Play again', '', () => { closeQuiz(); $('againBtn').click(); });
  const ratio = (count('right') + 0.5 * count('skipped')) / Math.max(1, Q.res.length); sfx(fresh.length ? 'fanfare' : ratio >= 0.5 ? 'done' : 'blip');
  sayQ(fresh.length ? 'New sandwich unlocked! You earned it!' : ratio >= 0.8 ? CFG.quiz.lines.done.high : ratio >= 0.5 ? CFG.quiz.lines.done.mid : CFG.quiz.lines.done.low, fresh.length || ratio >= 0.5 ? 'success' : 'happy');
  (fresh.length ? act.lastElementChild.previousElementSibling : done).focus({ preventScroll: true });
}
function wireQuiz() {
  $('qSkipQ').addEventListener('click', skipQ); $('qNext').addEventListener('click', nextQ); $('qHint').addEventListener('click', hintQ); $('qCheck').addEventListener('click', checkNum);
  $('qNum').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); checkNum(); } });
  $('quizScreen').addEventListener('keydown', e => {   /* keep Tab inside the dialog */
    if (e.key !== 'Tab') return; const f = [].filter.call($('quizScreen').querySelectorAll('button, input, summary, [tabindex="-1"]#qText'), x => !x.disabled && !x.hidden && x.offsetParent !== null);
    if (!f.length) return; const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  setInterval(() => { if (!Q.open) return; const cv = $('qSandy'), c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height); drawMascot(c, cv.width / 2, cv.height - 4, 1, Q.expr, performance.now() / 1000); }, 100);
}


/* ===================================================================
   20. SOUND EFFECTS: tiny synthesized sounds (WebAudio), no audio files. Add a sound to SOUNDS and call sfx('name')
   =================================================================== */
const SFX_KEY = 'breadjectory-sound';
const SFX = { on: (() => { try { return localStorage.getItem(SFX_KEY) !== '0'; } catch (e) { return true; } })(), ctx: null, master: null, nbuf: null };
function sfxCtx() {
  if (!SFX.ctx) {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    SFX.ctx = new AC(); SFX.master = SFX.ctx.createGain(); SFX.master.gain.value = CFG.sound.volume; SFX.master.connect(SFX.ctx.destination);
    const n = SFX.ctx.sampleRate, b = SFX.ctx.createBuffer(1, n, n), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; SFX.nbuf = b;
  }
  if (SFX.ctx.state === 'suspended') SFX.ctx.resume();
  return SFX.ctx;
}
function tone(f, d, type, v, t0, f2) {   /* one note: start pitch f (slides to f2), length d seconds, volume v */
  const c = sfxCtx(); if (!c) return; const t = c.currentTime + (t0 || 0), o = c.createOscillator(), g = c.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || 0.2, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(SFX.master); o.start(t); o.stop(t + d + 0.03);
}
function noise(d, v, f1, f2, t0) {   /* a swoosh or rumble: filtered noise sweeping from f1 to f2 */
  const c = sfxCtx(); if (!c) return; const t = c.currentTime + (t0 || 0), s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
  s.buffer = SFX.nbuf; s.loop = true; fl.type = 'bandpass'; fl.Q.value = 0.9; fl.frequency.setValueAtTime(f1, t); fl.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(fl); fl.connect(g); g.connect(SFX.master); s.start(t); s.stop(t + d + 0.03);
}
const SOUNDS = {
  click:     (a, d) => tone(740, 0.05, 'square', 0.06, d),
  pop:       (a, d) => tone(420, 0.09, 'sine', 0.2, d, 880),
  launch:    (a, d) => { noise(0.28, 0.3, 400, 2400, d); tone(220, 0.2, 'sine', 0.3, d, 70); },
  hit:       (a, d) => { const m = 1 + 0.07 * Math.min(a, 8); [880, 1320].forEach(f => tone(f * m, 0.35, 'sine', 0.16, d)); [1047, 1319, 1568].forEach((f, i) => tone(f * m, 0.14, 'triangle', 0.1, d + 0.08 + i * 0.07)); },
  wrong:     (a, d) => { tone(240, 0.28, 'triangle', 0.3, d, 120); tone(180, 0.28, 'square', 0.06, d + 0.02, 90); },
  softwrong: (a, d) => tone(330, 0.2, 'sine', 0.2, d, 200),
  thud:      (a, d) => { tone(140, 0.18, 'sine', 0.35, d, 50); noise(0.12, 0.15, 600, 200, d); },
  rotten:    (a, d) => { noise(0.35, 0.4, 900, 150, d); tone(130, 0.3, 'sine', 0.3, d, 55); },
  collapse:  (a, d) => { noise(0.9, 0.4, 500, 80, d); [300, 240, 180, 120].forEach((f, i) => tone(f, 0.22, 'triangle', 0.15, d + i * 0.12, f * 0.6)); },
  win:       (a, d) => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i === 5 ? 0.5 : 0.18, 'triangle', 0.2, d + i * 0.14)),
  lose:      (a, d) => [392, 370, 349, 330].forEach((f, i) => tone(f, i === 3 ? 0.6 : 0.28, 'sawtooth', 0.1, d + i * 0.3)),
  tick:      (a, d) => tone(1000, 0.04, 'square', 0.05, d),
  whoosh:    (a, d) => noise(0.5, 0.2, 300, 3000, d),
  correct:   (a, d) => { tone(660, 0.12, 'sine', 0.2, d); tone(990, 0.3, 'sine', 0.2, d + 0.1); tone(1320, 0.25, 'triangle', 0.08, d + 0.18); },
  blip:      (a, d) => tone(600, 0.08, 'sine', 0.15, d, 900),
  swish:     (a, d) => noise(0.18, 0.14, 2000, 600, d),
  done:      (a, d) => [659, 784, 988].forEach((f, i) => tone(f, i === 2 ? 0.4 : 0.14, 'triangle', 0.18, d + i * 0.12)),
  fanfare:   (a, d) => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i === 4 ? 0.6 : 0.15, 'triangle', 0.2, d + i * 0.13)),
  squeak:    (a, d) => { tone(500, 0.1, 'sine', 0.25, d, 1100); tone(700, 0.12, 'sine', 0.22, d + 0.11, 1400); }
};
function sfx(name, arg, delay) { if (!SFX.on || !SOUNDS[name]) return; try { SOUNDS[name](arg || 0, delay || 0); } catch (e) { /* audio is optional */ } }
function updateSfxBtns() {
  document.querySelectorAll('.sfxBtn').forEach(b => {
    const t = SFX.on ? 'Sound on. Press to mute.' : 'Sound off. Press to turn on.';
    b.textContent = SFX.on ? '🔊' : '🔇'; b.setAttribute('aria-pressed', String(SFX.on)); b.setAttribute('aria-label', t); b.title = t;
  });
}
function wireSfx() {
  document.querySelectorAll('.sfxBtn').forEach(b => b.addEventListener('click', () => {
    SFX.on = !SFX.on; try { localStorage.setItem(SFX_KEY, SFX.on ? '1' : '0'); } catch (e) { /* ignore */ } updateSfxBtns(); sfx('pop');
  }));
  document.addEventListener('click', e => {   /* a soft click for every button, unless it has a sound of its own */
    const b = e.target.closest && e.target.closest('button'); if (!b || b.disabled || b.classList.contains('sfxBtn') || b.matches('#launchBtn, .qopt, #sandyHit')) return;
    sfx(b.matches('.rcard.locked') ? 'softwrong' : b.matches('.rcard, .pf-item') ? 'pop' : 'click');
  }, true);
  const first = () => { if (SFX.on) sfxCtx(); };   /* browsers only allow sound after a first tap or key press */
  addEventListener('pointerdown', first, { once: true }); addEventListener('keydown', first, { once: true });
  document.addEventListener('visibilitychange', () => { if (SFX.ctx) { if (document.hidden) SFX.ctx.suspend(); else if (SFX.on) SFX.ctx.resume(); } });
  updateSfxBtns();
}

/* ---- wiring ---- */
function init() {
  buildControls(); syncControls(null); updateLab(); buildBrand();
  nameInput.value = readName();
  try { const sv = localStorage.getItem('breadjectory-hidearrow'); hideArrow = sv === null ? CFG.hideArrowDefault : sv === '1'; } catch (e) { /* ignore */ }
  $('hideArrow').checked = hideArrow;
  nameInput.addEventListener('input', () => { nameInput.classList.remove('err'); $('nameErr').hidden = true; });
  nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') beginPlay(); });
  document.querySelectorAll('.mode').forEach(b => b.addEventListener('click', () => {
    chosenMode = b.dataset.mode;
    document.querySelectorAll('.mode').forEach(o => o.setAttribute('aria-checked', String(o === b)));
    newRound(chosenMode);
  }));
  document.querySelectorAll('.lbtab').forEach(b => b.addEventListener('click', () => { lbMode = b.dataset.mode; renderLB(); }));
  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => { $(b.dataset.close).hidden = true; }));
  const toSetup = () => wave(() => { show('setup'); nameInput.focus({ preventScroll: true }); }, 1);
  $('playBtn').addEventListener('click', () => { if (!tutDone() && !tutAsked()) $('tutAsk').hidden = false; else toSetup(); });
  $('tutAskYes').addEventListener('click', () => { markAsked(); $('tutAsk').hidden = true; startTutorial(); });
  $('tutAskNo').addEventListener('click', () => { markAsked(); $('tutAsk').hidden = true; toSetup(); });
  $('startBtn').addEventListener('click', beginPlay);
  buildKitchen();
  $('cookBtn').addEventListener('click', cook);
  $('kitchenBack').addEventListener('click', () => wave(() => show('setup'), -1));
  $('pausedKitchen').addEventListener('click', goKitchen);
  $('endKitchenBtn').addEventListener('click', goKitchen);
  const chips = $('lbChips');
  [['all', 'All']].concat(Object.keys(CFG.recipes).map(k => [k, CFG.recipes[k].name])).forEach(a => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.dataset.r = a[0]; b.textContent = a[1];
    b.addEventListener('click', () => { lbRecipe = a[0]; renderLB(); }); chips.appendChild(b);
  });
  $('setupBack').addEventListener('click', () => wave(() => show('title'), -1));
  $('howBtn').addEventListener('click', () => { scr.how.hidden = false; });
  $('lbBtn').addEventListener('click', () => openLB(chosenMode));
  $('againBtn').addEventListener('click', () => { el.pauseBtn.textContent = 'Pause'; startGame(G.mode); updateLast(); });
  $('changeBtn').addEventListener('click', goSetup);
  $('endLbBtn').addEventListener('click', () => openLB(G.mode));
  $('endTitleBtn').addEventListener('click', goTitle);
  $('pausedSetup').addEventListener('click', goSetup);
  $('pausedTitle').addEventListener('click', goTitle);
  $('menuBtn').addEventListener('click', () => { if (G.sandbox) endTutorial(false); else if (G.phase === 'play') togglePause(); else goTitle(); });
  $('resumeBtn').addEventListener('click', togglePause);
  el.pauseBtn.addEventListener('click', togglePause);
  el.launchBtn.addEventListener('click', launch);
  el.previewBtn.addEventListener('click', () => setPreview({ full: 'short', short: 'off', off: 'full' }[G.previewMode]));
  $('labBtn').addEventListener('click', () => { const d = $('labDrawer'); d.hidden = !d.hidden; $('labBtn').setAttribute('aria-expanded', String(!d.hidden)); });
  $('tuneBtn').addEventListener('click', () => { const o = scr.game.classList.toggle('tuneopen'); $('tuneBtn').setAttribute('aria-expanded', String(o)); });
  $('rotateOk').addEventListener('click', () => { rotDismissed = true; rotateCheck(); });
  document.addEventListener('keydown', e => {
    const t = e.target;
    if (e.code === 'Space' && !scr.game.hidden && !(t instanceof HTMLButtonElement) && t.tagName !== 'INPUT' && t.tagName !== 'SUMMARY') { e.preventDefault(); launch(); }
    if (e.key === 'Escape') { scr.how.hidden = true; scr.lb.hidden = true; $('profileScreen').hidden = true; }
  });
  wireDrag(); wireExtras();
  addEventListener('resize', () => { layout(); rotateCheck(); intro.size(); });
  addEventListener('orientationchange', () => setTimeout(() => { layout(); rotateCheck(); intro.size(); }, 200));
  setInterval(updateLast, 200);
  newRound(chosenMode); syncOverlays();
  intro.size(); show('title');
  requestAnimationFrame(t => { lastStamp = t; frame(t); });
}
init();
})();

