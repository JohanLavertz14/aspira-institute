/**
 * คอร์สจริงคอร์สแรกของสถาบัน: Foundation for Chemistry
 * เคมีปรับพื้นฐานสำหรับนักเรียนที่กำลังขึ้น ม.4 สายวิทย์
 *
 * รันด้วย: npm run db:seed:chem
 *
 * สคริปต์นี้รันซ้ำได้ ทุกครั้งที่รันจะเขียนทับบท บทเรียน และแบบทดสอบของคอร์สนี้ใหม่ทั้งหมด
 * ตามข้อมูลในไฟล์นี้ ส่วนคอร์สอื่นและข้อมูลนักเรียนไม่ถูกแตะต้อง
 *
 * แก้เนื้อหาได้ที่ตัวแปร CHAPTERS ด้านล่าง หรือแก้ทีหลังในหลังบ้านก็ได้
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/* ------------------------------ ข้อมูลคอร์ส ------------------------------ */

const COURSE = {
  slug: 'foundation-chemistry',
  title: 'Foundation for Chemistry',
  subtitle: 'เคมีปรับพื้นฐาน สำหรับคนกำลังขึ้น ม.4 สายวิทย์',
  description: `คอร์สเคมีปรับพื้นฐานสำหรับนักเรียนที่กำลังขึ้น ม.4 สายวิทย์ และยังไม่เคยเรียนเคมีมาก่อน

คอร์สนี้ไม่ได้เน้นตะลุยโจทย์แข่งขัน แต่เน้นให้เข้าใจว่าเคมีกำลังพูดถึงอะไร ทำไมต้องคิดแบบนี้ และสูตรแต่ละสูตรมาจากไหน เริ่มจากทักษะคณิตที่ต้องใช้จริงในเคมี ไปจนถึงอะตอม ตารางธาตุ พันธะเคมี การเขียนสูตรและเรียกชื่อสาร โมล และการดุลสมการ

เมื่อเรียนจบ นักเรียนจะพร้อมเข้าห้องเรียนเคมี ม.4 เทอม 1 ได้โดยไม่ต้องกลับไปรื้อพื้นฐานใหม่ และอ่านตำราเคมีเองได้รู้เรื่อง`,
  subjectSlug: 'chemistry',
  level: 'ม.ปลาย',
  price: 2990,
  comparePrice: 3590,
  accessDays: 365,
  teacherName: 'ครูพี่เคม',
  teacherBio: 'สอนเคมีระดับมัธยมปลาย เน้นอธิบายที่มาของแนวคิดก่อนลงสูตร',
  totalHours: 16,
  isPublished: true,
  isFeatured: true,
  // เอกสารประกอบคอร์สทั้งเล่ม นักเรียนดาวน์โหลดได้ตั้งแต่ก่อนเริ่มเรียน
  materialTitle: 'ชีทเรียน Chemistry Foundation (ทั้งเล่ม)',
  materialUrl: '/uploads/sheets/chemistry-foundation.pdf',
};

type QuestionSeed = {
  text: string;
  explanation?: string;
  choices: [string, boolean][];
};

type LessonSeed = {
  title: string;
  description?: string;
  durationMin: number;
  isPreview?: boolean;
  videoId?: string;
  quiz?: { title: string; questions: QuestionSeed[] };
};

type ChapterSeed = { title: string; summary?: string; lessons: LessonSeed[] };

/* ------------------------- โครงบทและบทเรียน ------------------------- */

