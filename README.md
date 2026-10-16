# Meu Capturador (fork do Spectra Client)

Versão modificada do [Spectra Client](https://github.com/ValoSpectra/Spectra-Client). O que mudou está em [MODIFICATIONS.md](MODIFICATIONS.md).

## Onde mexer

| Arquivo | O que faz |
| --- | --- |
| `src/branding.ts` | Nome do app e repositório de atualizações do seu fork |
| `src/services/gepService.ts` | Recebe os dados do Valorant pelo Overwolf (vida, dinheiro, armas, rounds...) |
| `src/services/formattingService.ts` | Organiza esses dados antes do envio |
| `src/services/connectorService.ts` | Envia os dados para o servidor (socket.io, porta 5100 por padrão) |
| `angular/src/app/` | Tela do app (onde se digita o servidor, os times, etc.) |

## Overlay (pasta `overlay/`)

O overlay foi criado do zero e fica em um único arquivo: `overlay/index.html`. Ele conversa com o Spectra Server no mesmo formato do overlay original, então funciona com o servidor deles sem mudanças.

No OBS, adicione uma fonte **Navegador** com 1920 × 1080 e marque **Arquivo local** apontando para `overlay/index.html`, ou use a URL com os parâmetros:

```
index.html?server=http://localhost:5200&groupCode=SEUCODIGO
```

| Parâmetro | O que faz |
| --- | --- |
| `server` | Endereço do Spectra Server (padrão `http://localhost:5200`) |
| `groupCode` | Código da partida, o mesmo digitado no capturador |
| `demo` | Mostra uma partida simulada com fundo transparente, para testar no OBS |
| `attack`, `defense` | Cores dos lados, em hexadecimal sem `#` (ex.: `attack=FF5A6A`) |
| `debug` | Mostra o status da conexão no canto da tela |

Aberto sem parâmetros, o arquivo mostra a página de prévia com controles da simulação.

### Versão broadcast (`overlay/broadcast.html`) — recomendada

Layout de transmissão com placas na cor de cada time, cartões compactos no combate, painel de economia com histórico de rodadas na compra e cartão animado de vitória de rodada (com o destaque da rodada).

**Vitória de rodada:** o cartão desce do placar e muda conforme a rodada: **ace** (um jogador com 5 abates), **clutch 1vN** (o time venceu depois de ficar com um único jogador vivo), **rodada perfeita** (venceu sem perder ninguém) ou vitória normal com o motivo e o destaque da rodada. A detecção usa os dados que o capturador já envia.

**Cores:** edite o bloco `CORES` no começo do script, ou passe pela URL:
`&left=C8323F&right=14A98A` (cor dos times, sem `#`), `&hl=F5C043` (ultimate pronta), `&spike=E8424F` (ícone da spike plantada) e `&colors=side` para colorir por lado (ataque e defesa) em vez de por time. Na prévia há seletores de cor para testar.

### Partida de teste (`tools/partida-teste.js`)

Simula o capturador e manda uma partida completa para o Spectra Server, para testar o overlay no modo real sem precisar do jogo. Copie o arquivo para a pasta do Spectra-Server (que já tem o `socket.io-client`) e rode:

```
node partida-teste.js http://localhost:5100 TESTE
```

No OBS: `broadcast.html?server=http://localhost:5200&groupCode=TESTE`. Com `VELOCIDADE=2` antes do comando, tudo fica duas vezes mais rápido.

### Versão pro (`overlay/pro.html`)

Mesma lógica e mesmos parâmetros da variante cyber, com visual de transmissão moderna: blocos sólidos na cor do time, cortes inclinados, números condensados e retratos que saem da moldura. Também lê a pasta `Resources` descrita abaixo.

### Variante cyber (`overlay/cyber.html`)

Mesmos parâmetros do `index.html`. No combate mostra cartões nas laterais com retrato, vida, escudo, K/D/A, habilidades, ultimate e arma; na fase de compra troca para um painel de economia com créditos, gastos, equipamento e o histórico de rodadas.

De onde vêm as imagens, em ordem de prioridade:

1. **Pasta de recursos local.** Se existir uma pasta `Resources/` ao lado do arquivo, ou se o arquivo estiver dentro dela, o overlay usa as imagens de lá. Para apontar outra pasta, use `&assets=file:///E:/caminho/Resources/`. Estrutura esperada:
   - `Agentes/<Nome>/<Nome>.png` e `C.png`, `Q.png`, `E.png`, `X.png` (KAY/O fica em `Kayo`)
   - `Armas/<Arma>.png`, `Escudos/CV.png` (créditos), `Escudos/Escudo50.png` (pesado), `Escudo100.png` (leve), `EscudoReg.png`
   - `Logos/logo1.png` e `logo2.png` (time da esquerda e da direita, quando o capturador não manda logo)
   - `Sponsors/Sponsor1.png`, `Sponsor2.png`… (rodízio no canto superior direito)
   - `Maps/<Mapa>.png`, `spike.png` e `Tungsten-Bold.ttf` (fonte dos números grandes)
2. **Internet**, pela [valorant-api.com](https://valorant-api.com).
3. **Ícones próprios**, quando nenhuma das duas está disponível ou com `&images=0`.

A pasta `overlay/Resources/` está no `.gitignore`: imagens do jogo, fontes e logos ficam só no seu PC e não vão para o GitHub.

O cronômetro é estimado pelo overlay a partir da mudança de fase (30 s de compra, 1:40 de combate, 45 s de spike), porque o servidor não envia o tempo da rodada.

## Como rodar o capturador (Windows)

Pré-requisitos: Node.js 22, Git e uma chave de desenvolvedor do Overwolf (veja abaixo).

```powershell
corepack enable
yarn install
$env:OW_DEV_KEY = '<sua-chave-do-overwolf>'
yarn start
```

Sem a chave, o app abre, mas não recebe nenhum dado do jogo.

## Chave de desenvolvedor do Overwolf

1. Crie uma conta em https://dev.overwolf.com e envie a ideia do seu app.
2. Espere a equipe do Overwolf aprovar. O status no seu perfil muda de *Pending* para *Approved*.
3. No perfil, em **Developer Key**, clique em *Generate key*.
4. Use a chave na variável `OW_DEV_KEY`, como no comando acima.

O modo dev com chave exige `@overwolf/ow-electron` 39.8.10+ e `@overwolf/ow-electron-builder` 26.9.0+. Este projeto ainda usa as versões 37.10.3 e 26.0.12. Se a chave não funcionar, atualize essas duas dependências.

---

# ValoSpectra - Client (README original)

Spectra is your all-in-one solution for an amazing looking Valorant Tournament Overlay, enabling all Organizers to display information like held gun, available credits etc. with just a single spectator running software.
To learn more and see a live demo, visit [valospectra.com](https://www.valospectra.com/).

It is comprised of three parts:
 - [The Spectra Client](https://github.com/ValoSpectra/Spectra-Client)
   - Running this software on a single in-game observer provides the Spectra Server with all data currently provided by Overwolf.
 - [The Spectra Server](https://github.com/ValoSpectra/Spectra-Server)
   - Ingests data from the Observer Client to reproduce the games state, allowing us to have an accurate representation of the game for further use.
 - [The Spectra Frontend](https://github.com/ValoSpectra/Spectra-Frontend)
   - Receives the game state from the Server every 100 milliseconds, presenting it in a beautiful manner for viewers to enjoy.

Further updates for new features, as well as a detailed setup guide and an easy to host docker container are in the pipeline!

Spectra-Client isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
