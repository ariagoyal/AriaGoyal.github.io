// Basic helpers
const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));

// Year
$('#year').textContent = new Date().getFullYear();

// Game state management
let activeGame = null;
const gameStates = {
	lego: false,
	swim: false,
	dance: false,
	art: false
};

function closeAllGames() {
	$$('.inline-game').forEach(game => game.style.display = 'none');
	$$('.card .btn').forEach(btn => {
		if (btn.textContent === 'Hide Game') {
			btn.textContent = 'Play';
		}
	});
	Object.keys(gameStates).forEach(game => gameStates[game] = false);
	activeGame = null;
}

function toggleGame(gameId, gameElement, buttonElement) {
	if (activeGame === gameId) {
		// Close this game
		gameElement.style.display = 'none';
		buttonElement.textContent = 'Play';
		gameStates[gameId] = false;
		activeGame = null;
	} else {
		// Close all other games first
		closeAllGames();
		// Open this game
		gameElement.style.display = 'block';
		buttonElement.textContent = 'Hide Game';
		gameStates[gameId] = true;
		activeGame = gameId;
	}
}

// LEGO Builder Game
$('#lego-start').addEventListener('click', () => {
	const gameDiv = $('#lego-game');
	const startBtn = $('#lego-start');
	
	toggleGame('lego', gameDiv, startBtn);
	
	if (gameStates.lego) {
		startLegoGame();
	}
});

function startLegoGame() {
	const canvas = $('#lego-canvas');
	const ctx = canvas.getContext('2d');
	let bricks = 0; 
	let start = performance.now();
	let score = 0;
	let combo = 0;
	let lastClickTime = 0;
	let fallingBricks = [];
	let particles = [];
	
	function createParticle(x, y, color) {
		particles.push({
			x, y, vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 3 - 1,
			life: 30, color, size: Math.random() * 3 + 2
		});
	}
	
	function addFallingBrick() {
		fallingBricks.push({
			x: Math.random() * (canvas.width - 30),
			y: -20,
			vy: Math.random() * 2 + 1,
			color: Math.random() > 0.5 ? '#ffcf00' : '#ff6b00'
		});
	}
	
	function draw() {
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = '#0b1220'; 
		ctx.fillRect(0,0,canvas.width,canvas.height);
		
		// Draw base
		ctx.fillStyle = '#2a2a2a';
		ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
		
		// Draw built bricks with glow effect
		for (let i=0;i<bricks;i++) {
			const x = (i%10)*30 + 10; 
			const y = canvas.height - 20 - Math.floor(i/10)*16;
			
			// Glow effect
			ctx.shadowColor = i % 2 ? '#ffcf00' : '#ff6b00';
			ctx.shadowBlur = 8;
			ctx.fillStyle = i % 2 ? '#ffcf00' : '#ff6b00';
			ctx.fillRect(x, y, 26, 12);
			ctx.shadowBlur = 0;
		}
		
		// Draw falling bricks
		fallingBricks.forEach((brick, i) => {
			brick.y += brick.vy;
			ctx.fillStyle = brick.color;
			ctx.fillRect(brick.x, brick.y, 26, 12);
			
			if (brick.y > canvas.height) {
				fallingBricks.splice(i, 1);
			}
		});
		
		// Draw particles
		particles.forEach((particle, i) => {
			particle.x += particle.vx;
			particle.y += particle.vy;
			particle.life--;
			
			ctx.globalAlpha = particle.life / 30;
			ctx.fillStyle = particle.color;
			ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
			ctx.globalAlpha = 1;
			
			if (particle.life <= 0) {
				particles.splice(i, 1);
			}
		});
		
		const t = Math.max(0, 30 - Math.floor((performance.now()-start)/1000));
		ctx.fillStyle = '#9db0d1'; 
		ctx.font = '14px Nunito';
		ctx.fillText(`Bricks: ${bricks} / 25 | Time: ${t}s`, 8, 16);
		ctx.fillText(`Score: ${score} | Combo: ${combo}x`, 8, 32);
		
		if (t <= 0 || bricks >= 25) {
			ctx.fillStyle = '#00ff9c';
			ctx.font = '16px Nunito';
			ctx.fillText(bricks >= 25 ? '🏗️ TOWER BUILT! 🏗️' : '⏰ Time up!', 8, 50);
			ctx.fillText(`Final Score: ${score}`, 8, 70);
			canvas.onclick = null;
			return;
		}
		
		if (gameStates.lego) requestAnimationFrame(draw);
	}
	
	canvas.onclick = (e) => { 
		const now = performance.now();
		const timeDiff = now - lastClickTime;
		
		// Combo system
		if (timeDiff < 500) {
			combo++;
			score += combo * 10;
		} else {
			combo = 1;
			score += 10;
		}
		
		bricks++;
		lastClickTime = now;
		
		// Create particles at click position
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		createParticle(x, y, '#00ff9c');
		
		// Occasionally add falling bricks
		if (Math.random() < 0.3) {
			addFallingBrick();
		}
	};
	
	// Start falling bricks timer
	const fallingInterval = setInterval(() => {
		if (gameStates.lego && Math.random() < 0.4) {
			addFallingBrick();
		}
	}, 2000);
	
	// Clean up interval when game ends
	const originalDraw = draw;
	draw = function() {
		originalDraw();
		if (!gameStates.lego) {
			clearInterval(fallingInterval);
		}
	};
	
	draw();
}

