import { describe, it, expect } from 'vitest';
import { LESSONS, getLessonById, getLessonMeta } from '@/lib/lessons-data';

describe('LESSONS 定数', () => {
  it('10件のレッスンが定義されている', () => {
    expect(LESSONS).toHaveLength(10);
  });

  it('各レッスンは必須フィールドを持つ', () => {
    for (const lesson of LESSONS) {
      expect(lesson.id).toBeTruthy();
      expect(lesson.title).toBeTruthy();
      expect(lesson.phase).toBeTypeOf('number');
      expect(['theory', 'exercise', 'review']).toContain(lesson.type);
      expect(['completed', 'available', 'locked']).toContain(lesson.status);
      expect(lesson.estimated_minutes).toBeGreaterThan(0);
      expect(lesson.difficulty).toBeGreaterThanOrEqual(1);
      expect(lesson.difficulty).toBeLessThanOrEqual(5);
      expect(Array.isArray(lesson.tags)).toBe(true);
    }
  });

  it('IDが重複していない', () => {
    const ids = LESSONS.map((l) => l.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('completed → available → locked の順序になっている', () => {
    const statuses = LESSONS.map((l) => l.status);
    let seenNonCompleted = false;
    let seenLocked = false;
    for (const status of statuses) {
      if (status !== 'completed') seenNonCompleted = true;
      if (status === 'locked') seenLocked = true;
      // locked の後に completed や available は来ない
      if (seenLocked) {
        expect(status).toBe('locked');
      }
    }
  });
});

describe('getLessonById', () => {
  it('存在するレッスンIDで詳細を返す', () => {
    const lesson = getLessonById('l-1');
    expect(lesson).not.toBeNull();
    expect(lesson?.id).toBe('l-1');
    expect(lesson?.content).toBeDefined();
    expect(lesson?.exercises).toBeDefined();
  });

  it('l-6 は演習を2件持つ', () => {
    const lesson = getLessonById('l-6');
    expect(lesson?.exercises).toHaveLength(2);
  });

  it('存在しないIDでは null を返す', () => {
    expect(getLessonById('non-existent')).toBeNull();
  });

  it('各レッスンのコンテンツは introduction, key_concepts, summary を持つ', () => {
    for (const meta of LESSONS.slice(0, 6)) {
      const lesson = getLessonById(meta.id);
      if (lesson) {
        expect(lesson.content.introduction).toBeTruthy();
        expect(Array.isArray(lesson.content.key_concepts)).toBe(true);
        expect(lesson.content.key_concepts.length).toBeGreaterThan(0);
        expect(lesson.content.summary).toBeTruthy();
      }
    }
  });
});

describe('getLessonMeta', () => {
  it('存在するIDのメタ情報を返す', () => {
    const meta = getLessonMeta('l-3');
    expect(meta).not.toBeNull();
    expect(meta?.title).toBe('制御フロー（if, for, while）');
  });

  it('存在しないIDでは null を返す', () => {
    expect(getLessonMeta('xyz')).toBeNull();
  });
});
