// Partida de teste para o HUD Looking.
// Conecta no Spectra Server como se fosse o capturador e manda uma partida simulada
// (compra, combate, abates, spike, troca de lado, aces e clutches de vez em quando).
//
// Uso (dentro da pasta do Spectra-Server, que já tem o socket.io-client instalado):
//   node partida-teste.js [servidor] [codigo]
//   node partida-teste.js http://localhost:5100 TESTE
//
// No OBS: broadcast.html?server=http://localhost:5200&groupCode=TESTE

const { io } = require("socket.io-client");

const SERVER = process.argv[2] || "http://localhost:5100";
const GROUP = (process.argv[3] || "TESTE").toUpperCase();
const OBS = "Teste#HUD";
const F = Math.max(0.1, Number(process.env.VELOCIDADE || 1)); // VELOCIDADE=2 deixa tudo 2x mais rápido
const T = { shopping: 12000, combatMax: 45000, end: 6000, tick: 1000, spike: 15000 }; // tempos encurtados

const TEAMS = [
  { name: "Jangada Esports", tricode: "JGD", players: [["kaiaque", "Wushu"], ["mareh", "Wraith"], ["tucunare", "Hunter"], ["ventosul", "Killjoy"], ["cajuzin", "Breach"]] },
  { name: "Caatinga Club", tricode: "CTG", players: [["xique", "Clay"], ["mandacaru", "Pandemic"], ["lampiao", "BountyHunter"], ["seriema", "Gumshoe"], ["aboio", "Rift"]] },
];
const ULT = { Wushu: 8, Wraith: 7, Hunter: 8, Killjoy: 9, Breach: 8, Clay: 8, Pandemic: 9, BountyHunter: 8, Gumshoe: 6, Rift: 7 };
const W = {
  Classic: "TX_Hud_Pistol_Classic", Ghost: "TX_Hud_Pistol_Luger", Sheriff: "TX_Hud_Pistol_Sheriff",
  Spectre: "TX_Hud_SMGs_Ninja", Bulldog: "TX_Hud_Rifles_Burst", Marshal: "TX_Hud_Sniper_Bolt",
  Phantom: "TX_Hud_Rifles_Ghost", Vandal: "TX_Hud_Rifles_Volcano", Operator: "TX_Hud_Sniper_Operater",
};
const COST = { Classic: 0, Ghost: 500, Sheriff: 800, Spectre: 1600, Bulldog: 2050, Marshal: 950, Phantom: 2900, Vandal: 2900, Operator: 4700 };
const ARMOR = { none: 0, light: 1, heavy: 2 };

const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms / F));
const uuid = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => ((Math.random() * 16) | 0).toString(16));

// estado: time 0 começa atacando (startTeam 0), time 1 defendendo
const teams = TEAMS.map((t, ti) => ({
  ...t, startTeam: ti, score: 0,
  players: t.players.map(([name, agent], pi) => ({
    name, tag: "BR" + (ti * 5 + pi + 1), agent, id: uuid(), startTeam: ti, position: pi,
    money: 800, weapon: "Classic", armor: "none", alive: true, kills: 0, deaths: 0, assists: 0, ult: 0, maxUlt: ULT[agent] || 7, spike: false,
  })),
}));

const ws = io(SERVER, { reconnection: false });
const send = (type, data) => ws.emit("obs_data", JSON.stringify({ obsName: OBS, groupCode: GROUP, type, timestamp: Date.now(), data }));
const scoreboard = (p) => send("scoreboard", {
  name: p.name, tagline: p.tag, playerId: p.id, startTeam: p.startTeam, agentInternal: p.agent + "_PC_C",
  isAlive: p.alive, initialArmor: ARMOR[p.armor], scoreboardWeaponInternal: W[p.weapon],
  currUltPoints: p.ult, maxUltPoints: p.maxUlt, hasSpike: p.spike, money: p.money, kills: p.kills, deaths: p.deaths, assists: p.assists,
});
const all = () => teams.flatMap((t) => t.players);
const attackersIdx = (round) => (round < 13 ? 0 : 1);

