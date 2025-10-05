// Basic helpers
const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));

// Year
$('#year').textContent = new Date().getFullYear();

// Smooth scroll nav
$$('.rbx-nav a').forEach(a => {
	a.addEventListener('click', e => {
		const id = a.getAttribute('data-target');
		if (!id) return;
		e.preventDefault();
		$('#' + id).scrollIntoView({ behavior: 'smooth', block: 'start' });
	});
});

// Modal system
const scrim = $('#modal-scrim');
function openModal(sel) {
	const modal = $(sel);
	if (!modal) return;
	scrim.hidden = false;
	modal.hidden = false;
	modal.dataset.open = '1';
}
function closeModal(modal) {
	if (!modal) return;
	modal.hidden = true;
	delete modal.dataset.open;
	if (!$('.modal[data-open="1"]')) scrim.hidden = true;
}
$$('[data-open-modal]').forEach(btn => btn.addEventListener('click', () => openModal(btn.getAttribute('data-open-modal'))));
$$('[data-close-modal]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.closest('.modal'))));
scrim.addEventListener('click', () => $$('.modal').forEach(m => closeModal(m)));

// About Quiz Game
const quizData = [
	{ q: "Which blocks theme is this site inspired by?", a: ['Roblox', 'Minecraft', 'Fortnite'], c: 0 },
	{ q: "Which building toy do I love?", a: ['K-nex', 'LEGO', 'Dominoes'], c: 1 },
	{ q: "Which activities do I enjoy?", a: ['Swimming', 'Skydiving', 'Base jumping'], c: 0 }
];
function renderQuiz() {
	const container = $('#quiz-container');
	container.innerHTML = '';
	let score = 0; let idx = 0;
	const card = document.createElement('div');
	const qEl = document.createElement('h4');
	const answers = document.createElement('div');
	answers.style.display = 'grid'; answers.style.gap = '8px';
	const next = document.createElement('button');
	next.className = 'btn btn-primary'; next.textContent = 'Next'; next.disabled = true;
	let selected = -1;
	function load() {
		const { q, a } = quizData[idx];
		qEl.textContent = `Q${idx+1}. ${q}`;
		answers.innerHTML = '';
		selected = -1; next.disabled = true;
		a.forEach((label, i) => {
			const b = document.createElement('button');
			b.className = 'btn'; b.textContent = label;
			b.addEventListener('click', () => { selected = i; next.disabled = false; });
			answers.appendChild(b);
		});
	}
	next.addEventListener('click', () => {
		if (selected === quizData[idx].c) score++;
		idx++;
		if (idx >= quizData.length) {
			container.innerHTML = `<p>You scored <strong>${score}/${quizData.length}</strong> 🎉</p>`;
			return;
		}
		load();
	});
	card.append(qEl, answers, next);
	container.append(card);
	load();
}
// Start quiz when modal opens
const aboutModal = $('#about-quiz-modal');
const obs = new MutationObserver(() => { if (!aboutModal.hidden) renderQuiz(); });
obs.observe(aboutModal, { attributes: true, attributeFilter: ['hidden'] });

// LEGO Builder Game
function legoGame() {
	const canvas = /** @type {HTMLCanvasElement} */ ($('#lego-canvas'));
	const ctx = canvas.getContext('2d');
	let bricks = 0; let start = performance.now();
	function draw() {
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = '#0b1220'; ctx.fillRect(0,0,canvas.width,canvas.height);
		for (let i=0;i<bricks;i++) {
			ctx.fillStyle = i % 2 ? '#ffcf00' : '#ff6b00';
			const x = (i%10)*32 + 8; const y = canvas.height - 20 - Math.floor(i/10)*18;
			ctx.fillRect(x, y, 28, 12);
		}
		const t = Math.max(0, 20 - Math.floor((performance.now()-start)/1000));
		ctx.fillStyle = '#9db0d1'; ctx.fillText(`Bricks: ${bricks} / 20 | Time: ${t}s`, 8, 16);
		if (t <= 0 || bricks >= 20) {
			ctx.fillStyle = '#00ff9c';
			ctx.fillText(bricks >= 20 ? 'You built it! 🧱' : 'Time up!', 8, 32);
			canvas.onclick = null;
			return;
		}
		requestAnimationFrame(draw);
	}
	canvas.onclick = () => { bricks++; };
	draw();
}
$('#lego-game-modal').addEventListener('click', e => {
	if (e.target.id === 'lego-game-modal' || e.target.hasAttribute('data-close-modal')) return;
});
const legoObs = new MutationObserver(() => { if (!$('#lego-game-modal').hidden) legoGame(); });
legoObs.observe($('#lego-game-modal'), { attributes: true, attributeFilter: ['hidden'] });

// Swim Reaction Game
(() => {
	const panel = $('#reaction-panel');
	const startBtn = $('#reaction-start');
	let waiting = false; let goTime = 0; let timeoutId = 0;
	startBtn.addEventListener('click', () => {
		panel.textContent = 'Wait for GO…';
		waiting = true; startBtn.disabled = true;
		const wait = 1000 + Math.random()*2000;
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => { goTime = performance.now(); panel.textContent = 'GO! Click!'; }, wait);
	});
	panel.addEventListener('click', () => {
		if (!waiting) return;
		if (panel.textContent.startsWith('GO')) {
			const rt = Math.round(performance.now()-goTime);
			panel.textContent = `Reaction: ${rt} ms`;
			startBtn.disabled = false; waiting = false;
		} else {
			panel.textContent = 'Too soon! Try again.';
			startBtn.disabled = false; waiting = false; clearTimeout(timeoutId);
		}
	});
})();

