import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSS 클래스를 병합하는 헬퍼 함수
 * @param inputs - 병합할 클래스명들
 * @returns 병합된 클래스명
 *
 * @example
 * cn('px-4 py-2', 'bg-blue-500', isActive && 'bg-red-500')
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return twMerge(...(inputs.filter(Boolean) as string[]));
}
