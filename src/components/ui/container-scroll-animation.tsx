'use client';

import React, { useRef } from 'react';
import { useScroll, useTransform, motion, useReducedMotion, type MotionValue } from 'framer-motion';

/**
 * กรอบอุปกรณ์ที่ค่อย ๆ ตั้งตรงขึ้นเมื่อเลื่อนหน้าจอ
 *
 * ดัดแปลงจากคอมโพเนนต์ ContainerScroll ของ 21st.dev
 * สิ่งที่ปรับให้เข้ากับเว็บนี้
 * - ลดความสูงลงจากต้นฉบับ เพื่อไม่ให้หน้าแรกยาวเกินไป
 * - เปลี่ยนสีกรอบและเงาให้เข้ากับโทนชมพูส้มของสถาบัน
 * - ปรับขนาดกรอบให้เห็นทั้งใบในหน้าจอเดียว ไม่งั้นจะมองไม่ออกว่ากำลังเอียง
 * - ใช้ min-h แทน h เพื่อให้กล่องยืดตามเนื้อหา ไม่ล้นออกไปทับส่วนที่อยู่ถัดลงไป
 * - รองรับ prefers-reduced-motion เครื่องที่ตั้งค่าลดการเคลื่อนไหวจะเอียงน้อยลงแทนที่จะนิ่งสนิท
 * - กำหนด offset ของการเลื่อนให้เริ่มนับตั้งแต่หัวหน้าเพจ
 */
export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scaleDimensions = (): [number, number] => (isMobile ? [0.85, 1] : [1.06, 1]);

  const rotate = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [6, 0] : [24, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [1, 1] : scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, -140]);

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-[40rem] items-start justify-center px-2 py-4 md:min-h-[48rem] md:px-6 md:py-6"
    >
      <div className="relative w-full py-8 md:py-10" style={{ perspective: '1200px' }}>
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>;
  titleComponent: string | React.ReactNode;
}) => {
  return (
    <motion.div style={{ translateY: translate }} className="mx-auto max-w-4xl text-center">
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          '0 0 #0000004d, 0 9px 20px rgba(27,20,24,0.18), 0 37px 37px rgba(27,20,24,0.12), 0 84px 50px rgba(236,53,102,0.10), 0 149px 60px rgba(249,115,22,0.05)',
      }}
      className="mx-auto mt-8 h-[16rem] w-full max-w-5xl rounded-[26px] border-4 border-[#241c20] bg-[#151013] p-2 shadow-2xl md:h-[24rem] md:p-3"
    >
      <div className="h-full w-full overflow-hidden rounded-[18px] bg-white">{children}</div>
    </motion.div>
  );
};
