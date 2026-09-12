'use client';

import { useFormStatus } from 'react-dom';
import { toggleLessonCompleteAction } from '@/app/actions/learn';

function Button({ completed }: { completed: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={completed ? 'btn-outline btn-sm' : 'btn-primary btn-sm'}
    >
      {pending ? 'กำลังบันทึก...' : completed ? '✓ เรียนจบแล้ว (กดเพื่อยกเลิก)' : 'ทำเครื่องหมายว่าเรียนจบ'}
    </button>
  );
}

export function MarkComplete({ lessonId, completed }: { lessonId: string; completed: boolean }) {
  return (
    <form action={toggleLessonCompleteAction}>
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="completed" value={completed ? 'false' : 'true'} />
      <Button completed={completed} />
    </form>
  );
}
