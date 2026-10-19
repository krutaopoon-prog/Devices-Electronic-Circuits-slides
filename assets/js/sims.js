/* ===========================================
   Sims — กิจกรรมและตัวจำลองในสไลด์ (คลิกได้ ไม่ทำให้สไลด์เลื่อน)
   - <div data-timer="300"></div>                       ตัวจับเวลานับถอยหลัง (วินาที)
   - <div class="vote" data-answer="1"> <button class="opt">…</button> … <button class="reveal">เฉลย</button> <div class="why">…</div></div>
   - <div data-board="6"></div>                         กระดานคะแนนกลุ่ม (ใช้คะแนนชุดเดียวกันทุกสไลด์)
   - <div data-picker="40"></div>                       สุ่มเลขที่นักเรียน
   - <div data-sim="dope|hole|pn|bias"></div>           ตัวจำลอง
   =========================================== */
(function (g) {
    'use strict';
    const NS = 'dec-w01-board';

    /* คลิกหรือกดแป้นในกิจกรรมต้องไม่ทำให้สไลด์เลื่อน */
    function guard(el) {
        el.addEventListener('keydown', e => e.stopPropagation());
        el.addEventListener('click', e => { if (e.target.closest('button, input, select, label')) e.stopPropagation(); });
    }
    const blur = b => b && b.blur && b.blur();

    /* ---------- ตัวจับเวลา ---------- */
    function timer(el) {
        const total = +el.dataset.timer || 300;
        let left = total, t = null;
        el.classList.add('timer');
        el.innerHTML = `<div class="tm-face" aria-live="polite"></div>
            <div class="tm-btns"><button type="button" data-a="go">▶ เริ่ม</button><button type="button" data-a="m">−1 นาที</button><button type="button" data-a="p">+1 นาที</button><button type="button" data-a="r">↺</button></div>`;
        const face = el.querySelector('.tm-face'), go = el.querySelector('[data-a=go]');
        const draw = () => {
            face.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
            el.classList.toggle('low', left > 0 && left <= 30);
            el.classList.toggle('done', left === 0);
        };
        const halt = () => { clearInterval(t); t = null; go.textContent = '▶ เริ่ม'; };
        el.addEventListener('click', e => {
            const b = e.target.closest('button'); if (!b) return;
            const a = b.dataset.a;
            if (a === 'go') {
                if (t) halt();
                else {
                    if (!left) left = total;
                    go.textContent = '⏸ หยุด';
                    t = setInterval(() => { left = Math.max(0, left - 1); draw(); if (!left) halt(); }, 1000);
                }
            } else if (a === 'm') left = Math.max(0, left - 60);
            else if (a === 'p') left += 60;
            else if (a === 'r') { halt(); left = total; }
            draw(); blur(b);
        });
        draw();
    }

    /* ---------- โหวต ก ข ค ง ---------- */
    function vote(el) {
        el.addEventListener('click', e => {
            const o = e.target.closest('.opt'), r = e.target.closest('.reveal');
            if (o) { el.querySelectorAll('.opt').forEach(x => x.classList.toggle('picked', x === o)); blur(o); }
            if (r) {
                el.classList.toggle('revealed');
                const ans = +el.dataset.answer;
                el.querySelectorAll('.opt').forEach((x, i) => x.classList.toggle('right', i === ans));
                r.textContent = el.classList.contains('revealed') ? 'ซ่อนเฉลย' : 'เฉลย';
                blur(r);
            }
        });
    }

    /* ---------- กระดานคะแนนกลุ่ม ---------- */
    const store = {
        get() { try { return JSON.parse(localStorage.getItem(NS)) || null; } catch (e) { return null; } },
        set(v) { try { localStorage.setItem(NS, JSON.stringify(v)); } catch (e) { /* ใช้ได้แม้บันทึกไม่ได้ */ } }
    };
    let scores = null;
    function boards() {
        document.querySelectorAll('[data-board]').forEach(el => {
            el.innerHTML = scores.map((s, i) => `<div class="bd-g"><div class="bd-n">กลุ่ม ${i + 1}</div><div class="bd-s">${s}</div>
                <div class="bd-b"><button type="button" data-g="${i}" data-d="-1">−</button><button type="button" data-g="${i}" data-d="1">+</button></div></div>`).join('')
                + `<button type="button" class="bd-reset">เริ่มนับใหม่</button>`;
        });
    }
    function board(el) {
        if (!scores) scores = store.get() || Array(+el.dataset.board || 6).fill(0);
        el.classList.add('board');
        el.addEventListener('click', e => {
            const b = e.target.closest('button'); if (!b) return;
            if (b.classList.contains('bd-reset')) scores = scores.map(() => 0);
            else scores[+b.dataset.g] = Math.max(0, scores[+b.dataset.g] + (+b.dataset.d));
            store.set(scores); boards();
        });
    }

    /* ---------- สุ่มเลขที่ ---------- */
    function picker(el) {
        el.classList.add('picker');
        el.innerHTML = `<label>เลขที่ 1 ถึง <input type="number" min="2" max="60" value="${+el.dataset.picker || 40}"></label>
            <button type="button">🎲 สุ่มเลขที่</button><div class="pk-num">?</div>`;
        const out = el.querySelector('.pk-num');
        el.querySelector('button').addEventListener('click', e => {
            const max = Math.max(2, +el.querySelector('input').value || 40);
            let n = 0;
            const t = setInterval(() => {
                out.textContent = 1 + Math.floor(Math.random() * max);
                if (++n > 14) { clearInterval(t); out.classList.remove('spin'); }
            }, 70);
            out.classList.add('spin'); blur(e.currentTarget);
        });
    }

    /* ---------- ตัวจำลองการโดป: ผลึกซิลิกอน 5×3 ---------- */
    function dope(el) {
        const cols = 5, rows = 3, gx = 120, gy = 115, x0 = 80, y0 = 65;
        const pos = (i, j) => [x0 + i * gx, y0 + j * gy];
        const C = [2, 1];
        const CAP = {
            si: 'ซิลิกอนบริสุทธิ์: ทุกอะตอมใช้อิเล็กตรอนวงนอก 4 ตัวสร้างพันธะครบ → แทบไม่มีอิเล็กตรอนอิสระ',
            n: 'เติมฟอสฟอรัส (P มีอิเล็กตรอนวงนอก 5 ตัว): ใช้สร้างพันธะ 4 ตัว ตัวที่ 5 ไม่มีคู่ → อิเล็กตรอนอิสระ = สารชนิด N',
            p: 'เติมโบรอน (B มีอิเล็กตรอนวงนอก 3 ตัว): พันธะหนึ่งขาดอิเล็กตรอน 1 ตัว → ตำแหน่งว่าง = โฮล = สารชนิด P'
        };
        let mode = el.dataset.mode || 'si';
        el.classList.add('sx', 'dope');
        el.innerHTML = `<div class="sx-ctl"><button type="button" data-m="si">ซิลิกอนบริสุทธิ์</button><button type="button" data-m="n">เติมฟอสฟอรัส (P)</button><button type="button" data-m="p">เติมโบรอน (B)</button></div>
            <svg viewBox="0 0 640 330" class="sx-svg"></svg><p class="sx-cap"></p>`;
        const svg = el.querySelector('svg');
        const pair = (x1, y1, x2, y2, missing) => {
            const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, h = y1 === y2;
            const a = h ? [mx, my - 9] : [mx - 9, my], b = h ? [mx, my + 9] : [mx + 9, my];
            return `<line class="bond" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>
                <circle class="el" cx="${a[0]}" cy="${a[1]}" r="7"/>` +
                (missing ? `<circle class="hole" cx="${b[0]}" cy="${b[1]}" r="9"/><rect class="lblbg" x="${b[0] - 4}" y="${b[1] + 16}" width="64" height="36" rx="10"/><text class="lbl hole-t" x="${b[0] + 4}" y="${b[1] + 43}">โฮล</text>`
                    : `<circle class="el" cx="${b[0]}" cy="${b[1]}" r="7"/>`);
        };
        const draw = () => {
            let s = '';
            for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
                const [x, y] = pos(i, j);
                if (i < cols - 1) s += pair(x, y, x + gx, y, mode === 'p' && i === C[0] && j === C[1]);
                else s += pair(x, y, x + 50, y);
                if (i === 0) s += pair(x - 50, y, x, y);
                if (j < rows - 1) s += pair(x, y, x, y + gy);
                else s += pair(x, y, x, y + 45);
                if (j === 0) s += pair(x, y - 45, x, y);
            }
            for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
                const [x, y] = pos(i, j), c = i === C[0] && j === C[1];
                const sym = c && mode === 'n' ? 'P' : c && mode === 'p' ? 'B' : 'Si';
                s += `<circle class="atom ${c && mode !== 'si' ? 'imp-' + mode : ''}" cx="${x}" cy="${y}" r="28"/><text class="atom-t" x="${x}" y="${y + 9}">${sym}</text>`;
            }
            if (mode === 'n') {
                const [x, y] = pos(C[0], C[1]);
                s += `<g class="free"><circle class="el free-e" cx="${x + 36}" cy="${y + 36}" r="9"/><rect class="lblbg" x="${x + 52}" y="${y + 44}" width="196" height="38" rx="10"/><text class="lbl" x="${x + 62}" y="${y + 72}">อิเล็กตรอนอิสระ</text></g>`;
            }
            svg.innerHTML = s;
            el.querySelector('.sx-cap').textContent = CAP[mode];
            el.querySelectorAll('[data-m]').forEach(b => b.classList.toggle('on', b.dataset.m === mode));
        };
        el.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b) { mode = b.dataset.m; draw(); blur(b); } });
        draw();
    }

    /* ---------- การเคลื่อนที่ของโฮล ---------- */
    function hole(el) {
        const n = 9, x0 = 70, dx = 62, y = 70;
        let h = 0;
        el.classList.add('sx', 'holes');
        el.innerHTML = `<svg viewBox="0 0 640 150" class="sx-svg">
            <text class="lbl pole-p" x="0" y="${y + 8}">+</text><text class="lbl pole-n" x="618" y="${y + 8}">−</text>
            <line class="bond" x1="${x0 - 20}" y1="${y}" x2="${x0 + (n - 1) * dx + 20}" y2="${y}"/>
            ${Array.from({ length: n }, (_, i) => `<circle class="slot" cx="${x0 + i * dx}" cy="${y}" r="13"/>`).join('')}
            ${Array.from({ length: n }, (_, i) => `<circle class="el mv" data-i="${i}" r="11" cy="${y}"/>`).join('')}
            <text class="lbl e-t" x="40" y="128">อิเล็กตรอนกระโดดไปทางซ้าย ←</text>
            <text class="lbl h-t" x="370" y="128">→ โฮลเลื่อนไปทางขวา</text></svg>
            <div class="sx-ctl"><button type="button" data-a="step">▶ ขั้นต่อไป</button><button type="button" data-a="r">↺ เริ่มใหม่</button><span class="sx-cap"></span></div>`;
        // อิเล็กตรอนตัวที่ k อยู่ช่อง slotOf[k]; โฮลอยู่ช่อง h (เริ่มที่ช่อง 0)
        let slotOf = Array.from({ length: n }, (_, i) => i);
        const els = Array.from(el.querySelectorAll('.mv'));
        const draw = () => {
            els.forEach((c, k) => {
                const s = slotOf[k];
                if (s < 0) { c.style.opacity = 0; return; }
                c.style.opacity = 1; c.style.cx = (x0 + s * dx) + 'px';
            });
            el.querySelectorAll('.slot').forEach((c, i) => c.classList.toggle('is-hole', i === h));
            el.querySelector('.sx-cap').textContent = `โฮลอยู่ตำแหน่งที่ ${h + 1}`;
        };
        const reset = () => { h = 0; slotOf = Array.from({ length: n }, (_, i) => (i === 0 ? -1 : i)); draw(); };
        el.addEventListener('click', e => {
            const b = e.target.closest('button'); if (!b) return;
            if (b.dataset.a === 'r' || h >= n - 1) reset();
            else {
                const k = slotOf.indexOf(h + 1);          // อิเล็กตรอนทางขวาของโฮลกระโดดเข้าโฮล
                slotOf[k] = h; h += 1; draw();
            }
            blur(b);
        });
        reset();
    }

    /* ---------- การเกิดรอยต่อพีเอ็น (กดทีละขั้น) ---------- */
    function pn(el) {
        const STEP = [
            'ขั้นที่ 0: สารชนิด P (มีโฮล ○) กับสารชนิด N (มีอิเล็กตรอน ●) ยังแยกกันอยู่',
            'ขั้นที่ 1: สร้างสาร P และ N ให้ต่อเนื่องกันในผลึกเดียว',
            'ขั้นที่ 2: อิเล็กตรอนใกล้รอยต่อแพร่ข้ามไปรวมกับโฮลฝั่ง P จึงหายไปทั้งคู่',
            'ขั้นที่ 3: เหลือไอออนตรึงอยู่ (− ฝั่ง P, + ฝั่ง N) บริเวณนี้ไม่มีพาหะ = บริเวณปลอดพาหะ',
            'ขั้นที่ 4: ไอออนสร้างแรงดันกำแพงศักย์ขวางการแพร่ต่อ ≈ 0.7 V (ซิลิกอน) / 0.3 V (เจอร์เมเนียม)'
        ];
        let st = 0;
        const hx = [70, 140, 210, 280, 350], ey = [70, 140, 210];
        let holes = '', elec = '', ions = '';
        hx.forEach((x, i) => ey.forEach((y, j) => {
            const near = i === hx.length - 1 ? ' near' : '';
            holes += `<g class="cr h${near}"><circle class="hole" cx="${x}" cy="${y + (i % 2) * 18}" r="12"/></g>`;
            const xe = 780 - x;
            elec += `<g class="cr e${near}"><circle class="el" cx="${xe}" cy="${y + (i % 2) * 18}" r="11"/></g>`;
            if (near) {
                ions += `<g class="ion"><rect class="ion-n" x="${x - 12}" y="${y + (i % 2) * 18 - 12}" width="24" height="24" rx="4"/><text class="ion-t" x="${x}" y="${y + (i % 2) * 18 + 8}">−</text></g>`;
                ions += `<g class="ion"><rect class="ion-p" x="${xe - 12}" y="${y + (i % 2) * 18 - 12}" width="24" height="24" rx="4"/><text class="ion-t" x="${xe}" y="${y + (i % 2) * 18 + 8}">+</text></g>`;
            }
        }));
        el.classList.add('sx', 'pn');
        el.innerHTML = `<svg viewBox="0 0 780 300" class="sx-svg">
            <g class="side-p"><rect class="blk-p" x="20" y="25" width="370" height="230" rx="14"/><text class="side-t" x="200" y="290">สารชนิด P</text>${holes}</g>
            <g class="side-n"><rect class="blk-n" x="390" y="25" width="370" height="230" rx="14"/><text class="side-t" x="580" y="290">สารชนิด N</text>${elec}</g>
            <rect class="dep" x="325" y="25" width="130" height="230" rx="8"/>
            ${ions}
            <g class="barrier"><text class="bar-t" x="390" y="18">บริเวณปลอดพาหะ · ≈ 0.7 V</text></g></svg>
            <div class="sx-ctl"><button type="button" data-a="prev">◀</button><button type="button" data-a="next">ขั้นต่อไป ▶</button><span class="sx-cap"></span></div>`;
        const draw = () => {
            for (let k = 1; k <= 4; k++) el.classList.toggle('ge' + k, st >= k);
            el.querySelector('.sx-cap').textContent = STEP[st];
        };
        el.addEventListener('click', e => {
            const b = e.target.closest('button'); if (!b) return;
            st = Math.max(0, Math.min(4, st + (b.dataset.a === 'next' ? 1 : -1))); draw(); blur(b);
        });
        draw();
    }

    /* ---------- ตัวจำลองการไบแอส ---------- */
    function bias(el) {
        let fwd = true, V = 0, R = 1000, Vk = 0.7;
        el.classList.add('sx', 'bias');
        el.innerHTML = `<div class="bs-row">
            <svg viewBox="0 0 560 360" class="sx-svg bs-svg"></svg>
            <div class="bs-ctl">
              <div class="sx-ctl"><button type="button" data-p="1">ไบแอสตรง</button><button type="button" data-p="0">ไบแอสกลับ</button></div>
              <label>แรงดันแหล่งจ่าย <b class="bs-v"></b><input type="range" min="0" max="12" step="0.1" value="0"></label>
              <label>ตัวต้านทาน R <select class="bs-r"><option value="470">470 Ω</option><option value="1000" selected>1 kΩ</option><option value="2200">2.2 kΩ</option><option value="0">ไม่ต่อ R (อันตราย!)</option></select></label>
              <label>ชนิดไดโอด <select class="bs-k"><option value="0.7">ซิลิกอน (0.7 V)</option><option value="0.3">เจอร์เมเนียม (0.3 V)</option></select></label>
              <div class="bs-out"></div>
            </div></div>`;
        const svg = el.querySelector('svg'), out = el.querySelector('.bs-out');
        const draw = () => {
            let I = 0, VD = V, note = '';
            if (fwd && V > Vk) {
                if (R === 0) { I = Infinity; note = '🔥 ไม่มี R จำกัดกระแส: กระแสสูงมากจนไดโอดร้อนและเสียหาย'; }
                else { I = (V - Vk) / R * 1000; VD = Vk; }
            }
            const on = I > 0.05;
            const w = fwd ? Math.max(6, 64 * (1 - Math.min(V, Vk) / Vk)) : Math.min(190, 64 + V * 10.5);
            const top = fwd ? '+' : '−', bot = fwd ? '−' : '+';
            svg.innerHTML = `
                <path class="wire" d="M60,60 H500 V250 H60 Z"/>
                <rect class="bat-bg" x="35" y="125" width="50" height="60"/>
                <line class="bat-l" x1="35" y1="${fwd ? 140 : 170}" x2="85" y2="${fwd ? 140 : 170}"/><line class="bat-s" x1="47" y1="${fwd ? 170 : 140}" x2="73" y2="${fwd ? 170 : 140}"/>
                <text class="lbl pol" x="96" y="140">${top}</text><text class="lbl pol" x="96" y="186">${bot}</text>
                <text class="lbl" x="8" y="215">${V.toFixed(1)} V</text>
                <rect class="bat-bg" x="190" y="35" width="80" height="50"/>
                <path class="body d-tri" d="M205,40 L205,80 L245,60 Z"/><line class="d-bar" x1="245" y1="40" x2="245" y2="80"/>
                <text class="lbl" x="190" y="28">D (A → K)</text>
                <rect class="bat-bg" x="330" y="45" width="100" height="30"/>
                ${R ? `<path class="wire" d="M330,60 l10,-14 l16,28 l16,-28 l16,28 l16,-28 l16,28 l10,-14"/><text class="lbl" x="345" y="30">R ${R >= 1000 ? R / 1000 + ' kΩ' : R + ' Ω'}</text>` : `<text class="lbl warn" x="340" y="30">ไม่มี R</text>`}
                <circle class="lamp ${on ? 'on' : ''}" cx="500" cy="155" r="26"/><text class="lbl small" x="466" y="162" text-anchor="end">แสดงกระแส</text>
                ${on ? `<path class="flow ${I === Infinity ? 'fast' : ''}" style="stroke-width:${Math.min(14, 4 + I / 2)}px" d="M110,48 H480"/>` : ''}
                <g transform="translate(150,306)">
                    <rect class="blk-p" x="0" y="0" width="${170 - w / 2}" height="44"/><rect class="dep" x="${170 - w / 2}" y="0" width="${w}" height="44"/>
                    <rect class="blk-n" x="${170 + w / 2}" y="0" width="${170 - w / 2}" height="44"/>
                    <text class="lbl" x="${(170 - w / 2) / 2 - 8}" y="30">P</text><text class="lbl" x="${170 + w / 2 + (170 - w / 2) / 2 - 8}" y="30">N</text>
                </g>
                <text class="lbl small" x="150" y="294">บริเวณปลอดพาหะ ${fwd ? (V >= Vk ? 'แคบมากจนพาหะข้ามได้' : 'แคบลง') : 'กว้างขึ้น'}</text>`;
            let txt;
            if (!fwd) txt = `<b class="c-blue">ไบแอสกลับ</b><br>V<sub>D</sub> = ${V.toFixed(1)} V (แรงดันตกคร่อมไดโอดทั้งหมด)<br>I ≈ 0 (มีเพียงกระแสรั่วไหลระดับ µA)`;
            else if (V <= Vk) txt = `<b class="c-orange">ไบแอสตรง</b> แต่แรงดันยังไม่ถึง ${Vk} V<br>ไดโอดยังแทบไม่นำกระแส: I ≈ 0`;
            else if (R === 0) txt = `<b class="c-rose">${note}</b>`;
            else txt = `<b class="c-orange">ไบแอสตรง ไดโอดนำกระแส</b><br>V<sub>D</sub> ≈ ${Vk} V<br>I = (V − ${Vk}) ÷ R = (${V.toFixed(1)} − ${Vk}) ÷ ${R}<br>= <b class="mono">${I.toFixed(2)} mA</b>`;
            out.innerHTML = txt;
            el.querySelector('.bs-v').textContent = V.toFixed(1) + ' V';
            el.querySelectorAll('[data-p]').forEach(b => b.classList.toggle('on', (b.dataset.p === '1') === fwd));
        };
        el.addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (b) { fwd = b.dataset.p === '1'; draw(); blur(b); } });
        el.querySelector('input').addEventListener('input', e => { V = +e.target.value; draw(); });
        el.querySelector('.bs-r').addEventListener('change', e => { R = +e.target.value; draw(); });
        el.querySelector('.bs-k').addEventListener('change', e => { Vk = +e.target.value; draw(); });
        draw();
    }

    const SIMS = { dope, hole, pn, bias };
    function init(root) {
        root = root || document;
        root.querySelectorAll('[data-timer]').forEach(el => { timer(el); guard(el); });
        root.querySelectorAll('.vote').forEach(el => { vote(el); guard(el); });
        root.querySelectorAll('[data-board]').forEach(el => { board(el); guard(el); });
        if (scores) boards();
        root.querySelectorAll('[data-picker]').forEach(el => { picker(el); guard(el); });
        root.querySelectorAll('[data-sim]').forEach(el => { const f = SIMS[el.dataset.sim]; if (f) { f(el); guard(el); } });
    }

    g.Sims = { init };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init(document));
    else init(document);
})(window);
