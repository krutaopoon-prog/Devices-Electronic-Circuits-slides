/* ===========================================
   แบบฝึกหัดสัปดาห์ที่ 2 — ไฟล์นี้มีเฉพาะโจทย์ ไม่มีเฉลย
   type: pick (เลือกคำตอบจาก options), num (ตอบเป็นตัวเลข ทศนิยม dp ตำแหน่ง)
   fig = แบบวงจรอนุกรมประกอบโจทย์ (รูปแบบเดียวกับ data-loop ใน diodes.js)
   ตัวเลือกใน options ต้องเป็นข้อความล้วน (ไม่มีแท็ก HTML)
   =========================================== */
(function () {
    const TF = ['ถูก', 'ผิด'];
    const REGION = ['ไบแอสตรง ก่อนถึงแรงดันคัตอิน', 'ไบแอสตรง หลังแรงดันคัตอิน', 'ไบแอสกลับ (กระแสรั่วไหล)', 'ย่านพังทลาย'];
    const PARAM = ['แรงดันย้อนกลับสูงสุดซ้ำ', 'กระแสไบแอสตรงเฉลี่ย', 'กระแสกระชากสูงสุด', 'แรงดันตกคร่อมขณะนำกระแส', 'กระแสรั่วไหลย้อนกลับ'];
    const CAT = ['พิกัดสูงสุด (ห้ามเกิน)', 'คุณลักษณะทางไฟฟ้า (วัดได้จริง)'];
    const PART = ['1N4001', '1N4002', '1N4003', '1N4004', '1N4005', '1N4006', '1N4007', 'ไม่มีเบอร์ที่ผ่าน'];
    const USE = ['ใช้ 1N4007 ได้', 'ใช้ 1N4007 ไม่ได้'];
    const STATE = ['ดี (ซิลิกอน)', 'ดี (เจอร์เมเนียม)', 'ลัดวงจร', 'ขาด', 'รั่ว'];
    const AK = ['แอโนด (A)', 'แคโทด (K)'];

    window.EXERCISES = {
        chapter: 'สัปดาห์ที่ 2 การวัดทดสอบไดโอดและการอ่านคู่มืออุปกรณ์',
        sets: [
            {
                id: 's1', title: 'ชุดที่ 1 กราฟคุณลักษณะของไดโอด (หัวข้อ 5.1)',
                parts: [
                    {
                        title: 'ตอนที่ 1 ข้อความต่อไปนี้ถูกหรือผิด',
                        items: [
                            { id: 'g-1', type: 'pick', q: 'ไบแอสตรงก่อนถึงแรงดันคัตอิน กระแสไหลน้อยมาก', options: TF },
                            { id: 'g-2', type: 'pick', q: 'หลังแรงดันคัตอิน แรงดันตกคร่อมไดโอดเพิ่มขึ้นหลายเท่าตามกระแส', options: TF },
                            { id: 'g-3', type: 'pick', q: 'แรงดันคัตอินของเจอร์เมเนียมสูงกว่าซิลิกอน', options: TF },
                            { id: 'g-4', type: 'pick', q: 'ย่านไบแอสกลับมีเพียงกระแสรั่วไหลระดับไมโครแอมแปร์', options: TF },
                            { id: 'g-5', type: 'pick', q: 'กระแสรั่วไหลเพิ่มขึ้นมากตามแรงดันย้อนกลับตลอดช่วง', options: TF },
                            { id: 'g-6', type: 'pick', q: 'ไดโอดเรียงกระแสทั่วไปทำงานในย่านพังทลายได้โดยไม่เสียหาย', options: TF },
                            { id: 'g-7', type: 'pick', q: 'ซีเนอร์ไดโอดออกแบบมาให้ทำงานในย่านพังทลายได้', options: TF },
                            { id: 'g-8', type: 'pick', q: 'ในภาพที่ 1.6 สเกลแกนด้านลบกับด้านบวกเท่ากัน', options: TF }
                        ]
                    },
                    {
                        title: 'ตอนที่ 2 สภาวะต่อไปนี้อยู่ย่านใดของกราฟคุณลักษณะ',
                        items: [
                            { id: 'r-1', type: 'pick', q: 'ไดโอดซิลิกอน ไบแอสตรง V<sub>D</sub> = 0.3 V', options: REGION },
                            { id: 'r-2', type: 'pick', q: 'ไดโอดซิลิกอน ไบแอสตรง V<sub>D</sub> = 0.72 V กระแส 8 mA', options: REGION },
                            { id: 'r-3', type: 'pick', q: 'ไดโอดซิลิกอน แรงดันย้อนกลับ 20 V (ยังต่ำกว่า V<sub>BR</sub>) กระแส 5 µA', options: REGION },
                            { id: 'r-4', type: 'pick', q: 'แรงดันย้อนกลับถึง V<sub>BR</sub> กระแสย้อนกลับพุ่งสูงทันที', options: REGION },
                            { id: 'r-5', type: 'pick', q: 'ไดโอดเจอร์เมเนียม ไบแอสตรง V<sub>D</sub> = 0.35 V กระแสเพิ่มเร็ว', options: REGION },
                            { id: 'r-6', type: 'pick', q: 'ไดโอดเจอร์เมเนียม ไบแอสตรง V<sub>D</sub> = 0.1 V', options: REGION }
                        ]
                    },
                    {
                        title: 'ตอนที่ 3 คำนวณกระแสโดยประมาณ (V<sub>D</sub> ซิลิกอน = 0.7 V, เจอร์เมเนียม = 0.3 V) ตอบเป็น mA ทศนิยม 2 ตำแหน่ง',
                        items: [
                            { id: 'k-1', type: 'num', fig: 'v=4.7 V;d=f;r=1 kΩ', q: 'ซิลิกอน · 4.7 V · R 1 kΩ', unit: 'mA', dp: 2 },
                            { id: 'k-2', type: 'num', fig: 'v=12 V;d=f;r=2.2 kΩ', q: 'ซิลิกอน · 12 V · R 2.2 kΩ', unit: 'mA', dp: 2 },
                            { id: 'k-3', type: 'num', fig: 'v=3 V;d=f;dn=D1 Ge;r=1 kΩ', q: 'เจอร์เมเนียม · 3 V · R 1 kΩ', unit: 'mA', dp: 2 },
                            { id: 'k-4', type: 'num', fig: 'v=9 V;d=f;r=470 Ω', q: 'ซิลิกอน · 9 V · R 470 Ω', unit: 'mA', dp: 2 },
                            { id: 'k-5', type: 'num', fig: 'v=1.5 V;d=f;dn=D1 Ge;r=330 Ω', q: 'เจอร์เมเนียม · 1.5 V · R 330 Ω', unit: 'mA', dp: 2 },
                            { id: 'k-6', type: 'num', fig: 'v=0.5 V;d=f;r=1 kΩ', q: 'ซิลิกอน · 0.5 V · R 1 kΩ (ระวัง!)', unit: 'mA', dp: 2 }
                        ]
                    }
                ]
            },
            {
                id: 's2', title: 'ชุดที่ 2 ค่าพิกัดในคู่มืออุปกรณ์ (หัวข้อ 5.2)',
                parts: [
                    {
                        title: 'ตอนที่ 1 สัญลักษณ์ในคู่มือต่อไปนี้หมายถึงอะไร',
                        items: [
                            { id: 'p-1', type: 'pick', q: 'V<sub>RRM</sub>', options: PARAM },
                            { id: 'p-2', type: 'pick', q: 'I<sub>F(AV)</sub>', options: PARAM },
                            { id: 'p-3', type: 'pick', q: 'I<sub>FSM</sub>', options: PARAM },
                            { id: 'p-4', type: 'pick', q: 'V<sub>F</sub>', options: PARAM },
                            { id: 'p-5', type: 'pick', q: 'I<sub>R</sub>', options: PARAM }
                        ]
                    },
                    {
                        title: 'ตอนที่ 2 ค่าพิกัดของไดโอด 1N4007 จากคู่มือ (ตอบเป็นตัวเลข)',
                        items: [
                            { id: 'v-1', type: 'num', q: 'V<sub>RRM</sub>', unit: 'V', dp: 0 },
                            { id: 'v-2', type: 'num', q: 'I<sub>F(AV)</sub>', unit: 'A', dp: 1 },
                            { id: 'v-3', type: 'num', q: 'I<sub>FSM</sub>', unit: 'A', dp: 0 },
                            { id: 'v-4', type: 'num', q: 'V<sub>F</sub> (ที่กระแส 1.0 A)', unit: 'V', dp: 1 },
                            { id: 'v-5', type: 'num', q: 'I<sub>R</sub> (ที่ 25 °C)', unit: 'µA', dp: 1 }
                        ]
                    },
                    {
                        title: 'ตอนที่ 3 ค่าต่อไปนี้อยู่ในหมวดใดของคู่มือ',
                        items: [
                            { id: 'c-1', type: 'pick', q: 'V<sub>RRM</sub> 1000 V', options: CAT },
                            { id: 'c-2', type: 'pick', q: 'I<sub>F(AV)</sub> 1.0 A', options: CAT },
                            { id: 'c-3', type: 'pick', q: 'I<sub>FSM</sub> 30 A', options: CAT },
                            { id: 'c-4', type: 'pick', q: 'V<sub>F</sub> 1.1 V ที่ 1.0 A', options: CAT },
                            { id: 'c-5', type: 'pick', q: 'I<sub>R</sub> 5.0 µA ที่ 25 °C', options: CAT }
                        ]
                    },
                    {
                        title: 'ตอนที่ 4 เลือกเบอร์ที่พอดีที่สุดในตระกูล 1N4001–1N4007 (V<sub>RRM</sub> อย่างน้อย 2 เท่าของแรงดันย้อนกลับสูงสุดในวงจร)',
                        items: [
                            { id: 'n-1', type: 'pick', q: 'แรงดันย้อนกลับสูงสุด 20 V', options: PART },
                            { id: 'n-2', type: 'pick', q: 'แรงดันย้อนกลับสูงสุด 30 V', options: PART },
                            { id: 'n-3', type: 'pick', q: 'แรงดันย้อนกลับสูงสุด 60 V', options: PART },
                            { id: 'n-4', type: 'pick', q: 'แรงดันย้อนกลับสูงสุด 150 V', options: PART },
                            { id: 'n-5', type: 'pick', q: 'แรงดันย้อนกลับสูงสุด 350 V', options: PART },
                            { id: 'n-6', type: 'pick', q: 'แรงดันย้อนกลับสูงสุด 480 V', options: PART },
                            { id: 'n-7', type: 'pick', q: 'แรงดันย้อนกลับสูงสุด 600 V', options: PART }
                        ]
                    },
                    {
                        title: 'ตอนที่ 5 พิจารณากระแสใช้งาน (แรงดันย้อนกลับไม่เกินพิกัด)',
                        items: [
                            { id: 'f-1', type: 'pick', q: 'วงจรใช้กระแสเฉลี่ย 0.3 A', options: USE },
                            { id: 'f-2', type: 'pick', q: 'วงจรใช้กระแสเฉลี่ย 2 A', options: USE }
                        ]
                    }
                ]
            },
            {
                id: 's3', title: 'ชุดที่ 3 วัดทดสอบไดโอดด้วยมัลติมิเตอร์ (หัวข้อ 5.3)',
                parts: [
                    {
                        title: 'ตอนที่ 1 ตัดสินสภาพไดโอดจากค่าที่มิเตอร์ดิจิทัลแสดง (โหมดทดสอบไดโอด)',
                        items: [
                            { id: 's-1', type: 'pick', q: 'แดงที่ A: 0.612 · แดงที่ K: OL', options: STATE },
                            { id: 's-2', type: 'pick', q: 'แดงที่ A: 0.000 · แดงที่ K: 0.000', options: STATE },
                            { id: 's-3', type: 'pick', q: 'แดงที่ A: OL · แดงที่ K: OL', options: STATE },
                            { id: 's-4', type: 'pick', q: 'แดงที่ A: 0.254 · แดงที่ K: OL', options: STATE },
                            { id: 's-5', type: 'pick', q: 'ไดโอดซิลิกอน แดงที่ A: 0.301 · แดงที่ K: 1.210', options: STATE },
                            { id: 's-6', type: 'pick', q: 'แดงที่ A: 0.553 · แดงที่ K: OL', options: STATE },
                            { id: 's-7', type: 'pick', q: 'แดงที่ A: 0.004 · แดงที่ K: 0.003 (มีเสียงเตือน)', options: STATE },
                            { id: 's-8', type: 'pick', q: 'จอแสดงเลข 1 ด้านซ้ายทั้งสองทิศ', options: STATE }
                        ]
                    },
                    {
                        title: 'ตอนที่ 2 ไดโอดลบแถบสีหาย หาขาจากผลการวัด',
                        items: [
                            { id: 'a-1', type: 'pick', q: 'มิเตอร์ดิจิทัลแสดง 0.60 ขณะสายแดงแตะขา 1 · ขา 1 คือ', options: AK },
                            { id: 'a-2', type: 'pick', q: 'จากข้อ 1 ขา 2 ที่สายดำแตะอยู่คือ', options: AK },
                            { id: 'a-3', type: 'pick', q: 'มิเตอร์เข็ม (ย่านโอห์ม) เข็มขึ้นขณะสายดำแตะขา 1 · ขา 1 คือ', options: AK },
                            { id: 'a-4', type: 'pick', q: 'จากข้อ 3 ขา 2 ที่สายแดงแตะอยู่คือ', options: AK }
                        ]
                    },
                    {
                        title: 'ตอนที่ 3 ข้อความเกี่ยวกับการวัดต่อไปนี้ถูกหรือผิด',
                        items: [
                            { id: 't-1', type: 'pick', q: 'ต้องปิดไฟเลี้ยงวงจรก่อนวัดไดโอดในโหมดทดสอบไดโอด', options: TF },
                            { id: 't-2', type: 'pick', q: 'ในโหมดทดสอบไดโอด มิเตอร์จ่ายกระแสเล็ก ๆ ออกจากสายสีแดง', options: TF },
                            { id: 't-3', type: 'pick', q: 'ตัวเลขที่แสดงในโหมดทดสอบไดโอดมีหน่วยเป็นโอห์ม', options: TF },
                            { id: 't-4', type: 'pick', q: 'วัดบนแผ่นวงจรแล้วผลไม่ชัดเจน ให้ถอดขาข้างหนึ่งออกก่อนวัด', options: TF },
                            { id: 't-5', type: 'pick', q: 'มิเตอร์เข็มย่านโอห์ม สายสีแดงเป็นขั้วบวกของแบตเตอรี่ภายใน', options: TF },
                            { id: 't-6', type: 'pick', q: 'ไดโอดที่รั่วยังนำไปใช้งานได้ตามปกติ', options: TF },
                            { id: 't-7', type: 'pick', q: 'OL บนจอมิเตอร์หมายถึงเกินย่านวัด', options: TF },
                            { id: 't-8', type: 'pick', q: 'ไดโอดที่ดีต้องแสดงตัวเลขทั้งสองทิศ', options: TF }
                        ]
                    }
                ]
            },
            {
                id: 's4', title: 'ชุดที่ 4 วงจรหาค่าคุณลักษณะ (หัวข้อ 5.4)',
                parts: [
                    {
                        title: 'ตอนที่ 1 วงจรภาพที่ 1.8 (R = 1 kΩ) คำนวณ I<sub>D</sub> = (V<sub>S</sub> − V<sub>D</sub>) ÷ R ตอบเป็น mA ทศนิยม 2 ตำแหน่ง',
                        items: [
                            { id: 'i-1', type: 'num', q: 'V<sub>S</sub> = 5 V · V<sub>D</sub> = 0.65 V', unit: 'mA', dp: 2 },
                            { id: 'i-2', type: 'num', q: 'V<sub>S</sub> = 10 V · V<sub>D</sub> = 0.68 V', unit: 'mA', dp: 2 },
                            { id: 'i-3', type: 'num', q: 'V<sub>S</sub> = 2 V · V<sub>D</sub> = 0.58 V', unit: 'mA', dp: 2 },
                            { id: 'i-4', type: 'num', q: 'V<sub>S</sub> = 1 V · V<sub>D</sub> = 0.53 V', unit: 'mA', dp: 2 },
                            { id: 'i-5', type: 'num', q: 'V<sub>S</sub> = 8 V · V<sub>D</sub> = 0.66 V', unit: 'mA', dp: 2 },
                            { id: 'i-6', type: 'num', q: 'V<sub>S</sub> = 0.5 V · V<sub>D</sub> = 0.43 V', unit: 'mA', dp: 2 }
                        ]
                    },
                    {
                        title: 'ตอนที่ 2 เปลี่ยนค่าตัวต้านทาน ตอบเป็น mA ทศนิยม 2 ตำแหน่ง',
                        items: [
                            { id: 'j-1', type: 'num', q: 'V<sub>S</sub> = 6 V · V<sub>D</sub> = 0.64 V · R = 470 Ω', unit: 'mA', dp: 2 },
                            { id: 'j-2', type: 'num', q: 'V<sub>S</sub> = 12 V · V<sub>D</sub> = 0.69 V · R = 2.2 kΩ', unit: 'mA', dp: 2 },
                            { id: 'j-3', type: 'num', q: 'V<sub>S</sub> = 3 V · V<sub>D</sub> = 0.60 V · R = 330 Ω', unit: 'mA', dp: 2 }
                        ]
                    },
                    {
                        title: 'ตอนที่ 3 แรงดันตกคร่อมตัวต้านทาน V<sub>R</sub> = V<sub>S</sub> − V<sub>D</sub> ตอบเป็น V ทศนิยม 2 ตำแหน่ง',
                        items: [
                            { id: 'w-1', type: 'num', q: 'V<sub>S</sub> = 5 V · V<sub>D</sub> = 0.64 V', unit: 'V', dp: 2 },
                            { id: 'w-2', type: 'num', q: 'V<sub>S</sub> = 9 V · V<sub>D</sub> = 0.67 V', unit: 'V', dp: 2 }
                        ]
                    },
                    {
                        title: 'ตอนที่ 4 กลับขั้วไดโอดในวงจรภาพที่ 1.8 (ไบแอสกลับ) ตอบทศนิยม 1 ตำแหน่ง',
                        items: [
                            { id: 'b-1', type: 'num', q: 'V<sub>S</sub> = 5 V · แรงดันตกคร่อมไดโอดประมาณ', unit: 'V', dp: 1 },
                            { id: 'b-2', type: 'num', q: 'V<sub>S</sub> = 10 V · กระแสในวงจรประมาณ', unit: 'mA', dp: 1 }
                        ]
                    }
                ]
            }
        ]
    };
})();
