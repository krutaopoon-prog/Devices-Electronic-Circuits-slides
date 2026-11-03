/* ===========================================
   แบบฝึกหัดสัปดาห์ที่ 3 — ไฟล์นี้มีเฉพาะโจทย์ ไม่มีเฉลย
   type: pick (เลือกคำตอบจาก options), num (ตอบเป็นตัวเลข ทศนิยม dp ตำแหน่ง)
   circ = แบบวงจรประกอบตอน (half | ct | bridge จาก Sims.circuit) · scope = จอสโคปประกอบข้อ "type;vp;f;vdiv;tdiv"
   ตัวเลือกใน options ต้องเป็นข้อความล้วน (ไม่มีแท็ก HTML)
   =========================================== */
(function () {
    const TF = ['ถูก', 'ผิด'];
    const PART = ['หม้อแปลงไฟฟ้า', 'วงจรเรียงกระแส', 'วงจรกรองแรงดัน', 'วงจรรักษาระดับแรงดัน'];
    const PAIR = ['D1 และ D2', 'D1 และ D3', 'D2 และ D4', 'D3 และ D4'];
    const CHANGE = ['เพิ่มขึ้น', 'ลดลง', 'เท่าเดิม'];
    const RATE = ['10 V', '16 V', '25 V', '35 V', '50 V'];

    window.EXERCISES = {
        chapter: 'สัปดาห์ที่ 3 วงจรเรียงกระแสและวงจรกรองแรงดัน',
        sets: [
            {
                id: 's1', title: 'ชุดที่ 1 แผนผังแหล่งจ่ายไฟฟ้ากระแสตรงและค่ายอด (หัวข้อ 5.1)',
                parts: [
                    {
                        title: 'ตอนที่ 1 หน้าที่ต่อไปนี้เป็นของภาคใด',
                        items: [
                            { id: 'p-1', type: 'pick', q: 'ลดแรงดันไฟบ้าน 220 V ลงเหลือราว 12 V', options: PART },
                            { id: 'p-2', type: 'pick', q: 'ทำให้ไฟสลับไหลทางเดียว', options: PART },
                            { id: 'p-3', type: 'pick', q: 'ใช้ตัวเก็บประจุทำให้แรงดันเรียบขึ้น', options: PART },
                            { id: 'p-4', type: 'pick', q: 'ทำให้แรงดันคงที่แม้ไฟบ้านหรือโหลดเปลี่ยน', options: PART },
                            { id: 'p-5', type: 'pick', q: 'แยกวงจรของเราออกจากไฟบ้านเพื่อความปลอดภัย', options: PART },
                            { id: 'p-6', type: 'pick', q: 'ภาคที่ใช้ไดโอดเป็นอุปกรณ์หลัก', options: PART }
                        ]
                    },
                    {
                        title: 'ตอนที่ 2 คำนวณค่ายอด V<sub>m</sub> = 1.414 × V<sub>rms</sub> (ทศนิยม 2 ตำแหน่ง)',
                        items: [
                            { id: 'm-1', type: 'num', q: 'หม้อแปลง 12 V', unit: 'V', dp: 2 },
                            { id: 'm-2', type: 'num', q: 'หม้อแปลง 9 V', unit: 'V', dp: 2 },
                            { id: 'm-3', type: 'num', q: 'หม้อแปลง 6 V', unit: 'V', dp: 2 },
                            { id: 'm-4', type: 'num', q: 'หม้อแปลง 15 V', unit: 'V', dp: 2 },
                            { id: 'm-5', type: 'num', q: 'หม้อแปลง 24 V', unit: 'V', dp: 2 }
                        ]
                    },
                    {
                        title: 'ตอนที่ 3 ข้อความต่อไปนี้ถูกหรือผิด',
                        items: [
                            { id: 't-1', type: 'pick', q: 'มัลติมิเตอร์ย่าน V~ อ่านได้ค่าประสิทธิผล (rms)', options: TF },
                            { id: 't-2', type: 'pick', q: 'ค่ายอดของไฟสลับต่ำกว่าค่า rms', options: TF },
                            { id: 't-3', type: 'pick', q: 'แรงดันขาออกของหม้อแปลงยังเป็นไฟสลับ 50 Hz', options: TF },
                            { id: 't-4', type: 'pick', q: 'นักเรียนต่อสายด้านไฟบ้าน 220 V ของหม้อแปลงเองได้', options: TF }
                        ]
                    }
                ]
            },
            {
                id: 's2', title: 'ชุดที่ 2 วงจรเรียงกระแสแบบครึ่งคลื่น (หัวข้อ 5.2)',
                parts: [
                    {
                        title: 'ตอนที่ 1 คำนวณ (ไดโอดซิลิกอนตก 0.7 V · ทศนิยม 2 ตำแหน่ง)', circ: 'half',
                        items: [
                            { id: 'h-1', type: 'num', q: 'หม้อแปลง 12 V: V<sub>p(out)</sub>', unit: 'V', dp: 2 },
                            { id: 'h-2', type: 'num', q: 'หม้อแปลง 12 V: V<sub>dc</sub>', unit: 'V', dp: 2 },
                            { id: 'h-3', type: 'num', q: 'หม้อแปลง 9 V: V<sub>p(out)</sub>', unit: 'V', dp: 2 },
                            { id: 'h-4', type: 'num', q: 'หม้อแปลง 9 V: V<sub>dc</sub>', unit: 'V', dp: 2 },
                            { id: 'h-5', type: 'num', q: 'V<sub>p(out)</sub> = 10 V: V<sub>dc</sub>', unit: 'V', dp: 2 },
                            { id: 'h-6', type: 'num', q: 'ไฟบ้าน 50 Hz: ความถี่ขาออก', unit: 'Hz', dp: 0 }
                        ]
                    },
                    {
                        title: 'ตอนที่ 2 ข้อความต่อไปนี้ถูกหรือผิด',
                        items: [
                            { id: 'ht-1', type: 'pick', q: 'ครึ่งคาบลบ ไดโอดไบแอสกลับ แรงดันที่โหลดเป็น 0 V', options: TF },
                            { id: 'ht-2', type: 'pick', q: 'วงจรครึ่งคลื่นใช้พลังงานได้ทั้งสองครึ่งคาบ', options: TF },
                            { id: 'ht-3', type: 'pick', q: 'วงจรครึ่งคลื่นเหมาะกับงานกระแสต่ำ', options: TF }
                        ]
                    }
                ]
            },
            {
                id: 's3', title: 'ชุดที่ 3 วงจรเรียงกระแสแบบเต็มคลื่นและบริดจ์ (หัวข้อ 5.2)',
                parts: [
                    {
                        title: 'ตอนที่ 1 ทางเดินกระแสในวงจรบริดจ์ (ภาพที่ 2.3 · ครึ่งคาบบวก = ขั้วบนของหม้อแปลงเป็นบวก)', circ: 'bridge',
                        items: [
                            { id: 'b-1', type: 'pick', q: 'ครึ่งคาบบวก ไดโอดที่นำกระแส', options: PAIR },
                            { id: 'b-2', type: 'pick', q: 'ครึ่งคาบลบ ไดโอดที่นำกระแส', options: PAIR },
                            { id: 'b-3', type: 'pick', q: 'ครึ่งคาบบวก ไดโอดที่ไบแอสกลับ', options: PAIR },
                            { id: 'b-4', type: 'pick', q: 'ครึ่งคาบลบ ไดโอดที่ไบแอสกลับ', options: PAIR }
                        ]
                    },
                    {
                        title: 'ตอนที่ 2 คำนวณวงจรบริดจ์ (ไดโอดตัวละ 0.7 V · ทศนิยม 2 ตำแหน่ง)',
                        items: [
                            { id: 'k-1', type: 'num', q: 'หม้อแปลง 12 V: V<sub>p(out)</sub>', unit: 'V', dp: 2 },
                            { id: 'k-2', type: 'num', q: 'หม้อแปลง 12 V: V<sub>dc</sub>', unit: 'V', dp: 2 },
                            { id: 'k-3', type: 'num', q: 'หม้อแปลง 9 V: V<sub>p(out)</sub>', unit: 'V', dp: 2 },
                            { id: 'k-4', type: 'num', q: 'หม้อแปลง 9 V: V<sub>dc</sub>', unit: 'V', dp: 2 },
                            { id: 'k-5', type: 'num', q: 'ไฟบ้าน 50 Hz: ความถี่ขาออก', unit: 'Hz', dp: 0 },
                            { id: 'k-6', type: 'num', q: 'ไดโอดที่นำกระแสพร้อมกันในแต่ละครึ่งคาบ', unit: 'ตัว', dp: 0 }
                        ]
                    },
                    {
                        title: 'ตอนที่ 3 ข้อความต่อไปนี้ถูกหรือผิด',
                        items: [
                            { id: 'kt-1', type: 'pick', q: 'วงจรบริดจ์ใช้หม้อแปลงธรรมดา (ไม่มีแท็ปกลาง) ได้', options: TF },
                            { id: 'kt-2', type: 'pick', q: 'วงจรเต็มคลื่นแบบแท็ปกลางใช้ไดโอด 4 ตัว', options: TF },
                            { id: 'kt-3', type: 'pick', q: 'ในวงจรบริดจ์ ทั้งสองครึ่งคาบกระแสผ่านโหลดทิศเดียวกัน', options: TF },
                            { id: 'kt-4', type: 'pick', q: 'ไดโอดบริดจ์สำเร็จรูป ขา ~ ต่อกับโหลด', options: TF }
                        ]
                    }
                ]
            },
            {
                id: 's4', title: 'ชุดที่ 4 วงจรกรองแรงดันด้วยตัวเก็บประจุ (หัวข้อ 5.3)',
                parts: [
                    {
                        title: 'ตอนที่ 1 คำนวณ V<sub>r(pp)</sub> = I<sub>L</sub> ÷ (f × C) (ทศนิยม 2 ตำแหน่ง)',
                        items: [
                            { id: 'r-1', type: 'num', q: 'บริดจ์ · 100 mA · 1000 µF', unit: 'V', dp: 2 },
                            { id: 'r-2', type: 'num', q: 'บริดจ์ · 200 mA · 2200 µF', unit: 'V', dp: 2 },
                            { id: 'r-3', type: 'num', q: 'ครึ่งคลื่น · 100 mA · 1000 µF', unit: 'V', dp: 2 },
                            { id: 'r-4', type: 'num', q: 'บริดจ์ · 50 mA · 470 µF', unit: 'V', dp: 2 },
                            { id: 'r-5', type: 'num', q: 'บริดจ์ · 15 mA · 470 µF', unit: 'V', dp: 2 },
                            { id: 'r-6', type: 'num', q: 'บริดจ์ · 100 mA · ต้องการพลิ้วไม่เกิน 0.5 V: C อย่างน้อย', unit: 'µF', dp: 0 }
                        ]
                    },
                    {
                        title: 'ตอนที่ 2 ถ้าเปลี่ยนตามข้อต่อไปนี้ (อย่างอื่นเท่าเดิม) แรงดันพลิ้วเป็นอย่างไร',
                        items: [
                            { id: 'c-1', type: 'pick', q: 'เพิ่มกระแสโหลด', options: CHANGE },
                            { id: 'c-2', type: 'pick', q: 'เพิ่มค่าตัวเก็บประจุ', options: CHANGE },
                            { id: 'c-3', type: 'pick', q: 'เปลี่ยนวงจรครึ่งคลื่นเป็นบริดจ์', options: CHANGE },
                            { id: 'c-4', type: 'pick', q: 'เปลี่ยน R<sub>L</sub> จาก 1 kΩ เป็น 220 Ω', options: CHANGE }
                        ]
                    },
                    {
                        title: 'ตอนที่ 3 เลือกพิกัดแรงดันตัวเก็บประจุที่ต่ำที่สุดที่ใช้ได้ (อย่างน้อย 1.5 เท่าของแรงดันยอด)',
                        items: [
                            { id: 'v-1', type: 'pick', q: 'แรงดันยอด 15.57 V', options: RATE },
                            { id: 'v-2', type: 'pick', q: 'แรงดันยอด 8 V', options: RATE },
                            { id: 'v-3', type: 'pick', q: 'แรงดันยอด 32.5 V', options: RATE },
                            { id: 'v-4', type: 'pick', q: 'แรงดันยอด 16.27 V', options: RATE },
                            { id: 'v-5', type: 'pick', q: 'แรงดันยอด 5 V', options: RATE }
                        ]
                    },
                    {
                        title: 'ตอนที่ 4 ข้อความต่อไปนี้ถูกหรือผิด',
                        items: [
                            { id: 'e-1', type: 'pick', q: 'ขาด้านที่มีแถบเครื่องหมายลบบนตัวถังคือขาลบ', options: TF },
                            { id: 'e-2', type: 'pick', q: 'ปิดเครื่องแล้วแตะขาตัวเก็บประจุได้ทันที', options: TF },
                            { id: 'e-3', type: 'pick', q: 'ต่อตัวเก็บประจุอิเล็กโทรไลต์กลับขั้วได้ถ้าแรงดันไม่เกินพิกัด', options: TF }
                        ]
                    }
                ]
            },
            {
                id: 's5', title: 'ชุดที่ 5 อ่านจอออสซิลโลสโคป (เสริม)',
                parts: [
                    {
                        title: 'ตอนที่ 1 นับช่องบนจอ แล้วคูณด้วยค่าต่อช่องที่เขียนใต้จอ',
                        items: [
                            { id: 'o-1', type: 'num', scope: 'sine;12;50;5;5', q: 'ค่ายอด V<sub>p</sub>', unit: 'V', dp: 1 },
                            { id: 'o-2', type: 'num', scope: 'sine;3;1000;1;0.2', q: 'ความถี่', unit: 'Hz', dp: 0 },
                            { id: 'o-3', type: 'num', scope: 'half;15;50;5;5', q: 'ค่ายอด V<sub>p(out)</sub>', unit: 'V', dp: 1 },
                            { id: 'o-4', type: 'num', scope: 'full;8;100;2;2', q: 'ความถี่', unit: 'Hz', dp: 0 },
                            { id: 'o-5', type: 'num', scope: 'rip;1;100;0.2;2', q: 'แรงดันพลิ้ว V<sub>r(pp)</sub> (AC coupling)', unit: 'V', dp: 1 },
                            { id: 'o-6', type: 'num', scope: 'rip;0.4;50;0.1;5', q: 'ความถี่ของแรงดันพลิ้ว', unit: 'Hz', dp: 0 }
                        ]
                    },
                    {
                        title: 'ตอนที่ 2 ข้อความต่อไปนี้ถูกหรือผิด',
                        items: [
                            { id: 'ot-1', type: 'pick', q: 'วัดแรงดันพลิ้วควรตั้งออสซิลโลสโคปเป็น AC coupling', options: TF },
                            { id: 'ot-2', type: 'pick', q: 'ในวงจรบริดจ์ คีบกราวด์โพรบ 2 เส้นไว้คนละจุดได้', options: TF }
                        ]
                    }
                ]
            }
        ]
    };
})();