// Dance Steps (Simon-like)
(() => {
	const seqEl = $('#dance-seq');
	const startBtn = $('#dance-start');
	const controls = $$('.dance-controls .arrow');
	const dirs = ['←','↑','→','↓'];
	let seq = []; let input = []; let playing = false;
	function flash(dir) {
		const btn = controls[dirs.indexOf(dir)];
		btn.style.transform = 'scale(1.08)';
		setTimeout(() => btn.style.transform = '', 180);
	}
	function showSeq() {
		playing = true; seqEl.textContent = seq.join(' ');
		let i = 0;
		const iv = setInterval(() => {
			flash(seq[i]); i++;
			if (i>=seq.length) { clearInterval(iv); playing = false; input = []; }
		}, 420);
	}
	controls.forEach(btn => btn.addEventListener('click', () => {
		if (playing || !seq.length) return;
		const d = btn.getAttribute('data-dir');
		input.push(d);
		if (d !== seq[input.length-1]) { seqEl.textContent = 'Miss! Try again.'; input = []; showSeq(); return; }
		if (input.length === seq.length) { seq.push(dirs[Math.floor(Math.random()*4)]); seqEl.textContent = 'Great!'; showSeq(); }
	}));
	startBtn.addEventListener('click', () => { seq = [dirs[Math.floor(Math.random()*4)]]; showSeq(); });
})();

// Pixel Painter
(() => {
	const canvas = /** @type {HTMLCanvasElement} */ ($('#art-canvas'));
	const ctx = canvas.getContext('2d');
	const size = 16; const cell = canvas.width/size;
	let filled = new Set(); let painting = false;
	function drawCell(cx, cy) {
		ctx.fillStyle = '#00d0ff';
		ctx.fillRect(cx*cell, cy*cell, cell-1, cell-1);
	}
	function redraw() {
		ctx.fillStyle = '#0b1220'; ctx.fillRect(0,0,canvas.width,canvas.height);
		for (const key of filled) { const [x,y] = key.split(',').map(Number); drawCell(x,y); }
		const pct = Math.round((filled.size/(size*size))*100);
		ctx.fillStyle = '#9db0d1'; ctx.fillText(`${pct}% painted`, 8, 16);
		if (pct>=80) { ctx.fillStyle = '#00ff9c'; ctx.fillText('You win! 🎨', 8, 32); }
	}
	function pos(e){ const r = canvas.getBoundingClientRect(); const x = Math.floor((e.clientX-r.left)/cell); const y = Math.floor((e.clientY-r.top)/cell); return [x,y]; }
	canvas.addEventListener('mousedown', e => { painting = true; const [x,y]=pos(e); filled.add(`${x},${y}`); redraw(); });
	canvas.addEventListener('mousemove', e => { if (!painting) return; const [x,y]=pos(e); filled.add(`${x},${y}`); redraw(); });
	window.addEventListener('mouseup', () => painting=false);
	redraw();
})();

// Memory Match
(() => {
	const grid = $('#memory-grid');
	const reset = $('#memory-reset');
	const symbols = ['🍎','🍋','🍇','🍉','🥝','🍑','🍍','🥥'];
	let cards = []; let first = null; let lock = false; let matches = 0;
	function setup() {
		grid.innerHTML=''; matches=0; first=null; lock=false;
		cards = symbols.concat(symbols).sort(()=>Math.random()-0.5).map(sym => ({ sym, el: document.createElement('button'), revealed: false }));
		for (const c of cards) {
			c.el.textContent = c.sym; c.el.addEventListener('click', () => flip(c)); grid.appendChild(c.el);
		}
	}
	function flip(c){
		if (lock || c.revealed) return;
		c.revealed = true; c.el.classList.add('revealed');
		if (!first) { first = c; return; }
		if (first.sym === c.sym) { first=null; matches+=1; if (matches===symbols.length) alert('You matched all pairs!'); return; }
		lock = true; setTimeout(() => { c.revealed=false; first.revealed=false; c.el.classList.remove('revealed'); first.el.classList.remove('revealed'); first=null; lock=false; }, 700);
	}
	reset.addEventListener('click', setup);
	setup();
})();


