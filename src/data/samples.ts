import { QuickSample } from '../types';

export const QUICK_SAMPLES: QuickSample[] = [
  {
    id: 'sample-math',
    category: 'math',
    title: 'Решение уравнения / задачи',
    badge: 'Математика & STEM',
    description: 'Распознавание условия с фото, пошаговый расчет и финальный ответ',
    prompt: 'Реши это уравнение пошагово с подробными пояснениями: 2x² - 8x + 6 = 0',
    svgIcon: 'Calculator',
  },
  {
    id: 'sample-error',
    category: 'error',
    title: 'Скриншот ошибки на экране',
    badge: 'IT & Программы',
    description: 'Диагностика сбоя ОС, кода или приложения и точные команды для исправления',
    prompt: 'Объясни причину сбоя `Uncaught TypeError: Cannot read properties of undefined (reading "data")` и предложи конкретный способ исправления.',
    svgIcon: 'Terminal',
  },
  {
    id: 'sample-repair',
    category: 'repair',
    title: 'Поломка прибора / устройства',
    badge: 'Быт & Техника',
    description: 'Определение причины неисправности и пошаговая инструкция по ремонту',
    prompt: 'Стиральная машина гудит, но не сливает воду (код ошибки E18/F18). Что проверить и как исправить самому?',
    svgIcon: 'Wrench',
  },
  {
    id: 'sample-document',
    category: 'document',
    title: 'Документ / Текст на фото',
    badge: 'Документы & Текст',
    description: 'Краткая выжимка главных условий, рисков и ответы по содержанию',
    prompt: 'Сделай краткую выжимку главных мыслей документа и выдели критические пункты для подписания.',
    svgIcon: 'FileText',
  },
];

// Helper to create a crisp illustrative canvas image for testing if user wants to test with a pre-made image
export function generateSampleCanvasImage(type: 'math' | 'error' | 'repair' | 'document'): { data: string; mimeType: string; previewUrl: string; name: string } {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { data: '', mimeType: 'image/png', previewUrl: '', name: 'sample.png' };
  }

  // Draw background
  if (type === 'math') {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 800, 500);

    // Notebook grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let y = 40; y < 500; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }
    // Red margin line
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(80, 0);
    ctx.lineTo(80, 500);
    ctx.stroke();

    // Handwritten-style text
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 28px serif';
    ctx.fillText('Задание № 4: Решить квадратное уравнение', 110, 80);

    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('2x² - 8x + 6 = 0', 110, 160);

    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Найти все действительные корни x₁ и x₂.', 110, 220);
    ctx.fillText('Указать дискриминант D и подробный ход решения.', 110, 260);

    ctx.strokeStyle = '#cbd5e1';
    ctx.strokeRect(100, 310, 600, 130);
    ctx.font = 'italic 18px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Примечание экзаменатора: Проверить теоремой Виета', 120, 350);
    ctx.fillText('Время выполнения: 10 мин.', 120, 390);

  } else if (type === 'error') {
    // Dark terminal/IDE error window
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 800, 500);

    // Title bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 800, 45);
    // Window dots
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(25, 22, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.arc(45, 22, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.beginPath(); ctx.arc(65, 22, 6, 0, Math.PI * 2); ctx.fill();

    ctx.font = '14px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Terminal — Node.js & React App Exception', 100, 27);

    // Error text
    ctx.font = '18px monospace';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('Uncaught TypeError: Cannot read properties of undefined (reading "data")', 30, 95);

    ctx.font = '15px monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('    at UserProfile (src/components/UserProfile.tsx:42:25)', 50, 140);
    ctx.fillText('    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:14985)', 50, 175);
    ctx.fillText('    at updateFunctionComponent (node_modules/react-dom.js:17356)', 50, 210);

    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('41 | function UserProfile({ user }) {', 30, 280);
    ctx.fillStyle = '#f87171';
    ctx.fillText('42 |   const bio = user.profile.data.biography;', 30, 310);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('43 |   return <div>{bio}</div>;', 30, 340);
    ctx.fillText('44 | }', 30, 370);

    ctx.fillStyle = '#f59e0b';
    ctx.fillText('> Process exited with code 1 (ERR_UNHANDLED_EXCEPTION)', 30, 440);

  } else if (type === 'repair') {
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, 800, 500);

    // Appliance panel drawing
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 40, 700, 420);
    ctx.fillRect(50, 40, 700, 420);

    // Digital LED display on washer
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(400, 80, 280, 100);
    ctx.font = 'bold 54px monospace';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('E18', 430, 150);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#f87171';
    ctx.fillText('ERR: DRAIN PUMP BLOCKED', 430, 170);

    // Circular dial
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(220, 180, 80, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Стиральная машина: Сбой слива', 80, 80);

    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('Симптомы: Вода не уходит из барабана,', 80, 320);
    ctx.fillText('слышен тихий гул помпы, люк заблокирован.', 80, 350);
    ctx.fillText('Фильтр сливного насоса внизу справа не открывался 6 месяцев.', 80, 380);

  } else {
    // Document
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 800, 500);

    // Sheet of paper
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 10;
    ctx.fillRect(100, 30, 600, 440);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px serif';
    ctx.fillText('ДОГОВОР ОКАЗАНИЯ УСЛУГ № 142/26', 150, 80);

    ctx.font = '14px serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('1. ПРЕДМЕТ ДОГОВОРА:', 150, 130);
    ctx.fillText('Исполнитель обязуется оказать консультационные услуги в срок до 30 дней.', 170, 155);

    ctx.fillText('2. ПОРЯДОК ОПЛАТЫ И РАСЧЕТОВ:', 150, 200);
    ctx.fillText('Авансовый платеж в размере 50% выплачивается в течение 3 банковских дней.', 170, 225);
    ctx.fillText('Окончательный расчет производится после подписания двустороннего Акта.', 170, 250);

    ctx.fillText('3. ОТВЕТСТВЕННОСТЬ И ШТРАФНЫЕ САНКЦИИ:', 150, 300);
    ctx.fillText('При задержке сдачи этапа неустойка составляет 0.1% за каждый день просрочки,', 170, 325);
    ctx.fillText('но не более 10% от общей суммы договора.', 170, 350);

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('ВАЖНО: Пункт 4.2 содержит условие об одностороннем расторжении!', 170, 400);
  }

  const dataUrl = canvas.toDataURL('image/png');
  const base64Data = dataUrl.split(',')[1];
  return {
    data: base64Data,
    mimeType: 'image/png',
    previewUrl: dataUrl,
    name: `sample_${type}.png`,
  };
}
