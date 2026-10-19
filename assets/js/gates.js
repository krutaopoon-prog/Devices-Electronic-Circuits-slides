/* ===========================================
   Gates — วาดสัญลักษณ์ลอจิกเกตเป็น SVG และตัวจำลองเกตแบบคลิกได้
   ใช้: <span data-gate="AND"></span> แล้วเรียก Gates.render(root)
        <div data-gate-sim></div> แล้วเรียก Gates.initSims(root)
   =========================================== */
(function (g) {
    'use strict';

    const FN = {
        AND: (a, b) => a & b,
        OR: (a, b) => a | b,
        XOR: (a, b) => a ^ b,
        NAND: (a, b) => 1 - (a & b),
        NOR: (a, b) => 1 - (a | b),
        NOT: (a) => 1 - a
    };

    const AND_BODY = 'M50,10 H100 A40,40 0 0 1 100,90 H50 Z';
    const OR_BODY = 'M45,10 Q75,50 45,90 Q115,90 150,50 Q115,10 45,10 Z';

    /* viewBox 0 0 200 100: อินพุต A ที่ y=30, B ที่ y=70 (NOT ใช้ y=50), เอาต์พุตที่ y=50 */
    function svg(type, opts) {
        opts = opts || {};
        const cls = opts.cls || 'gate-svg';
        const labels = opts.labels !== false;
        const wa = opts.a == null ? '' : (opts.a ? ' hi' : ' lo');
        const wb = opts.b == null ? '' : (opts.b ? ' hi' : ' lo');
        const wq = opts.q == null ? '' : (opts.q ? ' hi' : ' lo');
        let body = '', inA = 0, inB = 0, outX = 0;
        switch (type) {
            case 'AND': body = `<path d="${AND_BODY}"/>`; inA = inB = 50; outX = 140; break;
            case 'NAND': body = `<path d="${AND_BODY}"/><circle cx="148" cy="50" r="8"/>`; inA = inB = 50; outX = 156; break;
            case 'OR': body = `<path d="${OR_BODY}"/>`; inA = inB = 56; outX = 150; break;
            case 'NOR': body = `<path d="${OR_BODY}"/><circle cx="158" cy="50" r="8"/>`; inA = inB = 56; outX = 166; break;
            case 'XOR': body = `<path d="M55,10 Q85,50 55,90 Q125,90 160,50 Q125,10 55,10 Z"/><path class="wire" d="M40,10 Q70,50 40,90"/>`; inA = inB = 52; outX = 160; break;
            case 'NOT': body = `<path d="M60,15 L60,85 L130,50 Z"/><circle cx="138" cy="50" r="8"/>`; outX = 146; break;
        }
        let wires;
        if (type === 'NOT') {
            wires = `<line class="w${wa}" x1="0" y1="50" x2="60" y2="50"/>`;
        } else {
            wires = `<line class="w${wa}" x1="0" y1="30" x2="${inA}" y2="30"/><line class="w${wb}" x1="0" y1="70" x2="${inB}" y2="70"/>`;
        }
        wires += `<line class="w${wq}" x1="${outX}" y1="50" x2="200" y2="50"/>`;
        const txt = !labels ? '' : (type === 'NOT'
            ? `<text x="2" y="42">A</text><text x="186" y="42">Q</text>`
            : `<text x="2" y="22">A</text><text x="2" y="62">B</text><text x="186" y="42">Q</text>`);
        return `<svg class="${cls}" viewBox="0 0 200 100" role="img" aria-label="สัญลักษณ์ ${type} gate">${wires}${body}${txt}</svg>`;
    }

    function render(root) {
        (root || document).querySelectorAll('[data-gate]').forEach(el => {
            el.innerHTML = svg(el.getAttribute('data-gate'), { cls: el.getAttribute('data-cls') || 'gate-svg', labels: el.getAttribute('data-labels') !== 'no' });
        });
    }

    /* --- ตัวจำลอง: ปุ่ม A, B, เลือกเกต, หลอดเอาต์พุต --- */
    function initSims(root) {
        (root || document).querySelectorAll('[data-gate-sim]').forEach(el => {
            let type = el.getAttribute('data-gate-sim') || 'AND';
            let a = 0, b = 0;
            el.innerHTML = `
                <div class="sim-gates">${Object.keys(FN).map(k => `<button type="button" data-k="${k}">${k}</button>`).join('')}</div>
                <div class="sim-board">
                    <div class="sim-ins">
                        <button type="button" class="sim-in" data-in="a" aria-label="สลับอินพุต A"></button>
                        <button type="button" class="sim-in" data-in="b" aria-label="สลับอินพุต B"></button>
                    </div>
                    <div class="sim-gate"></div>
                    <div class="sim-out"><div class="sim-lamp"></div><div class="sim-q"></div></div>
                </div>
                <div class="sim-expr"></div>`;
            const draw = () => {
                const q = type === 'NOT' ? FN.NOT(a) : FN[type](a, b);
                el.querySelector('.sim-gate').innerHTML = svg(type, { cls: 'gate-svg sim-svg', a, b: type === 'NOT' ? null : b, q });
                el.querySelectorAll('.sim-gates button').forEach(x => x.classList.toggle('on', x.dataset.k === type));
                const ba = el.querySelector('[data-in=a]'), bb = el.querySelector('[data-in=b]');
                ba.textContent = 'A = ' + a; ba.classList.toggle('hi', !!a);
                bb.textContent = 'B = ' + b; bb.classList.toggle('hi', !!b);
                bb.style.visibility = type === 'NOT' ? 'hidden' : 'visible';
                el.querySelector('.sim-ins').classList.toggle('single', type === 'NOT');
                el.querySelector('.sim-lamp').classList.toggle('hi', !!q);
                el.querySelector('.sim-q').textContent = 'Q = ' + q;
                el.querySelector('.sim-expr').textContent = type === 'NOT' ? `NOT ${a} = ${q}` : `${a} ${type} ${b} = ${q}`;
            };
            el.addEventListener('click', e => {
                const k = e.target.closest('[data-k]'); const i = e.target.closest('[data-in]');
                if (k) type = k.dataset.k;
                if (i) { if (i.dataset.in === 'a') a = 1 - a; else b = 1 - b; }
                if (k || i) { e.stopPropagation(); draw(); }
            });
            draw();
        });
    }

    g.Gates = { FN, svg, render, initSims };
})(window);
