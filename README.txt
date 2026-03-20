ROTA DO OURO VERDE — BASE ESTRUTURADA PARA LONGO PRAZO

O que mudou nesta versão:
- Home focada em marca + catálogo de percursos
- Página individual de percurso: percurso.html?id=percurso-original-7-dias
- Dados centralizados em data/percursos.json
- Estrutura compatível com Cloudflare Pages gratuita
- Mantido modelo estático: HTML + CSS + JS + JSON + imagens

Como adicionar um novo percurso:
1) Abra data/percursos.json
2) Duplique um bloco dentro de "routes"
3) Preencha:
   - id
   - status (published ou coming-soon)
   - title, subtitle, duration, distance, difficulty
   - cover
   - description
   - highlights
   - stages
4) Se quiser publicar, deixe status = published
5) O card aparecerá automaticamente na home
6) O link da página será:
   percurso.html?id=SEU_ID

Como adicionar etapas:
- Dentro do percurso, use a chave "stages"
- Cada etapa aceita:
  - label
  - day
  - route
  - distance
  - summary
  - profile
  - attention
  - highlights
  - cover
  - photos

Como adicionar fotos:
- Coloque as imagens na pasta assets/
- Cadastre os caminhos no campo photos:
  "photos": [
    {"src": "assets/minha-pasta/foto1.jpg", "alt": "Descrição"},
    {"src": "assets/minha-pasta/foto2.jpg", "alt": "Descrição"}
  ]

Cloudflare Pages:
- Faça upload/publicação desta pasta inteira como site estático
- Não precisa banco de dados para exibir os percursos
- Para formulário, troque o endpoint do Formspree em index.html

Observação importante:
Se você abrir os arquivos direto no computador em file://, alguns navegadores podem bloquear o fetch do JSON.
Para testar corretamente, publique na Cloudflare Pages ou use um servidor local.
