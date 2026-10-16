// Configuração da HUD e do monitor. Edite aqui e salve; depois recarregue a página (ou a fonte no OBS).
window.HUD_CONFIG = {
  servidor: "http://localhost:5200", // endereço do Spectra Server (porta do overlay)
  codigo: "TESTE",                    // groupCode: o mesmo digitado no capturador (TESTE é o da partida de teste)
  recursos: "Resources/",             // pasta das imagens e fontes, ao lado deste arquivo
  fase: "",                           // texto do canto superior direito (vazio usa o nome do torneio do capturador)
  camera: true,                       // moldura da câmera do jogador observado
  armasParaDireita: false,            // as imagens de Resources/Armas apontam para a esquerda
};
