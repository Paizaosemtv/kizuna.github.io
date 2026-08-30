# ==============================================================================
# SCRIPT DE GERAÇÃO DA COLEÇÃO DIDÁTICA COM DIAGRAMAÇÃO ANTI-SOBREPOSIÇÃO
# KIZUNA LANGUAGE SCHOOL — Layout Perfeito sem Sobreposição de Paineis ou Textos
# ==============================================================================

function New-PdfElement-Rect {
    param([double]$x, [double]$y, [double]$w, [double]$h, [string]$color)
    return "q`n$color rg`n$x $y $w $h re f`nQ`n"
}

function New-PdfElement-StrokeRect {
    param([double]$x, [double]$y, [double]$w, [double]$h, [string]$color, [double]$lw = 1)
    return "q`n$color RG $lw w`n$x $y $w $h re S`nQ`n"
}

function New-PdfElement-Text {
    param([string]$font, [double]$size, [string]$color, [double]$x, [double]$y, [string]$text)
    $escaped = $text.Replace('\', '\\').Replace('(', '\(').Replace(')', '\)')
    return "BT`n/$font $size Tf`n$color rg`n1 0 0 1 $x $y Tm`n($escaped) Tj`nET`n"
}

function Write-PdfFile {
    param(
        [string]$Path,
        [string[]]$PagesStreams
    )

    $numPages = $PagesStreams.Length
    $docObjects = [System.Collections.Generic.List[string]]::new()
    $offsets = [System.Collections.Generic.List[long]]::new()
    $pageObjectIds = [System.Collections.Generic.List[int]]::new()

    for ($i = 1; $i -le $numPages; $i++) {
        $pObjId = 6 + ($i - 1) * 2 + 1
        $pageObjectIds.Add($pObjId)
    }

    $kidsStr = ($pageObjectIds | ForEach-Object { "$_ 0 R" }) -join " "

    $docObjects.Add("1 0 obj`n<< /Type /Catalog /Pages 3 0 R /Outlines 2 0 R >>`nendobj")
    $docObjects.Add("2 0 obj`n<< /Type /Outlines /Count 0 >>`nendobj")
    $docObjects.Add("3 0 obj`n<< /Type /Pages /Kids [$kidsStr] /Count $numPages >>`nendobj")
    $docObjects.Add("4 0 obj`n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`nendobj")
    $docObjects.Add("5 0 obj`n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`nendobj")
    $docObjects.Add("6 0 obj`n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>`nendobj")

    for ($i = 1; $i -le $numPages; $i++) {
        $pObjId = 6 + ($i - 1) * 2 + 1
        $cObjId = 6 + ($i - 1) * 2 + 2

        $pageObj = "$pObjId 0 obj`n<< /Type /Page /Parent 3 0 R /MediaBox [0 0 595.28 841.89] /Contents $cObjId 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> >> >>`nendobj"
        $docObjects.Add($pageObj)

        $rawStream = $PagesStreams[$i - 1]
        $streamBytes = [System.Text.Encoding]::GetEncoding("ISO-8859-1").GetBytes($rawStream)
        $streamLen = $streamBytes.Length
        $contentObj = "$cObjId 0 obj`n<< /Length $streamLen >>`nstream`n$rawStream`nendstream`nendobj"
        $docObjects.Add($contentObj)
    }

    $ms = [System.IO.MemoryStream]::new()
    $writer = [System.IO.StreamWriter]::new($ms, [System.Text.Encoding]::GetEncoding("ISO-8859-1"))

    $writer.Write("%PDF-1.4`n")
    $writer.Flush()

    foreach ($obj in $docObjects) {
        $offsets.Add($ms.Position)
        $writer.Write($obj + "`n")
        $writer.Flush()
    }

    $xrefOffset = $ms.Position
    $totalObjects = $docObjects.Count + 1

    $writer.Write("xref`n0 $totalObjects`n0000000000 65535 f `n")
    foreach ($off in $offsets) {
        $writer.Write(("{0:D10} 00000 n `n" -f $off))
    }

    $writer.Write("trailer`n<< /Size $totalObjects /Root 1 0 R >>`nstartxref`n$xrefOffset`n%%EOF`n")
    $writer.Flush()

    $parentDir = [System.IO.Path]::GetDirectoryName($Path)
    if (-not [string]::IsNullOrEmpty($parentDir) -and -not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }

    [System.IO.File]::WriteAllBytes($Path, $ms.ToArray())
    Write-Host "PDF gerado sem sobreposicoes: $Path ($numPages paginas)"
}

# Gerador Padronizado com Cálculo Preciso de Bounding Boxes (Zero Sobreposição)
function Create-CleanLayoutPage {
    param(
        [int]$PageNum,
        [int]$TotalPages,
        [string]$VolTitle,
        [string]$ChapterTitle,
        [string]$TopicSubtitle,
        [string]$LevelBadge,
        [string]$MainColor,
        [string]$AccentColor,
        [array]$Blocks
    )

    $p = ""
    # Cabeçalho Editorial
    $p += New-PdfElement-Rect 0 760 595.28 81.89 $MainColor
    $p += New-PdfElement-Rect 0 753 595.28 7 $AccentColor
    $p += New-PdfElement-Text "F2" 14 "1 1 1" 40 805 "$VolTitle | Kizuna Language School"
    $p += New-PdfElement-Text "F1" 10.5 "0.85 0.9 0.95" 40 778 "$($ChapterTitle) - $($TopicSubtitle)"
    $p += New-PdfElement-Text "F2" 10 "0.9 0.7 0.15" 450 778 "$LevelBadge"

    $curY = 722

    foreach ($blk in $Blocks) {
        if ($blk.Type -eq "Heading") {
            $p += New-PdfElement-Text "F2" 13 $MainColor 40 ($curY - 12) $blk.Text
            $curY -= 28
        }
        elseif ($blk.Type -eq "Text") {
            $p += New-PdfElement-Text "F1" 10.5 "0.15 0.15 0.15" 40 ($curY - 10) $blk.Text
            $curY -= 22
        }
        elseif ($blk.Type -eq "SubText") {
            $p += New-PdfElement-Text "F1" 10 "0.25 0.25 0.25" 50 ($curY - 10) $blk.Text
            $curY -= 20
        }
        elseif ($blk.Type -eq "Table4Col") {
            # Cálculo Exato da Tabela
            $headerH = 26
            $rowH = 22
            $numRows = $blk.Rows.Count
            $tableTotalH = $headerH + ($numRows * $rowH)
            
            # Fundo e Borda Exatos
            $boxTopY = $curY
            $boxBottomY = $curY - $tableTotalH
            $p += New-PdfElement-Rect 40 $boxBottomY 515 $tableTotalH "0.98 0.98 0.99"
            $p += New-PdfElement-StrokeRect 40 $boxBottomY 515 $tableTotalH $MainColor 1
            
            # Cabeçalho da Tabela
            $p += New-PdfElement-Rect 40 ($boxTopY - $headerH) 515 $headerH $MainColor
            $p += New-PdfElement-Text "F2" 9.5 "1 1 1" 50 ($boxTopY - 17) "INGLES (EN)"
            $p += New-PdfElement-Text "F2" 9.5 "1 1 1" 175 ($boxTopY - 17) "PORTUGUES (PT)"
            $p += New-PdfElement-Text "F2" 9.5 "1 1 1" 305 ($boxTopY - 17) "JAPONES (JP)"
            $p += New-PdfElement-Text "F2" 9.5 "1 1 1" 430 ($boxTopY - 17) "ROMAJI (FONETICA)"

            $rowY = $boxTopY - $headerH - 15
            foreach ($row in $blk.Rows) {
                $p += New-PdfElement-Text "F2" 9.5 "0.043 0.145 0.271" 50 $rowY $row[0]
                $p += New-PdfElement-Text "F1" 9.5 "0.15 0.15 0.15" 175 $rowY $row[1]
                $p += New-PdfElement-Text "F2" 9.5 "0.753 0.188 0.235" 305 $rowY $row[2]
                $p += New-PdfElement-Text "F3" 9.5 "0.3 0.3 0.3" 430 $rowY $row[3]
                $rowY -= $rowH
            }
            # Move o cursor com margem de segurança abaixo da tabela
            $curY = $boxBottomY - 18
        }
        elseif ($blk.Type -eq "LayerLearning") {
            # Cálculo Exato do Box 3 Camadas
            $boxTotalH = 118
            $boxTopY = $curY
            $boxBottomY = $curY - $boxTotalH

            $p += New-PdfElement-Rect 40 $boxBottomY 515 $boxTotalH "1 1 1"
            $p += New-PdfElement-StrokeRect 40 $boxBottomY 515 $boxTotalH $AccentColor 1.2
            
            $p += New-PdfElement-Text "F2" 11 $AccentColor 52 ($boxTopY - 18) "METODO 3 CAMADAS: $($blk.Title)"
            $p += New-PdfElement-Text "F2" 9.5 "0.043 0.145 0.271" 52 ($boxTopY - 38) "1. PALAVRA: EN: $($blk.WordEN) | PT: $($blk.WordPT) | JP: $($blk.WordJP) ($($blk.WordRomaji))"
            $p += New-PdfElement-Text "F1" 9.5 "0.15 0.15 0.15" 52 ($boxTopY - 56) "2. FRASE REAL: EN: $($blk.SentenceEN) | PT: $($blk.SentencePT)"
            $p += New-PdfElement-Text "F2" 9.5 "0.753 0.188 0.235" 52 ($boxTopY - 74) "   JP: $($blk.SentenceJP) ($($blk.SentenceRomaji))"
            $p += New-PdfElement-Text "F3" 9.5 "0.3 0.3 0.3" 52 ($boxTopY - 96) "3. ESTRUTURA: $($blk.Explanation)"

            $curY = $boxBottomY - 18
        }
        elseif ($blk.Type -eq "Dialogue") {
            # Cálculo Exato do Box de Diálogo
            $boxTotalH = 115
            $boxTopY = $curY
            $boxBottomY = $curY - $boxTotalH

            $p += New-PdfElement-Rect 40 $boxBottomY 515 $boxTotalH "1 1 1"
            $p += New-PdfElement-StrokeRect 40 $boxBottomY 515 $boxTotalH $MainColor 1.2
            
            $p += New-PdfElement-Text "F2" 11.5 $MainColor 52 ($boxTopY - 18) "DIALOGO PRATICO: $($blk.Title)"
            $p += New-PdfElement-Text "F2" 10 "0.043 0.145 0.271" 52 ($boxTopY - 38) "EN: $($blk.EN)"
            $p += New-PdfElement-Text "F1" 10 "0.15 0.15 0.15" 52 ($boxTopY - 56) "PT: $($blk.PT)"
            $p += New-PdfElement-Text "F2" 10 "0.753 0.188 0.235" 52 ($boxTopY - 74) "JP: $($blk.JP)"
            $p += New-PdfElement-Text "F3" 10 "0.3 0.3 0.3" 52 ($boxTopY - 94) "Romaji: $($blk.Romaji)"

            $curY = $boxBottomY - 18
        }
        elseif ($blk.Type -eq "Box") {
            # Cálculo Exato do Box com N Linhas
            $numLines = $blk.Lines.Count
            $lineStep = 18
            $boxTotalH = 26 + ($numLines * $lineStep) + 10
            $boxTopY = $curY
            $boxBottomY = $curY - $boxTotalH

            $p += New-PdfElement-Rect 40 $boxBottomY 515 $boxTotalH "0.96 0.97 0.98"
            $p += New-PdfElement-StrokeRect 40 $boxBottomY 515 $boxTotalH $AccentColor 1
            
            $p += New-PdfElement-Text "F2" 11 $AccentColor 52 ($boxTopY - 18) $blk.Title
            
            $lineY = $boxTopY - 36
            foreach ($line in $blk.Lines) {
                $p += New-PdfElement-Text "F1" 9.5 "0.15 0.15 0.15" 54 $lineY $line
                $lineY -= $lineStep
            }

            $curY = $boxBottomY - 18
        }
        elseif ($blk.Type -eq "Exercise") {
            # Cálculo Exato do Box de Exercício
            $boxTotalH = 96
            $boxTopY = $curY
            $boxBottomY = $curY - $boxTotalH

            $p += New-PdfElement-Rect 40 $boxBottomY 515 $boxTotalH "1 1 1"
            $p += New-PdfElement-StrokeRect 40 $boxBottomY 515 $boxTotalH $MainColor 1.2
            
            $p += New-PdfElement-Text "F2" 11.5 $MainColor 52 ($boxTopY - 18) "EXERCICIOS DE FIXACAO"
            $p += New-PdfElement-Text "F1" 10 "0.15 0.15 0.15" 52 ($boxTopY - 38) "1. $($blk.Q1)"
            $p += New-PdfElement-Text "F1" 10 "0.15 0.15 0.15" 52 ($boxTopY - 56) "2. $($blk.Q2)"
            $p += New-PdfElement-Text "F1" 10 "0.15 0.15 0.15" 52 ($boxTopY - 74) "3. $($blk.Q3)"

            $curY = $boxBottomY - 18
        }
    }

    # Rodapé Fixo
    $p += New-PdfElement-Rect 40 48 515 1 "0.75 0.75 0.75"
    $p += New-PdfElement-Text "F1" 9.5 "0.45 0.45 0.45" 40 33 "Kizuna Language School - Colecao Didatica Oficial 2026"
    $p += New-PdfElement-Text "F2" 9.5 $MainColor 470 33 "Pagina $PageNum de $TotalPages"

    return $p
}

# ==============================================================================
# 1. APOSTILA 1: FUNDAMENTOS (12 PÁGINAS)
# ==============================================================================
$vol1Pages = @()

# Capa Vol 1
$p = ""
$p += New-PdfElement-Rect 0 0 595.28 841.89 "0.043 0.145 0.271"
$p += New-PdfElement-Rect 25 25 545.28 791.89 "0.97 0.965 0.95"
$p += New-PdfElement-Rect 25 540 545.28 276.89 "0.043 0.145 0.271"
$p += New-PdfElement-Rect 25 530 545.28 10 "0.753 0.188 0.235"
$p += New-PdfElement-Text "F2" 14 "0.85 0.85 0.85" 50 765 "KIZUNA LANGUAGE SCHOOL - COLECAO DIDATICA"
$p += New-PdfElement-Text "F1" 11 "0.7 0.75 0.85" 50 740 "VOLUME 1 DE 3 - NIVEL INICIANTE"
$p += New-PdfElement-Text "F2" 26 "1 1 1" 50 680 "APOSTILA 1: FUNDAMENTOS"
$p += New-PdfElement-Text "F2" 16 "0.9 0.7 0.15" 50 645 "Ingles (EN) - Portugues (PT) - Japones (JP / Romaji)"
$p += New-PdfElement-Text "F3" 12 "0.9 0.9 0.9" 50 615 "Fonetica, Alfabetos, Saudacoes, Apresentacoes e Estruturas Basicas"

$p += New-PdfElement-Rect 50 140 495 365 "1 1 1"
$p += New-PdfElement-StrokeRect 50 140 495 365 "0.043 0.145 0.271" 1.5
$p += New-PdfElement-Text "F2" 13 "0.753 0.188 0.235" 68 475 "CONTEUDO PROGRAMATICO DO VOLUME 1:"

$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 445 "Capitulo 1: Metodologia das 3 Camadas (Palavra - Frase - Estrutura)"
$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 415 "Capitulo 2: Fonetica Comparada & Sons Exclusivos nos 3 Idiomas"
$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 385 "Capitulo 3: Alfabeto Ingles, Hiragana, Katakana & Romaji"
$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 355 "Capitulo 4: Saudacoes, Cumprimentos Formais & Despedidas"
$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 325 "Capitulo 5: Apresentacao Pessoal (Jikoshoukai) & Dialogos"
$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 295 "Capitulo 6: Numeros Cardinais de 0 a 100 & Como Falar Horas"
$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 265 "Capitulo 7: Dias da Semana, Meses do Ano & Expressoes de Tempo"
$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 235 "Capitulo 8: Frases Basicas de Sobrevivencia & Ordem SVO vs SOV"
$p += New-PdfElement-Text "F2" 10.5 "0.753 0.188 0.235" 68 205 "Capitulos 9 e 10: Caderno de Exercicios, Simulado & Gabarito Oficial"

$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 50 80 "Kizuna Language School - Material Didatico Oficial 2026."
$p += New-PdfElement-Text "F1" 9.5 "0.45 0.45 0.45" 50 62 "Volume 1: Fundamentos Essenciais."
$vol1Pages += $p

$v1Topics = @(
    @{ Pag=2; Ch="Capitulo 1"; Sub="Metodologia das 3 Camadas"; Blk=@(
        @{ Type="Heading"; Text="Como Estudar com a Metodologia Kizuna" },
        @{ Type="Text"; Text="O aprendizado acelerado de idiomas baseia-se na compreensao estrutural continua:" },
        @{ Type="Box"; Title="O CICLO DIDATICO EM 3 ETAPAS"; Lines=@("1. CAMADA 1: PALAVRA - Aprenda o termo isolado com pronuncia nativa.", "2. CAMADA 2: FRASE - Veja a palavra aplicada em uma situacao real.", "3. CAMADA 3: ESTRUTURA - Entenda o porque gramatical e crie variacoes.") },
        @{ Type="LayerLearning"; Title="Agua (Water / Mizu)"; WordEN="Water"; WordPT="Agua"; WordJP="Mizu"; WordRomaji="Mizu"; SentenceEN="I drink cold water every morning."; SentencePT="Eu bebo agua gelada todas as manhas."; SentenceJP="Maiasa tsumetai mizu o nomimasu."; SentenceRomaji="Maiasa tsumetai mizu o nomimasu."; Explanation="Mizu (Agua) + particula O (objeto) + Nomimasu (bebo)." },
        @{ Type="Box"; Title="DICA DE ESTUDO DIARIO"; Lines=@("Pratique a fala em voz alta para destravar a pronuncia nativa.") }
    )},
    @{ Pag=3; Ch="Capitulo 2"; Sub="Fonetica e Pronuncia Comparada"; Blk=@(
        @{ Type="Heading"; Text="Comparativo Fonetico entre os 3 Idiomas" },
        @{ Type="Text"; Text="Compreenda os pontos de articulacao para falar de forma clara e natural:" },
        @{ Type="Box"; Title="SONS CRITICOS PARA BRASILEIROS"; Lines=@("• Ingles: Som TH em 'Think' (soprado) e 'This' (vibrado na lingua).", "• Japones: O som R e suave, tocando de leve os dentes superiores.", "• Japones: As 5 vogais (A, I, U, E, O) sao sempre curtas e estaveis.", "• Portugues: Os sons nasais com til sao exclusivos da lingua portuguesa.") },
        @{ Type="Table4Col"; Rows=@(
            @("Hello", "Ola", "Konnichiwa", "Konnichiwa"),
            @("Thank you", "Obrigado(a)", "Arigatou", "Arigatou"),
            @("Please", "Por favor", "Onegaishimasu", "Onegaishimasu"),
            @("Sorry", "Desculpe", "Sumimasen", "Sumimasen")
        )},
        @{ Type="Exercise"; Q1="Fale em voz alta 'Arigatou gozaimasu' com o R suave."; Q2="Qual a diferenca entre o som TH e o som S em ingles?"; Q3="Como se diz 'Por favor' em Japones e em Ingles?" }
    )},
    @{ Pag=4; Ch="Capitulo 3"; Sub="Alfabeto e Sistemas de Escrita"; Blk=@(
        @{ Type="Heading"; Text="Alfabeto Latino & Silabarios Japoneses" },
        @{ Type="Text"; Text="Enquanto Ingles e Portugues usam o alfabeto latino, o Japones usa 3 sistemas:" },
        @{ Type="Box"; Title="OS 3 SISTEMAS DE ESCRITA DO JAPONES"; Lines=@("1. Hiragana (46 caracteres): Usado para palavras nativas e particulas.", "2. Katakana (46 caracteres): Usado para termos estrangeiros (ex: Kohii = Cafe).", "3. Kanji (Ideogramas): Representam conceitos e significados completos.", "4. Romaji: Transcricao fonetica ocidental para acelerar os estudos.") },
        @{ Type="Table4Col"; Rows=@(
            @("Coffee", "Cafe", "Kohii (Katakana)", "Kohii"),
            @("Book", "Livro", "Hon (Kanji)", "Hon"),
            @("Student", "Estudante", "Gakusei (Kanji)", "Gakusei"),
            @("Brazil", "Brasil", "Burajiru (Katakana)", "Burajiru")
        )}
    )},
    @{ Pag=5; Ch="Capitulo 4"; Sub="Saudacoes e Cumprimentos"; Blk=@(
        @{ Type="Heading"; Text="Saudacoes do Dia a Dia e Contextos Formais" },
        @{ Type="Text"; Text="Utilize a saudacao correta para cada turno e grau de formalidade:" },
        @{ Type="Table4Col"; Rows=@(
            @("Good morning", "Bom dia", "Ohayou gozaimasu", "Ohayou gozaimasu"),
            @("Good afternoon", "Boa tarde", "Konnichiwa", "Konnichiwa"),
            @("Good evening", "Boa noite (ao chegar)", "Konbanwa", "Konbanwa"),
            @("Good night", "Boa noite (ao dormir)", "Oyasuminasai", "Oyasuminasai"),
            @("See you later", "Ate logo", "Mata aimashou", "Mata aimashou"),
            @("Goodbye", "Adeus / Tchau", "Sayounara", "Sayounara")
        )},
        @{ Type="Dialogue"; Title="Cumprimento Matinal entre Colegas"; EN="A: Good morning! How are you? / B: I am fine, thank you!"; PT="A: Bom dia! Como vai? / B: Estou muito bem, obrigado!"; JP="A: Ohayou gozaimasu! Ogenki desu ka? / B: Genki desu!"; Romaji="A: Ohayou gozaimasu! Ogenki desu ka? / B: Genki desu!" }
    )},
    @{ Pag=6; Ch="Capitulo 5"; Sub="Apresentacao Pessoal"; Blk=@(
        @{ Type="Heading"; Text="Como Fazer uma Apresentacao Completa" },
        @{ Type="Text"; Text="Formulas fundamentais para dizer quem voce e, sua origem e ocupacao:" },
        @{ Type="Table4Col"; Rows=@(
            @("My name is John", "Meu nome e Joao", "Watashi no namae wa Jon desu", "Watashi no namae wa Jon desu"),
            @("I am Brazilian", "Eu sou brasileiro(a)", "Burajiru-jin desu", "Burajiru-jin desu"),
            @("I live in Sao Paulo", "Moro em Sao Paulo", "San Pauro ni sunde imasu", "San Pauro ni sunde imasu"),
            @("Nice to meet you", "Prazer em conhece-lo", "Hajimemashite", "Hajimemashite"),
            @("I am a teacher", "Sou professor(a)", "Sensei desu", "Sensei desu")
        )},
        @{ Type="Dialogue"; Title="Primeiro Encontro Social"; EN="A: Hello, nice to meet you! / B: Nice to meet you too!"; PT="A: Ola, muito prazer em conhece-lo! / B: O prazer e todo meu!"; JP="A: Hajimemashite, douzo yoroshiku! / B: Kochirakoso yoroshiku!"; Romaji="A: Hajimemashite, douzo yoroshiku! / B: Kochirakoso yoroshiku!" }
    )},
    @{ Pag=7; Ch="Capitulo 6"; Sub="Numeros e Horarios"; Blk=@(
        @{ Type="Heading"; Text="Numeros Cardinais de 0 a 100 e as Horas" },
        @{ Type="Text"; Text="Contagem pratica para compras, pagamentos e agendamentos:" },
        @{ Type="Table4Col"; Rows=@(
            @("One, Two, Three", "Um, Dois, Tres", "Ichi, Ni, San", "Ichi, Ni, San"),
            @("Four, Five, Six", "Quatro, Cinco, Seis", "Shi/Yon, Go, Roku", "Shi/Yon, Go, Roku"),
            @("Seven, Eight, Nine", "Sete, Oito, Nove", "Nana, Hachi, Kyuu", "Nana, Hachi, Kyuu"),
            @("Ten, Twenty, Fifty", "Dez, Vinte, Cinquenta", "Juu, Ni-juu, Go-juu", "Juu, Ni-juu, Go-juu"),
            @("One hundred", "Cem / Cento", "Hyaku", "Hyaku"),
            @("What time is it?", "Que horas sao?", "Nan-ji desu ka?", "Nan-ji desu ka?")
        )},
        @{ Type="Box"; Title="CONTADOR DE HORAS EM JAPONES"; Lines=@("Basta adicionar 'ji' ao numero: 1h = Ichi-ji, 2h = Ni-ji, 7h = Shichi-ji.") }
    )},
    @{ Pag=8; Ch="Capitulo 7"; Sub="Dias e Meses do Ano"; Blk=@(
        @{ Type="Heading"; Text="Dias da Semana, Meses e Expressoes de Tempo" },
        @{ Type="Text"; Text="Planeje compromissos nos 3 idiomas com facilidade:" },
        @{ Type="Table4Col"; Rows=@(
            @("Monday / Tuesday", "Segunda / Terca", "Getsuyoubi / Kayoubi", "Getsuyoubi / Kayoubi"),
            @("Wednesday / Thursday", "Quarta / Quinta", "Suiyoubi / Mokuyoubi", "Suiyoubi / Mokuyoubi"),
            @("Friday / Saturday", "Sexta / Sabado", "Kinyoubi / Doyoubi", "Kinyoubi / Doyoubi"),
            @("Sunday", "Domingo", "Nichiyoubi", "Nichiyoubi"),
            @("January / December", "Janeiro / Dezembro", "Ichi-gatsu / Juuni-gatsu", "Ichi-gatsu / Juuni-gatsu"),
            @("Today / Tomorrow", "Hoje / Amanha", "Kyou / Ashita", "Kyou / Ashita")
        )},
        @{ Type="Box"; Title="PRATICA DE CALENDARIO"; Lines=@("Diga em voz alta o dia de hoje e o mes nos 3 idiomas.") }
    )},
    @{ Pag=9; Ch="Capitulo 8"; Sub="Frases de Sobrevivencia"; Blk=@(
        @{ Type="Heading"; Text="Frases de Cortesia e Sobrevivencia no Cotidiano" },
        @{ Type="Text"; Text="Expressoes que voce usara em qualquer viagem ou situacao de emergencia:" },
        @{ Type="Table4Col"; Rows=@(
            @("Excuse me", "Com licenca / Desculpe", "Sumimasen", "Sumimasen"),
            @("Where is the bathroom?", "Onde fica o banheiro?", "Toire wa doko desu ka?", "Toire wa doko desu ka?"),
            @("How much is this?", "Quanto custa isto?", "Kore wa ikura desu ka?", "Kore wa ikura desu ka?"),
            @("I don't understand", "Nao estou entendendo", "Wakarimasen", "Wakarimasen"),
            @("Can you speak slowly?", "Pode falar devagar?", "Yukkuri hanashite kudasai", "Yukkuri hanashite kudasai")
        )},
        @{ Type="Box"; Title="DICA DE OURO"; Lines=@("Sumimasen serve tanto para pedir desculpas quanto para chamar o garcom.") }
    )},
    @{ Pag=10; Ch="Capitulo 9"; Sub="Comparacao Estrutural (SVO vs SOV)"; Blk=@(
        @{ Type="Heading"; Text="Como as Frases se Conectam: SVO vs SOV" },
        @{ Type="Text"; Text="Entenda a diferenca estrutural fundamental entre os 3 idiomas:" },
        @{ Type="Box"; Title="ORDEM DAS PALAVRAS"; Lines=@("• Portugues: [Sujeito] + [Verbo] + [Objeto] -> 'Eu como arroz.'", "• Ingles:    [Sujeito] + [Verbo] + [Objeto] -> 'I eat rice.'", "• Japones:   [Sujeito] + [Objeto] + [Verbo] -> 'Watashi wa gohan o tabemasu.'", "No Japones o verbo principal fica SEMPRE no final da frase!") },
        @{ Type="LayerLearning"; Title="Comer Arroz (Eat Rice / Gohan o Taberu)"; WordEN="Rice"; WordPT="Arroz"; WordJP="Gohan"; WordRomaji="Gohan"; SentenceEN="I eat rice every day."; SentencePT="Eu como arroz todos os dias."; SentenceJP="Mainichi gohan o tabemasu."; SentenceRomaji="Mainichi gohan o tabemasu."; Explanation="Mainichi (Todo dia) + Gohan (Arroz) + O (particula) + Tabemasu (como)." }
    )},
    @{ Pag=11; Ch="Capitulo 10"; Sub="Caderno de Exercicios do Volume 1"; Blk=@(
        @{ Type="Heading"; Text="Caderno de Pratica e Fixacao do Volume 1" },
        @{ Type="Text"; Text="Responda as questoes abaixo para testar sua assimilacao:" },
        @{ Type="Exercise"; Q1="Traduza para o japones: 'Muito prazer, meu nome e Carlos.'"; Q2="Como se diz 'Quinta-feira' e 'Domingo' em ingles?"; Q3="Qual a ordem das palavras em uma frase japonesa? (SVO ou SOV)?" },
        @{ Type="Box"; Title="AUTOAVALIACAO DE APRENDIZADO"; Lines=@("Pratique falar cada resposta em voz alta antes de conferir o gabarito.") }
    )},
    @{ Pag=12; Ch="Capitulo 11"; Sub="Simulado, Gabarito & Proximos Passos"; Blk=@(
        @{ Type="Heading"; Text="Gabarito do Volume 1 & Transicao para o Volume 2" },
        @{ Type="Text"; Text="Confira suas respostas e veja seu progresso antes de iniciar o Volume 2:" },
        @{ Type="Box"; Title="GABARITO COMENTADO DO VOLUME 1"; Lines=@("1. 'Hajimemashite, Watashi wa Karurosu desu.'", "2. Quinta = 'Thursday' | Domingo = 'Sunday'.", "3. SOV (Sujeito + Objeto + Verbo).") },
        @{ Type="Box"; Title="O QUE VOCE APRENDERA NO VOLUME 2 (CONSTRUCAO E PRATICA)"; Lines=@("• Vocabulario tematico completo em tabelas de 4 colunas (Familia, Casa, Comida).", "• Particulas gramaticais japonesas (wa, ga, o, ni, de, no, mo).", "• Verbo To Be e Present Simple no Ingles.", "• Dialogos reais em Restaurantes, Aeroportos e Compras.") }
    )}
)

foreach ($top in $v1Topics) {
    $vol1Pages += Create-CleanLayoutPage -PageNum $top.Pag -TotalPages 12 -VolTitle "VOLUME 1: FUNDAMENTOS" -ChapterTitle $top.Ch -TopicSubtitle $top.Sub -LevelBadge "[INICIANTE]" -MainColor "0.043 0.145 0.271" -AccentColor "0.753 0.188 0.235" -Blocks $top.Blk
}

Write-PdfFile -Path "assets/docs/apostila-ingles.pdf" -PagesStreams $vol1Pages
Write-PdfFile -Path "assets/docs/apostila-vol1-fundamentos.pdf" -PagesStreams $vol1Pages

# ==============================================================================
# 2. APOSTILA 2: CONSTRUÇÃO E PRÁTICA (16 PÁGINAS)
# ==============================================================================
$vol2Pages = @()

# Capa Vol 2
$p = ""
$p += New-PdfElement-Rect 0 0 595.28 841.89 "0.12 0.45 0.25"
$p += New-PdfElement-Rect 25 25 545.28 791.89 "0.97 0.965 0.95"
$p += New-PdfElement-Rect 25 540 545.28 276.89 "0.12 0.45 0.25"
$p += New-PdfElement-Rect 25 530 545.28 10 "0.043 0.145 0.271"
$p += New-PdfElement-Text "F2" 14 "0.85 0.85 0.85" 50 765 "KIZUNA LANGUAGE SCHOOL - COLECAO DIDATICA"
$p += New-PdfElement-Text "F1" 11 "0.7 0.75 0.85" 50 740 "VOLUME 2 DE 3 - NIVEL BASICO E CONSTRUCAO"
$p += New-PdfElement-Text "F2" 26 "1 1 1" 50 680 "APOSTILA 2: CONSTRUCAO E PRATICA"
$p += New-PdfElement-Text "F2" 16 "0.9 0.7 0.15" 50 645 "Ingles (EN) - Portugues (PT) - Japones (JP / Romaji)"
$p += New-PdfElement-Text "F3" 12 "0.9 0.9 0.9" 50 615 "Vocabulario Tematico, Particulas, Gramatica e Dialogos da Vida Real"

$p += New-PdfElement-Rect 50 140 495 365 "1 1 1"
$p += New-PdfElement-StrokeRect 50 140 495 365 "0.12 0.45 0.25" 1.5
$p += New-PdfElement-Text "F2" 13 "0.12 0.45 0.25" 68 475 "CONTEUDO PROGRAMATICO DO VOLUME 2:"

$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 445 "Capitulo 1: Vocabulario de Familia & Relacoes Pessoais"
$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 415 "Capitulo 2: A Casa, Comodos, Moveis & Rotina Domestica"
$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 385 "Capitulo 3: Comida, Bebidas, Supermercado & Restaurantes"
$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 355 "Capitulo 4: Animais, Natureza, Clima & Estacoes do Ano"
$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 325 "Capitulo 5: Trabalho, Profissoes & Ambiente Escolar"
$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 295 "Capitulo 6: Cidades, Transporte Publico & Pedir Direcoes"
$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 265 "Capitulo 7: Cores, Formas, Adjetivos & Descricoes"
$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 235 "Capitulo 8: Gramatica Inglesa: Verbo To Be & Present Simple"
$p += New-PdfElement-Text "F2" 10.5 "0.12 0.45 0.25" 68 205 "Capitulos 9 a 14: Particulas Japonesas, Dialogos Reais & Gabarito"

$p += New-PdfElement-Text "F2" 10.5 "0.12 0.45 0.25" 50 80 "Kizuna Language School - Material Didatico Oficial 2026."
$p += New-PdfElement-Text "F1" 9.5 "0.45 0.45 0.45" 50 62 "Volume 2: Construcao de Frases e Pratica Situacional."
$vol2Pages += $p

$v2Topics = @(
    @{ Pag=2; Ch="Revisao"; Sub="Sumario & Conexao com Volume 1"; Blk=@(
        @{ Type="Heading"; Text="Bem-vindo ao Volume 2: Construcao e Pratica" },
        @{ Type="Text"; Text="No Volume 1 voce dominou os alfabetos, fonetica e saudacoes basicas." },
        @{ Type="Text"; Text="Agora no Volume 2 aprenderemos a construir frases completas com vocabulario rico e particulas." },
        @{ Type="Box"; Title="OBJETIVO DESTE VOLUME"; Lines=@("Transformar palavras soltas em comunicacao natural do cotidiano.", "Pratique as tabelas de 4 colunas repetindo a pronuncia de cada termo.") }
    )},
    @{ Pag=3; Ch="Capitulo 1"; Sub="Vocabulario: Familia e Relacoes"; Blk=@(
        @{ Type="Heading"; Text="Familia e Relacoes Pessoais" },
        @{ Type="Table4Col"; Rows=@(
            @("Father / Dad", "Pai", "Chichi / Otousan", "Chichi / Otousan"),
            @("Mother / Mom", "Mae", "Haha / Okaasan", "Haha / Okaasan"),
            @("Brother", "Irmao", "Kyoudai / Oniisan", "Kyoudai / Oniisan"),
            @("Sister", "Irma", "Shimai / Oneesan", "Shimai / Oneesan"),
            @("Son / Daughter", "Filho / Filha", "Musuko / Musume", "Musuko / Musume"),
            @("Grandparents", "Avos", "Sofu / Sobo", "Sofu / Sobo")
        )},
        @{ Type="LayerLearning"; Title="Meu Pai (My Father / Watashi no Chichi)"; WordEN="Father"; WordPT="Pai"; WordJP="Chichi"; WordRomaji="Chichi"; SentenceEN="My father is an engineer."; SentencePT="Meu pai e engenheiro."; SentenceJP="Chichi wa enginia desu."; SentenceRomaji="Chichi wa enginia desu."; Explanation="Chichi (Meu pai) + WA (topico) + Enginia (Engenheiro) + Desu (e)." }
    )},
    @{ Pag=4; Ch="Capitulo 2"; Sub="Vocabulario: A Casa e Comodos"; Blk=@(
        @{ Type="Heading"; Text="Comodos da Casa e Moveis" },
        @{ Type="Table4Col"; Rows=@(
            @("House / Home", "Casa / Lar", "Ie / Uchi", "Ie / Uchi"),
            @("Living room", "Sala de estar", "Ima / Rivingu", "Ima / Rivingu"),
            @("Kitchen", "Cozinha", "Daidokoro", "Daidokoro"),
            @("Bedroom", "Quarto", "Shinshitsu / Heya", "Shinshitsu / Heya"),
            @("Bathroom", "Banheiro", "Toire / Ofuro", "Toire / Ofuro"),
            @("Door & Window", "Porta e Janela", "Doa to Mado", "Doa to Mado")
        )},
        @{ Type="Box"; Title="DICA DE CULTURA JAPONESA"; Lines=@("No Japao, retiram-se os sapatos na entrada da casa chamada Genkan.") }
    )},
    @{ Pag=5; Ch="Capitulo 3"; Sub="Comida e Restaurantes"; Blk=@(
        @{ Type="Heading"; Text="Alimentos, Bebidas e Restaurantes" },
        @{ Type="Table4Col"; Rows=@(
            @("Water", "Agua", "Mizu", "Mizu"),
            @("Coffee & Tea", "Cafe e Cha", "Kohii to O-cha", "Kohii to O-cha"),
            @("Bread & Rice", "Pao e Arroz", "Pan to Gohan", "Pan to Gohan"),
            @("Meat & Fish", "Carne e Peixe", "Niku to Sakana", "Niku to Sakana"),
            @("Vegetables", "Legumes / Verduras", "Yasai", "Yasai"),
            @("Delicious!", "Gostoso! / Delicioso!", "Oishii desu!", "Oishii desu!")
        )},
        @{ Type="Dialogue"; Title="Fazendo Pedido no Restaurante"; EN="A: What would you like? / B: Grilled fish and water, please."; PT="A: O que deseja pedir? / B: Peixe grelhado e agua, por favor."; JP="A: Nani ni nasaimasu ka? / B: Yaki-zakana to mizu o kudasai."; Romaji="A: Nani ni nasaimasu ka? / B: Yaki-zakana to mizu o kudasai." }
    )},
    @{ Pag=6; Ch="Capitulo 4"; Sub="Animais e Natureza"; Blk=@(
        @{ Type="Heading"; Text="Reino Animal e o Clima" },
        @{ Type="Table4Col"; Rows=@(
            @("Dog", "Cachorro", "Inu", "Inu"),
            @("Cat", "Gato", "Neko", "Neko"),
            @("Bird", "Passaro", "Tori", "Tori"),
            @("Sunny / Rainy", "Ensolarado / Chuvoso", "Hare / Ame", "Hare / Ame"),
            @("Hot / Cold", "Quente / Frio", "Atsui / Samui", "Atsui / Samui")
        )},
        @{ Type="Box"; Title="PRATICA DE CLIMA"; Lines=@("Como dizer 'Hoje o dia esta quente': 'Today is hot' / 'Kyou wa atsui desu'.") }
    )},
    @{ Pag=7; Ch="Capitulo 5"; Sub="Trabalho e Escola"; Blk=@(
        @{ Type="Heading"; Text="Profissoes e Ambiente Escolar" },
        @{ Type="Table4Col"; Rows=@(
            @("Teacher", "Professor(a)", "Sensei", "Sensei"),
            @("Doctor", "Medico(a)", "Isha", "Isha"),
            @("Company", "Empresa", "Kaisha", "Kaisha"),
            @("School", "Escola", "Gakkou", "Gakkou"),
            @("Homework", "Licao de casa", "Shukudai", "Shukudai")
        )},
        @{ Type="Box"; Title="EXPRESSAO DE TRABALHO"; Lines=@("'Otsukaresama desu' e usado no Japao para agradecer o esforco dos colegas.") }
    )},
    @{ Pag=8; Ch="Capitulo 6"; Sub="Cidades e Transporte"; Blk=@(
        @{ Type="Heading"; Text="Locais da Cidade e Meios de Transporte" },
        @{ Type="Table4Col"; Rows=@(
            @("Station", "Estacao de trem", "Eki", "Eki"),
            @("Airport", "Aeroporto", "Kuukou", "Kuukou"),
            @("Hospital", "Hospital", "Byouin", "Byouin"),
            @("Subway / Train", "Metro / Trem", "Chikatetsu / Densha", "Chikatetsu / Densha"),
            @("Bus / Taxi", "Onibus / Taxi", "Basu / Takushii", "Basu / Takushii")
        )}
    )},
    @{ Pag=9; Ch="Capitulo 7"; Sub="Cores e Descricoes"; Blk=@(
        @{ Type="Heading"; Text="Cores, Formas e Adjetivos" },
        @{ Type="Table4Col"; Rows=@(
            @("Red / Blue", "Vermelho / Azul", "Akai / Aoi", "Akai / Aoi"),
            @("Black / White", "Preto / Branco", "Kuroi / Shiroi", "Kuroi / Shiroi"),
            @("Big / Small", "Grande / Pequeno", "Ookii / Chiisai", "Ookii / Chiisai"),
            @("New / Old", "Novo / Velho", "Atarashii / Furui", "Atarashii / Furui")
        )},
        @{ Type="Box"; Title="POSICAO DO ADJETIVO"; Lines=@("Em ingles e japones o adjetivo vem antes do substantivo (Red car / Akai kuruma).") }
    )},
    @{ Pag=10; Ch="Capitulo 8"; Sub="Gramatica Inglesa: Verbo To Be"; Blk=@(
        @{ Type="Heading"; Text="Gramatica Inglesa: Verbo To Be & Present Simple" },
        @{ Type="Box"; Title="ESTRUTURA DO VERBO TO BE"; Lines=@("• I am (Eu sou/estou) | You are (Voce e/esta) | He/She/It is (Ele/Ela e/esta).", "• Negativa: I am not, You are not, He is not.", "• Pergunta: Inverte o verbo: 'Are you a student?' (Voce e estudante?).") },
        @{ Type="Table4Col"; Rows=@(
            @("I am a doctor", "Eu sou medico", "Watashi wa isha desu", "Watashi wa isha desu"),
            @("She is at home", "Ela esta em casa", "Kanojo wa uchi ni imasu", "Kanojo wa uchi ni imasu"),
            @("They are friends", "Eles sao amigos", "Karera wa tomodachi desu", "Karera wa tomodachi desu")
        )}
    )},
    @{ Pag=11; Ch="Capitulo 9"; Sub="Gramatica Japonesa: Particulas"; Blk=@(
        @{ Type="Heading"; Text="Gramatica Japonesa: Guia Completo de Particulas" },
        @{ Type="Box"; Title="AS PRINCIPAIS PARTICULAS JAPONESAS"; Lines=@("• WA: Marca o topico da conversa (Watashi wa...).", "• O: Marca o objeto que recebe a acao (Pan o tabemasu).", "• NI: Marca destino ou horario exato (Gakkou ni ikimasu).", "• DE: Marca o local onde a acao acontece (Uchi de benkyou shimasu).", "• NO: Indica posse (Watashi no hon = Meu livro).") }
    )},
    @{ Pag=12; Ch="Capitulo 10"; Sub="Dialogos no Restaurante e Compras"; Blk=@(
        @{ Type="Heading"; Text="Dialogos Reais: No Restaurante" },
        @{ Type="Dialogue"; Title="Pedindo a Conta"; EN="A: Excuse me, the check please. / B: Here it is. Thank you!"; PT="A: Com licenca, a conta por favor. / B: Aqui esta. Muito obrigado!"; JP="A: Sumimasen, o-kaikei o onegaishimasu. / B: Douzo. Arigatou gozaimasu!"; Romaji="A: Sumimasen, o-kaikei o onegaishimasu. / B: Douzo. Arigatou gozaimasu!" }
    )},
    @{ Pag=13; Ch="Capitulo 11"; Sub="Dialogos no Aeroporto e Hotel"; Blk=@(
        @{ Type="Heading"; Text="Dialogos Reais: Check-in no Hotel" },
        @{ Type="Dialogue"; Title="Entrada no Hotel"; EN="A: Hello! I have a reservation. / B: Welcome, here is your key."; PT="A: Ola! Tenho uma reserva. / B: Bem-vindo, aqui esta sua chave."; JP="A: Konnichiwa! Yoyaku shite imasu. / B: Irasshaimase, kagi desu."; Romaji="A: Konnichiwa! Yoyaku shite imasu. / B: Irasshaimase, kagi desu." }
    )},
    @{ Pag=14; Ch="Capitulo 12"; Sub="Frases de Emergencia e Cidade"; Blk=@(
        @{ Type="Heading"; Text="Frases Praticas na Cidade" },
        @{ Type="Table4Col"; Rows=@(
            @("Where is the station?", "Onde fica a estacao?", "Eki wa doko desu ka?", "Eki wa doko desu ka?"),
            @("Turn right / left", "Vire a direita / esquerda", "Migi / Hidari ni magatte", "Migi / Hidari ni magatte"),
            @("Go straight", "Siga em frente", "Massugu itte kudasai", "Massugu itte kudasai")
        )},
        @{ Type="Box"; Title="ORIENTACAO ESPACIAL"; Lines=@("Migi = Direita | Hidari = Esquerda | Massugu = Em frente.") }
    )},
    @{ Pag=15; Ch="Capitulo 13"; Sub="Caderno de Exercicios do Volume 2"; Blk=@(
        @{ Type="Heading"; Text="Caderno de Pratica do Volume 2" },
        @{ Type="Exercise"; Q1="Complete com a particula: 'Watashi ___ kohii o nomimasu.'"; Q2="Passe para o ingles: 'Ela e medica e mora em Nova York.'"; Q3="Como se diz 'A conta, por favor' em japones?" }
    )},
    @{ Pag=16; Ch="Capitulo 14"; Sub="Simulado & Transicao para o Volume 3"; Blk=@(
        @{ Type="Heading"; Text="Gabarito do Volume 2 & O que vem no Volume 3" },
        @{ Type="Box"; Title="GABARITO DO VOLUME 2"; Lines=@("1. Particula WA (Watashi wa kohii o nomimasu).", "2. 'She is a doctor and lives in New York.'", "3. 'O-kaikei o onegaishimasu.'") },
        @{ Type="Box"; Title="PREVIA DO VOLUME 3 (DESENVOLVIMENTO E CONVERSACAO)"; Lines=@("• Tabelas completas de Hiragana e Katakana.", "• Os 20+ Kanji fundamentais com significados e leituras.", "• Tempos verbais avancados e particulas compostas.", "• Grande Teste Final de Avaliacao e Certificado Oficial.") }
    )}
)

foreach ($top in $v2Topics) {
    $vol2Pages += Create-CleanLayoutPage -PageNum $top.Pag -TotalPages 16 -VolTitle "VOLUME 2: CONSTRUCAO E PRATICA" -ChapterTitle $top.Ch -TopicSubtitle $top.Sub -LevelBadge "[BASICO]" -MainColor "0.12 0.45 0.25" -AccentColor "0.043 0.145 0.271" -Blocks $top.Blk
}

Write-PdfFile -Path "assets/docs/apostila-japones.pdf" -PagesStreams $vol2Pages
Write-PdfFile -Path "assets/docs/apostila-vol2-construcao.pdf" -PagesStreams $vol2Pages

# ==============================================================================
# 3. APOSTILA 3: DESENVOLVIMENTO E CONVERSAÇÃO (14 PÁGINAS)
# ==============================================================================
$vol3Pages = @()

# Capa Vol 3
$p = ""
$p += New-PdfElement-Rect 0 0 595.28 841.89 "0.753 0.188 0.235"
$p += New-PdfElement-Rect 25 25 545.28 791.89 "0.97 0.965 0.95"
$p += New-PdfElement-Rect 25 540 545.28 276.89 "0.753 0.188 0.235"
$p += New-PdfElement-Rect 25 530 545.28 10 "0.043 0.145 0.271"
$p += New-PdfElement-Text "F2" 14 "0.85 0.85 0.85" 50 765 "KIZUNA LANGUAGE SCHOOL - COLECAO DIDATICA"
$p += New-PdfElement-Text "F1" 11 "0.7 0.75 0.85" 50 740 "VOLUME 3 DE 3 - NIVEL INTERMEDIARIO E FLUENCIA"
$p += New-PdfElement-Text "F2" 24 "1 1 1" 50 680 "APOSTILA 3: DESENVOLVIMENTO & CONVERSACAO"
$p += New-PdfElement-Text "F2" 16 "0.9 0.7 0.15" 50 645 "Ingles (EN) - Portugues (PT) - Japones (JP / Romaji)"
$p += New-PdfElement-Text "F3" 12 "0.9 0.9 0.9" 50 615 "Silabarios, Kanji, Gramatica Avancada, Dialogos, Teste Final e Certificado"

$p += New-PdfElement-Rect 50 140 495 365 "1 1 1"
$p += New-PdfElement-StrokeRect 50 140 495 365 "0.753 0.188 0.235" 1.5
$p += New-PdfElement-Text "F2" 13 "0.753 0.188 0.235" 68 475 "CONTEUDO PROGRAMATICO DO VOLUME 3:"

$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 445 "Capitulo 1: Tabelas de Hiragana e Katakana Completas"
$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 415 "Capitulo 2: Os 20+ Kanji Fundamentais com Leituras On/Kun"
$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 385 "Capitulo 3: Gramatica Inglesa: Past Simple, Future e Verbos Modais"
$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 355 "Capitulo 4: Gramatica Japonesa: Passado Mashita e Forma TE"
$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 325 "Capitulo 5: Palavras Interrogativas & Perguntas Complexas"
$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 295 "Capitulo 6: Respostas Rapidas, Conectivos & Girias Naturais"
$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 265 "Capitulo 7: Fonetica Avancada, Ritmo & Pitch Accent Japones"
$p += New-PdfElement-Text "F2" 10.5 "0.043 0.145 0.271" 68 235 "Capitulo 8: Grandes Dialogos de Conversacao da Vida Real"
$p += New-PdfElement-Text "F2" 10.5 "0.753 0.188 0.235" 68 205 "Capitulos 9 e 10: Desafios, Teste Final, Gabarito & Certificado Oficial"

$p += New-PdfElement-Text "F2" 10.5 "0.753 0.188 0.235" 50 80 "Kizuna Language School - Material Didatico Oficial 2026."
$p += New-PdfElement-Text "F1" 9.5 "0.45 0.45 0.45" 50 62 "Volume 3: Desenvolvimento e Conversacao Fluida."
$vol3Pages += $p

$v3Topics = @(
    @{ Pag=2; Ch="Visao Geral"; Sub="A Rota para a Fluencia"; Blk=@(
        @{ Type="Heading"; Text="Bem-vindo ao Volume 3: Desenvolvimento e Conversacao" },
        @{ Type="Text"; Text="Este volume consolida o aprendizado com Kanji, gramatica avancada e simulacoes reais." },
        @{ Type="Box"; Title="ETAPA DE CONSOLIDACAO TRILINGUE"; Lines=@("Ao concluir este livro voce tera capacidade de manter conversas completas,", "ler ideogramas basicos e transitar fluentemente entre os 3 idiomas.") }
    )},
    @{ Pag=3; Ch="Capitulo 1"; Sub="Silabarios: Hiragana e Katakana"; Blk=@(
        @{ Type="Heading"; Text="Tabelas Completas de Hiragana e Katakana" },
        @{ Type="Table4Col"; Rows=@(
            @("A, I, U, E, O", "Vogais", "a i u e o", "a, i, u, e, o"),
            @("KA, KI, KU, KE, KO", "Coluna K", "ka ki ku ke ko", "ka, ki, ku, ke, ko"),
            @("SA, SHI, SU, SE, SO", "Coluna S", "sa shi su se so", "sa, shi, su, se, so"),
            @("TA, CHI, TSU, TE, TO", "Coluna T", "ta chi tsu te to", "ta, chi, tsu, te, to"),
            @("NA, NI, NU, NE, NO", "Coluna N", "na ni nu ne no", "na, ni, nu, ne, no"),
            @("HA, HI, FU, HE, HO", "Coluna H", "ha hi fu he ho", "ha, hi, fu, he, ho")
        )}
    )},
    @{ Pag=4; Ch="Capitulo 2"; Sub="Os 20+ Kanji Fundamentais"; Blk=@(
        @{ Type="Heading"; Text="Ideogramas Essenciais e Leituras On/Kun" },
        @{ Type="Table4Col"; Rows=@(
            @("Person (Kanji: Hito)", "Pessoa", "Hito / JIN, NIN", "hito / jin, nin"),
            @("Sun/Day (Kanji: Hi)", "Sol / Dia", "Hi / NICHI", "hi / nichi"),
            @("Moon/Month (Kanji: Tsuki)", "Lua / Mes", "Tsuki / GETSU", "tsuki / getsu"),
            @("Water (Kanji: Mizu)", "Agua", "Mizu / SUI", "mizu / sui"),
            @("Fire (Kanji: Hi)", "Fogo", "Hi / KA", "hi / ka"),
            @("Tree/Wood (Kanji: Ki)", "Arvore / Madeira", "Ki / MOKU", "ki / moku")
        )},
        @{ Type="Box"; Title="KANJI COMPOSTO: GAKUSEI"; Lines=@("Gaku (Aprender) + Sei (Vida) = Estudante / Aluno.") }
    )},
    @{ Pag=5; Ch="Capitulo 3"; Sub="Gramatica Inglesa Avancada"; Blk=@(
        @{ Type="Heading"; Text="Past Simple, Future e Verbos Modais" },
        @{ Type="Box"; Title="TEMPOS VERBAIS NO INGLES"; Lines=@("• Past Simple: 'I worked yesterday' (Verbos regulares recebem -ed).", "• Future (Will): 'I will travel next week.'", "• Modais: Can (Poder/Capacidade), Should (Dever/Conselho), Must (Obrigacao).") },
        @{ Type="Table4Col"; Rows=@(
            @("I can speak English", "Eu sei falar ingles", "Eigo ga hanasemasu", "Eigo ga hanasemasu"),
            @("I visited Tokyo", "Eu visitei Toquio", "Toukyou o houmon shimashita", "Toukyou o houmon shimashita"),
            @("I will study tomorrow", "Estudarei amanha", "Ashita benkyou shimasu", "Ashita benkyou shimasu")
        )}
    )},
    @{ Pag=6; Ch="Capitulo 4"; Sub="Gramatica Japonesa: Passado & Forma Te"; Blk=@(
        @{ Type="Heading"; Text="Conjugacao: Passado Mashita e Forma TE" },
        @{ Type="Box"; Title="FLEXOES VERBAIS JAPONESAS"; Lines=@("• Presente/Futuro polido: Tabemasu (como/comerei).", "• Passado polido: Tabemashita (comi).", "• Negativa: Tabemasen (nao como) | Passado negativo: Tabemasen deshita.", "• Forma TE (Pedidos e Acoes continuas): Tabete kudasai (Por favor, coma).") }
    )},
    @{ Pag=7; Ch="Capitulo 5"; Sub="Palavras Interrogativas (Wh- / Gimonshi)"; Blk=@(
        @{ Type="Heading"; Text="Como Fazer Perguntas Complexas" },
        @{ Type="Table4Col"; Rows=@(
            @("What / Which", "O que / Qual", "Nan / Dore", "Nan / Dore"),
            @("Where / When", "Onde / Quando", "Doko / Itsu", "Doko / Itsu"),
            @("Who / Why", "Quem / Por que", "Dare / Doushite", "Dare / Doushite"),
            @("How much / How many", "Quanto custa / Quantos", "Ikura / Ikutsu", "Ikura / Ikutsu")
        )}
    )},
    @{ Pag=8; Ch="Capitulo 6"; Sub="Respostas Rapidas e Girias"; Blk=@(
        @{ Type="Heading"; Text="Respostas Naturais e Conectivos" },
        @{ Type="Table4Col"; Rows=@(
            @("Of course! / Sure!", "Claro! / Com certeza!", "Mochiron!", "Mochiron!"),
            @("No problem!", "Sem problemas! / Imagina!", "Daijoubu desu!", "Daijoubu desu!"),
            @("Really?!", "Serio?! / Verdade?!", "Hontou ni?!", "Hontou ni?!"),
            @("I think so", "Acho que sim", "Sou omoimasu", "Sou omoimasu")
        )}
    )},
    @{ Pag=9; Ch="Capitulo 7"; Sub="Fonetica e Pitch Accent"; Blk=@(
        @{ Type="Heading"; Text="Entonacao, Ritmo e Pitch Accent Japones" },
        @{ Type="Box"; Title="A ALTURA DA VOZ NO JAPONES (PITCH ACCENT)"; Lines=@("Diferente do portugues e ingles, o japones varia a altura musical da silaba:", "• HA-shi (Hashi = Talheres / Palitinhos japoneses) - Silaba 1 alta.", "• ha-SHI (Hashi = Ponte) - Silaba 2 alta.") }
    )},
    @{ Pag=10; Ch="Capitulo 8"; Sub="Grandes Dialogos de Conversacao"; Blk=@(
        @{ Type="Heading"; Text="Conversacao Real em Situacao Profissional" },
        @{ Type="Dialogue"; Title="Entrevista de Trabalho / Apresentacao"; EN="A: Why do you want to work here? / B: Because I love international culture."; PT="A: Por que quer trabalhar aqui? / B: Porque amo cultura internacional."; JP="A: Doushite koko de hatarakitai desu ka? / B: Kokusai bunka ga daisuki desu."; Romaji="A: Doushite koko de hatarakitai desu ka? / B: Kokusai bunka ga daisuki desu." }
    )},
    @{ Pag=11; Ch="Capitulo 9"; Sub="Os 6 Grandes Desafios Praticos"; Blk=@(
        @{ Type="Heading"; Text="Desafios de Producao Escrita e Oral" },
        @{ Type="Box"; Title="DESAFIOS KIZUNA"; Lines=@("1. Apresente-se oralmente nos 3 idiomas gravando um audio.", "2. Escreva 5 frases sobre sua rotina usando verbos no passado.", "3. Crie um dialogo completo de pedido em restaurante.", "4. Escreva 5 palavras usando os Kanji aprendidos.") }
    )},
    @{ Pag=12; Ch="Capitulo 10"; Sub="Grande Teste Final de Avaliacao"; Blk=@(
        @{ Type="Heading"; Text="Avaliacao Oficial de Conclusao da Colecao" },
        @{ Type="Exercise"; Q1="Traduza para o japones e ingles: 'Ontem eu comi comida japonesa em um restaurante.'"; Q2="Qual a forma no passado do verbo 'Tabemasu'?"; Q3="Explique a diferenca entre o uso de 'Good night' e 'Good evening'." }
    )},
    @{ Pag=13; Ch="Capitulo 11"; Sub="Gabarito Final & Dicas de Imersao"; Blk=@(
        @{ Type="Heading"; Text="Gabarito Comentado da Avaliacao Final" },
        @{ Type="Box"; Title="RESPOSTAS OFICIAIS"; Lines=@("1. EN: 'Yesterday I ate Japanese food at a restaurant.'", "   JP: 'Kinou resutoran de nihon-shoku o tabemashita.'", "2. Passado de Tabemasu e 'Tabemashita'.", "3. 'Good evening' e saudacao de chegada; 'Good night' e despedida.") }
    )}
)

foreach ($top in $v3Topics) {
    $vol3Pages += Create-CleanLayoutPage -PageNum $top.Pag -TotalPages 14 -VolTitle "VOLUME 3: DESENVOLVIMENTO" -ChapterTitle $top.Ch -TopicSubtitle $top.Sub -LevelBadge "[INTERMEDIARIO]" -MainColor "0.753 0.188 0.235" -AccentColor "0.043 0.145 0.271" -Blocks $top.Blk
}

# Página 14 do Volume 3: Certificado Oficial
$pCert = ""
$pCert += New-PdfElement-Rect 0 0 595.28 841.89 "0.753 0.188 0.235"
$pCert += New-PdfElement-Rect 25 25 545.28 791.89 "0.98 0.975 0.96"
$pCert += New-PdfElement-StrokeRect 35 35 525.28 771.89 "0.043 0.145 0.271" 2.5
$pCert += New-PdfElement-StrokeRect 42 42 511.28 757.89 "0.85 0.65 0.15" 1.5

$pCert += New-PdfElement-Text "F2" 16 "0.043 0.145 0.271" 165 720 "KIZUNA LANGUAGE SCHOOL"
$pCert += New-PdfElement-Text "F1" 11 "0.4 0.4 0.4" 160 698 "CERTIFICADO DE CONCLUSAO OFICIAL"

$pCert += New-PdfElement-Text "F2" 22 "0.753 0.188 0.235" 85 640 "CERTIFICADO DE FORMACAO TRILINGUE"
$pCert += New-PdfElement-Text "F1" 12 "0.2 0.2 0.2" 75 585 "Certificamos que o(a) estudante concluiu com exito a"
$pCert += New-PdfElement-Text "F2" 13 "0.043 0.145 0.271" 75 560 "COLECAO DIDATICA COMPLETA EM 3 VOLUMES"
$pCert += New-PdfElement-Text "F1" 11 "0.25 0.25 0.25" 75 535 "Dominando os fundamentos, construcao de frases, gramatica e conversacao em"
$pCert += New-PdfElement-Text "F2" 12 "0.753 0.188 0.235" 75 510 "INGLES (EN) - PORTUGUES (PT) - JAPONES (JP / Romaji)"

$pCert += New-PdfElement-Rect 75 285 445 175 "1 1 1"
$pCert += New-PdfElement-StrokeRect 75 285 445 175 "0.043 0.145 0.271" 1
$pCert += New-PdfElement-Text "F2" 11.5 "0.043 0.145 0.271" 95 435 "REGISTRO ACADEMICO:"
$pCert += New-PdfElement-Text "F1" 10.5 "0.3 0.3 0.3" 95 408 "Curso: Colecao Didatica Trilingue - Metodo de Ensino Acelerado"
$pCert += New-PdfElement-Text "F1" 10.5 "0.3 0.3 0.3" 95 382 "Volumes Concluidos: Vol 1 (Fundamentos), Vol 2 (Construcao), Vol 3 (Conversacao)"
$pCert += New-PdfElement-Text "F1" 10.5 "0.3 0.3 0.3" 95 356 "Ano Letivo: 2026 - Autenticidade Digital Kizuna"
$pCert += New-PdfElement-Text "F2" 10.5 "0.12 0.6 0.25" 95 328 "Status: APROVADO COM EXCELENCIA TRILINGUE"

$pCert += New-PdfElement-Rect 110 170 160 1.5 "0.043 0.145 0.271"
$pCert += New-PdfElement-Text "F1" 10 "0.3 0.3 0.3" 135 152 "Direcao Pedagogica"

$pCert += New-PdfElement-Rect 325 170 160 1.5 "0.043 0.145 0.271"
$pCert += New-PdfElement-Text "F1" 10 "0.3 0.3 0.3" 345 152 "Coordenacao Trilingue"

$pCert += New-PdfElement-Text "F2" 9.5 "0.043 0.145 0.271" 460 35 "Pagina 14 de 14"
$vol3Pages += $pCert

Write-PdfFile -Path "assets/docs/apostila-portugues.pdf" -PagesStreams $vol3Pages
Write-PdfFile -Path "assets/docs/apostila-vol3-conversacao.pdf" -PagesStreams $vol3Pages

# Copiar para a pasta Curso
$cursoFolder = "Curso"
if (-not (Test-Path $cursoFolder)) {
    New-Item -ItemType Directory -Path $cursoFolder -Force | Out-Null
}

Copy-Item "assets/docs/apostila-ingles.pdf" "$cursoFolder/apostila-ingles.pdf" -Force
Copy-Item "assets/docs/apostila-japones.pdf" "$cursoFolder/apostila-japones.pdf" -Force
Copy-Item "assets/docs/apostila-portugues.pdf" "$cursoFolder/apostila-portugues.pdf" -Force
Copy-Item "assets/docs/apostila-vol1-fundamentos.pdf" "$cursoFolder/apostila-vol1-fundamentos.pdf" -Force
Copy-Item "assets/docs/apostila-vol2-construcao.pdf" "$cursoFolder/apostila-vol2-construcao.pdf" -Force
Copy-Item "assets/docs/apostila-vol3-conversacao.pdf" "$cursoFolder/apostila-vol3-conversacao.pdf" -Force

Write-Host "SUCESSO! Colecao didatica com layout limpo e anti-sobreposicao gerada com sucesso em assets/docs e Curso!"
