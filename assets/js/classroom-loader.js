/* ===========================================
   โหลดระบบห้องเรียนสด (repo classroom) ตามลำดับ
   - บนเครื่อง (127.0.0.1) ใช้ /Classroom-live/ จากโฟลเดอร์ Lesson_slides
   - บน GitHub Pages ใช้ https://krutaopoon-prog.github.io/classroom/
   - <script src="../assets/js/classroom-loader.js" data-parts="identity,live"></script>
   ถ้าโหลดไม่ได้ (ไม่มีเน็ต) หน้าเว็บยังทำงานแบบเดิมทุกอย่าง
   =========================================== */
(function () {
    const me = document.currentScript;
    const local = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
    const base = local ? '/Classroom-live/' : 'https://krutaopoon-prog.github.io/classroom/';
    const parts = (me.dataset.parts || 'identity').split(',').map(s => s.trim()).filter(Boolean);
    window.CLASSROOM_BASE = base;
    window.CLASSROOM_COURSE = me.dataset.course || '';
    const urls = ['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js', base + 'config.js']
        .concat(parts.map(p => base + p + '.js' + (local ? '?v=' + Date.now() : '')));
    urls.forEach(src => {
        const s = document.createElement('script');
        s.src = src; s.async = false;
        document.head.appendChild(s);
    });
})();
