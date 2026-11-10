/* ===========================================
   Sims — กิจกรรมและตัวจำลองในสไลด์ (คลิกได้ ไม่ทำให้สไลด์เลื่อน)
   - <div data-timer="300"></div>                       ตัวจับเวลานับถอยหลัง (วินาที)
   - <div class="vote" data-answer="1"> <button class="opt">…</button> … <button class="reveal">เฉลย</button> <div class="why">…</div></div>
   - <div data-board="6"></div>                         กระดานคะแนนกลุ่ม (ใช้คะแนนชุดเดียวกันทุกสไลด์)
   - <div data-picker="40"></div>                       สุ่มเลขที่นักเรียน
   - <div data-sim="dope|hole|pn|bias"></div>           ตัวจำลอง (สัปดาห์ที่ 1)
   - <div data-sim="iv|dmm|curve|ds"></div>             ตัวจำลอง (สัปดาห์ที่ 2) · dmm: data-reveal="1" = มีปุ่มครูเฉลยสภาพ
   - <div data-sim="rect" data-modes="half,ct,bridge"></div>  หลักการวงจรเรียงกระแส (สัปดาห์ที่ 3)
   - <div data-sim="psu" data-mode="half" data-lock="mode"></div>  แล็บเสมือนใบงาน 2.1: วงจร + ออสซิลโลสโคป + มัลติมิเตอร์
   - <div data-sim="scoperead"></div>                   ฝึกอ่านจอออสซิลโลสโคป
   - <div data-video="YouTubeID" data-title="…" data-credit="…" data-len="1:25" data-start="0" data-end="0"></div>
   =========================================== */
