let editIdx = null;

  const get  = () => JSON.parse(localStorage.getItem("tarefas")) || [];
  const save = t  => localStorage.setItem("tarefas", JSON.stringify(t));
  const fmt  = v  => "R$ " + Number(v).toFixed(2).replace(".", ",");

  function trocarView(v) {
    document.querySelectorAll(".view").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
    document.getElementById("view-" + v).classList.add("active");
    document.getElementById("btn-" + (v === "lista" ? "lista" : "orc")).classList.add("active");
    if (v === "orcamento") renderOrc();
  }

  function renderLista() {
    const tarefas = get();
    const el = document.getElementById("lista-tarefas");

    el.innerHTML = tarefas.length === 0
      ? '<div class="empty">Nenhuma tarefa cadastrada.<br>Clique em <strong>+ Nova tarefa</strong> para começar.</div>'
      : tarefas.map((t, i) => `
          <div class="task-row">
            <span>${t.nome}</span>
            <span>${t.horas}h</span>
            <span>${fmt(t.custo)}</span>
            <span>${fmt(t.horas * t.custo)}</span>
            <div class="task-actions">
              <button class="btn-icon edit" onclick="editar(${i})" title="Editar">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn-icon" onclick="excluir(${i})" title="Excluir">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </button>
            </div>
          </div>`).join("");

    const totalT = tarefas.length;
    const totalH = tarefas.reduce((s, t) => s + Number(t.horas), 0);
    const totalV = tarefas.reduce((s, t) => s + t.horas * t.custo, 0);
    document.getElementById("totalTarefas").textContent  = totalT;
    document.getElementById("totalHorasCard").textContent = totalH + "h";
    document.getElementById("valorTotalCard").textContent  = fmt(totalV);
  }

 function renderOrc() {
  const tarefas = get();
  const el = document.getElementById("lista-orcamento");

  const descontoInput = document.getElementById("desconto");
  const descontoPerc = Number(descontoInput?.value || 0);

  const urgenciaSelect = document.getElementById("urgencia");
  const urgenciaPerc = Number(urgenciaSelect?.value || 0);

  let totalH = 0;
  let subtotalGeral = 0;

  el.innerHTML = tarefas.length === 0
    ? '<div class="empty">Nenhuma tarefa cadastrada.</div>'
    : tarefas.map(t => {

        const sub = t.horas * t.custo;

        const descontoValor = sub * (descontoPerc / 100);

        const totalLinha = sub - descontoValor;

        totalH += Number(t.horas);
        subtotalGeral += totalLinha;

        return `
          <div class="orc-row">
            <span>${t.nome}</span>
            <span>${t.horas}h</span>
            <span>${fmt(t.custo)}</span>
            <span>${fmt(sub)}</span>
            <span>${fmt(descontoValor)}</span>
            <span>${fmt(totalLinha)}</span>
          </div>
        `;
      }).join("");

  let totalFinal = subtotalGeral;

  totalFinal += totalFinal * (urgenciaPerc / 100);

  document.getElementById("totalHorasOrc").textContent = totalH + "h";
  document.getElementById("totalFinal").textContent = fmt(totalFinal);
}
  
  function abrirModal() {
    editIdx = null;
    document.getElementById("modalTitulo").textContent = "Nova Tarefa";
    document.getElementById("inputNome").value  = "";
    document.getElementById("inputHoras").value = "";
    document.getElementById("inputCusto").value = "";
    document.getElementById("modal").classList.add("open");
    setTimeout(() => document.getElementById("inputNome").focus(), 50);
  }

  function fecharModal() { document.getElementById("modal").classList.remove("open"); }
  function fecharFora(e) { if (e.target === document.getElementById("modal")) fecharModal(); }

  function salvar() {
    const nome  = document.getElementById("inputNome").value.trim();
    const horas = parseFloat(document.getElementById("inputHoras").value);
    const custo = parseFloat(document.getElementById("inputCusto").value);
    if (!nome || isNaN(horas) || isNaN(custo) || horas < 0 || custo < 0) {
      alert("Preencha todos os campos corretamente."); return;
    }
    const tarefas = get();
    if (editIdx !== null) tarefas[editIdx] = { nome, horas, custo };
    else tarefas.push({ nome, horas, custo });
    save(tarefas);
    fecharModal();
    renderLista();
  }

  function editar(i) {
    const t = get()[i];
    editIdx = i;
    document.getElementById("modalTitulo").textContent = "Editar Tarefa";
    document.getElementById("inputNome").value  = t.nome;
    document.getElementById("inputHoras").value = t.horas;
    document.getElementById("inputCusto").value = t.custo;
    document.getElementById("modal").classList.add("open");
  }

  function excluir(i) {
    if (!confirm("Excluir esta tarefa?")) return;
    const tarefas = get();
    tarefas.splice(i, 1);
    save(tarefas);
    renderLista();
  }

  document.addEventListener("keydown", e => { if (e.key === "Escape") fecharModal(); });

document.addEventListener("input", (e) => {
  if (e.target.id === "desconto") {
    renderOrc();
  }
});

document.addEventListener("change", (e) => {
  if (e.target.id === "urgencia") {
    renderOrc();
  }
});
  renderLista();
