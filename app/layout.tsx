import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Đào Tạo Chuyên Sâu Kỹ Năng Telesale Bất Động Sản - Nguyễn Nam Academy',
  description: 'Buổi đào tạo hoàn toàn miễn phí 100%, giới hạn tối đa 30 học viên. Học sâu bộ kỹ năng telesale bất động sản thực chiến cùng chuyên gia Nguyễn Nam tại Vinhomes Ocean Park 1.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body className="bg-[#0B0B0B] text-gray-100 antialiased font-sans select-none selection:bg-brand selection:text-black" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
