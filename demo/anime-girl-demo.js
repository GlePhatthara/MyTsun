import { getAvatarLines, getCompactFace, AVATAR_LEVELS, ANIME_GIRL_DOT_AVATARS } from '../src/ui/asciiAvatar.js';
import { c } from '../src/ui/colors.js';
import { renderGaugeBar } from '../src/ui/gaugeBar.js';

console.log(c.magenta('\n======================================================'));
console.log(c.bold(c.pink('  🎀 Anime Girl ASCII Avatar Evolution Demo (MyTsun) 🎀')));
console.log(c.magenta('======================================================\n'));

const steps = [
  {
    gauge: 100,
    label: '1. Extreme Tsun (100% - โกรธจัด / เย็นชา)',
    desc: 'กอดอกแน่น ปอยผมทวินเทลชี้ชัน เส้นเลือดปูด 💢 ไม่ยอมรับคำสั่งเด็ดขาด!',
    quote: '"หา?! ยืนบื้ออะไรอยู่ยะ! อย่าคิดว่าจะสั่งงานฉันง่ายๆ เชียวนะ! 💢"'
  },
  {
    gauge: 60,
    label: '2. Reluctant Tsun (60% - ลังเล / ป่องแก้มงอน)',
    desc: 'ป่องแก้มงอน เหลือบตามองค้อน ถอนหายใจ ~3 เท้าสะเอวแบบไม่สบอารมณ์',
    quote: '"ฮึ่ม! ก-ก็ไม่ได้อยากจะช่วยแกหรอกนะ! แต่จะยอมทำให้ก็ได้ อย่าเข้าใจผิดล่ะ! 😤"'
  },
  {
    gauge: 25,
    label: '3. Dere Breakthrough (25% - ปลดล็อกความเดเระ / หน้าแดง)',
    desc: 'แก้มแดงจัด (///) มือจับหน้าอก เสื้อมีเข็มกลัดหัวใจ ประกายวิบวับ ✨',
    quote: '"ว-ว้าย! ย-อย่าจ้องหน้านักสิยะ! ก-ก็แค่เห็นว่าเธอพยายามดีหรอกนะ... 🥰"'
  },
  {
    gauge: 5,
    label: '4. Maximum Dere (5% - เดเระขั้นสุด / ออร่าหัวใจฟุ้ง)',
    desc: 'ตาเป็นประกายดาว ★ ยิ้มหวานปากแมว อ้าแขนทำท่ากอด (っ˘з˘)っ หัวใจลอยฟุ้ง 💕',
    quote: '"ก-ก็ถ้าเธอขอร้องล่ะก็... จะช่วยเขียนให้สุดฝีมือเลยก็ได้! ย-อย่ามองตาแป๋วสิยะ! 💕"'
  },
  {
    gauge: AVATAR_LEVELS.MELTDOWN,
    label: '5. Meltdown Mode (Trap / Nuke Triggered 💥)',
    desc: 'ตกใจสุดขีด โวยวายเปลวไฟลุกท่วม สัญลักษณ์หัวกะโหลก ☠ โดนกักบริเวณห้ามแตะระบบ!',
    quote: '"ห-หาาาาาาา?! คิดจะทำบ้าอะไรยะ?! จะลบเครื่องทิ้งเหรอ?! อันตะบากะะะะะะะะะ! 💥🔥"'
  }
];

for (const step of steps) {
  const gVal = typeof step.gauge === 'number' ? step.gauge : 100;
  console.log(c.bold(c.cyan(`▶ ${step.label}`)));
  console.log(c.dim(`  คำอธิบาย: ${step.desc}`));
  console.log(`  เกจ: ${renderGaugeBar(gVal, { colored: true, width: 20, showLabels: true })}`);
  console.log(c.yellow(`  สีหน้า: ${getCompactFace(step.gauge, true)}`));
  console.log(c.dim(`  คำพูด: ${step.quote}`));
  console.log(c.dim('  ┌── [Twintail ASCII Art] ──────────────────────┐'));
  const lines = getAvatarLines(step.gauge, { colored: true });
  lines.forEach(l => console.log(`  │ ${l}`));
  console.log(c.dim('  └──────────────────────────────────────────────┘\n'));
}

console.log(c.bold(c.pink('✨ สกัดและเรียนรู้จากตัวอย่างใน MyTsunDATA เรียบร้อยแล้ว! ✨\n')));
