# Aviso de modificação

Este programa é uma versão modificada do **Spectra Client**
(https://github.com/ValoSpectra/Spectra-Client), © Purple Shark UG (haftungsbeschränkt),
distribuído sob a licença GPL-3.0 (veja `LICENSE`). Esta versão também é distribuída sob a GPL-3.0.

## Alterações em relação ao original (15/10/2026, a partir da versão 0.3.3)

- Novo arquivo `src/branding.ts`, com o nome do app (`APP_NAME`) e o repositório de atualizações (`UPDATE_REPO`).
- A verificação de atualização deixou de consultar o repositório do Spectra. Ela fica desligada até `UPDATE_REPO` ser preenchido.
- O título da janela usa `APP_NAME` e informa que o app é baseado no Spectra Client.
- `package.json`: nome do pacote, nome do produto, nome do instalador e destino de publicação alterados.

Os avisos de copyright e a licença originais foram mantidos.