// Swim Reaction Game
$('#swim-start').addEventListener('click', () => {
	const gameDiv = $('#swim-game');
	const startBtn = $('#swim-start');
	
	toggleGame('swim', gameDiv, startBtn);
});

(() => {
	const panel = $('#reaction-panel');
	const startBtn = $('#reaction-start-btn');
	let waiting = false; let goTime = 0; let timeoutId = 0;
	let bestTime = Infinity; let attempts = 0; let totalTime = 0;
	
	function updateStats() {
		const avgTime = attempts > 0 ? Math.round(totalTime / attempts) : 0;
		const statsText = `Best: ${bestTime === Infinity ? '--' : bestTime}ms | Avg: ${avgTime}ms | Attempts: ${attempts}`;
		panel.setAttribute('data-stats', statsText);
	}
	
	startBtn.addEventListener('click', () => {
		panel.textContent = '🏊‍♀️ Get ready...';
		panel.style.background = 'linear-gradient(45deg, #0a1320, #1a2a40)';
		waiting = true; startBtn.disabled = true;
		const wait = 1500 + Math.random()*3000;
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => { 
			goTime = performance.now(); 
			panel.textContent = '🏊‍♀️ GO! SWIM! 🏊‍♀️';
			panel.style.background = 'linear-gradient(45deg, #00ff9c, #00d0ff)';
			panel.style.transform = 'scale(1.05)';
			setTimeout(() => panel.style.transform = '', 200);
		}, wait);
	});
	
	panel.addEventListener('click', () => {
		if (!waiting) return;
		if (panel.textContent.includes('GO')) {
			const rt = Math.round(performance.now()-goTime);
			attempts++;
			totalTime += rt;
			
			if (rt < bestTime) {
				bestTime = rt;
				panel.textContent = `🏆 NEW RECORD! ${rt}ms 🏆`;
				panel.style.background = 'linear-gradient(45deg, #ffd700, #ffed4e)';
			} else if (rt < 200) {
				panel.textContent = `⚡ LIGHTNING FAST! ${rt}ms ⚡`;
				panel.style.background = 'linear-gradient(45deg, #00ff9c, #00d0ff)';
			} else if (rt < 400) {
				panel.textContent = `🏊‍♀️ Great swim! ${rt}ms 🏊‍♀️`;
				panel.style.background = 'linear-gradient(45deg, #4ade80, #22c55e)';
			} else {
				panel.textContent = `🐌 Keep practicing! ${rt}ms 🐌`;
				panel.style.background = 'linear-gradient(45deg, #f59e0b, #d97706)';
			}
			
			updateStats();
			startBtn.disabled = false; waiting = false;
		} else {
			panel.textContent = '❌ Too soon! Wait for GO! ❌';
			panel.style.background = 'linear-gradient(45deg, #ef4444, #dc2626)';
			startBtn.disabled = false; waiting = false; clearTimeout(timeoutId);
		}
	});
})();

