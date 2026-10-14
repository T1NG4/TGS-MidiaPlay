# MidiaPlay

Catálogo privado de vídeos para telões no VRChat. Você envia o arquivo; o painel gera uma URL HTTPS de MP4 que o AVPro consegue reproduzir.

O site roda na [Vercel](https://vercel.com). Os arquivos ficam no [Supabase Storage](https://supabase.com). Não use a Vercel para hospedar o filme — o limite de upload serverless é pequeno demais.

## O que o VRChat aceita

- URL **direta** para o arquivo (termina em `.mp4`), em **HTTPS**
- Codec **H.264** + áudio **AAC** (Quest é mais rígido; evite HEVC/AV1)
- Servidor com **HTTP Range** (o Storage já oferece)

Páginas do Google Drive, MixDrop e hosts parecidos **não** são arquivos de vídeo. Este projeto não baixa nem faz proxy desses links.

Se o arquivo não tocar no Quest, converta localmente:

```bash
ffmpeg -i entrada.mkv -c:v libx264 -pix_fmt yuv420p -c:a aac -movflags +faststart saida.mp4
```

## Subir a sua instância

### 1. Supabase

1. Crie um projeto.
2. SQL Editor: cole e execute [`supabase/migrations/20241013120000_videos.sql`](supabase/migrations/20241013120000_videos.sql).
3. Authentication → Users → adicione o e-mail/senha do painel (desative o cadastro público se quiser só convite).
4. Storage → o bucket `videos` já nasce **público** (leitura pela URL, listagem da API restrita). Nomes são UUID: só quem tem o link abre.
5. Storage → Configuration: aumente o tamanho máximo do arquivo se precisar. A migration define até 20 GB por objeto; o plano do projeto também precisa comportar isso.
6. CORS do Storage: permita a origem do site (`http://localhost:3000` e o domínio da Vercel) para o upload retomável (TUS) funcionar no browser.

### 2. Variáveis

Copie `.env.example` para `.env.local`:

| Variável | Função |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave `anon` (pública) |
| `NEXT_PUBLIC_SITE_URL` | URL do site (para copiar a página de teste) |
| `NEXT_PUBLIC_MAX_STORAGE_BYTES` | Teto da barra de disco (padrão 50 GB) |

Não coloque a `service_role` no frontend.

### 3. Local

```bash
npm install
npm run dev
```

Abra `/login`, entre com o usuário criado no Supabase, envie um MP4 e copie **URL VRChat**.

### 4. Vercel

1. Importe o repositório.
2. Configure as mesmas variáveis.
3. Deploy. O painel fica em `/painel`.

Cada pessoa que clonar o projeto usa **o próprio** projeto Supabase (auth, banco e gigabytes).

## Uso no mundo

1. Envie o MP4 no painel.
2. Copie **URL VRChat** (link `.../storage/v1/object/public/videos/...`).
3. Cole no player do mundo (ProTV, Udon, etc.).
4. A página `/v/[id]` é só para testar no navegador. O telão precisa da URL crua, não da página HTML.

O player do VRChat **não envia cookie de login**. Por isso o arquivo precisa ser acessível pela URL.

## Licença de conteúdo

Hospede apenas material que você tem direito de usar. MidiaPlay é a ferramenta de hospedagem, não um agregador de filmes de terceiros.
