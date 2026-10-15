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

## Como rodar (Windows)

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
