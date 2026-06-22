'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown, 
  PhoneCall, 
  MessageSquare, 
  Award, 
  Check, 
  HelpCircle, 
  Sparkles, 
  X, 
  ChevronRight, 
  User, 
  Smartphone, 
  Briefcase,
  Mail,
  Copy,
  Ticket,
  ExternalLink,
  ChevronUp,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';

// Define TS interfaces for our state
interface FormState {
  fullName: string;
  phone: string;
  email: string;
  currentRole: string;
  committed: boolean;
}

interface Registration {
  fullName: string;
  phone: string;
  email: string;
  currentRole: string;
  seatNumber: number;
  ticketCode: string;
  registeredAt: string;
}

const TOTAL_SEATS = 30;
const INITIAL_REGISTERED_COUNT = 27; // High-fidelity social proof
const EVENT_DATE = new Date('2026-06-24T08:00:00+07:00'); // 08:00 AM Wed, June 24, 2026 (Vietnam Time)

export default function Page() {
  // Client States
  const [ticket, setTicket] = useState<Registration | null>(null);
  const [showThankYouPage, setShowThankYouPage] = useState<boolean>(false);
  const [registeredList, setRegisteredList] = useState<Registration[]>([]);
  const [formValues, setFormValues] = useState<FormState>({
    fullName: '',
    phone: '',
    email: '',
    currentRole: 'Môi giới tự do / Cá nhân',
    committed: true
  });
  const [submitError, setSubmitError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Interactive Telesale Script Tool state to practice the "27-second formula"
  const [currentScriptStep, setCurrentScriptStep] = useState<number>(0);
  const [showStickyCta, setShowStickyCta] = useState(false);

  // Initialize registration state from LocalStorage on mount
  useEffect(() => {
    // Scroll listener for Sticky Bottom CTA on mobile
    const handleScroll = () => {
      const heroHeight = 650;
      if (window.scrollY > heroHeight) {
        setShowStickyCta(true);
      } else {
        setShowStickyCta(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Defer localStorage reading and state changes to avoid synchronous setState inside useEffect
    const ticketLoadTimer = setTimeout(() => {
      const saved = localStorage.getItem('nguyennam_academy_telesale_registrations');
      if (saved) {
        try {
          const dbList = JSON.parse(saved);
          setRegisteredList(dbList);
        } catch (e) {
          console.error(e);
        }
      }

      const savedTicket = localStorage.getItem('nguyennam_academy_user_ticket');
      if (savedTicket) {
        try {
          setTicket(JSON.parse(savedTicket));
        } catch (e) {
          console.error(e);
        }
      }
    }, 0);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(ticketLoadTimer);
    };
  }, []);

  // Update Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = EVENT_DATE.getTime() - now.getTime();

      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setCountdown({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Dynamic Seats Remaining computation
  const currentRegisteredCount = INITIAL_REGISTERED_COUNT + registeredList.length;
  const seatsRemaining = Math.max(0, TOTAL_SEATS - currentRegisteredCount);

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    if (submitError) setSubmitError('');
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues(prev => ({
      ...prev,
      committed: e.target.checked
    }));
  };

  // Process registration submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (seatsRemaining <= 0) {
      setSubmitError('Rất tiếc! Chương trình hiện đã đủ 30 học viên đăng ký giữ chỗ và đã đóng form.');
      return;
    }

    // Validation
    if (!formValues.fullName.trim()) {
      setSubmitError('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!formValues.phone.trim() || !/^[0-9+ ]{9,13}$/.test(formValues.phone.trim())) {
      setSubmitError('Số điện thoại không hợp lệ (ví dụ: 0912345678).');
      return;
    }
    if (!formValues.email.trim() || !/\S+@\S+\.\S+/.test(formValues.email.trim())) {
      setSubmitError('Email không hợp lệ (ví dụ: nguyennambds@gmail.com).');
      return;
    }
    if (!formValues.committed) {
      setSubmitError('Vui lòng tích cam kết tham gia lớp học đúng giờ để được giữ vé.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Connect and submit to Mautic proxy API route
      await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formValues.fullName.trim(),
          phone: formValues.phone.trim(),
          email: formValues.email.trim(),
        }),
      });
    } catch (err) {
      console.error('Error syncing registration to Mautic:', err);
    }

    // Generate stunning Ticket Pass
    const trackingCode = `NN-TS-${Math.floor(1000 + Math.random() * 9000)}`;
    const seatNo = currentRegisteredCount + 1;
    const newReg: Registration = {
      fullName: formValues.fullName.trim(),
      phone: formValues.phone.trim(),
      email: formValues.email.trim(),
      currentRole: formValues.currentRole,
      seatNumber: seatNo,
      ticketCode: trackingCode,
      registeredAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedList = [...registeredList, newReg];
    setRegisteredList(updatedList);
    localStorage.setItem('nguyennam_academy_telesale_registrations', JSON.stringify(updatedList));

    setTicket(newReg);
    localStorage.setItem('nguyennam_academy_user_ticket', JSON.stringify(newReg));
    setIsSubmitting(false);
    setShowThankYouPage(true);
    
    // Smooth scroll to top of window to read thank you instruction letter
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://telesale.nambds.vn');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCancelReservation = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy lượt đăng ký tham gia đào tạo miễn phí này không? Ghế trống của bạn sẽ được mở lại cho người khác.')) {
      // Remove from lists
      const fileFiltered = registeredList.filter(item => item.ticketCode !== ticket?.ticketCode);
      setRegisteredList(fileFiltered);
      localStorage.setItem('nguyennam_academy_telesale_registrations', JSON.stringify(fileFiltered));
      setTicket(null);
      localStorage.removeItem('nguyennam_academy_user_ticket');
    }
  };

  // Pain points list
  const PAIN_POINTS = [
    {
      id: "pain-1",
      icon: <PhoneCall className="w-10 h-10 text-red-500" />,
      title: "Sợ nhấc điện thoại gọi cho khách",
      desc: "Nỗi sợ vô hình khi phải đối mặt với cảm giác bị từ chối liên tiếp, hồi hộp và nhịp tim tăng nhanh mỗi khi nhấn nút gọi điện thoại."
    },
    {
      id: "pain-2",
      icon: <AlertTriangle className="w-10 h-10 text-red-500" />,
      title: "Khách dập máy chỉ sau 3 giây đầu",
      desc: "Nói lời chào rập khuôn kiểu: 'Em chào anh, em gọi từ dự án...' khiến khách nhận diện ngay cuộc gọi spam và ngắt máy phũ phàng."
    },
    {
      id: "pain-3",
      icon: <MessageSquare className="w-10 h-10 text-red-500" />,
      title: "Không biết xử lý khi bị từ chối khéo",
      desc: "Lúng túng, ấp úng khi khách nói: 'Anh đang bận', 'Anh chưa có nhu cầu', 'Giá cao quá em ơi', 'Để anh nghiên cứu thêm'..."
    },
    {
      id: "pain-4",
      icon: <Users className="w-10 h-10 text-red-500" />,
      title: "Phung phí lượng data khách hàng giá trị",
      desc: "Sở hữu danh sách khách hàng chất lượng nhưng gọi hỏng hàng loạt, cạn kiệt data mà không tạo ra được cuộc hẹn hay phản hồi tích cực."
    }
  ];

  // Solutions highlights
  const SOLUTIONS = [
    {
      id: "sol-1",
      number: "01",
      title: "Vượt qua rào cản 10 giây đầu tiên",
      desc: "Lọc bỏ giọng điệu bán hàng, thiết lập một mở đầu hoàn toàn tự nhiên, đánh thức sự tò mò của khách hàng chứ không gây phiền phức."
    },
    {
      id: "sol-2",
      number: "02",
      title: "Kỹ thuật '27 giây' độc quyền",
      desc: "Cách xin phép khách hàng thông minh để được nghe chia sẻ tiếp mà không tạo ra sự đề phòng, tăng ngay tỷ lệ giữ cuộc gọi lên tới 85%."
    },
    {
      id: "sol-3",
      number: "03",
      title: "Kịch bản xử lý từ chối gãy gọn",
      desc: "Sở hữu bộ mẫu hội thoại ngắn cho từng tình huống: Giá cao, Sợ lãi suất ngân hàng, Chờ dự án khác, Nghi ngờ pháp lý..."
    },
    {
      id: "sol-4",
      number: "04",
      title: "Chuyển đổi mượt mà sang Zalo",
      desc: "Nghệ thuật xin thông tin mạng xã hội Zalo tinh tế, gửi tài liệu hữu ích khiến khách hàng chủ động kết nối lại thay vì chặn số."
    },
    {
      id: "sol-5",
      number: "05",
      title: "Phân loại nhóm khách hàng tinh tế",
      desc: "Lọc data rác để tập trung thời gian vàng vào những khách hàng thuộc nhóm ấm, nóng, tối ưu hiệu quả làm việc gấp 3 lần."
    }
  ];

  // Specific Agenda
  const AGENDA = [
    {
      id: "agenda-1",
      time: "08:00 – 09:30",
      title: "Tư duy vượt sợ hãi & Tâm lý Môi giới thực chiến",
      desc: "Giải mã nguồn gốc nỗi sợ cuộc gọi. Cách định vị bản thân làm người trao cơ hội thay vì cầu xin sự chú ý. Khởi động năng lượng trước khi thực hiện cuộc gọi."
    },
    {
      id: "agenda-2",
      time: "09:45 – 11:30",
      title: "Công thức mở đầu tự nhiên & Kỹ thuật '27 giây'",
      desc: "Huấn luyện chuyên sâu cách vượt qua rào cản lọc spam của khách hàng. Cách thiết kế lời thoại ngắn tự nhiên, xin phép khách nghe tiếp tinh tế."
    },
    {
      id: "agenda-3",
      time: "11:30 – 13:00",
      title: "Kết nối & Trao đổi tự do (Nghỉ trưa)",
      desc: "Nghỉ ngơi, ăn trưa và giao lưu mạng lưới cùng 30 anh em môi giới bất động sản xuất sắc trong lớp học."
    },
    {
      id: "agenda-4",
      time: "13:00 – 15:00",
      title: "Bẻ gãy mọi câu từ chối phổ biến",
      desc: "Thực hành phản xạ xử lý các bẫy từ chối: bận họp, không mua chung cư, sợ pháp lý, sợ không vay được ngân hàng, giá đắt..."
    },
    {
      id: "agenda-5",
      time: "15:15 – 17:00",
      title: "Kéo khách về Zalo & Thực hành Live Calling",
      desc: "Quy trình gửi tin nhắn sau cuộc gọi. Trực tiếp nhấc máy thực hành cuộc gọi thực tế (Live Telesaling) trước lớp dưới sự chỉnh sửa từng câu chữ từ Nguyễn Nam."
    }
  ];

  // Targets / Who should attend
  const TARGET_AUDIENCES = [
    {
      id: "target-1",
      title: "Môi giới Bất Động Sản",
      desc: "Sales bán dự án dự án Vinhomes, Masterise, đất nền, thổ cư muốn tăng số lượng cuộc gặp hẹn khách xem trực tiếp."
    },
    {
      id: "target-2",
      title: "Sales dự án / Sales chung cư",
      desc: "Cần cải thiện tỷ lệ chốt cuộc hẹn qua điện thoại với nguồn data lạnh mới nhận từ phòng Marketing."
    },
    {
      id: "target-3",
      title: "Team leader / Trưởng phòng kinh doanh",
      desc: "Muốn học quy trình telesale quy chuẩn bài bản để đem về chia sẻ lại và huấn luyện đội ngũ chiến binh của mình."
    }
  ];

  // FAQ list
  const FAQS = [
    {
      question: "Sự kiện đào tạo này có thực sự miễn phí 100% không? Có bán thêm khóa học gì sau đó không?",
      answer: "Hoàn toàn miễn phí 100%. Đây là sự kiện cộng đồng tâm huyết của Nguyễn Nam nhằm đóng góp giá trị cho sự hồi phục của thị trường Môi giới và nâng cao chất lượng Telesale. Không có bất kỳ chi phí ẩn nào, mục tiêu là đào tạo và thực hành thực tế chất lượng cao."
    },
    {
      question: "Tại sao chương trình lại giới hạn nghiêm ngặt tối đa 30 học viên?",
      answer: "Để đảm bảo chất lượng tiếp thu tốt nhất. Buổi đào tạo của Nguyễn Nam Academy là học đi đôi với thực hành. Từng người trong số 30 học viên sẽ được chỉnh kịch bản mở đầu, trực tiếp thực hiện bài nói, chỉnh sửa ngữ điệu giọng nói trực tiếp tại lớp. Số lượng đông hơn sẽ làm loãng thời gian thực hành."
    },
    {
      question: "Nếu form đăng ký đã đủ 30 người thì có cách nào tham gia không?",
      answer: "Khi form đạt đủ 30 lượt giữ chỗ, hệ thống sẽ tự động đóng đăng ký. Trong trường hợp có người đăng ký nhưng không cam kết hoặc hủy phòng, cơ hội sẽ tự động hiển thị lại trên trang web cho các thành viên đăng ký sớm tiếp theo."
    },
    {
      question: "Tôi cần chuẩn bị những gì khi đến lớp học?",
      answer: "Hãy chuẩn bị tinh thần tập trung cao độ, một cuốn sổ ghi chép, điện thoại sạc đầy pin cùng tập danh sách (data) khách hàng của bạn để chúng ta cùng nhấc máy thực hiện cuộc gọi thực tế ngay trong buổi học buổi chiều."
    },
    {
      question: "Địa điểm lớp học SP02-02 Sao Biển 1 có dễ tìm không?",
      answer: "Rất dễ tìm. Đây là khu phố thương mại sầm uất tại Sao Biển 1 - VinHomes Ocean Park 1, Gia Lâm, Hà Nội. Khu vực có bãi đỗ xe ô tô, xe máy rộng rãi và có bảng biển chỉ dẫn của Nguyễn Nam Academy cực kỳ rõ ràng ở cửa ra vào."
    }
  ];

  // Sound play on register (High-fidelity sound simulation using browser speech or synthesized click effect)
  const playInteractiveClick = () => {
    try {
      if (typeof window !== 'undefined') {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioCtx) {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, audioCtx.currentTime); // high note
          osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.16);
        }
      }
    } catch (e) {
      // AudioContext not supported or blocked by user
    }
  };

  // Live simulation script state handler for the practice tool
  const scriptSteps = [
    {
      label: "Bước 1: Mở đầu cuộc gọi (Phủ đầu nỗi lo)",
      speaker: "Tôi gõ máy gọi khích lệ:",
      script: `"Chào anh Nam ạ. Em là [Tên bạn] đây anh... (Dừng 1 giây)... Dạ em biết cuộc gọi này hoàn toàn đột ngột với mình, nhưng em chỉ xin đúng 27 giây để chia sẻ nhanh một giải pháp tối ưu dòng tiền lãi vay ngân hàng ở phân khu Sao Biển đang chuẩn bị bàn giao. Anh cho em xin đúng 27 giây được không ạ?"`,
      badge: "Kỹ năng '27 giây' tối thượng",
      tip: "Nói chậm rãi, hạ giọng xuống tông trung trầm, tạo sự tự nhiên gần gũi như một người quen."
    },
    {
      label: "Bước 2: Xử lý khi khách phản hồi lạnh ('Ừ em nói nhanh đi')",
      speaker: "Khách lắng nghe, bạn đáp lời tiếp tục:",
      script: `"Dạ cảm ơn anh Nam đã ưu ái. Khác với các cuộc điện thoại quảng cáo thông thường, em gọi trực tiếp vì biết anh đang sở hữu dòng tài sản gần khu vực Sao Biển. Hiện ngân hàng chuẩn bị điều chỉnh biên độ lãi thả nổi từ tháng tới, em có giải pháp cấu trúc lại khoản vay này giúp tiết kiệm trung bình 18 triệu mỗi tháng..."`,
      badge: "Đập tan đề phòng cực bén",
      tip: "Đưa ngay thông tin sát sườn lợi ích tài chính của khách hàng, nói rõ giá trị thiết thực thay vì mời chào mua bán."
    },
    {
      label: "Bước 3: Xử lý từ chối phổ biến khi khách bảo bận ('Bận rồi / Không mua')",
      speaker: "Ví dụ khách từ chối 'Anh không có nhu cầu đâu em ơi':",
      script: `"Dạ em hiểu mà. Một người bận rộn và nhiều công việc như anh Nam chắc chắn hàng ngày nhận rất nhiều cuộc gọi bất động sản phiền phức. Thực sự em cũng không có kỳ vọng bán hàng gì ngay qua cuộc gọi ngắn này, em chỉ muốn là đầu mối tin cậy gửi anh file PDF so sánh lãi suất các ngân hàng qua Zalo để anh tham khảo khi cần thôi ạ..."`,
      badge: "Hạ nhiệt căng thẳng tinh tế",
      tip: "Tỏ ra thấu hiểu tuyệt đối và hạ thấp kỳ vọng bán hàng xuống bằng không. Chạy đua lấy thông tin Zalo."
    },
    {
      label: "Bước 4: Nghệ thuật kéo khách về Zalo",
      speaker: "Chốt vấn đề bằng Zalo chính chủ:",
      script: `"Số điện thoại đuôi 5678 của anh có phải là Zalo anh đang dùng không anh Nam? Em xin phép add Zalo anh, gửi đúng 1 file so sánh 2 trang cực kỳ ngắn gọn. Lúc nào anh rảnh lướt xem là nắm rõ, không tốn thời gian trao đổi thêm ạ. Em kết bạn nhé anh Nam?"`,
      badge: "Tỷ lệ kết bạn Zalo tăng vọt",
      tip: "Mô tả tài liệu cực ngắn (2 trang) để kích thích sự tiếp thu lập tức của khách."
    }
  ];

  if (showThankYouPage) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] text-neutral-800 flex flex-col font-sans">
        <main className="flex-grow flex flex-col items-center py-8 md:py-12 px-4">
          <div className="max-w-7xl w-full text-center space-y-8 md:space-y-12">
            <div className="space-y-3">
              <h1 className="text-5xl md:text-7xl font-black text-[#E11D48] tracking-tighter uppercase leading-none drop-shadow-sm">
                ĐÃ GỬI EMAIL!
              </h1>
              <p className="text-lg md:text-2xl text-gray-400 font-bold italic tracking-wide">
                Hãy làm theo hướng dẫn bên dưới
              </p>
            </div>

            <div className="max-w-7xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
                
                {/* Step 1 */}
                <div className="flex flex-col group h-full">
                  <div className="bg-white rounded-[2rem] p-4 md:p-6 w-full h-full border border-gray-100 shadow-xl hover:shadow-red-50 hover:border-red-100 transition-all duration-300 flex flex-col">
                    <div className="rounded-[1.5rem] overflow-hidden mb-4 flex items-center justify-center bg-gray-50 aspect-[4/5] w-full shadow-inner relative h-80 sm:h-96 md:h-96">
                      <Image
                        alt="Check Inbox"
                        className="object-contain group-hover:scale-105 transition-transform duration-700"
                        src="https://i.postimg.cc/GmP1Y4KN/Bu_o_c_1.png"
                        fill
                        unoptimized
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="mt-auto px-2 mb-2 min-h-[50px] flex items-center justify-center text-center">
                      <p className="text-gray-900 font-black leading-tight text-xl md:text-2xl">
                        Kiểm tra hộp thư <span className="text-[#E11D48]">Inbox (Chính)</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col group h-full">
                  <div className="bg-white rounded-[2rem] p-4 md:p-6 w-full h-full border border-gray-100 shadow-xl hover:shadow-red-50 hover:border-red-100 transition-all duration-300 flex flex-col">
                    <div className="rounded-[1.5rem] overflow-hidden mb-4 flex items-center justify-center bg-gray-50 aspect-[4/5] w-full shadow-inner relative h-80 sm:h-96 md:h-96">
                      <Image
                        alt="Check Promotions"
                        className="object-contain group-hover:scale-105 transition-transform duration-700"
                        src="https://i.postimg.cc/XYK0FrLt/Bu_o_c_2.png"
                        fill
                        unoptimized
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="mt-auto px-2 mb-2 min-h-[50px] flex items-center justify-center text-center">
                      <p className="text-gray-900 font-black leading-tight text-xl md:text-2xl">
                        Kiểm tra tab <span className="text-[#E11D48]">Thư rác (Spam)</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col group h-full">
                  <div className="bg-white rounded-[2rem] p-4 md:p-6 w-full h-full border border-gray-100 shadow-xl hover:shadow-red-50 hover:border-red-100 transition-all duration-300 flex flex-col border-b-[8px] border-b-red-500">
                    <div className="rounded-[1.5rem] overflow-hidden mb-4 flex items-center justify-center bg-gray-50 aspect-[4/5] w-full shadow-inner relative h-80 sm:h-96 md:h-96">
                      <Image
                        alt="Check Spam"
                        className="object-contain group-hover:scale-105 transition-transform duration-700"
                        src="https://i.postimg.cc/wvh1tXMV/Bu-o-c_3-new.png"
                        fill
                        unoptimized
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="mt-auto px-2 mb-2 min-h-[50px] flex items-center justify-center text-center">
                      <p className="text-gray-900 font-extrabold leading-tight text-xl md:text-2xl uppercase">
                        BẤM <span className="text-[#E11D48] font-black underline">&ldquo;NOT SPAM&rdquo;</span> ĐỂ NHẬN TÀI LIỆU
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="max-w-4xl mx-auto w-full space-y-6">
              <div className="bg-white border border-blue-50 rounded-[2rem] shadow-xl overflow-hidden text-left">
                <div className="p-6 md:p-10 space-y-6">
                  
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-md">
                      1
                    </div>
                    <p className="text-gray-700 text-lg md:text-xl leading-relaxed pt-1 font-medium">
                      Kiểm tra hộp thư <span className="font-extrabold text-gray-900">Inbox (Hộp thư đến)</span> hoặc tab <span className="font-extrabold text-gray-900">Promotions (Quảng cáo)</span>.
                    </p>
                  </div>
                  
                  <div className="h-px bg-gray-100 w-full" />
                  
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-md">
                      2
                    </div>
                    <p className="text-gray-700 text-lg md:text-xl leading-relaxed pt-1 font-medium">
                      Nếu không thấy, vui lòng kiểm tra mục <span className="font-extrabold text-gray-900">Spam (Thư rác)</span>.
                    </p>
                  </div>
                  
                  <div className="h-px bg-gray-100 w-full" />
                  
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="w-10 h-10 rounded-full bg-[#F43F5E] text-white flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-md">
                      3
                    </div>
                    <div className="space-y-2 pt-1">
                      <p className="text-[#F43F5E] font-black text-xl md:text-2xl uppercase tracking-tight">
                        QUAN TRỌNG:
                      </p>
                      <p className="text-gray-700 text-lg md:text-xl leading-relaxed font-semibold">
                        Nếu mail nằm trong Spam, hãy bấm nút <span className="font-extrabold text-[#E11D48] underline">&ldquo;Report not spam&rdquo;</span> (Không phải thư rác) để đảm bảo bạn nhận được tài liệu từ Nguyễn Nam.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
              <p className="text-gray-400 text-base md:text-lg italic font-bold">
                * Email tự động có thể mất 30s để đến hộp thư của bạn.
              </p>
            </div>

            <div className="pt-4 flex flex-col items-center gap-4">
              <button
                onClick={() => {
                  setShowThankYouPage(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-extrabold text-xl cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 py-3 px-6 rounded-full shadow-md"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
                Quay lại trang chính
              </button>
              
              <div className="flex items-center gap-2 text-[12px] text-gray-400 font-extrabold uppercase tracking-[0.4em] mt-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                BẢO MẬT & HỖ TRỢ 24/7
              </div>
            </div>

          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-gray-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-50 bg-[#0B0B0B]/90 backdrop-blur-md border-b border-white/5 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand to-brand-light flex items-center justify-center font-bold text-black text-lg shadow-lg">
              NN
            </div>
            <div>
              <span className="font-semibold text-white tracking-wider block text-sm sm:text-base">NGUYÊN NAM</span>
              <span className="text-[10px] text-brand uppercase font-mono block tracking-widest -mt-1">ACADEMY</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300">
            <a href="#pain-points-section" className="hover:text-brand transition-colors">Nỗi đau Môi giới</a>
            <a href="#benefits-section" className="hover:text-brand transition-colors">Giá trị nhận được</a>
            <a href="#agenda-section" className="hover:text-brand transition-colors">Nội dung học</a>
            <a href="#speaker-section" className="hover:text-brand transition-colors">Nguyễn Nam</a>
            <a href="#faq-section" className="hover:text-brand transition-colors">Giải đáp thắc mắc</a>
          </nav>

          <div className="flex items-center gap-4">
            <a 
              href="#registration-section" 
              className="bg-brand hover:bg-brand-light text-black font-semibold text-xs sm:text-sm py-2 px-4 rounded-full transition-all duration-300 transform active:scale-95 shadow-[0_0_15px_rgba(255,153,0,0.3)] hover:shadow-[0_0_20px_rgba(255,153,0,0.5)]"
              onClick={playInteractiveClick}
            >
              Giữ Vé Miễn Phí
            </a>
          </div>
        </div>
      </header>

      {/* DYNAMIC PROGRESS INCENTIVE STRIP */}
      <div className="bg-gradient-to-r from-red-600 via-stone-900 to-[#141414] py-2.5 px-4 text-center border-b border-red-500/10 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <span className="bg-black/40 border border-brand/20 px-2.5 py-0.5 rounded text-white text-[11px] uppercase font-mono font-bold tracking-wider animate-pulse flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping"></span> Live Event Tracker
          </span>
          <p className="font-medium text-gray-100 flex items-center gap-2">
            Đã có <strong className="text-brand font-bold text-sm sm:text-base">{currentRegisteredCount}</strong>/30 Môi giới đăng ký giữ chỗ. 
            <span className="text-red-400 font-bold">Chỉ còn đúng {seatsRemaining} ghế cuối cùng!</span>
          </p>
          <a
            href="#registration-section"
            className="text-yellow-300 hover:text-white underline font-semibold text-xs ml-2 flex items-center gap-0.5"
          >
            Đăng ký ngay trước khi đóng form <ChevronRight className="w-3.5 h-3.5 inline" />
          </a>
        </div>
      </div>

      <main className="flex-grow">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-24 md:py-32 border-b border-white/5">
          {/* Subtle grid patterns */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900/40 via-[#0B0B0B] to-[#0B0B0B]" />
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand/5 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-brand/5 rounded-full blur-[120px]" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
            
            {/* Elegant Double Badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <span className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-[12px] sm:text-sm px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                MIỄN PHÍ 100%
              </span>
              <span className="bg-[#141414] border border-brand/40 text-brand font-bold text-[12px] sm:text-sm px-4 py-1.5 rounded-full uppercase tracking-wider">
                GIỚI HẠN CHỈ 30 HỌC VIÊN
              </span>
            </div>

            <p className="text-xs sm:text-sm md:text-base text-brand font-mono tracking-widest uppercase font-bold mb-3">
              NGUYỄN NAM ACADEMY — EVENT KHAI PHÁ DOANH SỐ
            </p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-5xl mx-auto">
              Từ Sợ Bị Từ Chối Đến Làm Chủ Cuộc Gọi <span className="bg-gradient-to-r from-brand via-amber-400 to-yellow-500 bg-clip-text text-transparent">Telesale</span>
            </h1>

            <p className="text-xl sm:text-2xl mt-4 text-brand-light font-medium tracking-wide">
              ĐÀO TẠO CHUYÊN SÂU KỸ NĂNG TELESALE BẤT ĐỘNG SẢN CHUYÊN NGHIỆP
            </p>

            <p className="mt-6 text-gray-300 text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
              Buổi đào tạo thực chiến dập tắt triệt để nỗi lo sợ nhấc máy của môi giới bất động sản. 
              Giúp bạn mở đầu cuộc gọi tự nhiên lý tưởng, xử lý lời từ chối chuyên nghiệp nhất và biến data lạnh bất lợi thành khách hàng hữu hảo trên Zalo.
            </p>

            {/* Quick Live Countdown Row */}
            <div className="mt-10 max-w-xl mx-auto bg-neutral-900/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 sm:p-6 shadow-2xl">
              <div className="text-xs uppercase tracking-widest text-gray-400 font-mono mb-3">
                Cơ hội chỉ mở trong:
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-black/50 p-2 sm:p-3 rounded-lg border border-white/5">
                  <div className="text-2xl sm:text-3xl font-extrabold text-brand font-mono">{countdown.days}</div>
                  <div className="text-[10px] sm:text-xs text-gray-400">Ngày</div>
                </div>
                <div className="bg-black/50 p-2 sm:p-3 rounded-lg border border-white/5">
                  <div className="text-2xl sm:text-3xl font-extrabold text-brand font-mono">{countdown.hours}</div>
                  <div className="text-[10px] sm:text-xs text-gray-400">Giờ</div>
                </div>
                <div className="bg-black/50 p-2 sm:p-3 rounded-lg border border-white/5">
                  <div className="text-2xl sm:text-3xl font-extrabold text-brand font-mono">{countdown.minutes}</div>
                  <div className="text-[10px] sm:text-xs text-gray-400">Phút</div>
                </div>
                <div className="bg-black/50 p-2 sm:p-3 rounded-lg border border-white/5">
                  <div className="text-2xl sm:text-3xl font-extrabold text-red-500 font-mono animate-pulse">{countdown.seconds}</div>
                  <div className="text-[10px] sm:text-xs text-gray-400">Giây</div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm text-yellow-500">
                <AlertTriangle className="w-4 h-4 text-brand shrink-0" />
                <span>Số lượng giới hạn 30 người – Form sẽ tự động đóng ngay khi đủ.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#registration-section"
                className="w-full sm:w-auto bg-brand hover:bg-brand-light text-black font-extrabold text-lg py-4 px-10 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-[0_0_25px_rgba(255,153,0,0.4)] hover:shadow-[0_0_35px_rgba(255,153,0,0.6)]"
              >
                Đăng Ký Giữ Chỗ Miễn Phí
              </a>
              <div className="text-gray-400 text-xs sm:text-sm font-mono flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-ping"></span> 
                <span>Đủ 30 người sẽ tự động khóa form đăng ký.</span>
              </div>
            </div>

            {/* Core Info Icons Badge Cards */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              <div className="bg-neutral-900/40 p-4 rounded-xl border border-white/5 flex items-center gap-3 text-left">
                <div className="w-11 h-11 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-gray-400 text-xs uppercase font-mono">Thời lượng học</div>
                  <div className="text-white font-semibold text-sm">08h00 – 17h00</div>
                  <div className="text-gray-400 text-[11px]">Thứ 4, 24/06/2026</div>
                </div>
              </div>

              <div className="bg-neutral-900/40 p-4 rounded-xl border border-white/5 flex items-center gap-3 text-left">
                <div className="w-11 h-11 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-gray-400 text-xs uppercase font-mono">Địa điểm học</div>
                  <div className="text-white font-semibold text-sm">SP02-02 – Sao Biển 1</div>
                  <div className="text-gray-400 text-[11px]">Vinhomes Ocean Park 1</div>
                </div>
              </div>

              <div className="bg-neutral-900/40 p-4 rounded-xl border border-white/5 flex items-center gap-3 text-left">
                <div className="w-11 h-11 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-gray-400 text-xs uppercase font-mono">Diễn giả thực chiến</div>
                  <div className="text-white font-semibold text-sm">Nguyễn Nam</div>
                  <div className="text-gray-400 text-[11px]">Nguyễn Nam Academy</div>
                </div>
              </div>

              <div className="bg-neutral-900/40 p-4 rounded-xl border border-white/5 flex items-center gap-3 text-left">
                <div className="w-11 h-11 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-gray-400 text-xs uppercase font-mono">Giá vé tham gia</div>
                  <div className="text-red-400 font-extrabold text-sm uppercase">Miễn phí 100%</div>
                  <div className="text-yellow-400 text-[11px]">Chỉ còn {seatsRemaining} suất trống</div>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* NOI DAU BROKER SECTION */}
        <section id="pain-points-section" className="py-20 bg-neutral-950 relative border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-red-500 font-mono text-sm uppercase tracking-widest font-semibold">THỰC TRẠNG PHŨ PHÀNG</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1.5">
                4 Nỗi Sợ Phổ Biến Khiến Môi Giới Đốt Cháy Hàng Ngàn Data Mới Mỗi Ngày
              </h2>
              <div className="h-1 w-20 bg-red-600 mx-auto mt-4 rounded"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {PAIN_POINTS.map((pt, idx) => (
                <div 
                  key={pt.id} 
                  className="bg-neutral-900 p-6 sm:p-8 rounded-2xl border border-red-950/40 hover:border-red-500/10 transition-all duration-300 relative overflow-hidden group flex gap-5"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl group-hover:bg-red-600/10 transition-all duration-300"></div>
                  <div className="p-3 bg-red-600/10 rounded-xl shrink-0 h-fit text-red-500 border border-red-500/20">
                    {pt.icon}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-wide flex items-center gap-2">
                      <span className="text-red-500 font-mono text-xs font-bold leading-none bg-red-500/10 px-2 py-1 rounded">0{idx + 1}</span>
                      {pt.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {pt.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quote of reality */}
            <div className="mt-14 max-w-4xl mx-auto text-center bg-gradient-to-r from-red-950/20 via-neutral-900 to-red-950/20 p-6 rounded-xl border border-red-900/20">
              <p className="text-gray-300 italic text-sm sm:text-base leading-relaxed">
                &ldquo;90% Môi giới bị thất bại không phải vì thông tin dự án không hấp dẫn, mà bởi vì cách nói chuyện qua điện thoại quá rập khuôn, khiến khách hàng dập máy ngay lập tức trước khi có cơ hội được trình bày cơ hội đầu tư giá trị.&rdquo;
              </p>
              <div className="text-brand font-bold text-xs sm:text-sm mt-3 uppercase font-mono">— Trích Giáo trình Huấn luyện Nguyễn Nam Academy</div>
            </div>
          </div>
        </section>


        {/* BENEFIT / SOLUTIONS SECTION */}
        <section id="benefits-section" className="py-20 relative bg-[#0B0B0B] border-b border-white/5">
          <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-brand/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-brand font-mono text-sm uppercase tracking-widest font-semibold">TỪNG BƯỚC THAY ĐỔI</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1.5">
                Bạn Sẽ Biết Cách Đón Nhận Và Làm Chủ Cuộc Gọi Telesale Như Thế Nào?
              </h2>
              <p className="text-gray-400 mt-3 text-sm sm:text-base">
                Nội dung học thực chiến áp dụng trực tiếp, xóa tan sự ngượng ngùng của bạn, biến cuộc gọi thành câu chuyện vui vẻ giữa những người đầu tư.
              </p>
              <div className="h-1 w-20 bg-brand mx-auto mt-4 rounded"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {SOLUTIONS.map((sol) => (
                <div 
                  key={sol.id} 
                  className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl relative hover:border-brand/40 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="absolute top-4 right-4 text-3xl font-black text-brand/10 font-mono leading-none">
                    {sol.number}
                  </div>
                  
                  <div className="w-10 h-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-4">
                    <CheckCircle2 className="w-5 h-5 text-brand" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                    {sol.title}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                    {sol.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Target Audience Bullet point showcase */}
            <div className="mt-20 border border-brand/20 rounded-3xl bg-neutral-900/50 p-8 max-w-5xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Users className="w-48 h-48 text-brand" />
              </div>
              
              <h3 className="text-2xl font-bold text-white text-center mb-8">Ai Nên Có Mặt Tại Buổi Đào Tạo Này?</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TARGET_AUDIENCES.map(t => (
                  <div key={t.id} className="bg-black/40 p-5 rounded-xl border border-white/5 hover:border-brand/20 transition-colors">
                    <div className="flex items-center gap-2 text-brand font-bold text-base mb-2">
                      <Sparkles className="w-4 h-4 text-brand shrink-0" />
                      <span>{t.title}</span>
                    </div>
                    <p className="text-gray-300 text-xs sm:text-sm leading-normal">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* LIVE WORK INTERACTION - CALL PRACTICE TOOL (EXCLUSIVE HIGHLIGHT) */}
        <section className="py-20 bg-neutral-950 relative border-b border-white/5">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <span className="text-brand font-mono text-xs sm:text-sm uppercase tracking-widest font-bold">TRẢI NGHIỆM TRƯỚC SỰ KHÁC BIỆT</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1.5">
              Học thử kịch bản &apos;27 Giây&apos; cực bén ngay tại đây!
            </h2>
            <p className="text-gray-400 text-sm mt-3 max-w-2xl mx-auto leading-relaxed">
              Hãy bấm qua từng bước hành động dưới đây để khám phá lối dẫn dắt thông minh mà Nguyễn Nam sẽ trực tiếp chỉ dạy sâu sắc hơn tại lớp học thực tế.
            </p>

            <div className="mt-10 bg-neutral-900 rounded-3xl border border-white/5 p-4 sm:p-8 text-left max-w-3xl mx-auto shadow-2xl relative">
              <div className="absolute top-3 right-4 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 font-mono"></span>
              </div>
              
              {/* Tab headers */}
              <div className="flex gap-2 sm:gap-3 border-b border-white/5 pb-4 overflow-x-auto whitespace-nowrap scrollbar-none">
                {scriptSteps.map((step, idx) => (
                  <button
                    key={idx}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all duration-300 ${
                      currentScriptStep === idx 
                        ? 'bg-brand text-black shadow-md' 
                        : 'bg-black/40 text-gray-400 hover:text-white hover:bg-neutral-800'
                    }`}
                    onClick={() => {
                      setCurrentScriptStep(idx);
                      playInteractiveClick();
                    }}
                  >
                    BƯỚC 0{idx + 1}
                  </button>
                ))}
              </div>

              {/* Step info context display */}
              <div className="mt-6">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                  <span className="text-gray-400 text-xs sm:text-sm font-mono tracking-wider font-semibold">
                    {scriptSteps[currentScriptStep].label}
                  </span>
                  <span className="bg-brand/10 border border-brand/30 text-brand text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {scriptSteps[currentScriptStep].badge}
                  </span>
                </div>

                <div className="bg-black/60 border border-white/5 rounded-2xl p-4 sm:p-6 mt-3 font-medium text-sm sm:text-base text-gray-200 leading-relaxed relative">
                  <span className="absolute -top-3.5 left-4 bg-brand px-2 py-0.5 rounded text-[10px] text-black font-extrabold font-mono uppercase tracking-widest">
                    Lời thoại khuyến nghị
                  </span>
                  <span className="text-brand quote-mark text-4xl block absolute right-4 top-2 text-brand/10 pointer-events-none">”</span>
                  <p className="whitespace-pre-line italic text-brand-light font-sans pt-1">
                    {scriptSteps[currentScriptStep].script}
                  </p>
                </div>

                <div className="mt-5 bg-black/20 p-4 rounded-xl border-l-[3px] border-brand/50">
                  <div className="text-brand text-xs uppercase font-mono font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Bí mật kỹ năng:
                  </div>
                  <p className="text-gray-300 text-xs mt-1 leading-normal">
                    {scriptSteps[currentScriptStep].tip}
                  </p>
                </div>
              </div>

              {/* Navigation button indicators */}
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/5">
                <button
                  disabled={currentScriptStep === 0}
                  onClick={() => {
                    setCurrentScriptStep(prev => prev - 1);
                    playInteractiveClick();
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    currentScriptStep === 0 
                      ? 'text-gray-600 cursor-not-allowed bg-black/10' 
                      : 'text-gray-300 hover:text-white bg-black/40'
                  }`}
                >
                  ◀ Quay lại
                </button>
                
                <span className="text-xs text-gray-400 font-mono">
                  {currentScriptStep + 1} / {scriptSteps.length}
                </span>

                <button
                  disabled={currentScriptStep === scriptSteps.length - 1}
                  onClick={() => {
                    setCurrentScriptStep(prev => prev + 1);
                    playInteractiveClick();
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    currentScriptStep === scriptSteps.length - 1 
                      ? 'text-gray-650 cursor-not-allowed bg-black/10' 
                      : 'text-black bg-brand hover:bg-brand-light font-bold'
                  }`}
                >
                  Tiếp theo ▶
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-6 max-w-xl mx-auto italic">
              * Đây chỉ là 1/10 kịch bản thực tế bạn sẽ được Nguyễn Nam hướng dẫn chi tiết, bổ sung ngữ điệu nói, sửa ngắt nhịp tại lớp học.
            </p>
          </div>
        </section>


        {/* DETAILED AGENDA TIME TABLE */}
        <section id="agenda-section" className="py-20 bg-[#0B0B0B] relative border-b border-white/5">
          <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] bg-brand/5 rounded-full blur-[110px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-brand font-mono text-sm uppercase tracking-widest font-semibold">LỘ TRÌNH ĐÀO TẠO</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1.5">
                Chi Tiết Kế Hoạch 1 Ngày Thực Chiến Cùng Loạt Bài Giảng Chuyên Sâu
              </h2>
              <p className="text-gray-400 mt-3 text-sm sm:text-base">
                Lớp học kéo dài từ 08h00 sáng tới 17h00 chiều, tập trung 80% thời gian thực hành tương tác trực tiếp.
              </p>
              <div className="h-1 w-20 bg-brand mx-auto mt-4 rounded"></div>
            </div>

            <div className="max-w-4xl mx-auto relative pl-1 sm:pl-8 before:content-[''] before:absolute before:left-[11px] sm:before:left-[35px] before:top-4 before:bottom-4 before:w-[2px] before:bg-brand/20">
              
              {AGENDA.map((item, idx) => (
                <div key={item.id} className="relative pl-10 sm:pl-14 pb-12 last:pb-0 group">
                  
                  {/* Circle outline marking step */}
                  <div className="absolute left-[2px] sm:left-[26px] top-1.5 w-[20px] h-[20px] rounded-full border-2 border-brand bg-black flex items-center justify-center text-brand font-mono text-[10px] font-bold group-hover:bg-brand group-hover:text-black transition-all duration-300 z-10 shadow-[0_0_8px_rgba(255,153,0,0.5)]">
                    {idx + 1}
                  </div>

                  {/* Detailed Box */}
                  <div className="bg-neutral-900 border border-neutral-800 p-5 sm:p-6 rounded-2xl hover:border-brand/30 transition-colors">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-brand transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* SPEAKER PROFILE SECTION */}
        <section id="speaker-section" className="py-20 bg-[#0B0B0B] relative border-b border-white/5">
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-brand/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 items-center max-w-5xl mx-auto">
              
              {/* Speaker Visual Styling Column */}
              <div className="md:col-span-5 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand to-yellow-400 rounded-3xl rotate-3 scale-102 opacity-20 blur-sm"></div>
                <div className="relative bg-neutral-900 border border-brand/30 rounded-3xl p-4 overflow-hidden shadow-2xl">
                  {/* High concept placeholder / avatar for Nguyễn Nam with real image */}
                  <div className="h-80 w-full rounded-2xl bg-neutral-950 flex flex-col items-center justify-end select-none relative overflow-hidden">
                    {/* Real Avatar Photo */}
                    <div className="absolute inset-0 w-full h-full">
                      <Image
                        src="https://i.postimg.cc/j5nWg8jz/anh-dai-dien.jpg"
                        alt="Nguyễn Nam"
                        fill
                        className="object-cover object-top"
                        referrerPolicy="no-referrer"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        priority
                      />
                      {/* Dark overlay at bottom to make label text readable */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                    </div>
                    
                    <div className="relative text-center z-10 mb-5">
                      <p className="text-white font-extrabold text-xl tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">NGUYỄN NAM</p>
                      <p className="text-brand text-xs font-mono font-bold tracking-widest uppercase mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Founder Nguyễn Nam Academy</p>
                    </div>

                    {/* Subtle branding seal */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] text-gray-300 font-mono tracking-widest select-none bg-black/60 backdrop-blur-xs px-3 py-1 rounded-full border border-white/10 z-10 whitespace-nowrap">
                      TELESALE MÔI GIỚI CHUYÊN SÂU
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                      <div className="text-brand font-bold font-mono">10+ Năm</div>
                      <div className="text-[10px] text-gray-400">Thành tích Sale</div>
                    </div>
                    <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                      <div className="text-brand font-bold font-mono">5000+</div>
                      <div className="text-[10px] text-gray-400">Học viên</div>
                    </div>
                    <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                      <div className="text-brand font-bold font-mono">98%</div>
                      <div className="text-[10px] text-gray-400 font-sans">Đánh giá tốt</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Speaker Description Details Column */}
              <div className="md:col-span-7">
                <span className="text-brand font-mono text-sm uppercase tracking-widest font-bold">NGƯỜI TRUYỀN CẢM HỨNG</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1.5 mb-6">
                  Nguyễn Nam BĐS
                </h2>
                <div className="h-1 w-14 bg-brand mb-6 rounded"></div>

                <div className="space-y-4 text-gray-300 text-sm sm:text-base leading-relaxed">
                  <p>
                    Với hơn 6 năm lăn lộn thực tế tại các chiến trường bất động sản lớn nhỏ từ Nam ra Bắc, từ đất nền tỉnh lẻ, biệt thự biển tới các đại đô thị chung cư Vinhomes. 
                    <strong>Nguyễn Nam BĐS</strong> thấu hiểu tường tận gốc rễ những rào cản tâm lý và sự đớn đau của một nhân sự môi giới khi hàng ngày phải gọi danh sách data lạnh.
                  </p>
                  <p>
                    Sáng lập ra <strong>Nguyễn Nam Academy</strong> 
                    Phương pháp giảng dạy của ông lược bỏ hoàn toàn lý thuyết sáo rỗng, áp dụng kịch bản thực tiễn có đo lường chuyển đổi thực tế.
                  </p>

                  <p className="border-l-4 border-brand pl-4 py-2 italic bg-neutral-900 rounded-r-lg text-gray-200">
                    &ldquo;Telesale không phải là việc bấm số làm phiền người khác cầu xin cuộc hẹn. Đó là nghệ thuật giao tiếp của người có tư duy cấp cao, nhận diện nỗi đau và trao đi giải pháp đắt giá đúng thời điểm vàng.&rdquo;
                  </p>
                  
                  <div className="pt-4 flex flex-wrap gap-2.5">
                    <span className="bg-[#141414] text-xs text-white px-3 py-1.5 rounded-md border border-white/5"># Chuyên gia đàm phán cuộc gọi</span>
                    <span className="bg-[#141414] text-xs text-white px-3 py-1.5 rounded-md border border-white/5"># Chuyên gia đào tạo Sales Vinhomes</span>
                    <span className="bg-[#141414] text-xs text-white px-3 py-1.5 rounded-md border border-white/5"># Tác giả bộ giáo trình Telesale 27s</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>


        {/* INTERACTIVE FORM REGISTRATION SECTION */}
        <section id="registration-section" className="py-24 bg-neutral-950 relative border-t border-b border-brand/10">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-dark to-transparent" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="bg-red-500 text-white text-xs font-black px-3.5 py-1.2 rounded-full uppercase tracking-wider animate-pulse inline-block">
                  Cơ hội khóa 30 ghế cuối cùng
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">
                  Đăng Ký Giữ Chỗ Ngay Hôm Nay
                </h2>
                <p className="text-gray-400 mt-2 text-xs sm:text-sm">
                  Lưu ý: Hệ thống và form đăng ký sẽ tự động đóng ngay lập tức khi đủ số lượng tối đa 30 học viên. Vui lòng điền thông tin chính xác.
                </p>
              </div>

              {/* Main Ticket Interface (Conditional on register status) */}
              <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                
                {/* Decorative golden/brand pattern background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand/5 rounded-full blur-[100px] pointer-events-none" />

                {!ticket ? (
                  /* THE REGISTRATION FORM */
                  <form onSubmit={handleRegisterSubmit} className="relative z-10 space-y-6">
                    
                    {/* Live Counter Display in Form with Premium Progress Bar */}
                    <div className="bg-black/70 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <div className="text-zinc-400 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block"></span>
                            Tình Trạng Ghế Sự Kiện: <strong className="text-white font-black">{currentRegisteredCount}/{TOTAL_SEATS} ĐÃ GIỮ</strong>
                          </div>
                          <p className="text-white font-bold text-sm sm:text-base mt-0.5 select-none font-sans">
                            Đã ghi danh: <span className="text-brand font-black text-base sm:text-lg">{currentRegisteredCount}</span>/30 Học viên
                          </p>
                        </div>
                        <span className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold px-3 py-1 rounded font-mono select-none uppercase tracking-wide">
                          {seatsRemaining > 0 ? `Chỉ còn ${seatsRemaining} ghế trống` : 'Hết Suất Trống'}
                        </span>
                      </div>

                      {/* Professional Polish theme gradient progress bar */}
                      <div className="w-full">
                        <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#FF9900] to-[#EF4444] transition-all duration-500 ease-out" 
                            style={{ width: `${Math.min(100, Math.round((currentRegisteredCount / TOTAL_SEATS) * 100))}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-2 text-center font-mono uppercase tracking-wider">
                          Đủ 30 học viên lớp sẽ đóng đăng ký giữ chỗ hoàn toàn tự động
                        </p>
                      </div>
                    </div>

                    {submitError && (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      
                      {/* Name input */}
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm text-gray-300 font-bold flex items-center gap-1">
                          <User className="w-4 h-4 text-brand" />
                          Họ và Tên Học Viên <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formValues.fullName}
                          onChange={handleInputChange}
                          placeholder="Ví dụ: Nguyễn Văn Nam"
                          className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-brand transition-colors placeholder:text-gray-600"
                          disabled={seatsRemaining <= 0 || isSubmitting}
                        />
                      </div>

                      {/* Phone input */}
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm text-gray-300 font-bold flex items-center gap-1">
                          <Smartphone className="w-4 h-4 text-brand" />
                          Số Điện Thoại Nhận Vé <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={formValues.phone}
                          onChange={handleInputChange}
                          placeholder="Ví dụ: 0912345678"
                          className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-brand transition-colors placeholder:text-gray-600"
                          disabled={seatsRemaining <= 0 || isSubmitting}
                        />
                      </div>

                      {/* Email input */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs sm:text-sm text-gray-300 font-bold flex items-center gap-1">
                          <Mail className="w-4 h-4 text-brand" />
                          Địa Chỉ Email Xác Xác Thực <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formValues.email}
                          onChange={handleInputChange}
                          placeholder="Ví dụ: nguyennambds@gmail.com"
                          className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-brand transition-colors placeholder:text-gray-600"
                          disabled={seatsRemaining <= 0 || isSubmitting}
                        />
                      </div>



                    </div>

                    {/* Commit check */}
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formValues.committed}
                          onChange={handleCheckboxChange}
                          disabled={seatsRemaining <= 0 || isSubmitting}
                          className="mt-1 accent-brand rounded"
                        />
                        <span className="text-xs sm:text-sm text-gray-300 leading-normal">
                          Tôi cam kết tham gia lớp học đúng giờ (<strong className="text-brand">08h00 – 17h00 ngày 24/06/2026</strong>) và có trách nhiệm giữ ghế, không đăng ký chiếm suất ảo làm mất cơ hội của các anh chị Môi giới khác.
                        </span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={seatsRemaining <= 0 || isSubmitting}
                      className={`w-full py-4 px-6 rounded-2xl text-black font-extrabold text-base sm:text-lg transition-all duration-300 transform flex items-center justify-center gap-2 ${
                        seatsRemaining <= 0 
                          ? 'bg-gray-600 text-gray-200 cursor-not-allowed border-none' 
                          : isSubmitting
                          ? 'bg-amber-600 text-black cursor-wait opacity-80'
                          : 'bg-gradient-to-r from-brand via-amber-500 to-yellow-500 hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(255,153,0,0.5)] cursor-pointer'
                      }`}
                    >
                      {isSubmitting && (
                        <svg className="animate-spin h-5 w-5 text-black shrink-0" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      )}
                      <span>
                        {seatsRemaining <= 0 
                          ? 'Form Đăng Ký Đã Khóa (Hết chỗ)' 
                          : isSubmitting
                          ? 'Đang gửi thông tin đăng ký...'
                          : 'Đồng Ý Cam Kết — Giữ Vé Miễn Phí Từ Nguyễn Nam'
                        }
                      </span>
                    </button>

                    <div className="text-center text-xs text-gray-400 font-mono">
                      Website đăng ký chính thức: telesale.nambds.vn
                    </div>

                  </form>
                ) : (
                  
                  /* TICKET SUCCESS SCREEN - HIGH INTERACTIVITY */
                  <div className="animate-fade-in relative z-10 text-center py-6">
                    
                    <div className="w-16 h-16 rounded-full bg-brand/20 border-2 border-brand flex items-center justify-center mx-auto mb-6">
                      <Check className="w-8 h-8 text-brand" />
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Xác Nhận Giữ Vé Thành Công!</h3>
                    <p className="text-brand text-xs sm:text-sm font-mono uppercase tracking-widest mt-1">HỌC VIÊN SỐ #{ticket.seatNumber} THAM DỰ LỚP</p>
                    
                    <p className="text-gray-300 text-sm mt-3 max-w-2xl mx-auto leading-relaxed">
                      Chúc mừng bạn <strong className="text-white">{ticket.fullName}</strong> đã đăng ký thành công suất giữ chỗ miễn phí tại khóa học của Nguyễn Nam. 
                      Thông tin check-in chi tiết đã được kích hoạt đồng thời hệ thống đã khóa cổng nhận đăng ký thứ {ticket.seatNumber}.
                    </p>

                    {/* STUNNING VIRTUAL PASS TICKET RENDER */}
                    <div className="mt-8 max-w-lg mx-auto bg-neutral-950 border-2 border-dashed border-brand/50 rounded-2xl overflow-hidden relative shadow-2xl">
                      
                      {/* Ticket top logo */}
                      <div className="bg-zinc-900 px-6 py-4 border-b border-white/5 flex items-center justify-between text-left">
                        <div className="flex items-center gap-2">
                          <Ticket className="w-5 h-5 text-brand" />
                          <span className="font-extrabold text-white text-xs sm:text-sm tracking-wider uppercase font-mono">NGUYỄN NAM ACADEMY</span>
                        </div>
                        <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                          VIP GUEST PASS
                        </span>
                      </div>

                      {/* Ticket content */}
                      <div className="p-6 text-left space-y-4">
                        
                        <div>
                          <div className="text-gray-500 text-[10px] uppercase font-mono tracking-widest">Tên khách hàng</div>
                          <div className="text-white font-bold text-lg sm:text-xl truncate">{ticket.fullName}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-gray-500 text-[10px] uppercase font-mono tracking-widest">Học viên số</div>
                            <div className="text-brand font-extrabold text-lg font-mono">0{ticket.seatNumber} / 30</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-[10px] uppercase font-mono tracking-widest">Mã kiểm soát</div>
                            <div className="text-white font-bold text-sm sm:text-base font-mono">{ticket.ticketCode}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                          <div>
                            <div className="text-gray-500 text-[10px] uppercase font-mono tracking-widest">Ngày diễn ra</div>
                            <div className="text-white text-xs font-semibold">24/06/2026 (Thứ 4)</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-[10px] uppercase font-mono tracking-widest">Giờ tham dự</div>
                            <div className="text-white text-xs font-semibold">08:00 – 17:00</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-gray-500 text-[10px] uppercase font-mono tracking-widest">Địa điểm chính xác</div>
                          <div className="text-white text-xs font-semibold leading-normal">
                            SP02-02 – Sao Biển 1, Vinhomes Ocean Park 1, Hà Nội.
                          </div>
                        </div>

                        {/* Interactive fake QR scan box */}
                        <div className="mt-4 p-3 bg-zinc-900/60 rounded-xl border border-white/5 flex items-center justify-between text-xs text-gray-300">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                            <span>Trạng thái: <strong>ĐÃ CAM KẾT</strong></span>
                          </div>
                          <span className="text-[10px] text-gray-500 font-mono">Đã ghi nhận lúc: {ticket.registeredAt}</span>
                        </div>

                      </div>

                      {/* Ticket tear edge circle simulation */}
                      <div className="absolute left-0 bottom-14 w-4 h-4 rounded-full bg-neutral-900 -translate-x-1/2 border-r border-brand/50"></div>
                      <div className="absolute right-0 bottom-14 w-4 h-4 rounded-full bg-neutral-900 translate-x-1/2 border-l border-brand/50"></div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={() => window.print()}
                        className="w-full sm:w-auto bg-brand hover:bg-brand-light text-black font-extrabold text-sm py-3 px-6 rounded-xl transition-all"
                      >
                        🖨 In Thẻ Tham Dự / Chụp Màn Hình Vé
                      </button>
                      <button
                        onClick={handleCancelReservation}
                        className="w-full sm:w-auto bg-black/40 hover:bg-neutral-900 border border-red-500/30 text-red-400 font-bold text-sm py-3 px-6 rounded-xl transition-all"
                      >
                        Hủy Giữ Chỗ Của Tôi
                      </button>
                    </div>

                    <p className="text-xs text-yellow-500 mt-5 leading-normal max-w-md mx-auto">
                      * Mách nhỏ: Vui lòng lưu/chụp lại vé có mã này và xuất trình cho lễ tân check-in tại cửa lắp lớp học lúc 07h45 sáng ngày 24/06/2026.
                    </p>

                  </div>
                )}

              </div>

            </div>
          </div>
        </section>


        {/* FAQ ACCORDION SECTION */}
        <section id="faq-section" className="py-20 bg-[#0B0B0B] relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-brand font-mono text-sm uppercase tracking-widest font-semibold font-bold">GIẢI ĐÁP THẮC MẮC</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1.5">
                Các Câu Hỏi Thường Gặp từ Học Viên Môi Giới
              </h2>
              <div className="h-1 w-20 bg-brand mx-auto mt-4 rounded"></div>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {FAQS.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div 
                    key={idx} 
                    className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl overflow-hidden transition-all duration-350"
                  >
                    <button
                      className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 text-white font-bold text-sm sm:text-base focus:outline-none"
                      onClick={() => {
                        setActiveFaq(isOpen ? null : idx);
                        playInteractiveClick();
                      }}
                    >
                      <span className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-brand shrink-0" />
                        {faq.question}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-brand shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
                      )}
                    </button>

                    {/* Expanded answer panel */}
                    <div 
                      className={`transition-all duration-300 overflow-hidden ${
                        isOpen ? 'max-h-80 border-t border-white/5 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="p-6 text-gray-405 text-xs sm:text-sm leading-relaxed bg-[#141414]/30 text-gray-300">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER SECTION */}
      <footer className="bg-neutral-950 border-t border-white/5 py-12 px-4 sm:px-6 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-lg bg-[#FF9900] flex items-center justify-center font-bold text-black text-lg">
              NN
            </div>
            <div>
              <span className="font-extrabold text-white tracking-widest block uppercase font-mono">NGUYỄN NAM ACADEMY</span>
              <span className="text-[10px] text-gray-400 block tracking-wider font-sans">Hệ Thống Đào Tạo Thực Chiến Môi Giới Đất Việt</span>
            </div>
          </div>

          <div className="text-center text-gray-400 leading-relaxed font-mono">
            <p>© 2026 Nguyễn Nam Academy. Bản quyền thuộc về telesale.nambds.vn</p>
            <p className="mt-1 text-[11px] text-brand">Hotline: 09xx.xxx.xxx — Địa chỉ: SP02-02 – Sao Biển 1 – OCP 1</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Link button removed */}
          </div>

        </div>
      </footer>

      {/* MOBILE STICKY BOTTOM ACTION CTA */}
      {showStickyCta && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#141414]/95 border-t border-brand/20 p-3 flex items-center justify-between gap-4 animate-fade-in backdrop-blur-md">
          <div className="text-left select-none">
            <span className="text-red-500 font-mono text-[10px] font-bold block leading-none animate-pulse">CHỈ CÒN {seatsRemaining} SUẤT TRỐNG</span>
            <span className="text-white font-bold text-xs block mt-1">Đủ học viên đóng đăng ký</span>
          </div>
          <a
            href="#registration-section"
            className="bg-brand text-black font-extrabold text-xs py-2 px-5 rounded-lg whitespace-nowrap"
            onClick={playInteractiveClick}
          >
            Đăng Ký Khóa Vé VIP
          </a>
        </div>
      )}

    </div>
  );
}
