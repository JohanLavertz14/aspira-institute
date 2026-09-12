/**
 * ข้อมูลตัวอย่าง (mock) สำหรับเว็บไซต์ Aspira Institute
 * รันด้วย: npm run db:seed
 *
 * ข้อมูลทั้งหมดในไฟล์นี้เป็นข้อมูลสมมติไว้ให้ระบบมีของแสดงผล
 * เมื่อได้ข้อมูลจริงแล้วสามารถลบทิ้งหรือแก้ทับได้เลย
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
});
const prisma = new PrismaClient({ adapter });

type LessonSeed = {
  title: string;
  description?: string;
  videoId: string;
  durationMin: number;
  isPreview?: boolean;
  sheet?: string;
  quiz?: {
    title: string;
    questions: {
      text: string;
      explanation?: string;
      choices: [string, boolean][];
    }[];
  };
};

type ChapterSeed = { title: string; summary?: string; lessons: LessonSeed[] };

type CourseSeed = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  subject: string;
  level: string;
  price: number;
  comparePrice?: number;
  accessDays: number;
  teacherName: string;
  teacherBio: string;
  totalHours: number;
  isPublished: boolean;
  isFeatured?: boolean;
  chapters: ChapterSeed[];
};

// รหัสวิดีโอตัวอย่างของ Vimeo ไว้ให้ player มีของเล่น
// เปลี่ยนเป็นรหัสวิดีโอจริงของสถาบันได้จากหลังบ้าน
const DEMO_VIDEOS = ['76979871', '148751763', '87110435', '119227450'];
const video = (i: number) => DEMO_VIDEOS[i % DEMO_VIDEOS.length];

const SUBJECTS = [
  { name: 'คณิตศาสตร์', slug: 'math', colorHex: '#e11d56', iconKey: 'sigma', order: 1, description: 'ปูพื้นฐานถึงตะลุยโจทย์สนามสอบ' },
  { name: 'เคมี', slug: 'chemistry', colorHex: '#7c3aed', iconKey: 'flask', order: 2, description: 'เข้าใจหลักการ ไม่ต้องท่องอย่างเดียว' },
  { name: 'ฟิสิกส์', slug: 'physics', colorHex: '#0ea5e9', iconKey: 'atom', order: 3, description: 'มองเห็นภาพก่อน แล้วค่อยลงสมการ' },
  { name: 'ชีววิทยา', slug: 'biology', colorHex: '#16a34a', iconKey: 'leaf', order: 4, description: 'สรุปครบ จำง่าย ใช้สอบได้' },
  { name: 'ภาษาไทย', slug: 'thai', colorHex: '#f59e0b', iconKey: 'book', order: 5, description: 'หลักภาษาและวรรณคดีแบบเข้าใจจริง' },
  { name: 'ภาษาอังกฤษ', slug: 'english', colorHex: '#0891b2', iconKey: 'globe', order: 6, description: 'แกรมมาร์ คำศัพท์ และการอ่านจับใจความ' },
];

const COURSES: CourseSeed[] = [
  {
    slug: 'math-m4-term1',
    title: 'คณิตศาสตร์ ม.4 เทอม 1',
    subtitle: 'เซต ตรรกศาสตร์ และจำนวนจริง',
    description:
      'คอร์สปูพื้นฐานคณิตศาสตร์ ม.4 เทอม 1 ครบทุกหัวข้อตามหลักสูตร สอนจากนิยามไปจนถึงโจทย์ระดับสอบเข้ามหาวิทยาลัย พร้อมชีทสรุปและแบบฝึกท้ายบททุกบท เหมาะกับนักเรียนที่เพิ่งขึ้น ม.4 และอยากวางรากฐานให้แน่นก่อนเนื้อหาที่ยากขึ้นในเทอมถัดไป',
    subject: 'math',
    level: 'ม.ปลาย',
    price: 2900,
    comparePrice: 3500,
    accessDays: 180,
    teacherName: 'ครูพี่วิน',
    teacherBio: 'ประสบการณ์สอนคณิตศาสตร์ระดับมัธยมปลายกว่า 10 ปี เน้นความเข้าใจมากกว่าการท่องสูตร',
    totalHours: 18,
    isPublished: true,
    isFeatured: true,
    chapters: [
      {
        title: 'บทที่ 1 เซต',
        summary: 'นิยามของเซต การดำเนินการ และการแก้โจทย์ด้วยแผนภาพเวนน์',
        lessons: [
          {
            title: 'ความหมายของเซตและการเขียนเซต',
            description: 'รู้จักเซต สมาชิกของเซต การเขียนแบบแจกแจงสมาชิกและแบบบอกเงื่อนไข',
            videoId: video(0),
            durationMin: 32,
            isPreview: true,
            sheet: 'ชีทสรุป บทที่ 1 เซต',
            quiz: {
              title: 'แบบทดสอบท้ายบท เซตเบื้องต้น',
              questions: [
                {
                  text: 'ข้อใดคือจำนวนสมาชิกของเซต A = {1, 2, 2, 3, 3, 3}',
                  explanation: 'สมาชิกที่ซ้ำกันนับเพียงครั้งเดียว เซตนี้จึงมีสมาชิกคือ 1, 2, 3 รวม 3 ตัว',
                  choices: [
                    ['3', true],
                    ['6', false],
                    ['2', false],
                    ['1', false],
                  ],
                },
                {
                  text: 'เซตว่างเขียนแทนด้วยสัญลักษณ์ใด',
                  explanation: 'เซตว่างเขียนแทนด้วย ∅ หรือ { } แต่ไม่ใช่ {∅} ซึ่งมีสมาชิก 1 ตัว',
                  choices: [
                    ['∅', true],
                    ['{∅}', false],
                    ['0', false],
                    ['U', false],
                  ],
                },
                {
                  text: 'ถ้า A = {1, 2, 3} แล้วเซตกำลังของ A มีสมาชิกกี่ตัว',
                  explanation: 'เซตกำลังของเซตที่มีสมาชิก n ตัว มีสมาชิก 2^n ตัว ในที่นี้คือ 2^3 = 8',
                  choices: [
                    ['8', true],
                    ['6', false],
                    ['3', false],
                    ['9', false],
                  ],
                },
              ],
            },
          },
          {
            title: 'ยูเนียน อินเตอร์เซกชัน และคอมพลีเมนต์',
            description: 'การดำเนินการระหว่างเซตและสมบัติที่ใช้บ่อยในการทำโจทย์',
            videoId: video(1),
            durationMin: 41,
          },
          {
            title: 'โจทย์ประยุกต์ด้วยแผนภาพเวนน์',
            description: 'เทคนิคแปลงโจทย์คำอธิบายยาวให้เป็นแผนภาพภายใน 1 นาที',
            videoId: video(2),
            durationMin: 46,
            sheet: 'แบบฝึกหัด โจทย์เวนน์ 25 ข้อ',
          },
        ],
      },
      {
        title: 'บทที่ 2 ตรรกศาสตร์เบื้องต้น',
        summary: 'ประพจน์ ตัวเชื่อม สัจนิรันดร์ และการอ้างเหตุผล',
        lessons: [
          {
            title: 'ประพจน์และตัวเชื่อมทางตรรกศาสตร์',
            videoId: video(3),
            durationMin: 38,
            sheet: 'ตารางค่าความจริง สรุป 1 หน้า',
          },
          {
            title: 'สัจนิรันดร์และการตรวจสอบ',
            videoId: video(0),
            durationMin: 35,
            quiz: {
              title: 'แบบทดสอบ ตรรกศาสตร์',
              questions: [
                {
                  text: 'ประพจน์ p ∨ ~p มีค่าความจริงเป็นอย่างไร',
                  explanation: 'ไม่ว่า p จะจริงหรือเท็จ ประพจน์นี้เป็นจริงเสมอ จึงเป็นสัจนิรันดร์',
                  choices: [
                    ['จริงเสมอ (สัจนิรันดร์)', true],
                    ['เท็จเสมอ', false],
                    ['ขึ้นกับค่าของ p', false],
                    ['หาค่าไม่ได้', false],
                  ],
                },
                {
                  text: 'ข้อความใดเป็นนิเสธของ "นักเรียนทุกคนสอบผ่าน"',
                  explanation: 'นิเสธของ "ทุกคน" คือ "มีอย่างน้อยหนึ่งคนที่ไม่"',
                  choices: [
                    ['มีนักเรียนบางคนสอบไม่ผ่าน', true],
                    ['นักเรียนทุกคนสอบไม่ผ่าน', false],
                    ['ไม่มีนักเรียนสอบผ่าน', false],
                    ['นักเรียนบางคนสอบผ่าน', false],
                  ],
                },
              ],
            },
          },
        ],
      },
      {
        title: 'บทที่ 3 จำนวนจริง',
        summary: 'สมบัติของจำนวนจริง การแยกตัวประกอบ สมการและอสมการ',
        lessons: [
          { title: 'สมบัติของจำนวนจริงและการแยกตัวประกอบ', videoId: video(1), durationMin: 44, sheet: 'ชีทสรุป การแยกตัวประกอบ' },
          { title: 'สมการและอสมการค่าสัมบูรณ์', videoId: video(2), durationMin: 39 },
        ],
      },
    ],
  },
  {
    slug: 'math-m5-full',
    title: 'คณิตศาสตร์ ม.5 ครบทั้งปี',
    subtitle: 'ฟังก์ชัน ตรีโกณมิติ เมทริกซ์ และเวกเตอร์',
    description:
      'รวมเนื้อหาคณิตศาสตร์ ม.5 ทั้งปีไว้ในคอร์สเดียว เริ่มจากฟังก์ชันเอกซ์โพเนนเชียลและลอการิทึม ต่อด้วยตรีโกณมิติ เมทริกซ์ และเวกเตอร์ สอนพร้อมโจทย์แนวข้อสอบ A-Level ทุกหัวข้อ',
    subject: 'math',
    level: 'ม.ปลาย',
    price: 3200,
    comparePrice: 3900,
    accessDays: 365,
    teacherName: 'ครูพี่วิน',
    teacherBio: 'ประสบการณ์สอนคณิตศาสตร์ระดับมัธยมปลายกว่า 10 ปี',
    totalHours: 26,
    isPublished: true,
    isFeatured: true,
    chapters: [
      {
        title: 'บทที่ 1 ฟังก์ชันเอกซ์โพเนนเชียลและลอการิทึม',
        lessons: [
          { title: 'กราฟและสมบัติของฟังก์ชันเอกซ์โพเนนเชียล', videoId: video(0), durationMin: 40, isPreview: true },
          { title: 'สมบัติของลอการิทึมและการแก้สมการ', videoId: video(1), durationMin: 48, sheet: 'สรุปสมบัติลอการิทึม' },
        ],
      },
      {
        title: 'บทที่ 2 ตรีโกณมิติ',
        lessons: [
          { title: 'ฟังก์ชันตรีโกณมิติและวงกลมหนึ่งหน่วย', videoId: video(2), durationMin: 45 },
          { title: 'เอกลักษณ์และสมการตรีโกณมิติ', videoId: video(3), durationMin: 52 },
          { title: 'กฎของไซน์และโคไซน์', videoId: video(0), durationMin: 37, sheet: 'แบบฝึกหัด ตรีโกณ 30 ข้อ' },
        ],
      },
      {
        title: 'บทที่ 3 เมทริกซ์และเวกเตอร์',
        lessons: [
          { title: 'การดำเนินการของเมทริกซ์และดีเทอร์มิแนนต์', videoId: video(1), durationMin: 43 },
          { title: 'เวกเตอร์ในสามมิติและผลคูณเชิงสเกลาร์', videoId: video(2), durationMin: 41 },
        ],
      },
    ],
  },
  {
    slug: 'math-alevel-intensive',
    title: 'ตะลุยโจทย์คณิตศาสตร์ A-Level',
    subtitle: 'สรุปเนื้อหา ม.ปลาย ทั้งหมด พร้อมข้อสอบ 500 ข้อ',
    description:
      'คอร์สเข้มข้นสำหรับ ม.6 และเด็กซิ่ว สรุปเนื้อหา ม.4 ถึง ม.6 แบบกระชับ แล้วลุยข้อสอบเก่าและข้อสอบแนวใหม่กว่า 500 ข้อ พร้อมเทคนิคจับเวลาและการเลือกข้อที่ควรทำก่อน',
    subject: 'math',
    level: 'ม.ปลาย',
    price: 3500,
    comparePrice: 4500,
    accessDays: 240,
    teacherName: 'ครูพี่วิน',
    teacherBio: 'ออกแบบคอร์สจากสถิติข้อสอบย้อนหลัง 10 ปี',
    totalHours: 32,
    isPublished: true,
    isFeatured: true,
    chapters: [
      {
        title: 'ส่วนที่ 1 สรุปเนื้อหาแบบเร่งรัด',
        lessons: [
          { title: 'สรุปพีชคณิตและฟังก์ชัน', videoId: video(3), durationMin: 55, isPreview: true, sheet: 'สรุปสูตรคณิต ม.ปลาย 20 หน้า' },
          { title: 'สรุปเรขาคณิตวิเคราะห์และตรีโกณ', videoId: video(0), durationMin: 50 },
          { title: 'สรุปสถิติและความน่าจะเป็น', videoId: video(1), durationMin: 47 },
        ],
      },
      {
        title: 'ส่วนที่ 2 ตะลุยโจทย์ตามหัวข้อ',
        lessons: [
          { title: 'โจทย์ชุดที่ 1 พีชคณิตและจำนวนจริง', videoId: video(2), durationMin: 60 },
          {
            title: 'โจทย์ชุดที่ 2 แคลคูลัสเบื้องต้น',
            videoId: video(3),
            durationMin: 58,
            quiz: {
              title: 'แบบทดสอบ แคลคูลัสเบื้องต้น',
              questions: [
                {
                  text: 'อนุพันธ์ของ f(x) = 3x² + 5x คือข้อใด',
                  explanation: 'ใช้กฎยกกำลัง d/dx(xⁿ) = n·xⁿ⁻¹ ได้ 6x + 5',
                  choices: [
                    ['6x + 5', true],
                    ['3x + 5', false],
                    ['6x² + 5x', false],
                    ['x³ + x²', false],
                  ],
                },
                {
                  text: 'ค่าของ lim(x→2) (x² - 4)/(x - 2) เท่ากับเท่าใด',
                  explanation: 'แยกตัวประกอบเป็น (x-2)(x+2)/(x-2) = x+2 แทน x = 2 ได้ 4',
                  choices: [
                    ['4', true],
                    ['0', false],
                    ['2', false],
                    ['หาค่าไม่ได้', false],
                  ],
                },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    slug: 'chem-m4-foundation',
    title: 'เคมี ม.4 ปูพื้นฐาน',
    subtitle: 'อะตอม ตารางธาตุ พันธะเคมี และปริมาณสัมพันธ์',
    description:
      'คอร์สเคมีสำหรับผู้เริ่มต้น อธิบายตั้งแต่โครงสร้างอะตอมจนถึงการคำนวณปริมาณสัมพันธ์ เน้นให้เห็นภาพก่อนคำนวณ พร้อมชีทสรุปตารางธาตุและแบบฝึกหัดคำนวณโมลแบบเป็นขั้นตอน',
    subject: 'chemistry',
    level: 'ม.ปลาย',
    price: 3000,
    comparePrice: 3600,
    accessDays: 180,
    teacherName: 'ครูพี่เคม',
    teacherBio: 'สอนเคมีระดับมัธยมปลายและติวสอบเข้าคณะสายวิทย์-สุขภาพ',
    totalHours: 20,
    isPublished: true,
    isFeatured: true,
    chapters: [
      {
        title: 'บทที่ 1 อะตอมและตารางธาตุ',
        lessons: [
          { title: 'โครงสร้างอะตอมและการจัดเรียงอิเล็กตรอน', videoId: video(0), durationMin: 36, isPreview: true, sheet: 'ชีทสรุป โครงสร้างอะตอม' },
          {
            title: 'แนวโน้มตามตารางธาตุ',
            videoId: video(1),
            durationMin: 33,
            quiz: {
              title: 'แบบทดสอบ ตารางธาตุ',
              questions: [
                {
                  text: 'ธาตุในหมู่เดียวกันมีสิ่งใดเหมือนกัน',
                  explanation: 'ธาตุหมู่เดียวกันมีจำนวนเวเลนซ์อิเล็กตรอนเท่ากัน จึงมีสมบัติทางเคมีคล้ายกัน',
                  choices: [
                    ['จำนวนเวเลนซ์อิเล็กตรอน', true],
                    ['จำนวนโปรตอน', false],
                    ['มวลอะตอม', false],
                    ['จำนวนระดับพลังงาน', false],
                  ],
                },
                {
                  text: 'เมื่อเลื่อนจากซ้ายไปขวาในคาบเดียวกัน ขนาดอะตอมมีแนวโน้มอย่างไร',
                  explanation: 'ประจุในนิวเคลียสเพิ่มขึ้นแต่ระดับพลังงานเท่าเดิม แรงดึงดูดจึงมากขึ้น ขนาดอะตอมเล็กลง',
                  choices: [
                    ['เล็กลง', true],
                    ['ใหญ่ขึ้น', false],
                    ['เท่าเดิม', false],
                    ['ไม่มีแนวโน้มแน่นอน', false],
                  ],
                },
              ],
            },
          },
        ],
      },
      {
        title: 'บทที่ 2 พันธะเคมี',
        lessons: [
          { title: 'พันธะไอออนิกและพันธะโคเวเลนต์', videoId: video(2), durationMin: 42, sheet: 'ชีทสรุป พันธะเคมี' },
          { title: 'รูปร่างโมเลกุลและสภาพขั้ว', videoId: video(3), durationMin: 38 },
        ],
      },
      {
        title: 'บทที่ 3 ปริมาณสัมพันธ์',
        lessons: [
          { title: 'มวลอะตอม มวลโมเลกุล และโมล', videoId: video(0), durationMin: 45 },
          { title: 'การคำนวณจากสมการเคมี', videoId: video(1), durationMin: 50, sheet: 'แบบฝึกหัด ปริมาณสัมพันธ์ 40 ข้อ' },
        ],
      },
    ],
  },
  {
    slug: 'chem-m5-reaction',
    title: 'เคมี ม.5 สมดุลและกรด-เบส',
    subtitle: 'แก๊ส อัตราการเกิดปฏิกิริยา สมดุลเคมี กรด-เบส',
    description:
      'ต่อยอดจากพื้นฐาน ม.4 ไปสู่หัวข้อที่ออกสอบหนักที่สุดของ ม.5 อธิบายสมดุลเคมีและกรด-เบสด้วยภาพและกราฟ พร้อมสรุปสูตรคำนวณ pH ที่ใช้ได้จริงในห้องสอบ',
    subject: 'chemistry',
    level: 'ม.ปลาย',
    price: 3200,
    accessDays: 180,
    teacherName: 'ครูพี่เคม',
    teacherBio: 'สอนเคมีระดับมัธยมปลายและติวสอบเข้าคณะสายวิทย์-สุขภาพ',
    totalHours: 22,
    isPublished: true,
    chapters: [
      {
        title: 'บทที่ 1 แก๊สและสมบัติของแก๊ส',
        lessons: [
          { title: 'กฎของแก๊สและสมการแก๊สอุดมคติ', videoId: video(2), durationMin: 40, isPreview: true },
          { title: 'ทฤษฎีจลน์และการแพร่ของแก๊ส', videoId: video(3), durationMin: 34 },
        ],
      },
      {
        title: 'บทที่ 2 อัตราการเกิดปฏิกิริยาและสมดุลเคมี',
        lessons: [
          { title: 'ปัจจัยที่มีผลต่ออัตราการเกิดปฏิกิริยา', videoId: video(0), durationMin: 37 },
          { title: 'ค่าคงที่สมดุลและหลักของเลอชาเตอลิเอ', videoId: video(1), durationMin: 46, sheet: 'ชีทสรุป สมดุลเคมี' },
        ],
      },
      {
        title: 'บทที่ 3 กรด-เบส',
        lessons: [
          { title: 'ทฤษฎีกรด-เบสและการคำนวณ pH', videoId: video(2), durationMin: 48 },
          { title: 'การไทเทรตและสารละลายบัฟเฟอร์', videoId: video(3), durationMin: 44, sheet: 'แบบฝึกหัด กรด-เบส' },
        ],
      },
    ],
  },
  {
    slug: 'chem-alevel-intensive',
    title: 'ตะลุยโจทย์เคมี A-Level',
    subtitle: 'สรุปเนื้อหา ม.ปลาย และข้อสอบเก่า 10 ปี',
    description:
      'คอร์สติวเข้มสำหรับสนามสอบ A-Level เคมี สรุปเนื้อหาทั้งหมดแบบกระชับพร้อมเจาะข้อสอบเก่าย้อนหลัง 10 ปี แยกตามหัวข้อและระดับความยาก',
    subject: 'chemistry',
    level: 'ม.ปลาย',
    price: 3500,
    comparePrice: 4200,
    accessDays: 240,
    teacherName: 'ครูพี่เคม',
    teacherBio: 'สอนเคมีระดับมัธยมปลายและติวสอบเข้าคณะสายวิทย์-สุขภาพ',
    totalHours: 28,
    isPublished: true,
    chapters: [
      {
        title: 'ส่วนที่ 1 สรุปเนื้อหาเร่งรัด',
        lessons: [
          { title: 'สรุปเคมีพื้นฐานและปริมาณสัมพันธ์', videoId: video(0), durationMin: 52, isPreview: true, sheet: 'สรุปสูตรเคมี ม.ปลาย' },
          { title: 'สรุปเคมีอินทรีย์และพอลิเมอร์', videoId: video(1), durationMin: 49 },
        ],
      },
      {
        title: 'ส่วนที่ 2 ตะลุยข้อสอบ',
        lessons: [
          { title: 'ข้อสอบชุดที่ 1 พร้อมเฉลยละเอียด', videoId: video(2), durationMin: 62 },
          { title: 'ข้อสอบชุดที่ 2 พร้อมเฉลยละเอียด', videoId: video(3), durationMin: 58 },
        ],
      },
    ],
  },
  {
    slug: 'thai-m3-language',
    title: 'ภาษาไทย ม.3 หลักภาษาและวรรณคดี',
    subtitle: 'ครบทั้งหลักภาษา การอ่าน และวรรณคดีตามหลักสูตร',
    description:
      'คอร์สภาษาไทยสำหรับ ม.3 ครอบคลุมหลักภาษา คำสมาส คำสนธิ ชนิดของประโยค การอ่านจับใจความ และวรรณคดีที่ออกสอบบ่อย พร้อมชีทสรุปและข้อสอบท้ายบท',
    subject: 'thai',
    level: 'ม.ต้น',
    price: 1900,
    comparePrice: 2400,
    accessDays: 150,
    teacherName: 'ครูพี่ใบตอง',
    teacherBio: 'สอนภาษาไทยระดับมัธยมและออกข้อสอบให้สถาบันกวดวิชา',
    totalHours: 14,
    isPublished: true,
    chapters: [
      {
        title: 'บทที่ 1 หลักภาษา',
        lessons: [
          { title: 'คำสมาสและคำสนธิ', videoId: video(1), durationMin: 30, isPreview: true, sheet: 'ชีทสรุป คำสมาส คำสนธิ' },
          {
            title: 'ชนิดของประโยคและส่วนประกอบ',
            videoId: video(2),
            durationMin: 33,
            quiz: {
              title: 'แบบทดสอบ หลักภาษา',
              questions: [
                {
                  text: 'ข้อใดเป็นคำสมาสที่มีการสนธิ',
                  explanation: 'คำว่า "วิทยาลัย" มาจาก วิทยา + อาลัย ซึ่งมีการกลมกลืนเสียงสระ จึงเป็นคำสมาสแบบสนธิ',
                  choices: [
                    ['วิทยาลัย', true],
                    ['ราชการ', false],
                    ['พลเมือง', false],
                    ['ครุภัณฑ์', false],
                  ],
                },
                {
                  text: 'ประโยคใดเป็นประโยคความรวม',
                  explanation: 'ประโยคความรวมมีใจความสำคัญตั้งแต่สองใจความเชื่อมด้วยคำเชื่อม เช่น และ แต่ หรือ',
                  choices: [
                    ['เขาอ่านหนังสือและน้องดูโทรทัศน์', true],
                    ['เขาอ่านหนังสืออยู่ในห้อง', false],
                    ['หนังสือเล่มนี้หนามาก', false],
                    ['น้องกำลังนอนหลับ', false],
                  ],
                },
              ],
            },
          },
        ],
      },
      {
        title: 'บทที่ 2 วรรณคดีและการอ่าน',
        lessons: [
          { title: 'การอ่านจับใจความและตีความ', videoId: video(3), durationMin: 28 },
          { title: 'วรรณคดีที่ออกสอบบ่อย', videoId: video(0), durationMin: 35, sheet: 'สรุปวรรณคดี ม.3' },
        ],
      },
    ],
  },
  {
    slug: 'physics-m4-mechanics',
    title: 'ฟิสิกส์ ม.4 กลศาสตร์',
    subtitle: 'การเคลื่อนที่ แรง และกฎของนิวตัน',
    description:
      'คอร์สนี้อยู่ระหว่างเตรียมเนื้อหา ยังไม่เปิดขาย ใช้เป็นตัวอย่างของคอร์สที่บันทึกไว้ในระบบแต่ยังไม่เผยแพร่',
    subject: 'physics',
    level: 'ม.ปลาย',
    price: 3000,
    accessDays: 180,
    teacherName: 'ครูพี่ฟิสิกส์',
    teacherBio: 'อยู่ระหว่างเตรียมเปิดคอร์ส',
    totalHours: 0,
    isPublished: false,
    chapters: [
      {
        title: 'บทที่ 1 การเคลื่อนที่แนวตรง',
        lessons: [{ title: 'ปริมาณสเกลาร์และเวกเตอร์', videoId: video(0), durationMin: 30 }],
      },
    ],
  },
];

async function main() {
  console.log('เริ่ม seed ข้อมูลตัวอย่าง...');

  // ล้างข้อมูลเดิม
  await prisma.comment.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.choice.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.course.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();
  await prisma.siteSetting.deleteMany();

  // ตั้งค่าเว็บ (เว้นช่องโลโก้และข้อมูลติดต่อไว้ให้กรอกเองภายหลัง)
  await prisma.siteSetting.create({
    data: {
      id: 'singleton',
      siteName: 'Aspira Institute',
      tagline: 'เรียนออนไลน์กับติวเตอร์ตัวจริง ทบทวนซ้ำได้ทุกที่ทุกเวลา',
      logoUrl: null,
      aboutText:
        'Aspira Institute เป็นสถาบันกวดวิชาที่ออกแบบคอร์สจากห้องเรียนจริง ทุกคอร์สมีชีทสรุป แบบฝึกหัด และแบบทดสอบท้ายบท เพื่อให้นักเรียนวัดผลตัวเองได้ทันทีหลังเรียนจบ',
      contactPhone: '',
      contactEmail: '',
      contactLine: '',
      contactAddress: '',
      facebookUrl: '',
      bankName: 'ธนาคารตัวอย่าง',
      bankBranch: '',
      bankAccountNo: '000-0-00000-0',
      bankAccountName: 'บริษัท แอสไปรา จำกัด',
      promptpayId: '0000000000',
      promptpayQrUrl: null,
      cardEnabled: false,
    },
  });

  // ผู้ใช้
  const adminPassword = await bcrypt.hash('admin1234', 10);
  const studentPassword = await bcrypt.hash('student1234', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@aspira.ac.th',
      passwordHash: adminPassword,
      name: 'ผู้ดูแลระบบ',
      role: 'ADMIN',
      phone: '',
    },
  });

  const students = await Promise.all(
    [
      { email: 'student@example.com', name: 'ณิชา ใจดี', gradeLevel: 'ม.5', school: 'โรงเรียนตัวอย่างวิทยา' },
      { email: 'somchai@example.com', name: 'สมชาย รักเรียน', gradeLevel: 'ม.6', school: 'โรงเรียนสาธิตตัวอย่าง' },
      { email: 'pimploy@example.com', name: 'พิมพลอย ตั้งใจ', gradeLevel: 'ม.4', school: 'โรงเรียนเตรียมตัวอย่าง' },
    ].map((s) =>
      prisma.user.create({
        data: { ...s, passwordHash: studentPassword, role: 'STUDENT', phone: '' },
      }),
    ),
  );

  // วิชา
  const subjectMap = new Map<string, string>();
  for (const s of SUBJECTS) {
    const created = await prisma.subject.create({ data: s });
    subjectMap.set(s.slug, created.id);
  }

  // คอร์ส บท บทเรียน ชีท และแบบทดสอบ
  const courseIdBySlug = new Map<string, string>();
  const firstLessonIds: string[] = [];

  for (const [courseIndex, c] of COURSES.entries()) {
    const course = await prisma.course.create({
      data: {
        slug: c.slug,
        title: c.title,
        subtitle: c.subtitle,
        description: c.description,
        subjectId: subjectMap.get(c.subject)!,
        level: c.level,
        price: c.price,
        comparePrice: c.comparePrice ?? null,
        accessDays: c.accessDays,
        coverImage: null,
        teacherName: c.teacherName,
        teacherBio: c.teacherBio,
        totalHours: c.totalHours,
        isPublished: c.isPublished,
        isFeatured: c.isFeatured ?? false,
        order: courseIndex,
      },
    });
    courseIdBySlug.set(c.slug, course.id);

    for (const [chapterIndex, ch] of c.chapters.entries()) {
      const chapter = await prisma.chapter.create({
        data: {
          courseId: course.id,
          title: ch.title,
          summary: ch.summary ?? null,
          order: chapterIndex,
        },
      });

      for (const [lessonIndex, l] of ch.lessons.entries()) {
        const lesson = await prisma.lesson.create({
          data: {
            chapterId: chapter.id,
            title: l.title,
            description: l.description ?? null,
            videoProvider: 'VIMEO',
            videoId: l.videoId,
            durationMin: l.durationMin,
            isPreview: l.isPreview ?? false,
            order: lessonIndex,
          },
        });

        if (chapterIndex === 0 && lessonIndex === 0) firstLessonIds.push(lesson.id);

        if (l.sheet) {
          await prisma.attachment.create({
            data: {
              lessonId: lesson.id,
              title: l.sheet,
              // ไฟล์ตัวอย่าง เปลี่ยนเป็นไฟล์จริงได้จากหลังบ้าน
              fileUrl: '/uploads/sheets/ตัวอย่างชีท.pdf',
              fileType: 'PDF',
              sizeLabel: '1.2 MB',
            },
          });
        }

        if (l.quiz) {
          const quiz = await prisma.quiz.create({
            data: {
              lessonId: lesson.id,
              title: l.quiz.title,
              description: 'ทำแบบทดสอบเพื่อเช็คความเข้าใจก่อนไปบทถัดไป',
              passScore: 60,
            },
          });
          for (const [qi, q] of l.quiz.questions.entries()) {
            const question = await prisma.question.create({
              data: {
                quizId: quiz.id,
                text: q.text,
                explanation: q.explanation ?? null,
                order: qi,
              },
            });
            for (const [ci, [text, isCorrect]] of q.choices.entries()) {
              await prisma.choice.create({
                data: { questionId: question.id, text, isCorrect, order: ci },
              });
            }
          }
        }
      }
    }
  }

  // คำสั่งซื้อและการชำระเงินตัวอย่าง
  const mathM5 = courseIdBySlug.get('math-m5-full')!;
  const chemM4 = courseIdBySlug.get('chem-m4-foundation')!;
  const mathAlevel = courseIdBySlug.get('math-alevel-intensive')!;

  // 1) คำสั่งซื้อที่อนุมัติแล้ว พร้อมสิทธิ์เรียน
  const paidOrder = await prisma.order.create({
    data: {
      code: 'ASP-260901-1001',
      userId: students[0].id,
      courseId: mathM5,
      amount: 3200,
      status: 'PAID',
      method: 'BANK_TRANSFER',
    },
  });
  await prisma.payment.create({
    data: {
      orderId: paidOrder.id,
      amount: 3200,
      slipUrl: null,
      paidAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      payerNote: 'โอนจากแอปธนาคาร',
      status: 'APPROVED',
      reviewedById: admin.id,
      reviewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.enrollment.create({
    data: {
      userId: students[0].id,
      courseId: mathM5,
      orderId: paidOrder.id,
      startsAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 358 * 24 * 60 * 60 * 1000),
    },
  });

  // 2) คำสั่งซื้อที่แจ้งชำระแล้วรอแอดมินตรวจสอบ
  const waitingOrder = await prisma.order.create({
    data: {
      code: 'ASP-260908-1002',
      userId: students[1].id,
      courseId: chemM4,
      amount: 3000,
      status: 'WAITING_REVIEW',
      method: 'PROMPTPAY',
    },
  });
  await prisma.payment.create({
    data: {
      orderId: waitingOrder.id,
      amount: 3000,
      slipUrl: null,
      paidAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
      payerNote: 'โอนพร้อมเพย์เวลา 20:15 น.',
      status: 'PENDING',
    },
  });

  // 3) คำสั่งซื้อที่ยังไม่ชำระ
  await prisma.order.create({
    data: {
      code: 'ASP-260909-1003',
      userId: students[2].id,
      courseId: mathAlevel,
      amount: 3500,
      status: 'PENDING',
      method: 'BANK_TRANSFER',
    },
  });

  // ความคืบหน้าการเรียนตัวอย่าง
  const mathM5Lessons = await prisma.lesson.findMany({
    where: { chapter: { courseId: mathM5 } },
    orderBy: [{ chapter: { order: 'asc' } }, { order: 'asc' }],
  });
  for (const [i, lesson] of mathM5Lessons.entries()) {
    if (i > 2) break;
    await prisma.lessonProgress.create({
      data: {
        userId: students[0].id,
        lessonId: lesson.id,
        completed: true,
        secondsWatched: lesson.durationMin * 60,
        lastViewedAt: new Date(Date.now() - (3 - i) * 24 * 60 * 60 * 1000),
      },
    });
  }

  // คอมเมนต์ตัวอย่างใต้คลิป
  if (mathM5Lessons[0]) {
    const q = await prisma.comment.create({
      data: {
        lessonId: mathM5Lessons[0].id,
        userId: students[0].id,
        body: 'ตรงนาทีที่ 12 ที่ครูย้ายฐานลอการิทึม อยากให้อธิบายอีกรอบได้ไหมคะ',
      },
    });
    await prisma.comment.create({
      data: {
        lessonId: mathM5Lessons[0].id,
        userId: admin.id,
        parentId: q.id,
        body: 'ได้เลยครับ สูตรเปลี่ยนฐานคือ log_a(b) = log_c(b)/log_c(a) เดี๋ยวครูอัดคลิปเสริมเพิ่มให้ในบทนี้ครับ',
      },
    });
  }

  console.log('seed เสร็จแล้ว');
  console.log('  แอดมิน   : admin@aspira.ac.th / admin1234');
  console.log('  นักเรียน : student@example.com / student1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