// Dance Steps Game
$('#dance-start').addEventListener('click', () => {
	const gameDiv = $('#dance-game');
	const startBtn = $('#dance-start');
	
	toggleGame('dance', gameDiv, startBtn);
});

(() => {
	const seqEl = $('#dance-seq');
	const startBtn = $('#dance-start-btn');
	const controls = $$('.dance-controls .arrow');
	const dirs = ['←','↑','→','↓'];
	let seq = []; let input = []; let playing = false; let level = 1; let score = 0;
	
	function flash(dir) {
		const btn = controls[dirs.indexOf(dir)];
		btn.style.transform = 'scale(1.2)';
		btn.style.background = 'linear-gradient(145deg, #00ff9c, #00d0ff)';
		btn.style.boxShadow = '0 0 20px rgba(0, 255, 156, 0.5)';
		setTimeout(() => {
			btn.style.transform = '';
			btn.style.background = '';
			btn.style.boxShadow = '';
		}, 300);
	}
	
	function showSeq() {
		playing = true; 
		seqEl.textContent = `Level ${level} | Score: ${score} | Watch the sequence!`;
		let i = 0;
		const iv = setInterval(() => {
			flash(seq[i]); 
			i++;
			if (i>=seq.length) { 
				clearInterval(iv); 
				playing = false; 
				input = []; 
				seqEl.textContent = `Level ${level} | Score: ${score} | Your turn! Repeat the sequence.`;
			}
		}, 600);
	}
	
	function addParticles() {
		// Add visual feedback for successful moves
		seqEl.style.background = 'linear-gradient(45deg, #00ff9c, #00d0ff)';
		setTimeout(() => seqEl.style.background = '', 200);
	}
	
	controls.forEach(btn => btn.addEventListener('click', () => {
		if (playing || !seq.length) return;
		const d = btn.getAttribute('data-dir');
		input.push(d);
		
		// Visual feedback for button press
		btn.style.transform = 'scale(0.95)';
		setTimeout(() => btn.style.transform = '', 100);
		
		if (d !== seq[input.length-1]) { 
			seqEl.textContent = `💥 Oops! Wrong step! Level ${level} | Score: ${score}`;
			seqEl.style.background = 'linear-gradient(45deg, #ef4444, #dc2626)';
			setTimeout(() => seqEl.style.background = '', 500);
			input = []; 
			setTimeout(() => showSeq(), 1500);
			return; 
		}
		
		score += level * 10;
		addParticles();
		
		if (input.length === seq.length) { 
			level++;
			seq.push(dirs[Math.floor(Math.random()*4)]); 
			seqEl.textContent = `🎉 Perfect! Level ${level} | Score: ${score}`;
			setTimeout(() => showSeq(), 1200);
		} else {
			seqEl.textContent = `Level ${level} | Score: ${score} | Keep going! ${input.length}/${seq.length}`;
		}
	}));
	
	startBtn.addEventListener('click', () => { 
		level = 1; score = 0; input = [];
		seq = [dirs[Math.floor(Math.random()*4)]]; 
		showSeq(); 
	});
})();

// Pixel Painter Game
$('#art-start').addEventListener('click', () => {
	const gameDiv = $('#art-game');
	const startBtn = $('#art-start');
	
	toggleGame('art', gameDiv, startBtn);
	
	if (gameStates.art) {
		startArtGame();
	}
});