(function (g) {
    'use strict';
    /* กระดานคะแนนแยกตามสัปดาห์ (w01, w02, …) */
    const NS = 'dec-' + ((location.pathname.match(/\/(w\d+)\//) || [])[1] || 'w01') + '-board';
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

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
            <button type="button">สุ่มเลขที่</button><div class="pk-num">?</div>`;
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
                if (R === 0) { I = Infinity; note = 'ไม่มี R จำกัดกระแส: กระแสสูงมากจนไดโอดร้อนและเสียหาย'; }
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

    /* ===================== สัปดาห์ที่ 2 ===================== */
    /* แบบจำลองไดโอดซิลิกอน 1N4007 (สมการไดโอด): Is = 10 nA, n = 1.9
       ที่ 1–10 mA ได้ V_D ≈ 0.55–0.68 V ใกล้เคียงค่าที่วัดได้จริงในห้องปฏิบัติการ */
    const DIODE = { si: { Is: 1e-8, nVt: 1.9 * 0.025852, knee: 0.7, leak: 10, name: 'ซิลิกอน' },
                    ge: { Is: 2e-6, nVt: 1.5 * 0.025852, knee: 0.3, leak: 26, name: 'เจอร์เมเนียม' } };
    const iOf = (d, v) => d.Is * Math.expm1(v / d.nVt);                 // แอมแปร์
    const vdSeries = (d, vs, R) => {                                      // แก้สมการ I_diode = (VS − VD)/R
        if (vs <= 0) return 0;
        let lo = 0, hi = vs;
        for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (iOf(d, m) > (vs - m) / R) hi = m; else lo = m; }
        return (lo + hi) / 2;
    };

    /* ---------- กราฟคุณลักษณะ I-V ---------- */
    function iv(el) {
        const OX = 470, OY = 290, PXV = 360, PXBR = 333, PXMA = 12;     // 1 V = 360 px · V_BR = 333 px · 1 mA = 12 px
        let mat = 'si', t = 0;
        const fx = v => OX + v * PXV, rx = r => OX - r * PXBR;
        const fy = ma => OY - ma * PXMA;
        const ry = (d, r) => OY + (r < 1 ? d.leak * (1 - Math.exp(-r * 25)) : d.leak + (r - 1) / 0.2 * 200);
        const path = d => {
            let f = `M${OX},${OY}`;
            for (let v = 0.005; v <= 1; v += 0.005) { const ma = iOf(d, v) * 1000; if (ma > 21) break; f += ` L${fx(v).toFixed(1)},${fy(ma).toFixed(1)}`; }
            let r = `M${OX},${OY}`;
            for (let q = 0.005; q <= 1.2; q += 0.005) r += ` L${rx(q).toFixed(1)},${ry(d, q).toFixed(1)}`;
            return f + ' ' + r;
        };
        el.classList.add('sx', 'iv');
        el.innerHTML = `<div class="iv-row">
            <svg viewBox="0 0 900 520" class="sx-svg iv-svg"></svg>
            <div class="iv-ctl">
              <div class="sx-ctl"><button type="button" data-m="si">ซิลิกอน</button><button type="button" data-m="ge">เจอร์เมเนียม</button></div>
              <label>เลื่อนแรงดัน ← ไบแอสกลับ · ไบแอสตรง →<input type="range" min="-100" max="100" step="1" value="0"></label>
              <div class="iv-out"></div>
            </div></div>`;
        const svg = el.querySelector('svg'), out = el.querySelector('.iv-out');
        const P = { si: path(DIODE.si), ge: path(DIODE.ge) };
        const draw = () => {
            const d = DIODE[mat];
            let x, y, txt;
            if (t >= 0) {
                const v = t / 100, ma = iOf(d, v) * 1000;
                x = fx(v); y = fy(Math.min(ma, 21));
                if (ma > 21) txt = `V<sub>D</sub> = ${v.toFixed(2)} V<br><b class="c-rose">กระแสเกินกราฟ!</b> ในวงจรจริงต้องมี <b>R จำกัดกระแส</b>`;
                else if (v < d.knee - 0.12) txt = `<b class="c-orange">ไบแอสตรง</b> V<sub>D</sub> = ${v.toFixed(2)} V<br>ยังไม่ถึงแรงดันคัตอิน (≈ ${d.knee} V)<br>กระแส<b>น้อยมาก</b> ≈ ${ma < 0.01 ? '0' : ma.toFixed(2)} mA`;
                else txt = `<b class="c-orange">ไบแอสตรง</b> V<sub>D</sub> = ${v.toFixed(2)} V<br>ถึงย่านคัตอินแล้ว กระแส<b>เพิ่มเร็วมาก</b><br>I<sub>D</sub> ≈ <b class="mono">${ma.toFixed(1)} mA</b> แต่แรงดันแทบไม่เพิ่ม`;
            } else {
                const r = -t / 100 * 1.2;
                x = rx(r); y = ry(d, r);
                txt = r < 1
                    ? `<b class="c-blue">ไบแอสกลับ</b> แรงดัน = ${r.toFixed(2)} × V<sub>BR</sub><br>มีเพียง<b>กระแสรั่วไหล</b>ระดับ µA และแทบคงที่${mat === 'ge' ? '<br>(เจอร์เมเนียมรั่วมากกว่าซิลิกอน)' : ''}`
                    : `<b class="c-rose">ถึงแรงดันพังทลาย V<sub>BR</sub></b><br>กระแสย้อนกลับ<b>พุ่งสูงทันที</b> ไดโอดทั่วไปร้อนและเสียหายถาวร<br><span class="small">ซีเนอร์ไดโอดออกแบบให้ทำงานย่านนี้ (หน่วยที่ 2)</span>`;
            }
            svg.innerHTML = `
                <rect class="iv-zone" x="${OX}" y="20" width="420" height="${OY - 20}"/><rect class="iv-zone r" x="20" y="${OY}" width="${OX - 20}" height="${520 - OY}"/>
                <line class="axis" x1="20" y1="${OY}" x2="885" y2="${OY}"/><line class="axis" x1="${OX}" y1="510" x2="${OX}" y2="15"/>
                <text class="lbl" x="855" y="${OY - 12}">V<tspan baseline-shift="sub" font-size="18">D</tspan></text><text class="lbl" x="${OX + 12}" y="34">I<tspan baseline-shift="sub" font-size="18">D</tspan> (mA)</text>
                <text class="lbl small" x="${OX + 12}" y="505">(µA)</text>
                <line class="tick" x1="${fx(0.3)}" y1="${OY}" x2="${fx(0.3)}" y2="${OY + 10}"/><text class="lbl small" x="${fx(0.3) - 22}" y="${OY + 32}">0.3 V</text>
                <line class="tick" x1="${fx(0.7)}" y1="${OY}" x2="${fx(0.7)}" y2="${OY + 10}"/><text class="lbl small" x="${fx(0.7) - 22}" y="${OY + 32}">0.7 V</text>
                <line class="tick" x1="${rx(1)}" y1="${OY - 10}" x2="${rx(1)}" y2="${OY}"/><text class="lbl small" x="${rx(1) - 26}" y="${OY - 16}">−V<tspan baseline-shift="sub" font-size="14">BR</tspan></text>
                <text class="lbl zt" x="880" y="${OY + 80}" text-anchor="end">ย่านไบแอสตรง</text><text class="lbl zt" x="40" y="${OY - 60}">ย่านไบแอสกลับ</text>
                <text class="lbl small" x="${rx(0.5) - 70}" y="${OY + 52}">กระแสรั่วไหล</text>
                <text class="lbl small" x="${rx(1) + 24}" y="${OY + 170}">← ย่านพังทลาย</text>
                <path class="iv-c ${mat === 'ge' ? 'on' : ''} ge" d="${P.ge}"/><path class="iv-c ${mat === 'si' ? 'on' : ''} si" d="${P.si}"/>
                <text class="lbl iv-l ge ${mat === 'ge' ? 'on' : ''}" x="${OX - 12}" y="${fy(17)}" text-anchor="end">เจอร์เมเนียม →</text>
                <text class="lbl iv-l si ${mat === 'si' ? 'on' : ''}" x="${fx(0.75) + 8}" y="${fy(15)}">ซิลิกอน</text>
                <line class="guide" x1="${x}" y1="${y}" x2="${x}" y2="${OY}"/><line class="guide" x1="${x}" y1="${y}" x2="${OX}" y2="${y}"/>
                <circle class="iv-pt" cx="${x}" cy="${y}" r="12"/>
                <text class="lbl small" x="880" y="512" text-anchor="end">สเกลแกนลบกับแกนบวกไม่เท่ากัน</text>`;
            out.innerHTML = txt;
            el.querySelectorAll('[data-m]').forEach(b => b.classList.toggle('on', b.dataset.m === mat));
        };
        el.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b) { mat = b.dataset.m; draw(); blur(b); } });
        el.querySelector('input').addEventListener('input', e => { t = +e.target.value; draw(); });
        draw();
    }

    /* ---------- มัลติมิเตอร์เสมือน: วัดไดโอดสองทิศ ----------
       f/r = ค่าที่มิเตอร์ดิจิทัลแสดงเมื่อสายแดงที่ A / ที่ K · a = [เข็มตีเมื่อสายดำที่ A, เมื่อสายดำที่ K] (0–1) */
    const DMM = {
        d4007: { name: '1N4007', look: 'blk', f: '0.562', r: 'OL', a: [0.72, 0], st: 'ดี (ซิลิกอน): นำกระแสทิศเดียว' },
        d4148: { name: '1N4148', look: 'glass', f: '0.618', r: 'OL', a: [0.68, 0], st: 'ดี (ซิลิกอน): นำกระแสทิศเดียว' },
        led: { name: 'แอลอีดีสีแดง', look: 'led', f: '1.762', r: 'OL', a: [0.03, 0], glow: true,
            st: 'ดี: LED มีแรงดันตกคร่อมสูงกว่าไดโอดซิลิกอน (≈ 1.6–2 V) และอาจสว่างจาง ๆ ขณะวัด' },
        x: { name: 'ไดโอดหมายเลข X', look: 'blk', tag: 'X', f: '0.000', r: '0.000', a: [1, 1], st: 'ลัดวงจร (Short): ใกล้ 0 ทั้งสองทิศ' },
        y: { name: 'ไดโอดหมายเลข Y', look: 'blk', tag: 'Y', f: 'OL', r: 'OL', a: [0, 0], st: 'ขาด (Open): OL ทั้งสองทิศ' },
        ge: { name: 'ไดโอดเจอร์เมเนียม', look: 'glass', f: '0.241', r: 'OL', a: [0.84, 0.03], st: 'ดี (เจอร์เมเนียม): แรงดันคัตอินต่ำกว่าซิลิกอน' },
        leak: { name: 'ไดโอดรั่ว', look: 'blk', f: '0.318', r: '1.436', a: [0.8, 0.4], st: 'รั่ว (Leaky): ทิศกลับมีค่าแสดง ไม่ควรนำไปใช้งาน' }
    };
    function dmm(el) {
        const list = (el.dataset.set || 'd4007,d4148,led,x,y,mys').split(',');
        let cur = list[0] === 'mys' ? 'd4007' : list[0], mys = null, redAt = 'A', analog = false, shown = false;
        el.classList.add('sx', 'dmm');
        el.innerHTML = `<div class="sx-ctl dm-pick">${list.map(k => k === 'mys'
                ? `<button type="button" data-d="mys">ไดโอดปริศนา</button>` : `<button type="button" data-d="${k}">${esc(DMM[k].name)}</button>`).join('')}</div>
            <div class="dm-row"><svg viewBox="0 0 940 400" class="sx-svg dm-svg"></svg>
            <div class="dm-ctl"><div class="sx-ctl"><button type="button" data-a="swap">สลับสาย</button></div>
              <div class="sx-ctl"><button type="button" data-a="dig">ดิจิทัล (โหมด →|)</button><button type="button" data-a="ana">มิเตอร์เข็ม (R×10)</button></div>
              <div class="dm-out"></div>
              ${el.dataset.reveal ? '<div class="sx-ctl"><button type="button" data-a="st">ครูเฉลยสภาพ</button></div><div class="dm-st"></div>' : ''}
            </div></div>`;
        const svg = el.querySelector('svg'), out = el.querySelector('.dm-out'), stBox = el.querySelector('.dm-st');
        const body = (d, tag) => {
            if (d.look === 'led') return `<path class="dm-led ${d.lit ? 'lit' : ''}" d="M230,135 V95 A35,35 0 0 1 300,95 V135 Z"/><rect class="dm-led-rim" x="222" y="132" width="86" height="12" rx="3"/>`;
            const glass = d.look === 'glass';
            return `<rect class="${glass ? 'dm-glass' : 'dm-blk'}" x="200" y="88" width="130" height="44" rx="14"/>
                <rect class="${glass ? 'dm-band-k' : 'dm-band'}" x="298" y="88" width="16" height="44"/>
                ${tag ? `<text class="dm-tag" x="250" y="121">${tag}</text>` : ''}`;
        };
        const draw = () => {
            const d = mys ? DMM[mys] : DMM[cur];
            const fwdDig = redAt === 'A', fwdAna = redAt === 'K';
            const read = fwdDig ? d.f : d.r, defl = d.a[fwdAna ? 0 : 1];
            const lit = !analog && fwdDig && d.glow;
            const tipA = [74, 110], tipK = [456, 110];
            const red = redAt === 'A' ? tipA : tipK, blk = redAt === 'A' ? tipK : tipA;
            const jR = [820, 352], jB = [700, 352];
            const wire = (a, j, cls) => `<path class="dm-w ${cls}" d="M${a[0]},${a[1] + 30} C${a[0]},${a[1] + 230} ${j[0]},${j[1] + 70} ${j[0]},${j[1]}"/>`;
            const probe = (a, cls) => `<rect class="dm-p ${cls}" x="${a[0] - 9}" y="${a[1] - 2}" width="18" height="54" rx="6"/><line class="dm-tip" x1="${a[0]}" y1="${a[1] - 16}" x2="${a[0]}" y2="${a[1]}"/>`;
            const ang = (-50 + 100 * defl) * Math.PI / 180;
            const face = analog
                ? `<rect class="dm-face" x="645" y="45" width="230" height="150" rx="12"/>
                   <path class="dm-arc" d="M${760 - 115 * Math.sin(50 * Math.PI / 180)},${185 - 115 * Math.cos(50 * Math.PI / 180)} A115,115 0 0 1 ${760 + 115 * Math.sin(50 * Math.PI / 180)},${185 - 115 * Math.cos(50 * Math.PI / 180)}"/>
                   <text class="dm-sc" x="660" y="100">∞</text><text class="dm-sc" x="846" y="100">0</text><text class="dm-sc s" x="745" y="180">Ω</text>
                   <line class="dm-needle" x1="760" y1="185" x2="${760 + 120 * Math.sin(ang)}" y2="${185 - 120 * Math.cos(ang)}"/>`
                : `<rect class="dm-lcd" x="650" y="55" width="220" height="100" rx="10"/><text class="dm-read" x="860" y="128">${read}</text>
                   <text class="dm-mode" x="662" y="80">→|</text>${read === '0.000' ? '<text class="dm-beep" x="662" y="146">🔊</text>' : ''}`;
            svg.innerHTML = `
                <line class="dm-lead" x1="60" y1="110" x2="470" y2="110"/>
                ${body(Object.assign({ lit }, d), mys ? '?' : d.tag)}
                ${lit ? '<circle class="dm-glow" cx="265" cy="100" r="60"/>' : ''}
                <text class="dm-ak" x="52" y="78">A</text><text class="dm-ak" x="462" y="78">K</text>
                <rect class="dm-body ${analog ? 'ana' : ''}" x="620" y="20" width="280" height="370" rx="30"/>
                ${face}
                <circle class="dm-dial" cx="760" cy="262" r="44"/><line class="dm-knob" x1="760" y1="262" x2="760" y2="222"/>
                <text class="dm-dl" x="760" y="330">${analog ? 'R×10' : 'โหมดไดโอด'}</text>
                <circle class="dm-jack b" cx="${jB[0]}" cy="${jB[1]}" r="13"/><circle class="dm-jack r" cx="${jR[0]}" cy="${jR[1]}" r="13"/>
                <text class="dm-jl" x="${jB[0] - 46}" y="${jB[1] + 8}">COM</text>
                ${wire(blk, jB, 'b')}${wire(red, jR, 'r')}${probe(blk, 'b')}${probe(red, 'r')}
                <text class="dm-pl r" x="${red[0] - 50}" y="${red[1] + 80}">แดง</text><text class="dm-pl b" x="${blk[0] - 42}" y="${blk[1] + 80}">ดำ</text>`;
            const other = redAt === 'A' ? 'K' : 'A';
            if (analog) {
                const s = defl > 0.5 ? 'เข็ม<b>ตีขึ้นมาก</b> (ความต้านทานต่ำ = นำกระแส)' : defl > 0.1 ? 'เข็ม<b>ตีขึ้นบ้าง</b>' : 'เข็ม<b>ไม่ขึ้น</b> (ความต้านทานสูงมาก)';
                out.innerHTML = `<b class="c-teal">มิเตอร์เข็ม</b> สายแดงที่ ${redAt} · สายดำที่ ${other}<br>${s}${d.look === 'led' && fwdAna ? '<br><span class="small">ย่าน R×10 จ่ายแรงดันไม่พอให้ LED นำกระแส</span>' : ''}<br><span class="small c-rose">มิเตอร์เข็ม: สายดำ = ขั้วบวกของแบตเตอรี่ภายใน</span>`;
            } else {
                out.innerHTML = `<b class="c-teal">ดิจิทัล (โหมดไดโอด)</b><br>สายแดงที่ <b>${redAt}</b> · สายดำที่ <b>${other}</b><br>มิเตอร์แสดง <b class="mono">${read}</b>${read === 'OL' ? '<br><span class="small">OL = เกินย่านวัด (ไม่นำกระแส)</span>' : read === '0.000' ? '<br><span class="small">ใกล้ 0 + มีเสียงเตือน</span>' : ' <span class="small">V (แรงดันตกคร่อมไดโอด)</span>'}`;
            }
            if (stBox) stBox.innerHTML = shown ? `<b>${esc(d.name)}${mys ? ' (ปริศนา)' : ''}:</b> ${esc(d.st)}` : '';
            el.querySelectorAll('[data-d]').forEach(b => b.classList.toggle('on', mys ? b.dataset.d === 'mys' : b.dataset.d === cur));
            el.querySelector('[data-a=dig]').classList.toggle('on', !analog);
            el.querySelector('[data-a=ana]').classList.toggle('on', analog);
        };
        el.addEventListener('click', e => {
            const b = e.target.closest('button'); if (!b) return;
            if (b.dataset.d === 'mys') { const ks = ['d4007', 'x', 'y', 'leak', 'ge'].filter(k => k !== mys); mys = ks[Math.floor(Math.random() * ks.length)]; shown = false; redAt = 'A'; }
            else if (b.dataset.d) { cur = b.dataset.d; mys = null; shown = false; redAt = 'A'; }
            else if (b.dataset.a === 'swap') redAt = redAt === 'A' ? 'K' : 'A';
            else if (b.dataset.a === 'dig') analog = false;
            else if (b.dataset.a === 'ana') analog = true;
            else if (b.dataset.a === 'st') shown = !shown;
            draw(); blur(b);
        });
        draw();
    }

    /* ---------- แล็บเสมือน: วงจรหาค่าคุณลักษณะ (ภาพที่ 1.8) ---------- */
    function curve(el) {
        const R = 1000, d = DIODE.si, STEPS = [0, 0.5, 1, 2, 3, 5, 8, 10];
        let vs = 0, fwd = true, showI = false, pts = [];
        const vdOf = () => fwd ? vdSeries(d, vs, R) : vs;
        const PX = v => 70 + v * 625, PY = ma => 390 - ma * 34;
        el.classList.add('sx', 'curve');
        el.innerHTML = `<div class="cv-row">
            <div class="cv-l"><svg viewBox="0 0 640 400" class="sx-svg cv-svg"></svg>
              <div class="sx-ctl cv-steps"><span>V<sub>S</sub> =</span>${STEPS.map(v => `<button type="button" data-v="${v}">${v}</button>`).join('')}</div>
              <label class="cv-sl">ปรับละเอียด 0–12 V <input type="range" min="0" max="12" step="0.1" value="0"></label>
              <div class="sx-ctl"><button type="button" data-p="1">ไบแอสตรง</button><button type="button" data-p="0">กลับขั้วไดโอด</button>
                <button type="button" data-a="add">ลงจุด</button><button type="button" data-a="clr">ล้างกราฟ</button>
                <label class="cv-chk"><input type="checkbox"> แสดง I<sub>D</sub> (เฉลย)</label></div>
            </div>
            <div class="cv-r"><svg viewBox="0 0 620 456" class="sx-svg cv-plot"></svg><div class="cv-out"></div></div></div>`;
        const svg = el.querySelector('.cv-svg'), plot = el.querySelector('.cv-plot'), out = el.querySelector('.cv-out');
        let grid = '';
        for (let k = 0; k <= 8; k++) grid += `<line class="gr" x1="${PX(k / 10)}" y1="${PY(0)}" x2="${PX(k / 10)}" y2="${PY(10)}"/>` + (k % 2 ? '' : `<text class="lbl small" x="${PX(k / 10) - 16}" y="418">${(k / 10).toFixed(1)}</text>`);
        for (let k = 0; k <= 10; k++) grid += `<line class="gr" x1="${PX(0)}" y1="${PY(k)}" x2="${PX(0.8)}" y2="${PY(k)}"/>` + (k % 2 ? '' : `<text class="lbl small" x="${k > 9 ? 30 : 42}" y="${PY(k) + 7}">${k}</text>`);
        grid += `<line class="axis" x1="${PX(0)}" y1="${PY(0)}" x2="${PX(0.8) + 14}" y2="${PY(0)}"/><line class="axis" x1="${PX(0)}" y1="${PY(0)}" x2="${PX(0)}" y2="${PY(10) - 14}"/>
            <text class="lbl small" x="${PX(0.4) - 30}" y="448">V<tspan baseline-shift="sub" font-size="14">D</tspan> (V)</text><text class="lbl small" x="78" y="30">I<tspan baseline-shift="sub" font-size="14">D</tspan> (mA)</text>`;
        const draw = () => {
            const vd = vdOf(), vdr = Math.round(vd * 1000) / 1000, id = (vs - vdr) / R * 1000;
            const on = fwd && id > 0.05;
            svg.innerHTML = `
                <path class="wire" d="M90,70 H500 V330 H90 Z"/>
                <rect class="bat-bg" x="60" y="170" width="60" height="60"/>
                <line class="bat-l" x1="60" y1="188" x2="120" y2="188"/><line class="bat-s" x1="74" y1="212" x2="106" y2="212"/>
                <text class="lbl pol" x="128" y="186">+</text><text class="lbl pol" x="128" y="232">−</text>
                <text class="lbl" x="8" y="275">V<tspan baseline-shift="sub" font-size="18">S</tspan> = ${vs.toFixed(1)} V</text>
                <rect class="bat-bg" x="230" y="52" width="130" height="36"/>
                <path class="wire" d="M230,70 l10,-14 l16,28 l16,-28 l16,28 l16,-28 l16,28 l16,-28 l18,14"/>
                <text class="lbl" x="232" y="38">R 1 kΩ</text>
                <rect class="bat-bg" x="470" y="150" width="60" height="100"/>
                ${fwd ? '<path class="d-tri" d="M478,165 H522 L500,232 Z"/><line class="d-bar" x1="476" y1="234" x2="524" y2="234"/>'
                      : '<path class="d-tri" d="M478,235 H522 L500,168 Z"/><line class="d-bar" x1="476" y1="166" x2="524" y2="166"/>'}
                <text class="lbl" x="392" y="206">D1</text><text class="lbl small" x="380" y="232">1N4007</text>
                <path class="wire" d="M500,120 H590 V170"/><path class="wire" d="M590,230 V280 H500"/>
                <circle class="vm" cx="590" cy="200" r="30"/><text class="lbl vm-t" x="579" y="210">V</text>
                <rect class="vm-lcd" x="508" y="296" width="130" height="46" rx="8"/><text class="vm-read" x="630" y="330">${vdr.toFixed(3)}</text>
                <text class="lbl small" x="636" y="372" text-anchor="end">V<tspan baseline-shift="sub" font-size="14">D</tspan> ที่มิเตอร์วัดได้</text>
                ${on ? `<path class="flow" style="stroke-width:${Math.min(12, 4 + id)}px" d="M140,58 H470"/>` : ''}`;
            const fpts = pts.filter(p => p.fwd).sort((a, b) => a.vd - b.vd);
            plot.innerHTML = grid
                + (fpts.length > 1 ? `<polyline class="cv-line" points="${fpts.filter(p => p.id <= 10.5).map(p => `${PX(p.vd)},${PY(p.id)}`).join(' ')}"/>` : '')
                + fpts.filter(p => p.id <= 10.5).map(p => `<circle class="cv-pt" cx="${PX(p.vd)}" cy="${PY(p.id)}" r="8"/>`).join('')
                + (fwd && id <= 10.5 && vd <= 0.8 ? `<circle class="cv-now" cx="${PX(vdr)}" cy="${PY(id)}" r="11"/>` : '');
            const calc = showI ? `I<sub>D</sub> = (${vs.toFixed(1)} − ${vdr.toFixed(3)}) ÷ 1000 = <b class="mono">${id.toFixed(2)} mA</b>` : `คำนวณเอง: I<sub>D</sub> = (V<sub>S</sub> − V<sub>D</sub>) ÷ R`;
            /* ตารางแนวนอน: 1 คอลัมน์ต่อ 1 จุด (ไม่ล้นสไลด์แม้ลงครบ 10 จุด) */
            const row = (h, f) => `<tr><th>${h}</th>${pts.map(f).join('')}</tr>`;
            const rows = row('ไบแอส', p => `<td>${p.fwd ? 'ตรง' : 'กลับ'}</td>`) + row('V<sub>S</sub> (V)', p => `<td>${p.vs.toFixed(1)}</td>`)
                + row('V<sub>D</sub> (V)', p => `<td>${p.vd.toFixed(3)}</td>`) + row('I<sub>D</sub> (mA)', p => `<td>${showI ? p.id.toFixed(2) : '?'}</td>`);
            out.innerHTML = `<div class="cv-now-t">${fwd ? '<b class="c-orange">ไบแอสตรง</b>' : '<b class="c-blue">ไบแอสกลับ</b>'} · V<sub>S</sub> = ${vs.toFixed(1)} V · มิเตอร์อ่าน V<sub>D</sub> = <b class="mono">${vdr.toFixed(3)} V</b><br>${calc}</div>`
                + (pts.length ? `<table class="cv-tab">${rows}</table>` : '<p class="small" style="margin:6px 0 0">กด “ลงจุด” ทุกค่า V<sub>S</sub> ในตาราง แล้วดูรูปร่างกราฟ</p>');
            el.querySelectorAll('[data-v]').forEach(b => b.classList.toggle('on', +b.dataset.v === vs));
            el.querySelectorAll('[data-p]').forEach(b => b.classList.toggle('on', (b.dataset.p === '1') === fwd));
            el.querySelector('input[type=range]').value = vs;
        };
        el.addEventListener('click', e => {
            const b = e.target.closest('button'); if (!b) return;
            if (b.dataset.v != null) vs = +b.dataset.v;
            else if (b.dataset.p != null) fwd = b.dataset.p === '1';
            else if (b.dataset.a === 'add') {
                const vd = Math.round(vdOf() * 1000) / 1000;
                pts = pts.filter(p => !(p.fwd === fwd && p.vs === vs)).concat({ fwd, vs, vd, id: (vs - vd) / R * 1000 });
                pts.sort((a, c) => (c.fwd - a.fwd) || a.vs - c.vs);
            } else if (b.dataset.a === 'clr') pts = [];
            draw(); blur(b);
        });
        el.querySelector('input[type=range]').addEventListener('input', e => { vs = +e.target.value; draw(); });
        el.querySelector('input[type=checkbox]').addEventListener('change', e => { showI = e.target.checked; draw(); });
        draw();
    }

    /* ---------- คู่มืออุปกรณ์: เลือกเบอร์ 1N4001–1N4007 (หลักเผื่อ V_RRM อย่างน้อย 2 เท่า) ---------- */
    function ds(el) {
        const VRRM = [50, 100, 200, 400, 600, 800, 1000], Q = [25, 40, 50, 80, 120, 150, 200, 240, 300, 350, 400, 480, 600];
        let q = +el.dataset.q || 300, pick = -1;
        el.classList.add('sx', 'ds');
        el.innerHTML = `<div class="ds-cards">${VRRM.map((v, i) => `<button type="button" class="ds-c" data-i="${i}"><b>1N400${i + 1}</b><span>V<sub>RRM</sub></span><span class="mono">${v} V</span></button>`).join('')}</div>
            <p class="ds-same">ทุกเบอร์เหมือนกัน: I<sub>F(AV)</sub> 1.0 A · I<sub>FSM</sub> 30 A · V<sub>F</sub> 1.1 V (ที่ 1 A) · I<sub>R</sub> 5 µA (25 °C) · ตัวถัง DO-41</p>
            <div class="ds-q-row"><div class="ds-q"></div><div class="sx-ctl"><button type="button" data-a="new">สุ่มโจทย์ใหม่</button></div></div><div class="ds-fb"></div>`;
        const fb = el.querySelector('.ds-fb');
        const draw = () => {
            const need = 2 * q, best = VRRM.findIndex(v => v >= need);
            el.querySelector('.ds-q').innerHTML = `วงจรมีแรงดันย้อนกลับสูงสุด <b class="mono">${q} V</b> → ควรเลือกเบอร์ใด?`;
            el.querySelectorAll('.ds-c').forEach((c, i) => {
                c.classList.toggle('picked', i === pick);
                c.classList.toggle('ok', pick >= 0 && VRRM[i] >= need);
                c.classList.toggle('bad', pick >= 0 && VRRM[i] < need);
            });
            if (pick < 0) { fb.innerHTML = ''; return; }
            const v = VRRM[pick], nm = `1N400${pick + 1}`;
            const rule = `ต้องการ V<sub>RRM</sub> ≥ 2 × ${q} = <b>${need} V</b>`;
            if (best < 0) fb.innerHTML = `✗ ${rule} แต่ตระกูลนี้ทนได้สูงสุด 1000 V → <b>ไม่มีเบอร์ที่ผ่าน</b> ต้องหาไดโอดชนิดอื่นที่ทนแรงดันสูงกว่า`;
            else if (pick === best) fb.innerHTML = `✓ <b>${nm} เหมาะที่สุด</b>: ${rule} · ${nm} ทนได้ ${v} V`;
            else if (v >= need) fb.innerHTML = `✓ ${nm} ใช้ได้ (ทน ${v} V เผื่อมาก) · ${rule} เบอร์ที่พอดีที่สุดคือ <b>1N400${best + 1}</b>`;
            else fb.innerHTML = `✗ ${nm} ทนได้ ${v} V ${v >= q ? '(ทนได้ แต่<b>เผื่อไม่ถึง 2 เท่า</b>)' : '(<b>น้อยกว่า</b>แรงดันในวงจร ไดโอดจะพัง)'} · ${rule}`;
        };
        el.addEventListener('click', e => {
            const b = e.target.closest('button'); if (!b) return;
            if (b.dataset.a === 'new') { const o = Q.filter(x => x !== q); q = o[Math.floor(Math.random() * o.length)]; pick = -1; }
            else if (b.dataset.i != null) pick = +b.dataset.i;
            draw(); blur(b);
        });
        draw();
    }

    /* ---------- วิดีโอ YouTube: แสดงภาพปกก่อน กดแล้วจึงโหลด ----------
       เล่นในกรอบได้เมื่อเปิดผ่าน http(s) เช่น GitHub Pages ถ้าเปิดไฟล์ในเครื่องให้ใช้ลิงก์ "เปิดใน YouTube" */
    function video(el) {
        const id = el.dataset.video, s = +el.dataset.start || 0, e = +el.dataset.end || 0;
        const title = el.dataset.title || 'วิดีโอ', credit = el.dataset.credit || '', len = el.dataset.len || '';
        const watch = `https://www.youtube.com/watch?v=${id}${s ? '&t=' + s + 's' : ''}`;
        el.classList.add('vid');
        el.innerHTML = `<div class="vd-frame"></div>
            <div class="vd-cap"><span class="vd-c">${esc(credit)}${len ? ' · ' + esc(len) + ' นาที' : ''}</span>
            <a href="${watch}" target="_blank" rel="noopener">เปิดใน YouTube ↗</a></div>`;
        const frame = el.querySelector('.vd-frame');
        const poster = () => {
            frame.innerHTML = `<button type="button" class="vd-poster" aria-label="เล่นวิดีโอ: ${esc(title)}">
                <img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy">
                <span class="vd-play" aria-hidden="true">▶</span><span class="vd-t">${esc(title)}</span></button>`;
        };
        poster();
        frame.addEventListener('click', ev => {
            if (!ev.target.closest('.vd-poster')) return;
            const q = new URLSearchParams({ autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1 });
            if (s) q.set('start', s);
            if (e) q.set('end', e);
            frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?${q}" title="${esc(title)}"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen
                referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
        });
        /* เปลี่ยนสไลด์แล้วหยุดวิดีโอ (คืนเป็นภาพปก) */
        const slide = el.closest('.slide');
        if (slide) new MutationObserver(() => {
            if (!slide.classList.contains('active') && frame.querySelector('iframe')) poster();
        }).observe(slide, { attributes: true, attributeFilter: ['class'] });
    }

    /* ===================== สัปดาห์ที่ 3 วงจรเรียงกระแสและวงจรกรอง ===================== */
    /* แบบวงจร (พื้นที่ 920×520): หม้อแปลงทางซ้าย · ราง + ที่ y=140 · ราง − ที่ y=400 · C ที่ x=700 · R_L ที่ x=800
       ทิศไดโอดในบริดจ์ตามภาพที่ 2.3: D1 L→T, D2 T→R, D3 B→R, D4 L→B
       ครึ่งบวก: D2 → โหลด → D4 · ครึ่งลบ: D3 → โหลด → D1 */
    const RC = {
        T: [400, 150], B: [400, 370], L: [290, 260], R: [510, 260],
        paths: {
            half: { p: [[150, 140], [800, 140], [800, 400], [150, 400], [150, 380]], n: null },
            ct: { p: [[150, 140], [800, 140], [800, 400], [640, 400], [640, 260], [150, 260]],
                  n: [[150, 380], [150, 470], [880, 470], [880, 140], [800, 140], [800, 400], [640, 400], [640, 260], [150, 260]] },
            bridge: { p: [[150, 140], [150, 90], [400, 90], [400, 150], [510, 260], [640, 260], [640, 140], [800, 140], [800, 400], [640, 400], [640, 490], [250, 490], [250, 260], [290, 260], [400, 370], [400, 450], [150, 450], [150, 380]],
                      n: [[150, 380], [150, 450], [400, 450], [400, 370], [510, 260], [640, 260], [640, 140], [800, 140], [800, 400], [640, 400], [640, 490], [250, 490], [250, 260], [290, 260], [400, 150], [400, 90], [150, 90], [150, 140]] }
        },
        on: { half: { p: ['D1'], n: [] }, ct: { p: ['D1'], n: ['D2'] }, bridge: { p: ['D2', 'D4'], n: ['D3', 'D1'] } }
    };
    /* ไดโอดจาก a (แอโนด) ไป b (แคโทด) วาดที่กึ่งกลางเส้น */
    function rcDiode(a, b, name, lit, lx, ly) {
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
        return `<line class="wire" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>
            <g class="rc-d${lit ? ' lit' : ''}" transform="translate(${mx},${my}) rotate(${ang})"><path d="M-22,-24 L22,0 L-22,24 Z"/><line x1="24" y1="-26" x2="24" y2="26"/></g>
            <text class="lbl rc-dn${lit ? ' lit' : ''}" x="${mx + (lx || 0)}" y="${my + (ly || 0)}" text-anchor="middle">${name}</text>`;
    }
    function rcCircuit(mode, o) {
        o = o || {};
        const lit = n => o.on && o.on.includes(n);
        const coil = (x, y0, n, dir) => { let d = `M${x},${y0}`; for (let k = 0; k < n; k++) d += ` a20,20 0 0,${dir} 0,40`; return `<path class="wire rc-coil" d="${d}"/>`; };
        let s = `<rect class="rc-box" x="18" y="118" width="108" height="286" rx="12"/><text class="lbl small" x="72" y="110" text-anchor="middle">กล่องปิด</text>
            ${coil(96, 140, 6, 0)}<text class="lbl small" x="72" y="432" text-anchor="middle">220 V~</text>
            <line class="rc-core" x1="113" y1="136" x2="113" y2="384"/><line class="rc-core" x1="121" y1="136" x2="121" y2="384"/>
            ${coil(150, 140, 6, 1)}
            <path class="wire" d="M96,140 V128 M96,380 V392"/>`;
        if (o.pol) s += `<text class="lbl rc-pol" x="196" y="${mode === 'ct' ? 196 : 186}">${o.pol > 0 ? '+' : '−'}</text><text class="lbl rc-pol" x="196" y="${mode === 'ct' ? 356 : 372}">${o.pol > 0 ? '−' : '+'}</text>`;
        s += `<text class="lbl" x="${mode === 'ct' ? 182 : 186}" y="${mode === 'ct' ? 232 : 272}">${mode === 'ct' ? '12-0-12' : 'v<tspan baseline-shift="sub" font-size="18">s</tspan>'}</text>`;
        /* ส่วนโหลด (เหมือนกันทุกแบบ) */
        const zig = 'M800,140 V206 l18,8 l-36,16 l36,16 l-36,16 l36,16 l-36,16 l18,8 V400';
        s += `<path class="wire" d="${zig}"/><text class="lbl" x="830" y="280">R<tspan baseline-shift="sub" font-size="18">L</tspan></text>
            <text class="lbl small" x="830" y="310">${o.rl || ''}</text>
            <path class="wire" d="M${mode === 'bridge' ? 640 : mode === 'ct' ? 150 : 150},140 H${mode === 'ct' ? 880 : 800} M${mode === 'half' ? 150 : 640},400 H800"/>
            <circle class="rc-dot" cx="800" cy="140" r="7"/><circle class="rc-dot" cx="800" cy="400" r="7"/>
            <text class="lbl rc-pm" x="846" y="132">+</text><text class="lbl rc-pm" x="846" y="430">−</text>`;
        if (o.cap) s += `<path class="wire" d="M700,140 V256 M700,280 V400"/><line class="rc-plate" x1="672" y1="256" x2="728" y2="256"/>
            <path class="rc-plate" d="M672,286 Q700,272 728,286"/><text class="lbl rc-pm" x="676" y="246" text-anchor="end">+</text>
            <text class="lbl" x="616" y="300" text-anchor="end">C</text><text class="lbl small" x="616" y="330" text-anchor="end">${o.cap}</text>
            <circle class="rc-dot" cx="700" cy="140" r="7"/><circle class="rc-dot" cx="700" cy="400" r="7"/>`;
        if (mode === 'half') s += `<path class="wire" d="M150,380 V400"/>` + rcDiode([330, 140], [390, 140], 'D1', lit('D1'), 0, -40);
        if (mode === 'ct') s += `<path class="wire" d="M150,260 H640 V400 M150,380 V470 H880 V140"/><circle class="rc-dot" cx="150" cy="260" r="7"/>
            <text class="lbl small" x="170" y="290">แท็ปกลาง</text>`
            + rcDiode([330, 140], [390, 140], 'D1', lit('D1'), 0, -40) + rcDiode([330, 470], [390, 470], 'D2', lit('D2'), 0, -40);
        if (mode === 'bridge') {
            s += `<path class="wire" d="M150,140 V90 H400 V150 M150,380 V450 H400 V370 M510,260 H640 V140 M640,400 V490 H250 V462 a12,12 0 0,0 0,-24 V260 H290"/>
                <circle class="rc-dot" cx="400" cy="150" r="7"/><circle class="rc-dot" cx="400" cy="370" r="7"/><circle class="rc-dot" cx="290" cy="260" r="7"/><circle class="rc-dot" cx="510" cy="260" r="7"/>`;
            s += rcDiode(RC.L, RC.T, 'D1', lit('D1'), -40, -30) + rcDiode(RC.T, RC.R, 'D2', lit('D2'), 40, -30)
                + rcDiode(RC.B, RC.R, 'D3', lit('D3'), 40, 50) + rcDiode(RC.L, RC.B, 'D4', lit('D4'), -40, 50);
        }
        if (o.flow) s += `<polyline class="rc-flow" points="${o.flow.map(p => p.join(',')).join(' ')}"/>`;
        return s;
    }

    /* ---------- หลักการทำงานของวงจรเรียงกระแส (ครึ่งคลื่น / แท็ปกลาง / บริดจ์) ---------- */
    function rect(el) {
        const modes = (el.dataset.modes || el.dataset.mode || 'half').split(',');
        let mode = modes[0], ph = 0, play = false, raf = 0, last = 0, hide = el.dataset.hide === '1';   // hide = ทายก่อนเฉลย
        const VM = 16.97, DROP = { half: 0.7, ct: 0.7, bridge: 1.4 }, NAME = { half: 'ครึ่งคลื่น', ct: 'เต็มคลื่นแบบแท็ปกลาง', bridge: 'บริดจ์' };
        el.classList.add('sx', 'rect');
        el.innerHTML = `<div class="rc-row"><svg viewBox="0 0 920 520" class="sx-svg rc-svg"></svg>
              <div class="rc-r"><svg viewBox="0 0 560 470" class="sx-svg rc-plot"></svg><div class="rc-out"></div>
            <div class="sx-ctl">${modes.length > 1 ? '<div class="rc-ms">' + modes.map(m => `<button type="button" data-m="${m}">${NAME[m]}</button>`).join('') + '</div>' : ''}
              <button type="button" data-a="play">▶ เล่นช้า ๆ</button><button type="button" data-a="pos">ครึ่งคาบบวก</button><button type="button" data-a="neg">ครึ่งคาบลบ</button></div></div></div>`;
        const svg = el.querySelector('.rc-svg'), plot = el.querySelector('.rc-plot'), out = el.querySelector('.rc-out');
        const X0 = 50, W = 480, Y0 = 215, K = 170 / VM;                         // 2 คาบเต็มความกว้าง
        const vout = (m, v) => Math.max(0, (m === 'half' ? v : Math.abs(v)) - DROP[m]);
        const draw = () => {
            const v = VM * Math.sin(ph), pos = v > DROP[mode] && Math.sin(ph) > 0, neg = -v > DROP[mode];
            const half = pos ? 'p' : neg ? 'n' : null;
            const on = half && !hide ? RC.on[mode][half] : [], flow = half && !hide && RC.paths[mode][half];
            svg.innerHTML = rcCircuit(mode, { on, flow, pol: Math.sin(ph) >= 0 ? 1 : -1 });
            let vs = '', vo = '';
            const tEnd = ph % (4 * Math.PI);
            for (let k = 0; k <= 240; k++) {
                const t = k / 240 * 4 * Math.PI, x = X0 + k / 240 * W;
                vs += `${x.toFixed(1)},${(Y0 - VM * Math.sin(t) * K).toFixed(1)} `;
                if (t <= tEnd + 1e-9 && !hide) vo += `${x.toFixed(1)},${(Y0 - vout(mode, VM * Math.sin(t)) * K).toFixed(1)} `;
            }
            const mx = X0 + tEnd / (4 * Math.PI) * W;
            plot.innerHTML = `<line class="axis" x1="${X0}" y1="${Y0}" x2="${X0 + W + 14}" y2="${Y0}"/><line class="axis" x1="${X0}" y1="20" x2="${X0}" y2="410"/>
                <text class="lbl small" x="${X0 + W - 4}" y="${Y0 + 30}">t</text><text class="lbl small" x="${X0 + 8}" y="30">v</text>
                <polyline class="rc-vs" points="${vs}"/><polyline class="rc-vo" points="${vo}"/>
                <line class="rc-mk" x1="${mx}" y1="20" x2="${mx}" y2="410"/>
                <text class="lbl small rc-lg1" x="${X0 + 250}" y="456">- - v<tspan baseline-shift="sub" font-size="14">s</tspan> (ก่อนเรียงกระแส)</text>
                <text class="lbl small rc-lg2" x="${X0}" y="456">━ v<tspan baseline-shift="sub" font-size="14">out</tspan> ที่โหลด</text>`;
            const off = { half: ['D1'], ct: ['D1', 'D2'], bridge: ['D1', 'D2', 'D3', 'D4'] }[mode].filter(d => !on.includes(d));
            out.innerHTML = hide ? `<b>${NAME[mode]}</b> · v<sub>s</sub> = <span class="mono">${v.toFixed(1)} V</span><br><span class="c-rose">ทายก่อน: ไดโอดตัวไหนนำกระแส? แล้วกดปุ่มเพื่อเฉลย</span>` : `<b>${NAME[mode]}</b> · v<sub>s</sub> = <span class="mono">${v.toFixed(1)} V</span> · v<sub>out</sub> = <span class="mono">${vout(mode, v).toFixed(1)} V</span><br>`
                + (on.length ? `<span class="c-orange">นำกระแส: <b>${on.join(', ')}</b></span>${off.length ? ` · ไบแอสกลับ: ${off.join(', ')}` : ''}`
                    : `<span class="c-blue">${Math.abs(v) <= DROP[mode] ? 'แรงดันยังไม่ถึงแรงดันคัตอิน' : 'ไดโอดไบแอสกลับ'} → ไม่มีกระแสผ่านโหลด</span>`);
            el.querySelectorAll('[data-m]').forEach(b => b.classList.toggle('on', b.dataset.m === mode));
            el.querySelector('[data-a=play]').textContent = play ? '⏸ หยุด' : '▶ เล่นช้า ๆ';
        };
        const tick = ts => {
            if (!play) return;
            const slide = el.closest('.slide');
            if (slide && !slide.classList.contains('active')) { play = false; draw(); return; }
            if (last) ph = (ph + (ts - last) / 1000 * Math.PI / 2) % (4 * Math.PI);   // 1 คาบ = 4 วินาที
            last = ts; draw(); raf = requestAnimationFrame(tick);
        };
        el.addEventListener('click', e => {
            const b = e.target.closest('button'); if (!b) return;
            hide = false;
            if (b.dataset.m) { mode = b.dataset.m; }
            else if (b.dataset.a === 'play') { play = !play; last = 0; cancelAnimationFrame(raf); if (play) raf = requestAnimationFrame(tick); }
            else if (b.dataset.a === 'pos') { play = false; ph = Math.PI / 2; }
            else if (b.dataset.a === 'neg') { play = false; ph = 3 * Math.PI / 2; }
            draw(); blur(b);
        });
        ph = el.dataset.ph === 'neg' ? 3 * Math.PI / 2 : Math.PI / 2; draw();
    }

    /* ---------- แบบจำลองตามเวลา: หม้อแปลง 12 Vrms (ขดลวด 1 Ω) + ไดโอด 1N4007 + C + R_L ----------
       จำลองทีละ 10 µs หลายคาบจนนิ่ง แล้วเก็บ 1 คาบสุดท้าย (20 ms) · ค่าที่ได้ต่างจากสูตรเล็กน้อยเหมือนวัดจริง */
    const PSU = { f: 50, vm: 12 * Math.SQRT2, rw: 1, dt: 1e-5, cache: {} };
    function psuRun(mode, C, RL) {
        const key = mode + C + '|' + RL;
        if (PSU.cache[key]) return PSU.cache[key];
        const d = DIODE.si, nd = mode === 'bridge' ? 2 : 1, N = Math.round(1 / PSU.f / PSU.dt), cyc = C ? 12 : 1;
        const vdOf = i => d.nVt * Math.log1p(i / d.Is);
        const solve = (dv, Rs) => {                                            // nd·V_D(i) + i·Rs = dv
            if (dv <= 0) return 0;
            let lo = 0, hi = dv / Rs;
            for (let k = 0; k < 44; k++) { const m = (lo + hi) / 2; if (nd * vdOf(m) + m * Rs > dv) hi = m; else lo = m; }
            return (lo + hi) / 2;
        };
        let vo = C ? PSU.vm - 1.4 : 0;
        const out = new Float32Array(N), sec = new Float32Array(N);
        for (let s = 0; s < cyc * N; s++) {
            const vs = PSU.vm * Math.sin(2 * Math.PI * PSU.f * s * PSU.dt);
            const vin = mode === 'bridge' ? Math.abs(vs) : vs;
            let i;
            if (C) { i = solve(vin - vo, PSU.rw); vo += (i - vo / RL) * PSU.dt / C; }
            else { i = solve(vin, PSU.rw + RL); vo = i * RL; }
            if (s >= (cyc - 1) * N) { const k = s - (cyc - 1) * N; out[k] = vo; sec[k] = vs - Math.sign(vs) * i * PSU.rw; }
        }
        let mx = -1e9, mn = 1e9, sum = 0, sq = 0;
        for (let k = 0; k < N; k++) { mx = Math.max(mx, out[k]); mn = Math.min(mn, out[k]); sum += out[k]; sq += sec[k] * sec[k]; }
        return (PSU.cache[key] = { out, sec, N, vp: mx, vmin: mn, vdc: sum / N, vr: mx - mn, vsrms: Math.sqrt(sq / N), fo: mode === 'bridge' ? 100 : 50 });
    }

    /* ---------- จอออสซิลโลสโคป (10 × 8 ช่อง) ---------- */
    const SC = { D: 52, X: 24, Y: 18, n: 0 };                                        // 1 ช่อง = 52 px
    function scopeScreen(fn, o) {
        const { D, X, Y } = SC, id = 'scClip' + (++SC.n), W = 10 * D, H = 8 * D, gy = Y + H / 2 + (o.gnd || 0) * D;
        let g = `<rect class="sc-bg" x="${X}" y="${Y}" width="${W}" height="${H}" rx="6"/>`;
        for (let k = 1; k < 10; k++) g += `<line class="sc-gr${k === 5 ? ' mid' : ''}" x1="${X + k * D}" y1="${Y}" x2="${X + k * D}" y2="${Y + H}"/>`;
        for (let k = 1; k < 8; k++) g += `<line class="sc-gr${k === 4 ? ' mid' : ''}" x1="${X}" y1="${Y + k * D}" x2="${X + W}" y2="${Y + k * D}"/>`;
        for (let k = 1; k < 50; k++) g += `<line class="sc-tk" x1="${X + k * D / 5}" y1="${Y + H / 2 - 5}" x2="${X + k * D / 5}" y2="${Y + H / 2 + 5}"/>`;
        for (let k = 1; k < 40; k++) g += `<line class="sc-tk" x1="${X + W / 2 - 5}" y1="${Y + k * D / 5}" x2="${X + W / 2 + 5}" y2="${Y + k * D / 5}"/>`;
        let pts = '';
        for (let px = 0; px <= W; px += 2) {
            const v = fn(px / D * o.tdiv / 1000);
            const y = Math.max(Y - 2, Math.min(Y + H + 2, gy - v / o.vdiv * D));
            pts += `${X + px},${y.toFixed(1)} `;
        }
        g += `<defs><clipPath id="${id}"><rect x="${X}" y="${Y}" width="${W}" height="${H}"/></clipPath></defs>
            <polyline class="sc-tr" clip-path="url(#${id})" points="${pts}"/>
            <path class="sc-gnd" d="M${X - 2},${gy} l-16,-10 v20 z"/><text class="sc-gt" x="${X - 22}" y="${gy + 34}">⏚</text>
            <text class="sc-tx" x="${X + 8}" y="${Y + H + 34}">${o.ch || 'CH1'} ${fmtDiv(o.vdiv)}V/div ${o.ac ? 'AC' : 'DC'}</text>
            <text class="sc-tx" x="${X + W - 8}" y="${Y + H + 34}" text-anchor="end">${o.tdiv} ms/div</text>`;
        if (o.meas) g += `<rect class="sc-mbg" x="${X + W - 236}" y="${Y + 8}" width="228" height="${o.meas.length * 30 + 12}" rx="6"/>`
            + o.meas.map((m, i) => `<text class="sc-m" x="${X + W - 224}" y="${Y + 36 + i * 30}">${m}</text>`).join('');
        return g;
    }
    const fmtDiv = v => v < 1 ? (v * 1000) + 'm' : String(v);
    /* รูปคลื่นสำหรับจอสโคป: sine | half | full | rip (แรงดันพลิ้วแบบ AC coupling: ชาร์จเร็ว คายช้า) · vp = ค่ายอด (rip = Vpp) */
    function scopeWave(c) {
        const T = 1 / c.f, w = 2 * Math.PI * c.f;
        return t => {
            const ph = ((t % T) + T) % T / T;
            if (c.type === 'sine') return c.vp * Math.sin(w * t);
            if (c.type === 'half') return Math.max(0, c.vp * Math.sin(w * t));
            if (c.type === 'full') return Math.abs(c.vp * Math.sin(Math.PI * c.f * t));     // |sin| มีคาบ 1/f
            return ph < 0.18 ? c.vp * (ph / 0.18 - 0.5) : c.vp * (0.5 - (ph - 0.18) / 0.82);
        };
    }
    /* จอสโคปภาพนิ่ง: <svg viewBox="0 0 570 488" data-scope="type;vp;f;vdiv;tdiv"> (ใช้ในแบบฝึกหัด) */
    function scopeStatic(el) {
        const [type, vp, f, vdiv, tdiv] = el.dataset.scope.split(';');
        const c = { type, vp: +vp, f: +f, vdiv: +vdiv, tdiv: +tdiv };
        el.innerHTML = scopeScreen(scopeWave(c), { vdiv: c.vdiv, tdiv: c.tdiv, ac: type === 'rip', gnd: type === 'half' || type === 'full' ? 3 : 0 });
    }

    /* ---------- แล็บเสมือน ใบงานที่ 2.1: วงจร + ออสซิลโลสโคป + มัลติมิเตอร์ ---------- */
    function psu(el) {
        let mode = el.dataset.mode || 'half', C = +(el.dataset.c || 0), RL = +(el.dataset.rl || 1000), probe = 'out', ac = false, meas = false;
        const VD = [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10], TD = [1, 2, 5, 10];
        let vdiv = 5, tdiv = 5;
        const lock = (el.dataset.lock || '').split(',');
        const capTxt = c => c ? c * 1e6 + ' µF' : '', rlTxt = r => r >= 1000 ? r / 1000 + ' kΩ' : r + ' Ω';
        el.classList.add('sx', 'psu');
        const grp = (lab, a, list, fmt) => `<div class="ps-g"><span class="ps-l">${lab}</span>${list.map(v => `<button type="button" data-${a}="${v}">${fmt(v)}</button>`).join('')}</div>`;
        el.innerHTML = `<div class="ps-row">
              <div class="ps-l-col"><svg viewBox="0 0 920 520" class="sx-svg ps-svg"></svg>
                <div class="sx-ctl ps-ctl">
                  ${lock.includes('mode') ? '' : grp('วงจร', 'm', ['half', 'bridge'], v => v === 'half' ? 'ครึ่งคลื่น' : 'บริดจ์')}
                  ${grp('C', 'c', [0, 470e-6, 2200e-6], v => v ? capTxt(v) : 'ไม่ต่อ')}
                  ${grp('R<sub>L</sub>', 'r', [1000, 220], rlTxt)}
                </div>
                <div class="ps-meters"></div></div>
              <div class="ps-r-col"><svg viewBox="0 0 570 488" class="sx-svg ps-scope"></svg>
                <div class="sx-ctl ps-ctl">
                  <div class="ps-g"><span class="ps-l">โพรบวัด</span><button type="button" data-p="s">v<sub>s</sub> ขดทุติยภูมิ</button><button type="button" data-p="out">v<sub>out</sub> ที่โหลด</button></div>
                  <div class="ps-g"><span class="ps-l">VOLTS/DIV</span><button type="button" data-a="v-">−</button><b class="ps-v mono"></b><button type="button" data-a="v+">+</button>
                    <span class="ps-l">TIME/DIV</span><button type="button" data-a="t-">−</button><b class="ps-t mono"></b><button type="button" data-a="t+">+</button></div>
                  <div class="ps-g"><button type="button" data-a="ac"></button><button type="button" data-a="ms">Measure</button></div>
                </div></div></div>
            <div class="ps-note"></div>`;
        const svg = el.querySelector('.ps-svg'), scope = el.querySelector('.ps-scope');
        const draw = () => {
            const r = psuRun(mode, C, RL), N = r.N, T = 1 / PSU.f;
            svg.innerHTML = rcCircuit(mode, { cap: capTxt(C), rl: rlTxt(RL) })
                + `<g class="ps-probe"><circle cx="${probe === 's' ? 150 : 800}" cy="${probe === 's' ? 140 : 140}" r="16"/><text x="${probe === 's' ? 186 : 772}" y="${probe === 's' ? 120 : 118}" text-anchor="${probe === 's' ? 'start' : 'end'}">โพรบ</text></g>`;
            const arr = probe === 's' ? r.sec : r.out;
            let mean = 0; if (ac) { for (let k = 0; k < N; k++) mean += arr[k]; mean /= N; }
            const fn = t => arr[Math.floor(((t % T) + T) % T / PSU.dt) % N] - mean;
            let mx = -1e9, mn = 1e9; for (let k = 0; k < N; k++) { mx = Math.max(mx, arr[k] - mean); mn = Math.min(mn, arr[k] - mean); }
            const f = probe === 's' ? 50 : r.fo;
            const m = meas ? [`Vpp  ${(mx - mn).toFixed(2)} V`, `Vmax ${mx.toFixed(2)} V`, ac ? `Vmin ${mn.toFixed(2)} V` : `Vavg ${(probe === 's' ? 0 : r.vdc).toFixed(2)} V`, `Freq ${f} Hz`] : null;
            scope.innerHTML = scopeScreen(fn, { vdiv, tdiv, ac, gnd: probe === 'out' && !ac ? 3 : 0, meas: m, ch: probe === 's' ? 'CH1' : 'CH2' });
            el.querySelector('.ps-meters').innerHTML = `<div class="ps-m"><span>มัลติมิเตอร์ ย่าน V~ ที่ขดทุติยภูมิ</span><b class="lcd sm">${r.vsrms.toFixed(2)}</b> V</div>
                <div class="ps-m"><span>มัลติมิเตอร์ ย่าน V⎓ คร่อม R<sub>L</sub></span><b class="lcd sm">${r.vdc.toFixed(2)}</b> V</div>`;
            const clip = mx / vdiv > (probe === 'out' && !ac ? 7 : 4) || mn / vdiv < (probe === 'out' && !ac ? -1 : -4);
            el.querySelector('.ps-note').innerHTML = clip ? 'รูปคลื่นล้นจอ → เพิ่ม VOLTS/DIV' : (ac && probe === 'out' && C ? 'AC coupling: ตัดไฟตรงออก เห็นเฉพาะแรงดันพลิ้ว (V<sub>r(pp)</sub> = สูงสุด − ต่ำสุด)' : probe === 'out' && !C ? 'นับช่องจากเส้นกราวด์ (⏚) ถึงยอด × VOLTS/DIV = V<sub>p(out)</sub>' : '');
            el.querySelectorAll('[data-m]').forEach(b => b.classList.toggle('on', b.dataset.m === mode));
            el.querySelectorAll('[data-c]').forEach(b => b.classList.toggle('on', +b.dataset.c === C));
            el.querySelectorAll('[data-r]').forEach(b => b.classList.toggle('on', +b.dataset.r === RL));
            el.querySelectorAll('[data-p]').forEach(b => b.classList.toggle('on', b.dataset.p === probe));
            el.querySelector('.ps-v').textContent = fmtDiv(vdiv) + 'V'; el.querySelector('.ps-t').textContent = tdiv + ' ms';
            const acb = el.querySelector('[data-a=ac]'); acb.textContent = ac ? 'Coupling: AC' : 'Coupling: DC'; acb.classList.toggle('on', ac);
            el.querySelector('[data-a=ms]').classList.toggle('on', meas);
        };
        el.addEventListener('click', e => {
            const b = e.target.closest('button'); if (!b) return;
            if (b.dataset.m) mode = b.dataset.m;
            else if (b.dataset.c != null) C = +b.dataset.c;
            else if (b.dataset.r) RL = +b.dataset.r;
            else if (b.dataset.p) { probe = b.dataset.p; if (probe === 's') ac = false; }
            else if (b.dataset.a === 'v-') vdiv = VD[Math.max(0, VD.indexOf(vdiv) - 1)];
            else if (b.dataset.a === 'v+') vdiv = VD[Math.min(VD.length - 1, VD.indexOf(vdiv) + 1)];
            else if (b.dataset.a === 't-') tdiv = TD[Math.max(0, TD.indexOf(tdiv) - 1)];
            else if (b.dataset.a === 't+') tdiv = TD[Math.min(TD.length - 1, TD.indexOf(tdiv) + 1)];
            else if (b.dataset.a === 'ac') ac = !ac;
            else if (b.dataset.a === 'ms') meas = !meas;
            draw(); blur(b);
        });
        draw();
    }

    /* ---------- ฝึกอ่านจอออสซิลโลสโคป: นับช่อง → แรงดัน · คาบ → ความถี่ ---------- */
    function scoperead(el) {
        /* type: sine | half | full | rip (AC coupling) · vp = ค่ายอด (rip = Vpp) · f Hz · vdiv V · tdiv ms */
        const CASES = [
            { type: 'sine', vp: 12, f: 50, vdiv: 5, tdiv: 5 }, { type: 'sine', vp: 6, f: 50, vdiv: 2, tdiv: 5 },
            { type: 'sine', vp: 3, f: 1000, vdiv: 1, tdiv: 0.2 }, { type: 'half', vp: 15, f: 50, vdiv: 5, tdiv: 5 },
            { type: 'full', vp: 15, f: 100, vdiv: 5, tdiv: 2 }, { type: 'full', vp: 8, f: 100, vdiv: 2, tdiv: 2 },
            { type: 'rip', vp: 1, f: 100, vdiv: 0.2, tdiv: 2 }, { type: 'rip', vp: 0.4, f: 50, vdiv: 0.1, tdiv: 5 },
            { type: 'half', vp: 8, f: 50, vdiv: 2, tdiv: 2 }, { type: 'sine', vp: 17, f: 50, vdiv: 5, tdiv: 2 }
        ];
        let i = +(el.dataset.start || 0), shown = false;
        const NAME = { sine: 'ไซน์ (ไฟสลับ)', half: 'เรียงกระแสครึ่งคลื่น', full: 'เรียงกระแสเต็มคลื่น', rip: 'แรงดันพลิ้ว (AC coupling)' };
        el.classList.add('sx', 'scoperead');
        el.innerHTML = `<div class="sr-row"><svg viewBox="0 0 570 488" class="sx-svg sr-svg"></svg>
            <div class="sr-r"><div class="sr-q"></div><div class="sx-ctl"><button type="button" data-a="ans">เฉลย</button><button type="button" data-a="new">ข้อต่อไป</button></div><div class="sr-a"></div></div></div>`;
        const draw = () => {
            const c = CASES[i];
            const gnd = c.type === 'half' || c.type === 'full' ? 3 : 0;
            el.querySelector('.sr-svg').innerHTML = scopeScreen(scopeWave(c), { vdiv: c.vdiv, tdiv: c.tdiv, ac: c.type === 'rip', gnd });
            el.querySelector('.sr-q').innerHTML = `<p class="sr-n">ข้อ ${i + 1} / ${CASES.length}</p>
                <p>VOLTS/DIV = <b class="mono">${fmtDiv(c.vdiv)}V</b> · TIME/DIV = <b class="mono">${c.tdiv} ms</b></p>
                <p>${c.type === 'rip' ? 'แรงดันพลิ้วยอดถึงยอด <b>V<sub>r(pp)</sub></b>' : '<b>ค่ายอด V<sub>p</sub></b>'} = ? &nbsp; <b>ความถี่ f</b> = ?</p>`;
            const per = 1000 / c.f / c.tdiv, dv = c.type === 'rip' ? c.vp / c.vdiv : c.vp / c.vdiv;
            el.querySelector('.sr-a').innerHTML = shown ? `<p>รูปคลื่น: <b>${NAME[c.type]}</b></p>
                <p>${c.type === 'rip' ? 'ต่ำสุดถึงสูงสุด' : (gnd ? 'จากเส้นกราวด์ถึงยอด' : 'จากเส้นกลางถึงยอด')} <b class="mono">${+dv.toFixed(1)}</b> ช่อง × ${fmtDiv(c.vdiv)}V = <b class="mono c-orange">${+(c.vp).toFixed(2)} V</b></p>
                <p>1 คาบ = <b class="mono">${+per.toFixed(1)}</b> ช่อง × ${c.tdiv} ms = ${+(per * c.tdiv).toFixed(2)} ms → f = 1 ÷ ${+(per * c.tdiv / 1000).toFixed(4)} s = <b class="mono c-orange">${c.f} Hz</b></p>` : '';
            el.querySelector('[data-a=ans]').classList.toggle('on', shown);
        };
        el.addEventListener('click', e => {
            const b = e.target.closest('button'); if (!b) return;
            if (b.dataset.a === 'ans') shown = !shown;
            else if (b.dataset.a === 'new') { i = (i + 1) % CASES.length; shown = false; }
            draw(); blur(b);
        });
        draw();
    }

    const SIMS = { dope, hole, pn, bias, iv, dmm, curve, ds, rect, psu, scoperead };
    function init(root) {
        root = root || document;
        root.querySelectorAll('[data-timer]').forEach(el => { timer(el); guard(el); });
        root.querySelectorAll('.vote').forEach(el => { vote(el); guard(el); });
        root.querySelectorAll('[data-board]').forEach(el => { board(el); guard(el); });
        if (scores) boards();
        root.querySelectorAll('[data-picker]').forEach(el => { picker(el); guard(el); });
        root.querySelectorAll('[data-sim]').forEach(el => { const f = SIMS[el.dataset.sim]; if (f) { f(el); guard(el); } });
        root.querySelectorAll('[data-video]').forEach(el => { video(el); guard(el); });
        root.querySelectorAll('[data-circ]').forEach(el => { el.innerHTML = rcCircuit(el.dataset.circ, { cap: el.dataset.cap, rl: el.dataset.rl }); });
        root.querySelectorAll('[data-scope]').forEach(scopeStatic);
    }

    g.Sims = { init, circuit: rcCircuit };      // circuit(mode, {cap, rl, on, flow, pol}) = แบบวงจรแหล่งจ่าย (ใส่ใน <svg viewBox="0 0 920 520"> ภายใต้ .sx)
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init(document));
    else init(document);
})(window);