const CHAPTERS: ChapterSeed[] = [
  {
    title: 'บทที่ 0 เริ่มต้นกับเคมี',
    summary: 'รู้ว่าเคมีเรียนเรื่องอะไร และเตรียมทักษะคณิตที่ต้องใช้ให้พร้อม',
    lessons: [
      {
        title: 'คอร์สนี้เรียนอะไร และควรเรียนอย่างไร',
        description: 'แนะนำเส้นทางของคอร์ส วิธีใช้ชีทประกอบ และวิธีทำแบบทดสอบท้ายบทให้ได้ผล',
        durationMin: 12,
        isPreview: true,
      },
      {
        title: 'เคมีศึกษาเรื่องอะไร มองสสารแบบนักเคมี',
        description: 'สสารรอบตัวประกอบขึ้นจากอะไร ความแตกต่างของธาตุ สารประกอบ และสารผสม',
        durationMin: 28,
        isPreview: true,
      },
      {
        title: 'ทักษะคณิตที่ต้องใช้ในเคมี',
        description: 'เลขยกกำลัง สัญกรณ์วิทยาศาสตร์ การเทียบบัญญัติไตรยางศ์ และการหาความหนาแน่น',
        durationMin: 35,
        quiz: {
          title: 'แบบทดสอบ ทักษะคณิตสำหรับเคมี',
          questions: [
            {
              text: 'ค่า 0.0025 เขียนในรูปสัญกรณ์วิทยาศาสตร์ได้อย่างไร',
              explanation:
                'สัญกรณ์วิทยาศาสตร์ต้องมีเลขหน้าจุดทศนิยมเพียงหนึ่งตัว เลื่อนจุดไปขวา 3 ตำแหน่งจึงได้ 2.5 และเลขชี้กำลังเป็น -3',
              choices: [
                ['2.5 x 10^-3', true],
                ['25 x 10^-4', false],
                ['2.5 x 10^3', false],
                ['0.25 x 10^-2', false],
              ],
            },
            {
              text: 'ผลคูณของ (2.0 x 10^3) กับ (3.0 x 10^-5) มีค่าเท่าใด',
              explanation: 'คูณเลขหน้าได้ 2.0 x 3.0 = 6.0 แล้วบวกเลขชี้กำลัง 3 + (-5) = -2',
              choices: [
                ['6.0 x 10^-2', true],
                ['6.0 x 10^-15', false],
                ['5.0 x 10^-2', false],
                ['6.0 x 10^2', false],
              ],
            },
            {
              text: 'สารชิ้นหนึ่งมีมวล 2 กรัม และมีปริมาตร 4 ลูกบาศก์เซนติเมตร ความหนาแน่นเท่ากับเท่าใด',
              explanation: 'ความหนาแน่น = มวล หารด้วย ปริมาตร = 2 หารด้วย 4 = 0.5 กรัมต่อลูกบาศก์เซนติเมตร',
              choices: [
                ['0.5 g/cm^3', true],
                ['2 g/cm^3', false],
                ['8 g/cm^3', false],
                ['4 g/cm^3', false],
              ],
            },
          ],
        },
      },
    ],
  },
  {
    title: 'บทที่ 1 ทักษะปฏิบัติการและการวัด',
    summary: 'อุปกรณ์พื้นฐาน หน่วยวัด เลขนัยสำคัญ และการบันทึกผลอย่างถูกต้อง',
    lessons: [
      {
        title: 'อุปกรณ์พื้นฐานในห้องปฏิบัติการและความปลอดภัย',
        description: 'รู้จักอุปกรณ์ที่ใช้บ่อย วิธีอ่านค่า และข้อควรระวังในห้องแล็บ',
        durationMin: 24,
      },
      {
        title: 'หน่วยวัด การเปลี่ยนหน่วย และเลขนัยสำคัญ',
        description: 'หน่วย SI ที่ใช้ในเคมี เทคนิคเปลี่ยนหน่วยแบบไม่ต้องท่อง และกฎเลขนัยสำคัญ',
        durationMin: 32,
        quiz: {
          title: 'แบบทดสอบ หน่วยวัดและเลขนัยสำคัญ',
          questions: [
            {
              text: 'ค่า 0.04050 มีเลขนัยสำคัญกี่ตัว',
              explanation:
                'ศูนย์ที่นำหน้าไม่นับเป็นเลขนัยสำคัญ ส่วนศูนย์ที่อยู่ระหว่างตัวเลขและศูนย์ท้ายหลังจุดทศนิยมนับ จึงเหลือ 4, 0, 5, 0 รวม 4 ตัว',
              choices: [
                ['4 ตัว', true],
                ['3 ตัว', false],
                ['5 ตัว', false],
                ['6 ตัว', false],
              ],
            },
            {
              text: 'สารละลาย 250 มิลลิลิตร เท่ากับกี่ลิตร',
              explanation: '1 ลิตรเท่ากับ 1000 มิลลิลิตร ดังนั้น 250 หารด้วย 1000 ได้ 0.25 ลิตร',
              choices: [
                ['0.25 ลิตร', true],
                ['2.5 ลิตร', false],
                ['25 ลิตร', false],
                ['0.025 ลิตร', false],
              ],
            },
            {
              text: 'พื้นที่ของแผ่นโลหะกว้าง 2.5 เซนติเมตร ยาว 1.24 เซนติเมตร ควรตอบเท่าใดตามหลักเลขนัยสำคัญ',
              explanation:
                'ผลคูณได้ 3.1 ส่วนจำนวนเลขนัยสำคัญต้องยึดตามตัวที่น้อยที่สุด คือ 2.5 ซึ่งมี 2 ตัว จึงตอบ 3.1 ตารางเซนติเมตร',
              choices: [
                ['3.1 ตารางเซนติเมตร', true],
                ['3.10 ตารางเซนติเมตร', false],
                ['3.100 ตารางเซนติเมตร', false],
                ['3 ตารางเซนติเมตร', false],
              ],
            },
          ],
        },
      },
    ],
  },
  {
    title: 'บทที่ 2 อะตอมและโครงสร้างอะตอม',
    summary: 'จากแบบจำลองอะตอมถึงการจัดเรียงอิเล็กตรอนที่ใช้อธิบายสมบัติของธาตุ',
    lessons: [
      {
        title: 'แบบจำลองอะตอม ทำไมต้องเปลี่ยนแบบจำลองหลายครั้ง',
        description: 'ไล่ตั้งแต่ดอลตัน ทอมสัน รัทเทอร์ฟอร์ด โบร์ ถึงแบบกลุ่มหมอกอิเล็กตรอน',
        durationMin: 30,
      },
      {
        title: 'เลขอะตอม เลขมวล และไอโซโทป',
        description: 'อ่านสัญลักษณ์นิวเคลียร์ให้ออก และเข้าใจว่าอะไรทำให้ธาตุเป็นธาตุนั้น',
        durationMin: 26,
      },
      {
        title: 'การจัดเรียงอิเล็กตรอนและเวเลนซ์อิเล็กตรอน',
        description: 'จัดอิเล็กตรอนตามระดับพลังงาน และเชื่อมโยงกับตำแหน่งในตารางธาตุ',
        durationMin: 34,
        quiz: {
          title: 'แบบทดสอบ โครงสร้างอะตอม',
          questions: [
            {
              text: 'ธาตุที่มีเลขอะตอม 17 มีการจัดเรียงอิเล็กตรอนเป็นแบบใด',
              explanation:
                'อิเล็กตรอน 17 ตัวจัดได้เป็น 2 ในระดับแรก 8 ในระดับที่สอง และเหลือ 7 ในระดับที่สาม ธาตุนี้จึงอยู่หมู่ 17 คาบ 3',
              choices: [
                ['2, 8, 7', true],
                ['2, 8, 8, 1', false],
                ['2, 7, 8', false],
                ['2, 8, 6', false],
              ],
            },
            {
              text: 'ไอโซโทปของธาตุเดียวกันแตกต่างกันที่สิ่งใด',
              explanation:
                'ไอโซโทปมีจำนวนโปรตอนเท่ากันจึงเป็นธาตุเดียวกัน แต่จำนวนนิวตรอนต่างกัน ทำให้เลขมวลต่างกัน',
              choices: [
                ['จำนวนนิวตรอน', true],
                ['จำนวนโปรตอน', false],
                ['เลขอะตอม', false],
                ['สมบัติทางเคมี', false],
              ],
            },
            {
              text: 'ไอออน Na+ มีอิเล็กตรอนกี่ตัว เมื่อโซเดียมมีเลขอะตอม 11',
              explanation:
                'โซเดียมเสียอิเล็กตรอนวงนอกไป 1 ตัวเพื่อให้เวเลนซ์อิเล็กตรอนครบแปด จึงเหลืออิเล็กตรอน 10 ตัว',
              choices: [
                ['10 ตัว', true],
                ['11 ตัว', false],
                ['12 ตัว', false],
                ['1 ตัว', false],
              ],
            },
          ],
        },
      },
    ],
  },
  {
    title: 'บทที่ 3 ตารางธาตุ',
    summary: 'อ่านตารางธาตุให้เป็นเครื่องมือ ไม่ใช่สิ่งที่ต้องท่องจำ',
    lessons: [
      {
        title: 'โครงสร้างตารางธาตุ หมู่ คาบ และวิธีอ่าน',
        description: 'ตารางธาตุจัดเรียงอย่างไร และดูอะไรได้จากตำแหน่งของธาตุ',
        durationMin: 27,
      },
      {
        title: 'โลหะ อโลหะ และกึ่งโลหะ',
        description: 'เปรียบเทียบสมบัติของสามกลุ่มใหญ่ และตัวอย่างการใช้งานจริง',
        durationMin: 22,
      },
      {
        title: 'แนวโน้มขนาดอะตอมและพลังงานไอออไนเซชัน',
        description: 'อธิบายแนวโน้มจากแรงดึงดูดของนิวเคลียส ไม่ใช่จากการจำทิศทางลูกศร',
        durationMin: 30,
        quiz: {
          title: 'แบบทดสอบ ตารางธาตุ',
          questions: [
            {
              text: 'ธาตุที่อยู่หมู่เดียวกันมีสิ่งใดเท่ากัน',
              explanation:
                'ธาตุหมู่เดียวกันมีจำนวนเวเลนซ์อิเล็กตรอนเท่ากัน จึงมีสมบัติทางเคมีคล้ายกัน',
              choices: [
                ['จำนวนเวเลนซ์อิเล็กตรอน', true],
                ['จำนวนระดับพลังงาน', false],
                ['มวลอะตอม', false],
                ['จำนวนนิวตรอน', false],
              ],
            },
            {
              text: 'เมื่อเลื่อนจากซ้ายไปขวาในคาบเดียวกัน ขนาดอะตอมมีแนวโน้มอย่างไร',
              explanation:
                'จำนวนโปรตอนในนิวเคลียสเพิ่มขึ้นขณะที่จำนวนระดับพลังงานเท่าเดิม แรงดึงดูดอิเล็กตรอนจึงมากขึ้นและขนาดอะตอมเล็กลง',
              choices: [
                ['เล็กลง', true],
                ['ใหญ่ขึ้น', false],
                ['เท่าเดิม', false],
                ['ไม่มีแนวโน้มที่แน่นอน', false],
              ],
            },
            {
              text: 'ธาตุใดต่อไปนี้เป็นแก๊สมีตระกูล',
              explanation:
                'อาร์กอนอยู่หมู่ 18 มีเวเลนซ์อิเล็กตรอนครบแปด จึงเสถียรและไม่ค่อยทำปฏิกิริยา',
              choices: [
                ['Ar', true],
                ['Cl', false],
                ['K', false],
                ['S', false],
              ],
            },
          ],
        },
      },
    ],
  },
  {
    title: 'บทที่ 4 พันธะเคมีเบื้องต้น',
    summary: 'ทำไมอะตอมต้องรวมตัวกัน และพันธะแต่ละแบบให้สมบัติต่างกันอย่างไร',
    lessons: [
      {
        title: 'ทำไมอะตอมต้องสร้างพันธะ และกฎออกเตต',
        description: 'แนวคิดความเสถียร และที่มาของการให้ รับ หรือใช้อิเล็กตรอนร่วมกัน',
        durationMin: 25,
      },
      {
        title: 'พันธะไอออนิกและการเขียนสูตร',
        description: 'การถ่ายโอนอิเล็กตรอน ประจุของไอออน และการดุลประจุให้เป็นศูนย์',
        durationMin: 30,
      },
      {
        title: 'พันธะโคเวเลนต์และโครงสร้างลิวอิส',
        description: 'การใช้อิเล็กตรอนร่วมกัน พันธะเดี่ยว คู่ สาม และการเขียนโครงสร้าง',
        durationMin: 33,
      },
      {
        title: 'พันธะโลหะและการเปรียบเทียบสมบัติของสารสามแบบ',
        description: 'สรุปเป็นตารางเดียวว่าสารไอออนิก โคเวเลนต์ และโลหะ ต่างกันที่จุดใด',
        durationMin: 28,
        quiz: {
          title: 'แบบทดสอบ พันธะเคมี',
          questions: [
            {
              text: 'โซเดียมคลอไรด์ (NaCl) เกิดจากพันธะชนิดใด',
              explanation:
                'โซเดียมให้อิเล็กตรอนแก่คลอรีน เกิดเป็นไอออนบวกและไอออนลบที่ดึงดูดกันด้วยแรงทางไฟฟ้า จึงเป็นพันธะไอออนิก',
              choices: [
                ['พันธะไอออนิก', true],
                ['พันธะโคเวเลนต์', false],
                ['พันธะโลหะ', false],
                ['พันธะไฮโดรเจน', false],
              ],
            },
            {
              text: 'สารใดนำไฟฟ้าได้ทั้งในสถานะของแข็งและของเหลว',
              explanation:
                'พันธะโลหะมีอิเล็กตรอนเคลื่อนที่ได้อิสระทั่วก้อนโลหะ จึงนำไฟฟ้าได้ทั้งสองสถานะ ส่วนสารไอออนิกนำไฟฟ้าเฉพาะเมื่อหลอมเหลวหรือละลายน้ำ',
              choices: [
                ['ทองแดง', true],
                ['เกลือแกงสถานะของแข็ง', false],
                ['น้ำตาลทราย', false],
                ['แก๊สมีเทน', false],
              ],
            },
            {
              text: 'ในโมเลกุลน้ำ อะตอมออกซิเจนสร้างพันธะโคเวเลนต์กี่พันธะ',
              explanation:
                'ออกซิเจนมีเวเลนซ์อิเล็กตรอน 6 ตัว ต้องการอีก 2 ตัวเพื่อครบแปด จึงสร้างพันธะเดี่ยวกับไฮโดรเจน 2 พันธะ',
              choices: [
                ['2 พันธะ', true],
                ['1 พันธะ', false],
                ['3 พันธะ', false],
                ['4 พันธะ', false],
              ],
            },
          ],
        },
      },
    ],
  },
  {
    title: 'บทที่ 5 สูตรเคมีและการเรียกชื่อสาร',
    summary: 'เขียนสูตรและเรียกชื่อสารประกอบที่พบบ่อยได้ด้วยตัวเอง',
    lessons: [
      {
        title: 'สัญลักษณ์ธาตุและไอออนที่ต้องรู้จัก',
        description: 'ชุดสัญลักษณ์และไอออนหลายอะตอมที่ใช้บ่อย พร้อมวิธีจำแบบมีระบบ',
        durationMin: 24,
      },
      {
        title: 'การเขียนสูตรสารประกอบไอออนิก',
        description: 'ไล่จากประจุไปเป็นสูตร และตรวจคำตอบด้วยการดุลประจุ',
        durationMin: 29,
      },
      {
        title: 'การเรียกชื่อสารประกอบเบื้องต้น',
        description: 'เรียกชื่อสารประกอบไอออนิกและโคเวเลนต์ รวมถึงกรณีที่โลหะมีหลายเลขออกซิเดชัน',
        durationMin: 31,
        quiz: {
          title: 'แบบทดสอบ สูตรเคมีและการเรียกชื่อ',
          questions: [
            {
              text: 'สูตรของแคลเซียมคลอไรด์คือข้อใด',
              explanation:
                'แคลเซียมเป็นไอออนประจุบวกสอง คลอไรด์เป็นไอออนประจุลบหนึ่ง ต้องใช้คลอไรด์ 2 ตัวประจุรวมจึงเป็นศูนย์',
              choices: [
                ['CaCl2', true],
                ['CaCl', false],
                ['Ca2Cl', false],
                ['CaCl3', false],
              ],
            },
            {
              text: 'Fe2O3 มีชื่อเรียกว่าอะไร',
              explanation:
                'ออกซิเจนมีประจุลบสอง สามตัวรวมเป็นลบหก เหล็กสองตัวจึงต้องมีประจุบวกสามต่อตัว จึงเรียกว่าไอรอน(III) ออกไซด์',
              choices: [
                ['ไอรอน(III) ออกไซด์', true],
                ['ไอรอน(II) ออกไซด์', false],
                ['ไอรอนไตรออกไซด์', false],
                ['ไดไอรอนออกไซด์', false],
              ],
            },
            {
              text: 'ไอออน SO4 ที่มีประจุลบสอง มีชื่อว่าอะไร',
              explanation: 'ซัลเฟตคือ SO4 ประจุลบสอง ส่วนซัลไฟต์คือ SO3 ประจุลบสอง และซัลไฟด์คือ S ประจุลบสอง',
              choices: [
                ['ซัลเฟต', true],
                ['ซัลไฟต์', false],
                ['ซัลไฟด์', false],
                ['ไทโอซัลเฟต', false],
              ],
            },
          ],
        },
      },
    ],
  },
  {
    title: 'บทที่ 6 โมลและความเข้มข้นเบื้องต้น',
    summary: 'หัวใจของการคำนวณเคมี เข้าใจโมลให้ได้แล้วเรื่องอื่นจะง่ายขึ้น',
    lessons: [
      {
        title: 'มวลอะตอม มวลโมเลกุล และมวลต่อโมล',
        description: 'ที่มาของตัวเลขมวลในตารางธาตุ และวิธีคิดมวลต่อโมลของสารประกอบ',
        durationMin: 26,
      },
      {
        title: 'โมลคืออะไร แปลงมวล โมล และจำนวนอนุภาค',
        description: 'มองโมลเป็นหน่วยนับ แล้วใช้แผนภาพเดียวแปลงไปมาได้ทุกทิศ',
        durationMin: 36,
        quiz: {
          title: 'แบบทดสอบ โมล',
          questions: [
            {
              text: 'น้ำ 36 กรัม คิดเป็นกี่โมล เมื่อ H มีมวลอะตอม 1 และ O มีมวลอะตอม 16',
              explanation: 'มวลต่อโมลของน้ำเท่ากับ 18 กรัมต่อโมล ดังนั้น 36 หารด้วย 18 ได้ 2 โมล',
              choices: [
                ['2 โมล', true],
                ['1 โมล', false],
                ['18 โมล', false],
                ['36 โมล', false],
              ],
            },
            {
              text: 'สาร 0.5 โมล มีจำนวนอนุภาคประมาณเท่าใด',
              explanation:
                'หนึ่งโมลมีอนุภาค 6.02 x 10^23 อนุภาค ครึ่งโมลจึงมีประมาณ 3.01 x 10^23 อนุภาค',
              choices: [
                ['3.01 x 10^23', true],
                ['6.02 x 10^23', false],
                ['1.20 x 10^24', false],
                ['3.01 x 10^22', false],
              ],
            },
            {
              text: 'ละลาย NaOH 0.2 โมล ในน้ำจนได้สารละลาย 500 มิลลิลิตร ความเข้มข้นเป็นกี่โมลาร์',
              explanation: 'โมลาริตีคือโมลของตัวละลายต่อปริมาตรสารละลายเป็นลิตร คือ 0.2 หารด้วย 0.5 ได้ 0.4 โมลาร์',
              choices: [
                ['0.4 โมลาร์', true],
                ['0.1 โมลาร์', false],
                ['0.2 โมลาร์', false],
                ['4.0 โมลาร์', false],
              ],
            },
          ],
        },
      },
      {
        title: 'ความเข้มข้นของสารละลายแบบที่ใช้บ่อย',
        description: 'ร้อยละโดยมวล ร้อยละโดยปริมาตร และโมลาริตี พร้อมโจทย์เตรียมสารละลาย',
        durationMin: 30,
      },
    ],
  },
  {
    title: 'บทที่ 7 ปฏิกิริยาเคมีเบื้องต้น',
    summary: 'อ่านและดุลสมการเคมีได้ พร้อมต่อยอดไปเนื้อหา ม.4 เทอม 1',
    lessons: [
      {
        title: 'สมการเคมีและการดุลสมการ',
        description: 'อ่านสมการเคมีให้ออก และดุลสมการอย่างเป็นระบบโดยไม่ต้องเดา',
        durationMin: 32,
        quiz: {
          title: 'แบบทดสอบ สมการเคมี',
          questions: [
            {
              text: 'การดุลสมการ H2 + O2 ให้เป็น H2O ได้เลขสัมประสิทธิ์ชุดใด',
              explanation:
                'ต้องใช้ 2H2 + O2 ได้ 2H2O จึงมีไฮโดรเจน 4 อะตอมและออกซิเจน 2 อะตอมเท่ากันทั้งสองข้าง',
              choices: [
                ['2, 1, 2', true],
                ['1, 1, 1', false],
                ['1, 1, 2', false],
                ['2, 2, 2', false],
              ],
            },
            {
              text: 'ในปฏิกิริยาเคมี สิ่งใดคงที่เสมอ',
              explanation:
                'ตามกฎทรงมวล อะตอมไม่สูญหายไป มวลรวมก่อนและหลังปฏิกิริยาจึงเท่ากัน ขณะที่จำนวนโมลหรือโมเลกุลอาจเปลี่ยนได้',
              choices: [
                ['มวลรวมของสาร', true],
                ['จำนวนโมเลกุลรวม', false],
                ['ปริมาตรรวม', false],
                ['จำนวนโมลรวม', false],
              ],
            },
            {
              text: 'ปฏิกิริยา CH4 + 2O2 ให้ CO2 + 2H2O จัดเป็นปฏิกิริยาประเภทใด',
              explanation:
                'สารไฮโดรคาร์บอนทำปฏิกิริยากับออกซิเจนแล้วได้คาร์บอนไดออกไซด์และน้ำ เป็นลักษณะของปฏิกิริยาการเผาไหม้',
              choices: [
                ['การเผาไหม้', true],
                ['การสะเทิน', false],
                ['การแทนที่เดี่ยว', false],
                ['การสลายตัว', false],
              ],
            },
          ],
        },
      },
      {
        title: 'ประเภทของปฏิกิริยาที่พบบ่อย',
        description: 'การรวมตัว การสลายตัว การแทนที่ และการเผาไหม้ พร้อมตัวอย่างใกล้ตัว',
        durationMin: 27,
      },
      {
        title: 'ทบทวนรวมและเตรียมตัวสู่เคมี ม.4 เทอม 1',
        description: 'สรุปทั้งคอร์สในหนึ่งคลิป และชี้ว่าเนื้อหาแต่ละบทจะไปต่อที่เรื่องใด',
        durationMin: 26,
      },
    ],
  },
];

