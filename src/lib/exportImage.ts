import { toPng } from 'html-to-image';

export const exportAsImage = async (
  elementRef: React.RefObject<HTMLDivElement | null>,
  filename: string
) => {
  if (elementRef.current === null) return;

  try {
    const dataUrl = await toPng(elementRef.current, {
      quality: 1.0,
      pixelRatio: 2, // High resolution for social media
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Failed to export image', err);
  }
};