function buy(p) {
  if (p.money >= 5700 && Math.random() < 0.12) p.weapon = "Operator";
  else if (p.money >= 3900) p.weapon = pick(["Vandal", "Phantom"]);
  else if (p.money >= 2400 && (p.weapon === "Classic" || COST[p.weapon] < 1600)) p.weapon = pick(["Spectre", "Bulldog", "Marshal"]);
  else if (p.money >= 1300 && p.weapon === "Classic") p.weapon = pick(["Sheriff", "Ghost"]);
  const wantArmor = p.money - COST[p.weapon] >= 1000 ? "heavy" : p.money - COST[p.weapon] >= 400 ? "light" : p.armor;
  const cost = (p._lastWeapon !== p.weapon ? COST[p.weapon] : 0) + (wantArmor !== p.armor ? (wantArmor === "heavy" ? 1000 : 400) : 0);
  if (cost <= p.money) { p.money -= cost; p.armor = wantArmor; }
}

function kill(attacker, victim, assister) {
  victim.alive = false; victim.deaths++; victim.spike = false;
  attacker.kills++; attacker.ult = Math.min(attacker.maxUlt, attacker.ult + 1);
  if (assister) assister.assists++;
  send("killfeed", { attacker: attacker.name, victim: victim.name, weaponKillfeedInternal: W[attacker.weapon], headshotKill: Math.random() < 0.4, assists: [], isTeamkill: false });
  scoreboard(attacker); scoreboard(victim); if (assister) scoreboard(assister);
  console.log(`   ${attacker.name} abateu ${victim.name}`);
}

async function playRound(n) {
  const ai = attackersIdx(n), att = teams[ai], def = teams[1 - ai];
  if (n === 1 || n === 13) all().forEach((p) => { p.money = 800; p.weapon = "Classic"; p.armor = "none"; p._lastWeapon = "Classic"; });
  all().forEach((p) => { p.alive = true; p.spike = false; p._lastWeapon = p.weapon; });
  pick(att.players).spike = true;

  console.log(`\nRodada ${n}  ${teams[0].tricode} ${teams[0].score} x ${teams[1].score} ${teams[1].tricode}  (ataque: ${att.tricode})`);
  send("round_info", { roundPhase: "shopping", roundNumber: n });
  all().forEach(scoreboard);
  await sleep(T.shopping * 0.35);
  all().forEach((p) => { buy(p); scoreboard(p); });
  await sleep(T.shopping * 0.65);

  send("round_info", { roundPhase: "combat", roundNumber: n });
  const start = Date.now();
  let planted = false, plantAt = 0, result = null;
  const scenario = Math.random() < 0.12 ? "ace" : Math.random() < 0.2 ? "clutch" : "normal";
  const aliveOf = (t) => t.players.filter((p) => p.alive);
  let observed = null;

  if (scenario === "ace") {
    const winTeam = Math.random() < 0.5 ? att : def, loseTeam = winTeam === att ? def : att;
    const star = pick(winTeam.players);
    console.log(`   (cenário: ace de ${star.name})`);
    send("observing", `${star.name} #${star.tag}`);
    for (const v of loseTeam.players) { await sleep(rnd(1500, 3000)); kill(star, v); }
    result = winTeam === att ? "att_kills" : "def_kills";
  } else {
    if (scenario === "clutch") console.log("   (cenário: clutch)");
    while (!result) {
      await sleep(T.tick);
      const el = Date.now() - start;
      if (Math.random() < 0.25 || !observed || !observed.alive) {
        const cands = all().filter((p) => p.alive);
        observed = pick(cands);
        if (observed) send("observing", `${observed.name} #${observed.tag}`);
      }
      // plantar a spike
      if (!planted && el > (T.combatMax * 0.45) / F && aliveOf(att).length) {
        planted = true; plantAt = Date.now();
        att.players.forEach((p) => (p.spike = false));
        send("spike_planted", true);
        console.log("   spike plantada");
      }
      // combate
      let chance = 0.45;
      if (scenario === "clutch" && aliveOf(att).length > 1 && aliveOf(def).length > 2) chance = 0.6;
      if (Math.random() < chance) {
        let a = aliveOf(att), d = aliveOf(def);
        if (!a.length || !d.length) {}
        else {
          let attackerTeamWins = Math.random() < 0.5;
          if (scenario === "clutch") {
            // derruba um lado até sobrar 1, depois esse 1 vira o jogo
            const clutchTeam = att;
            if (aliveOf(clutchTeam).length > 1) attackerTeamWins = false;
            else attackerTeamWins = true;
          }
          const killer = attackerTeamWins ? pick(a) : pick(d);
          const victim = attackerTeamWins ? pick(d) : pick(a);
          const helpers = (attackerTeamWins ? a : d).filter((p) => p !== killer);
          kill(killer, victim, Math.random() < 0.35 ? pick(helpers) : null);
        }
      }
      const aA = aliveOf(att).length, dA = aliveOf(def).length;
      if (planted) {
        if (Date.now() - plantAt > T.spike / F) { send("spike_detonated", true); result = "att_det"; console.log("   spike detonou"); }
        else if (!aA && dA) { await sleep(2500); send("spike_defused", true); result = "def_defuse"; console.log("   spike desarmada"); }
        else if (!dA) result = "att_kills";
      } else if (!aA) result = "def_kills";
      else if (!dA) result = "att_kills";
      else if (el > T.combatMax / F) result = "def_time";
    }
  }

  const attWon = result.startsWith("att");
  const winner = attWon ? att : def;
  winner.score++;
  send("score", { team_0: teams[0].score, team_1: teams[1].score });
  console.log(`   ${winner.tricode} vence a rodada (${result})`);
  // economia
  all().forEach((p) => {
    const won = teams[p.startTeam] === winner;
    p.money = Math.min(9000, p.money + (won ? 3000 : 1900));
    if (!p.alive) { p.weapon = "Classic"; p.armor = "none"; }
  });
  const over = teams.some((t) => t.score >= 13);
  send("round_info", { roundPhase: over ? "game_end" : "end", roundNumber: n });
  await sleep(T.end);
  return over;
}

