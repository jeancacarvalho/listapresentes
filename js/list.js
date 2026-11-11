(function () {
  var grade = document.getElementById("grade");
  var vazio = document.getElementById("vazio");
  var contador = document.getElementById("contador");
  var busca = document.getElementById("f-busca");
  var categoria = document.getElementById("f-categoria");
  var faixa = document.getElementById("f-faixa");
  var ordem = document.getElementById("f-ordem");
  var title = document.title;
  var herodate = document.getElementById("hero-date");
  var heronames = document.getElementById("hero-names");
  var herophotocasal = document.getElementById("hero-photo-casal");
  var herotagline = document.getElementById("hero-tagline");

  var inicioLinkFoto = "https://lh3.googleusercontent.com/d/";

  let dados = null;

  // Categorias distintas (preenchidas automaticamente na página)
  var priceRanges = {
    all: { min: 0, max: Infinity },
    "1-50": { min: 1, max: 50 },
    "51-100": { min: 51, max: 100 },
    "101-250": { min: 101, max: 250 },
    "251-500": { min: 251, max: 500 },
    "501-1000": { min: 501, max: 1000 },
    "1000+": { min: 1001, max: Infinity },
  };

  function brl(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  // Função que conecta na planilha e retorna os dados
  async function carregarDadosDaPlanilha() {
    // Substitua pela URL gerada na implantação do Apps Script
    const urlApi =
      "https://script.google.com/macros/s/AKfycbwYmlBV8uvXMvw5UyUhndBO4qDnGuMmaKsdl75ZbmCXAUwOHTIeHmKzrqvSFtcxY6rT/exec";

    try {
      const resposta = await fetch(urlApi);
      if (!resposta.ok) throw new Error("Erro na requisição");

      dados = await resposta.json();
      //console.log("Dados recebidos da planilha privada:", dados);

      // Completa as informação da página
      title =
        dados[0][0].Noiva + " & " + dados[0][0].Noivo + " · Lista de Presentes";
      herodate.innerHTML =
        dados[0][0].Dia + " · " + dados[0][0].Mês + " · " + dados[0][0].Ano;
      heronames.innerHTML = dados[0][0].Noiva + " & " + dados[0][0].Noivo;
      herophotocasal.src = inicioLinkFoto + dados[0][0].Foto;
      herophotocasal.alt = dados[0][0].Noiva + " & " + dados[0][0].Noivo;
      herotagline.innerHTML = dados[0][0].Mensagem;

      // Preenche o combo de categorias com os valores distintos
      var seen = {};
      dados[1].forEach(function (g) {
        if (!seen[g.Categoria]) {
          seen[g.Categoria] = true;
          var opt = document.createElement("option");
          opt.value = g.Categoria;
          opt.textContent = g.Categoria;
          categoria.appendChild(opt);
        }
      });

      // Preenche a lista de presentes
      filtrar();

      // Exemplo de como usar os dados:
      // dados.forEach(item => { console.log(item.NomeDoCabecalho); });
    } catch (erro) {
      console.error("Não foi possível ler a planilha:", erro);
    }
  }

  function filtrar() {
    if (!dados) {
      console.warn("Os dados ainda não foram carregados.");
      return;
    }

    var q = busca.value.trim().toLowerCase();
    var cat = categoria.value;
    var range = priceRanges[faixa.value] || priceRanges["all"];

    var list = dados[1].filter(function (g) {
      var casaBusca =
        !q ||
        g.Nome.toLowerCase().indexOf(q) !== -1 ||
        g.Categoria.toLowerCase().indexOf(q) !== -1;
      var casaCat = !cat || g.Categoria === cat;
      var casaFaixa = g.Preço >= range.min && g.Preço <= range.max;
      return casaBusca && casaCat && casaFaixa;
    });

    if (ordem.value === "menor")
      list.sort(function (a, b) {
        return a.Preço - b.Preço;
      });
    if (ordem.value === "maior")
      list.sort(function (a, b) {
        return b.Preço - a.Preço;
      });

    contador.textContent = list.length + " presente(s)";
    vazio.hidden = list.length !== 0;
    grade.innerHTML = "";

    list.forEach(function (g) {
      var article = document.createElement("article");
      article.className = "card";
      article.innerHTML =
        '<div class="card-img"><img src="' +
        inicioLinkFoto +
        g.Foto +
        '" alt="' +
        g.Nome +
        '" loading="lazy" width="816" height="816"></div>' +
        '<p class="card-categoria">' +
        g.Categoria +
        "</p>" +
        '<h2 class="card-nome">' +
        g.Nome +
        "</h2>" +
        '<p class="card-preco">' +
        brl(g.Preço) +
        "</p>" +
        '<a class="card-btn" href="' +
        g.Pagamento +
        '" target="_blank">Presentear</a>';
      grade.appendChild(article);
    });
  }

  busca.addEventListener("input", filtrar);
  categoria.addEventListener("change", filtrar);
  faixa.addEventListener("change", filtrar);
  ordem.addEventListener("change", filtrar);

  // Executa a função que conecta na planilha e retorna os dados
  carregarDadosDaPlanilha();
})();