/* ------------------------------ ตัวสคริปต์ ------------------------------ */

async function main() {
  console.log('กำลังสร้างคอร์ส Foundation for Chemistry...');

  // 1. หาวิชาเคมี ถ้ายังไม่มีให้สร้างใหม่
  let subject = await prisma.subject.findUnique({ where: { slug: COURSE.subjectSlug } });
  if (!subject) {
    const count = await prisma.subject.count();
    subject = await prisma.subject.create({
      data: {
        name: 'เคมี',
        slug: COURSE.subjectSlug,
        description: 'เข้าใจหลักการ ไม่ต้องท่องอย่างเดียว',
        colorHex: '#7c3aed',
        iconKey: 'flask',
        order: count,
      },
    });
    console.log('  สร้างวิชาเคมีใหม่');
  }

  // 2. สร้างหรืออัปเดตคอร์ส
  //    ถ้าเคยอัปโหลดเอกสารประกอบขึ้น Blob แล้ว (URL เริ่มด้วย http) ให้คงค่าเดิมไว้
  //    ไม่ให้สคริปต์นี้เขียนทับด้วย path ของไฟล์บนเครื่อง
  const before = await prisma.course.findUnique({ where: { slug: COURSE.slug } });
  const materialUrl = before?.materialUrl?.startsWith('http')
    ? before.materialUrl
    : COURSE.materialUrl;

  const course = await prisma.course.upsert({
    where: { slug: COURSE.slug },
    create: {
      slug: COURSE.slug,
      title: COURSE.title,
      subtitle: COURSE.subtitle,
      description: COURSE.description,
      subjectId: subject.id,
      level: COURSE.level,
      price: COURSE.price,
      comparePrice: COURSE.comparePrice,
      accessDays: COURSE.accessDays,
      teacherName: COURSE.teacherName,
      teacherBio: COURSE.teacherBio,
      totalHours: COURSE.totalHours,
      isPublished: COURSE.isPublished,
      isFeatured: COURSE.isFeatured,
      materialTitle: COURSE.materialTitle,
      materialUrl,
      order: 0,
    },
    update: {
      title: COURSE.title,
      subtitle: COURSE.subtitle,
      description: COURSE.description,
      subjectId: subject.id,
      level: COURSE.level,
      price: COURSE.price,
      comparePrice: COURSE.comparePrice,
      accessDays: COURSE.accessDays,
      teacherName: COURSE.teacherName,
      teacherBio: COURSE.teacherBio,
      totalHours: COURSE.totalHours,
      isPublished: COURSE.isPublished,
      isFeatured: COURSE.isFeatured,
      materialTitle: COURSE.materialTitle,
      materialUrl,
      order: 0,
    },
  });

  // 3. ล้างบทเดิมของคอร์สนี้ แล้วสร้างใหม่ตามไฟล์นี้
  //    (บทเรียน แบบทดสอบ และไฟล์แนบที่ผูกกับบทจะถูกลบตาม onDelete: Cascade)
  await prisma.chapter.deleteMany({ where: { courseId: course.id } });

  let lessonCount = 0;
  let quizCount = 0;
  let questionCount = 0;

  for (const [ci, ch] of CHAPTERS.entries()) {
    const chapter = await prisma.chapter.create({
      data: {
        courseId: course.id,
        title: ch.title,
        summary: ch.summary ?? null,
        order: ci,
      },
    });

    for (const [li, l] of ch.lessons.entries()) {
      const lesson = await prisma.lesson.create({
        data: {
          chapterId: chapter.id,
          title: l.title,
          description: l.description ?? null,
          videoProvider: 'VIMEO',
          // ยังไม่ใส่รหัสวิดีโอ ใส่เองได้ที่ หลังบ้าน > จัดการคอร์ส > บทเรียน
          videoId: l.videoId ?? '',
          durationMin: l.durationMin,
          isPreview: l.isPreview ?? false,
          order: li,
        },
      });
      lessonCount++;

      if (l.quiz) {
        const quiz = await prisma.quiz.create({
          data: {
            lessonId: lesson.id,
            title: l.quiz.title,
            description: 'ทำแบบทดสอบเพื่อเช็คความเข้าใจก่อนไปบทถัดไป',
            passScore: 60,
          },
        });
        quizCount++;

        for (const [qi, q] of l.quiz.questions.entries()) {
          const question = await prisma.question.create({
            data: {
              quizId: quiz.id,
              text: q.text,
              explanation: q.explanation ?? null,
              order: qi,
            },
          });
          questionCount++;

          for (const [choiceIndex, [text, isCorrect]] of q.choices.entries()) {
            await prisma.choice.create({
              data: { questionId: question.id, text, isCorrect, order: choiceIndex },
            });
          }
        }
      }
    }
  }

  // 4. เปลี่ยนคอร์สตัวอย่างอื่นทั้งหมดเป็นฉบับร่าง เพื่อให้หน้าเว็บเหลือคอร์สนี้คอร์สเดียว
  const drafted = await prisma.course.updateMany({
    where: { slug: { not: COURSE.slug } },
    data: { isPublished: false, isFeatured: false },
  });

  console.log('เสร็จแล้ว');
  console.log(`  บท ${CHAPTERS.length} บท / บทเรียน ${lessonCount} บทเรียน`);
  console.log(`  แบบทดสอบ ${quizCount} ชุด รวม ${questionCount} ข้อ`);
  console.log(`  เปลี่ยนคอร์สอื่นเป็นฉบับร่าง ${drafted.count} คอร์ส`);
  console.log(`  ดูหน้าคอร์สได้ที่ /courses/${COURSE.slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