ws.on("connect", () => {
  console.log(`Conectado em ${SERVER}. Entrando com o código ${GROUP}...`);
  ws.emit("obs_logon", JSON.stringify({
    type: "authenticate", clientVersion: "0.3.3", obsName: OBS, key: "hudlooking", groupCode: GROUP,
    leftTeam: { name: TEAMS[0].name, tricode: TEAMS[0].tricode, url: "", attackStart: true },
    rightTeam: { name: TEAMS[1].name, tricode: TEAMS[1].tricode, url: "", attackStart: false },
    toolsData: {
      seriesInfo: { needed: 2, wonLeft: 1, wonRight: 0, mapInfo: [] },
      tournamentInfo: { name: "Copa Teste", logoUrl: "", backdropUrl: "" },
      timeoutDuration: 60, timeoutCounter: { max: 2, left: 2, right: 2 },
    },
  }));
});
ws.on("connect_error", (e) => { console.log(`Não consegui conectar em ${SERVER}. O servidor está ligado? (${e.message})`); process.exit(1); });
ws.once("obs_logon_ack", async (msg) => {
  const ack = JSON.parse(msg.toString());
  if (!ack.value) { console.log("O servidor recusou: " + ack.reason); process.exit(1); }
  console.log("Partida criada. No OBS use groupCode=" + GROUP);
  send("map", "Ascent");
  send("game_mode", "bomb");
  send("match_start", "teste-" + Date.now());
  all().forEach((p) => send("roster", { name: p.name, tagline: p.tag, startTeam: p.startTeam, agentInternal: p.agent + "_PC_C", playerId: p.id, position: p.position, locked: true, rank: 0 }));
  await sleep(1500);
  for (let n = 1; ; n++) { if (await playRound(n)) break; }
  console.log("\nFim do mapa. Rode de novo para outra partida.");
  setTimeout(() => process.exit(0), 1500);
});
