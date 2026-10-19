/* ===========================================
   Diodes — วาดสัญลักษณ์ไดโอดเป็น SVG
   ใช้: <span data-diode="std|zener|zener1|schottky|led|photo|bridge" data-ak="yes"></span>
        แล้วเรียก Diodes.render(root) (หน้าเว็บเรียกให้เองตอนโหลด)
   data-ak="yes" = เขียน A และ K กำกับขา, data-cls = คลาสของ svg (ค่าเริ่มต้น diode-svg)
   ห้ามใช้ data-gate กับสัญลักษณ์นี้ (Gates.render จะเขียนทับ)
   =========================================== */
(function (g) {
    'use strict';

    const NAME = {
        std: 'ไดโอดทั่วไป', zener: 'ซีเนอร์ไดโอด', zener1: 'ซีเนอร์ไดโอด', schottky: 'ชอตต์กีไดโอด',
        led: 'แอลอีดี', photo: 'โฟโต้ไดโอด', bridge: 'ไดโอดบริดจ์'
    };

    /* ลูกศรแสงเล็ก ๆ: out = ชี้ออก (LED), in = ชี้เข้า (โฟโต้ไดโอด) */
    function arrows(dir) {
        const one = (x, y) => dir === 'out'
            ? `<line x1="${x}" y1="${y}" x2="${x + 22}" y2="${y - 22}"/><path class="fill" d="M${x + 24},${y - 24} l-11,3 l8,8 z"/>`
            : `<line x1="${x + 24}" y1="${y - 24}" x2="${x + 2}" y2="${y - 2}"/><path class="fill" d="M${x},${y} l3,-11 l8,8 z"/>`;
        return one(96, 22) + one(114, 30);
    }

    /* viewBox 0 0 200 100: ขาแอโนดซ้าย (x=0..70) ขาแคโทดขวา (x=120..200) */
    function svg(type, opts) {
        opts = opts || {};
        const cls = opts.cls || 'diode-svg';
        if (type === 'bridge') return bridge(cls, opts);
        const tri = `<path class="body" d="M70,25 L70,75 L120,50 Z"/>`;
        let bar;
        switch (type) {
            case 'zener': bar = `<path d="M108,20 L120,25 L120,75 L132,80"/>`; break;          // ปลายงอสองข้างเป็นรูปตัว Z
            case 'zener1': bar = `<path d="M106,25 L120,25 L120,75"/>`; break;                 // งอปลายข้างเดียว (บางตำรา/โปรแกรมวาดแบบนี้)
            case 'schottky': bar = `<path d="M130,33 L130,25 L120,25 L120,75 L110,75 L110,67"/>`; break; // ปลายงอเป็นรูปตัว S
            default: bar = `<line x1="120" y1="25" x2="120" y2="75"/>`;
        }
        const extra = type === 'led' ? arrows('out') : type === 'photo' ? arrows('in') : '';
        const ak = opts.ak ? `<text x="4" y="40">A</text><text x="182" y="40">K</text>` : '';
        return `<svg class="${cls}" viewBox="0 0 200 100" role="img" aria-label="สัญลักษณ์${NAME[type] || 'ไดโอด'}">
            <line x1="0" y1="50" x2="70" y2="50"/><line x1="120" y1="50" x2="200" y2="50"/>${tri}${bar}${extra}${ak}</svg>`;
    }

    /* ไดโอดบริดจ์: ไดโอด 4 ตัวต่อเป็นสี่เหลี่ยมข้าวหลามตัด ขา ~ ซ้าย/ขวา, + บน, − ล่าง */
    function bridge(cls) {
        const d = (x, y, rot) => `<g transform="translate(${x},${y}) rotate(${rot})"><path class="body" d="M-14,-12 L-14,12 L8,0 Z"/><line x1="8" y1="-12" x2="8" y2="12"/></g>`;
        return `<svg class="${cls}" viewBox="0 0 200 200" role="img" aria-label="สัญลักษณ์ไดโอดบริดจ์">
            <path class="wire" d="M100,20 L20,100 L100,180 L180,100 Z"/>
            ${d(60, 60, -45)}${d(140, 60, -135)}${d(60, 140, -135)}${d(140, 140, -45)}
            <text x="92" y="14">+</text><text x="94" y="198">−</text><text x="0" y="96">~</text><text x="186" y="96">~</text></svg>`;
    }

    /* วงจรอนุกรมวงเดียว: แบตเตอรี่ (ซ้าย ขั้วบวกด้านบน) → D บนสายบน → R บนสายบน → LED ด้านขวา (ถ้ามี)
       opts: v ("6 V"), d ("f" ไบแอสตรง | "r" กลับขั้ว | ""), dn ("D1 1N4007"), r ("1 kΩ" | ""), rn ("R1"), led ("f" | "r" | ""), ln ("LED1"), flow (true = แสดงลูกศรกระแส) */
    function loop(o) {
        const dia = (x, y, rev) => `<g transform="translate(${x},${y})${rev ? ' rotate(180)' : ''}"><path class="body" d="M-22,-20 L-22,20 L18,0 Z"/><line x1="18" y1="-20" x2="18" y2="20"/></g>`;
        let s = `<path class="wire" d="M70,60 H480 V270 H70 Z"/><rect class="bg" x="40" y="138" width="60" height="44"/>
            <line x1="44" y1="148" x2="96" y2="148"/><line class="thick" x1="56" y1="172" x2="84" y2="172"/>
            <text class="pm" x="104" y="146">+</text><text class="val" x="-4" y="166" text-anchor="end">${o.v || ''}</text>`;
        if (o.d) s += `<rect class="bg" x="150" y="36" width="70" height="48"/>${dia(185, 60, o.d === 'r')}<text class="nm" x="185" y="26">${o.dn || 'D1'}</text>`;
        if (o.r) s += `<rect class="bg" x="285" y="44" width="110" height="32"/><path d="M285,60 l10,-14 l15,28 l15,-28 l15,28 l15,-28 l15,28 l10,-14"/><text class="nm" x="340" y="26">${(o.rn || 'R1') + ' ' + o.r}</text>`;
        if (o.led) {
            s += `<rect class="bg" x="456" y="130" width="48" height="70"/><g transform="translate(480,165) rotate(${o.led === 'r' ? -90 : 90})"><path class="body" d="M-22,-20 L-22,20 L18,0 Z"/><line x1="18" y1="-20" x2="18" y2="20"/></g>
                <line x1="506" y1="150" x2="530" y2="132"/><path class="fill" d="M534,129 l-11,2 l6,8 z"/><line x1="506" y1="168" x2="530" y2="150"/><path class="fill" d="M534,147 l-11,2 l6,8 z"/>
                <text class="nm" x="540" y="190" text-anchor="start">${o.ln || 'LED1'}</text>`;
        }
        if (o.flow) s += `<path class="flow" d="M110,40 H250"/><path class="fill flowhead" d="M262,40 l-14,-8 v16 z"/>`;
        return `<svg class="loop-svg" viewBox="-120 0 720 300" role="img" aria-label="แบบวงจรอนุกรม">${s}</svg>`;
    }

    function render(root) {
        (root || document).querySelectorAll('[data-diode]').forEach(el => {
            el.innerHTML = svg(el.getAttribute('data-diode'), { cls: el.getAttribute('data-cls') || 'diode-svg', ak: el.getAttribute('data-ak') === 'yes' });
        });
        (root || document).querySelectorAll('[data-loop]').forEach(el => {
            const o = {}; el.getAttribute('data-loop').split(';').forEach(kv => { const [k, v] = kv.split('='); if (k) o[k.trim()] = (v || '').trim(); });
            o.flow = o.flow === '1';
            el.innerHTML = loop(o);
        });
    }

    g.Diodes = { NAME, svg, loop, render };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => render(document));
    else render(document);
})(window);
