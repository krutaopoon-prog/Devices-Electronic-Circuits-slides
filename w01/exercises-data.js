/* ===========================================
   แบบฝึกหัดสัปดาห์ที่ 1 — ไฟล์นี้มีเฉพาะโจทย์ ไม่มีเฉลย
   type: pick (เลือกคำตอบจาก options; มี sym = แสดงสัญลักษณ์ไดโอด), num (ตอบเป็นตัวเลข ทศนิยม dp ตำแหน่ง)
   fig = แบบวงจรอนุกรมประกอบโจทย์ (รูปแบบเดียวกับ data-loop ใน diodes.js)
   =========================================== */
(function () {
    const MAT = ['ตัวนำ', 'สารกึ่งตัวนำ', 'ฉนวน'];
    const NP = ['สารชนิด N', 'สารชนิด P'];
    const TF = ['ถูก', 'ผิด'];
    const BIAS = ['ไบแอสตรง', 'ไบแอสกลับ'];
    const TYPE = ['ไดโอดเรียงกระแส', 'ไดโอดสัญญาณ', 'ไดโอดบริดจ์', 'ซีเนอร์ไดโอด', 'แอลอีดี'];
    const KMARK = ['แถบสีบนตัวถัง', 'ขาสั้นและขอบตัดเรียบ', 'อ่านเครื่องหมาย + − ~ บนตัว'];
    const PN = ['สาร P', 'สาร N'];
    const SYM = ['ไดโอดทั่วไป', 'ซีเนอร์ไดโอด', 'ชอตต์กีไดโอด', 'แอลอีดี', 'โฟโต้ไดโอด'];
    const AK = ['แอโนด (A)', 'แคโทด (K)'];
    const REF = ['ไดโอด', 'ตัวต้านทาน', 'ตัวเก็บประจุ', 'ทรานซิสเตอร์', 'วงจรรวม (ไอซี)'];
    const ON = ['นำกระแส', 'ไม่นำกระแส'];

    window.EXERCISES = {
        chapter: 'สัปดาห์ที่ 1 สารกึ่งตัวนำ ไดโอด และสัญลักษณ์อิเล็กทรอนิกส์',
        sets: [
            {
                id: 's1', title: 'ชุดที่ 1 สารกึ่งตัวนำและการโดป (หัวข้อ 5.1)',
                parts: [
                    {
                        title: 'ตอนที่ 1 วัสดุต่อไปนี้จัดอยู่ในกลุ่มใด',
                        items: [
                            { id: 'm-1', type: 'pick', q: 'ทองแดง', options: MAT },
                            { id: 'm-2', type: 'pick', q: 'ซิลิกอน', options: MAT },
                            { id: 'm-3', type: 'pick', q: 'ยาง', options: MAT },
                            { id: 'm-4', type: 'pick', q: 'เจอร์เมเนียม', options: MAT },
                            { id: 'm-5', type: 'pick', q: 'อะลูมิเนียม', options: MAT },
                            { id: 'm-6', type: 'pick', q: 'แก้ว', options: MAT }
                        ]
                    },
                    {
                        title: 'ตอนที่ 2 ได้สารกึ่งตัวนำชนิดใด',
                        items: [
                            { id: 'np-1', type: 'pick', q: 'เติมฟอสฟอรัสลงในซิลิกอน', options: NP },
                            { id: 'np-2', type: 'pick', q: 'เติมโบรอนลงในซิลิกอน', options: NP },
                            { id: 'np-3', type: 'pick', q: 'เติมอาร์เซนิกลงในซิลิกอน', options: NP },
                            { id: 'np-4', type: 'pick', q: 'เติมแกลเลียมลงในซิลิกอน', options: NP },
                            { id: 'np-5', type: 'pick', q: 'สารที่มีโฮลเป็นพาหะส่วนใหญ่', options: NP },
                            { id: 'np-6', type: 'pick', q: 'สารที่มีอิเล็กตรอนเป็นพาหะส่วนใหญ่', options: NP }
                        ]
                    },
                    {
                        title: 'ตอนที่ 3 ตอบเป็นตัวเลข',
                        items: [
                            { id: 'v-1', type: 'num', q: 'อิเล็กตรอนวงนอกสุดของซิลิกอน', unit: 'ตัว', dp: 0 },
                            { id: 'v-2', type: 'num', q: 'อิเล็กตรอนวงนอกสุดของฟอสฟอรัส', unit: 'ตัว', dp: 0 },
                            { id: 'v-3', type: 'num', q: 'อิเล็กตรอนวงนอกสุดของโบรอน', unit: 'ตัว', dp: 0 },
                            { id: 'v-4', type: 'num', q: 'อะตอมซิลิกอน 1 อะตอม สร้างพันธะกับอะตอมข้างเคียงกี่อะตอม', unit: 'อะตอม', dp: 0 }
                        ]
                    }
                ]
            },
            {
                id: 's2', title: 'ชุดที่ 2 รอยต่อพีเอ็นและการไบแอส (หัวข้อ 5.2)',
                parts: [
                    {
                        title: 'ตอนที่ 1 ข้อความต่อไปนี้ถูกหรือผิด',
                        items: [
                            { id: 'tf-1', type: 'pick', q: 'บริเวณปลอดพาหะเกิดจากอิเล็กตรอนฝั่ง N แพร่ไปรวมกับโฮลฝั่ง P', options: TF },
                            { id: 'tf-2', type: 'pick', q: 'แรงดันกำแพงศักย์ของซิลิกอนประมาณ 0.3 โวลต์', options: TF },
                            { id: 'tf-3', type: 'pick', q: 'ไบแอสตรงทำให้บริเวณปลอดพาหะแคบลง', options: TF },
                            { id: 'tf-4', type: 'pick', q: 'ไบแอสกลับทำให้ไดโอดนำกระแสได้มาก', options: TF },
                            { id: 'tf-5', type: 'pick', q: 'กระแสรั่วไหลเกิดจากพาหะส่วนน้อย มีขนาดระดับไมโครแอมแปร์หรือนาโนแอมแปร์', options: TF },
                            { id: 'tf-6', type: 'pick', q: 'ไดโอดที่ไบแอสตรงต่อเข้ากับแหล่งจ่ายตรง ๆ ได้ ไม่ต้องมีตัวต้านทาน', options: TF }
                        ]
                    },
                    {
                        title: 'ตอนที่ 2 การต่อแบบนี้เป็นไบแอสแบบใด',
                        items: [
                            { id: 'b-1', type: 'pick', q: 'ขั้วบวกต่อแอโนด ขั้วลบต่อแคโทด', options: BIAS },
                            { id: 'b-2', type: 'pick', q: 'ขั้วบวกของแหล่งจ่ายต่อเข้าสาร N', options: BIAS },
                            { id: 'b-3', type: 'pick', q: 'ขั้วลบของแหล่งจ่ายต่อเข้าสาร P', options: BIAS },
                            { id: 'b-4', type: 'pick', q: 'ขั้วบวกต่อสาร P ขั้วลบต่อสาร N', options: BIAS }
                        ]
                    },
                    {
                        title: 'ตอนที่ 3 คำนวณกระแสของไดโอดไบแอสตรงที่ต่ออนุกรมกับตัวต้านทาน (ซิลิกอน 0.7 V, เจอร์เมเนียม 0.3 V) ตอบเป็น mA',
                        items: [
                            { id: 'i-1', type: 'num', q: 'ซิลิกอน · แหล่งจ่าย 6 V · R = 1 kΩ', unit: 'mA', dp: 1 },
                            { id: 'i-2', type: 'num', q: 'ซิลิกอน · แหล่งจ่าย 10 V · R = 1 kΩ', unit: 'mA', dp: 1 },
                            { id: 'i-3', type: 'num', q: 'ซิลิกอน · แหล่งจ่าย 5 V · R = 2.2 kΩ (ทศนิยม 2 ตำแหน่ง)', unit: 'mA', dp: 2 },
                            { id: 'i-4', type: 'num', q: 'ซิลิกอน · แหล่งจ่าย 9 V · R = 470 Ω', unit: 'mA', dp: 1 },
                            { id: 'i-5', type: 'num', q: 'เจอร์เมเนียม · แหล่งจ่าย 3 V · R = 1 kΩ', unit: 'mA', dp: 1 },
                            { id: 'i-6', type: 'num', q: 'ซิลิกอน · แหล่งจ่าย 12 V · R = 330 Ω', unit: 'mA', dp: 1 }
                        ]
                    }
                ]
            },
            {
                id: 's3', title: 'ชุดที่ 3 ชนิด ขา และเบอร์ของไดโอด (หัวข้อ 5.3)',
                parts: [
                    {
                        title: 'ตอนที่ 1 ไดโอดเบอร์/ลักษณะนี้เป็นชนิดใด',
                        items: [
                            { id: 't-1', type: 'pick', q: '1N4007 ตัวถังพลาสติกสีดำ', options: TYPE },
                            { id: 't-2', type: 'pick', q: '1N4148 ตัวถังแก้วขนาดเล็ก', options: TYPE },
                            { id: 't-3', type: 'pick', q: 'GBL04 มี 4 ขา พิมพ์ + − ~ ~', options: TYPE },
                            { id: 't-4', type: 'pick', q: '1N4733A (5.1 V)', options: TYPE },
                            { id: 't-5', type: 'pick', q: 'ไดโอดเปล่งแสง 5 mm', options: TYPE },
                            { id: 't-6', type: 'pick', q: '1N4001', options: TYPE }
                        ]
                    },
                    {
                        title: 'ตอนที่ 2 หาขาแคโทดของไดโอดนี้จากอะไร',
                        items: [
                            { id: 'k-1', type: 'pick', q: '1N4007', options: KMARK },
                            { id: 'k-2', type: 'pick', q: 'แอลอีดี 5 mm', options: KMARK },
                            { id: 'k-3', type: 'pick', q: 'ไดโอดบริดจ์ GBL04', options: KMARK },
                            { id: 'k-4', type: 'pick', q: '1N4148', options: KMARK }
                        ]
                    },
                    {
                        title: 'ตอนที่ 3 ต่อออกมาจากสารชนิดใด',
                        items: [
                            { id: 'pn-1', type: 'pick', q: 'ขาแอโนด', options: PN },
                            { id: 'pn-2', type: 'pick', q: 'ขาแคโทด', options: PN },
                            { id: 'pn-3', type: 'pick', q: 'ขาด้านที่มีแถบสีบนตัวถัง', options: PN }
                        ]
                    },
                    {
                        title: 'ตอนที่ 4 อ่านค่าพิกัดของตระกูล 1N4001–1N4007 (จากตารางในสไลด์)',
                        items: [
                            { id: 'r-1', type: 'num', q: 'V<sub>RRM</sub> ของ 1N4004', unit: 'V', dp: 0 },
                            { id: 'r-2', type: 'num', q: 'V<sub>RRM</sub> ของ 1N4007', unit: 'V', dp: 0 },
                            { id: 'r-3', type: 'num', q: 'กระแสไบแอสตรงเฉลี่ย I<sub>F(AV)</sub> ของ 1N4007', unit: 'A', dp: 0 }
                        ]
                    }
                ]
            },
            {
                id: 's4', title: 'ชุดที่ 4 สัญลักษณ์และรหัสอ้างอิง (หัวข้อ 5.4)',
                parts: [
                    {
                        title: 'ตอนที่ 1 สัญลักษณ์นี้คือไดโอดชนิดใด',
                        items: [
                            { id: 's-1', type: 'pick', sym: 'led', options: SYM },
                            { id: 's-2', type: 'pick', sym: 'std', options: SYM },
                            { id: 's-3', type: 'pick', sym: 'schottky', options: SYM },
                            { id: 's-4', type: 'pick', sym: 'photo', options: SYM },
                            { id: 's-5', type: 'pick', sym: 'zener', options: SYM },
                            { id: 's-6', type: 'pick', sym: 'zener1', options: SYM }
                        ]
                    },
                    {
                        title: 'ตอนที่ 2 ส่วนนี้คือขาใด',
                        items: [
                            { id: 'ak-1', type: 'pick', q: 'ฐานของหัวลูกศรสามเหลี่ยมในสัญลักษณ์', options: AK },
                            { id: 'ak-2', type: 'pick', q: 'ขีดตั้งในสัญลักษณ์', options: AK },
                            { id: 'ak-3', type: 'pick', q: 'ขาด้านที่มีแถบสีบนตัวไดโอดจริง', options: AK },
                            { id: 'ak-4', type: 'pick', q: 'ขาที่ต่อออกมาจากสาร P', options: AK }
                        ]
                    },
                    {
                        title: 'ตอนที่ 3 รหัสอ้างอิงในแบบวงจรนี้หมายถึงอุปกรณ์ใด',
                        items: [
                            { id: 'rf-1', type: 'pick', q: 'D3', options: REF },
                            { id: 'rf-2', type: 'pick', q: 'R5', options: REF },
                            { id: 'rf-3', type: 'pick', q: 'C1', options: REF },
                            { id: 'rf-4', type: 'pick', q: 'Q2', options: REF },
                            { id: 'rf-5', type: 'pick', q: 'U1', options: REF }
                        ]
                    }
                ]
            },
            {
                id: 's5', title: 'ชุดที่ 5 อ่านแบบวงจรและคำนวณ (หัวข้อ 5.4)',
                parts: [
                    {
                        title: 'ตอนที่ 1 ไล่ทิศกระแสจากขั้วบวก แล้วบอกว่าไดโอด D1 นำกระแสหรือไม่',
                        items: [
                            { id: 'c-1', type: 'pick', fig: 'v=9 V;d=f;r=', q: 'ขั้วบวก → แอโนด D1 → แคโทด D1 → R1 → ขั้วลบ (แรงดัน 9 V)', options: ON },
                            { id: 'c-2', type: 'pick', fig: 'v=9 V;d=r;r=;order=rd', q: 'ขั้วบวก → R1 → แคโทด D1 → แอโนด D1 → ขั้วลบ (แรงดัน 9 V)', options: ON },
                            { id: 'c-3', type: 'pick', fig: 'v=9 V;d=r;r=1 kΩ', q: 'หัวลูกศรของ D1 ชี้สวนทิศกระแสในวงจร', options: ON },
                            { id: 'c-4', type: 'pick', fig: 'v=0.4 V;d=f', q: 'D1 ไบแอสตรง แต่แหล่งจ่ายมีเพียง 0.4 V (ซิลิกอน)', options: ON }
                        ]
                    },
                    {
                        title: 'ตอนที่ 2 คำนวณกระแสในวงจรอนุกรม (V<sub>D</sub> = 0.7 V, V<sub>LED</sub> = 2.0 V) ตอบเป็น mA ทศนิยม 1 ตำแหน่ง',
                        items: [
                            { id: 'l-1', type: 'num', fig: 'v=9 V;d=f;r=1 kΩ;led=f', q: '9 V → D1 → R1 1 kΩ → LED1 → กลับขั้วลบ', unit: 'mA', dp: 1 },
                            { id: 'l-2', type: 'num', fig: 'v=5 V;r=220 Ω;led=f', q: '5 V → R1 220 Ω → LED1 (ไม่มี D1)', unit: 'mA', dp: 1 },
                            { id: 'l-3', type: 'num', fig: 'v=12 V;d=f;r=680 Ω;led=f', q: '12 V → D1 → R1 680 Ω → LED1', unit: 'mA', dp: 1 },
                            { id: 'l-4', type: 'num', fig: 'v=5 V;d=f;d2=f;r=1 kΩ', q: '5 V → D1 → D2 → R1 1 kΩ (ไม่มี LED)', unit: 'mA', dp: 1 }
                        ]
                    }
                ]
            }
        ]
    };
})();
