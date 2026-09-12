'use client';

/**
 * ตัวเล่นวิดีโอบทเรียน
 * รองรับ Vimeo (ค่าเริ่มต้น), YouTube และไฟล์วิดีโอโดยตรง
 *
 * แนะนำสำหรับคอร์สที่ขาย ให้ใช้ Vimeo แล้วตั้งค่า Privacy เป็น
 * "Hide from Vimeo" + จำกัดโดเมนที่ฝังได้ (Domain-level privacy)
 * คลิปจะเล่นได้เฉพาะบนเว็บของสถาบันเท่านั้น
 */
export function VideoPlayer({
  provider,
  videoId,
  videoUrl,
  title,
}: {
  provider: string;
  videoId: string;
  videoUrl: string | null;
  title: string;
}) {
  if (provider === 'FILE' && videoUrl) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
        <video src={videoUrl} controls controlsList="nodownload" className="h-full w-full" />
      </div>
    );
  }

  if (!videoId && !videoUrl) {
    return (
      <div className="grid aspect-video w-full place-items-center rounded-2xl border border-dashed border-ink-line bg-brand-50/50 text-center text-sm text-ink-soft">
        <div>
          <p className="font-medium text-ink">ยังไม่ได้ใส่ลิงก์วิดีโอของบทเรียนนี้</p>
          <p className="mt-1">แอดมินสามารถเพิ่มรหัสวิดีโอได้ที่หน้าจัดการคอร์ส</p>
        </div>
      </div>
    );
  }

  const src =
    provider === 'YOUTUBE'
      ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`
      : `https://player.vimeo.com/video/${videoId}?byline=0&portrait=0&title=0`;

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <iframe
        src={src}
        title={title}
        className="h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