function startArtGame() {
	const canvas = $('#art-canvas');
	const ctx = canvas.getContext('2d');
	const size = 16; const cell = canvas.width/size;
	let filled = new Set(); let painting = false; let score = 0; let streak = 0;
	let colors = ['#00d0ff', '#00ff9c', '#ff6b00', '#ffcf00', '#ff4d6d'];
	let currentColor = 0; let particles = [];
	
	function createParticle(x, y, color) {
		particles.push({
			x, y, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 2 - 1,
			life: 20, color, size: Math.random() * 2 + 1
		});
	}
	
	function drawCell(cx, cy, colorIndex = 0) {
		const color = colors[colorIndex];
		ctx.fillStyle = color;
		ctx.shadowColor = color;
		ctx.shadowBlur = 4;
		ctx.fillRect(cx*cell, cy*cell, cell-1, cell-1);
		ctx.shadowBlur = 0;
	}
	
	function redraw() {
		ctx.fillStyle = '#0b1220'; ctx.fillRect(0,0,canvas.width,canvas.height);
		
		// Draw grid lines
		ctx.strokeStyle = 'rgba(255,255,255,0.1)';
		ctx.lineWidth = 0.5;
		for (let i = 0; i <= size; i++) {
			ctx.beginPath();
			ctx.moveTo(i * cell, 0);
			ctx.lineTo(i * cell, canvas.height);
			ctx.moveTo(0, i * cell);
			ctx.lineTo(canvas.width, i * cell);
			ctx.stroke();
		}
		
		for (const key of filled) { 
			const [x,y,colorIdx] = key.split(',').map(Number); 
			drawCell(x,y,colorIdx); 
		}
		
		// Draw particles
		particles.forEach((particle, i) => {
			particle.x += particle.vx;
			particle.y += particle.vy;
			particle.life--;
			
			ctx.globalAlpha = particle.life / 20;
			ctx.fillStyle = particle.color;
			ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
			ctx.globalAlpha = 1;
			
			if (particle.life <= 0) {
				particles.splice(i, 1);
			}
		});
		
		const pct = Math.round((filled.size/(size*size))*100);
		ctx.fillStyle = '#9db0d1'; 
		ctx.font = '12px Nunito';
		ctx.fillText(`Progress: ${pct}% | Score: ${score}`, 8, 14);
		ctx.fillText(`Streak: ${streak}x | Color: ${currentColor + 1}/5`, 8, 28);
		
		if (pct>=75) { 
			ctx.fillStyle = '#00ff9c'; 
			ctx.font = '14px Nunito';
			ctx.fillText('🎨 MASTERPIECE! 🎨', 8, 45);
			ctx.fillText(`Final Score: ${score}`, 8, 62);
		}
	}
	
	function pos(e){ 
		const r = canvas.getBoundingClientRect(); 
		const x = Math.floor((e.clientX-r.left)/cell); 
		const y = Math.floor((e.clientY-r.top)/cell); 
		return [x,y]; 
	}
	
	function paintCell(x, y) {
		const key = `${x},${y},${currentColor}`;
		if (!filled.has(key)) {
			filled.add(key);
			score += 10 + streak * 5;
			streak++;
			
			// Create particles
			createParticle(x * cell + cell/2, y * cell + cell/2, colors[currentColor]);
			
			// Change color every few strokes
			if (streak % 5 === 0) {
				currentColor = (currentColor + 1) % colors.length;
			}
		}
	}
	
	canvas.addEventListener('mousedown', e => { 
		painting = true; 
		const [x,y]=pos(e); 
		if (x >= 0 && x < size && y >= 0 && y < size) {
			paintCell(x, y);
			redraw();
		}
	});
	
	canvas.addEventListener('mousemove', e => { 
		if (!painting) return; 
		const [x,y]=pos(e); 
		if (x >= 0 && x < size && y >= 0 && y < size) {
			paintCell(x, y);
			redraw();
		}
	});
	
	window.addEventListener('mouseup', () => {
		painting = false;
		streak = 0; // Reset streak when stopping
	});
	
	// Color picker
	canvas.addEventListener('contextmenu', e => {
		e.preventDefault();
		currentColor = (currentColor + 1) % colors.length;
		redraw();
	});
	
	redraw();
}
