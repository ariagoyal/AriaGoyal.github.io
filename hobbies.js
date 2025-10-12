// Basic helpers
const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));

// Year
$('#year').textContent = new Date().getFullYear();

// LEGO Builder Game
let legoGameActive = false;
$('#lego-start').addEventListener('click', () => {
	const gameDiv = $('#lego-game');
	const startBtn = $('#lego-start');
	
	if (!legoGameActive) {
		gameDiv.style.display = 'block';
		startBtn.textContent = 'Hide Game';
		legoGameActive = true;
		startLegoGame();
	} else {
		gameDiv.style.display = 'none';
		startBtn.textContent = 'Play';
		legoGameActive = false;
	}
});

function startLegoGame() {
	const canvas = $('#lego-canvas');
	const ctx = canvas.getContext('2d');
	let bricks = 0; 
	let start = performance.now();
	
	function draw() {
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = '#0b1220'; 
		ctx.fillRect(0,0,canvas.width,canvas.height);
		
		for (let i=0;i<bricks;i++) {
			ctx.fillStyle = i % 2 ? '#ffcf00' : '#ff6b00';
			const x = (i%10)*30 + 10; 
			const y = canvas.height - 20 - Math.floor(i/10)*16;
			ctx.fillRect(x, y, 26, 12);
		}
		
		const t = Math.max(0, 20 - Math.floor((performance.now()-start)/1000));
		ctx.fillStyle = '#9db0d1'; 
		ctx.font = '14px Nunito';
		ctx.fillText(`Bricks: ${bricks} / 20 | Time: ${t}s`, 8, 16);
		
		if (t <= 0 || bricks >= 20) {
			ctx.fillStyle = '#00ff9c';
			ctx.fillText(bricks >= 20 ? 'You built it! 🧱' : 'Time up!', 8, 32);
			canvas.onclick = null;
			return;
		}
		
		if (legoGameActive) requestAnimationFrame(draw);
	}
	
	canvas.onclick = () => { bricks++; };
	draw();
}

// Swim Reaction Game
let swimGameActive = false;
$('#swim-start').addEventListener('click', () => {
	const gameDiv = $('#swim-game');
	const startBtn = $('#swim-start');
	
	if (!swimGameActive) {
		gameDiv.style.display = 'block';
		startBtn.textContent = 'Hide Game';
		swimGameActive = true;
	} else {
		gameDiv.style.display = 'none';
		startBtn.textContent = 'Play';
		swimGameActive = false;
	}
});

(() => {
	const panel = $('#reaction-panel');
	const startBtn = $('#reaction-start-btn');
	let waiting = false; let goTime = 0; let timeoutId = 0;
	
	startBtn.addEventListener('click', () => {
		panel.textContent = 'Wait for GO…';
		waiting = true; startBtn.disabled = true;
		const wait = 1000 + Math.random()*2000;
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => { 
			goTime = performance.now(); 
			panel.textContent = 'GO! Click!'; 
		}, wait);
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

// Dance Steps Game
let danceGameActive = false;
$('#dance-start').addEventListener('click', () => {
	const gameDiv = $('#dance-game');
	const startBtn = $('#dance-start');
	
	if (!danceGameActive) {
		gameDiv.style.display = 'block';
		startBtn.textContent = 'Hide Game';
		danceGameActive = true;
	} else {
		gameDiv.style.display = 'none';
		startBtn.textContent = 'Play';
		danceGameActive = false;
	}
});

(() => {
	const seqEl = $('#dance-seq');
	const startBtn = $('#dance-start-btn');
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
		if (d !== seq[input.length-1]) { 
			seqEl.textContent = 'Miss! Try again.'; 
			input = []; 
			setTimeout(() => showSeq(), 1000);
			return; 
		}
		if (input.length === seq.length) { 
			seq.push(dirs[Math.floor(Math.random()*4)]); 
			seqEl.textContent = 'Great!'; 
			setTimeout(() => showSeq(), 1000);
		}
	}));
	
	startBtn.addEventListener('click', () => { 
		seq = [dirs[Math.floor(Math.random()*4)]]; 
		showSeq(); 
	});
})();

// Pixel Painter Game
let artGameActive = false;
$('#art-start').addEventListener('click', () => {
	const gameDiv = $('#art-game');
	const startBtn = $('#art-start');
	
	if (!artGameActive) {
		gameDiv.style.display = 'block';
		startBtn.textContent = 'Hide Game';
		artGameActive = true;
		startArtGame();
	} else {
		gameDiv.style.display = 'none';
		startBtn.textContent = 'Play';
		artGameActive = false;
	}
});

function startArtGame() {
	const canvas = $('#art-canvas');
	const ctx = canvas.getContext('2d');
	const size = 12; const cell = canvas.width/size;
	let filled = new Set(); let painting = false;
	
	function drawCell(cx, cy) {
		ctx.fillStyle = '#00d0ff';
		ctx.fillRect(cx*cell, cy*cell, cell-1, cell-1);
	}
	
	function redraw() {
		ctx.fillStyle = '#0b1220'; ctx.fillRect(0,0,canvas.width,canvas.height);
		for (const key of filled) { 
			const [x,y] = key.split(',').map(Number); 
			drawCell(x,y); 
		}
		const pct = Math.round((filled.size/(size*size))*100);
		ctx.fillStyle = '#9db0d1'; 
		ctx.font = '12px Nunito';
		ctx.fillText(`${pct}% painted`, 8, 14);
		if (pct>=80) { 
			ctx.fillStyle = '#00ff9c'; 
			ctx.fillText('You win! 🎨', 8, 28); 
		}
	}
	
	function pos(e){ 
		const r = canvas.getBoundingClientRect(); 
		const x = Math.floor((e.clientX-r.left)/cell); 
		const y = Math.floor((e.clientY-r.top)/cell); 
		return [x,y]; 
	}
	
	canvas.addEventListener('mousedown', e => { 
		painting = true; 
		const [x,y]=pos(e); 
		filled.add(`${x},${y}`); 
		redraw(); 
	});
	canvas.addEventListener('mousemove', e => { 
		if (!painting) return; 
		const [x,y]=pos(e); 
		filled.add(`${x},${y}`); 
		redraw(); 
	});
	window.addEventListener('mouseup', () => painting=false);
	redraw();
}
