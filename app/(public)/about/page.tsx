'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Car, Shield, Clock, Headphones, MapPin, Phone, Mail, Star, Award, ChevronRight} from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="bg-[#080f1a] min-h-screen text-white">

      {/* ===== HERO ===== */}
      <section className="relative pt-20 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080f1a]/60 to-[#080f1a]" />
        <div className="absolute top-[-100px] right-[-60px] w-[350px] h-[350px] rounded-full bg-[#4ade80] opacity-[0.05] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#4ade80]/10 border border-[#4ade80]/25 rounded-full px-4 py-1.5 text-xs font-semibold mb-6 text-[#4ade80]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] inline-block" />
            Tentang RentGo
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight text-white drop-shadow-lg">
            Platform Sewa Kendaraan <br />
            <span className="text-[#4ade80]">Terpercaya #1</span> di Indonesia
          </h1>
          <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            RentGo hadir untuk memudahkan perjalananmu. Dari kendaraan keluarga hingga motor harian, semua tersedia dengan harga transparan dan proses yang mudah.
          </p>
        </div>
      </section>

      {/* ===== VISI & MISI ===== */}
      <section className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 hover:border-[#4ade80]/25 transition-all">
          <div className="w-12 h-12 bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-2xl flex items-center justify-center mb-5">
            <Award size={22} className="text-[#4ade80]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Visi Kami</h2>
          <p className="text-white/40 text-sm leading-relaxed">
            Menjadi platform sewa kendaraan terdepan di Indonesia yang menghubungkan jutaan pelanggan dengan armada kendaraan berkualitas, aman, dan terpercaya di seluruh penjuru nusantara.
          </p>
        </div>
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 hover:border-[#4ade80]/25 transition-all">
          <div className="w-12 h-12 bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-2xl flex items-center justify-center mb-5">
            <Star size={22} className="text-[#4ade80]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Misi Kami</h2>
          <p className="text-white/40 text-sm leading-relaxed">
            Memberikan pengalaman sewa kendaraan yang mudah, cepat, dan transparan. Kami berkomitmen menghadirkan layanan terbaik dengan harga yang jujur tanpa biaya tersembunyi.
          </p>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="bg-white/[0.02] border-y border-white/[0.06] py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-5 text-center">
          {[
            { value: '500+',    label: 'Armada Kendaraan' },
            { value: '10.000+', label: 'Pelanggan Puas' },
            { value: '50+',     label: 'Kota Terjangkau' },
            { value: '4.9★',    label: 'Rating Rata-rata' },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
              <p className="text-3xl font-extrabold text-[#4ade80] mb-1">{s.value}</p>
              <p className="text-xs text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== KEUNGGULAN ===== */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Mengapa Memilih RentGo?</h2>
          <p className="text-white/40 text-sm mt-2">Kami memberikan yang terbaik untuk perjalananmu</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { icon: <Shield size={20} />,     title: 'Aman & Terpercaya',    desc: 'Semua kendaraan telah melalui inspeksi ketat, diasuransikan, dan terdaftar resmi.' },
            { icon: <Clock size={20} />,      title: 'Proses Cepat & Mudah', desc: 'Booking dalam hitungan menit. Tidak perlu antri, semua bisa dilakukan online.' },
            { icon: <Car size={20} />,        title: 'Armada Lengkap',       desc: 'Pilihan dari motor matic hingga SUV premium. Cocok untuk semua kebutuhan.' },
            { icon: <Headphones size={20} />, title: 'Support 24/7',         desc: 'Tim customer service kami siap membantu kamu kapanpun dan dimanapun.' },
          ].map((f) => (
            <div key={f.title} className="flex gap-4 bg-white/[0.04] border border-white/10 rounded-2xl p-6 hover:border-[#4ade80]/25 transition-all group">
              <div className="w-10 h-10 bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#4ade80]/20 transition-all text-[#4ade80]">
                {f.icon}
              </div>
              <div>
                <p className="font-semibold text-white mb-1">{f.title}</p>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== DEVELOPER ===== */}
      <section className="bg-white/[0.02] border-y border-white/[0.06] py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Tim Developer</h2>
            <p className="text-white/40 text-sm mt-2">Orang-orang di balik RentGo</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {[
              { name: '',           role: 'Frontend Developer', img: '',   stack: 'Next.js · TypeScript · Tailwind' },
              { name: 'Fadhil Akbar Saputra', role: 'Backend Developer',  img: '/images/fadhil.jpeg', stack: 'NestJS · TypeScript · Prisma · MySQL · Swagger · RailWay' },
            ].map((t) => (
              <div key={t.name} className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center hover:border-[#4ade80]/25 transition-all group">
                <div className="relative w-28 h-28 rounded-full mx-auto mb-5 overflow-hidden border-2 border-[#4ade80]/30 group-hover:border-[#4ade80]/60 transition-all">
                  <Image src={t.img} alt={t.name} fill className="object-cover object-top" />
                </div>
                <p className="font-bold text-white text-lg">{t.name}</p>
                <p className="text-sm text-[#4ade80] mt-1 font-medium">{t.role}</p>
                <p className="text-xs text-white/30 mt-2">{t.stack}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== KONTAK ===== */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Hubungi Kami</h2>
          <p className="text-white/40 text-sm mt-2">Kami siap membantu kamu</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { icon: <Phone size={20} />,  label: 'Telepon', value: '+62 881-0269-30456' },
            { icon: <Mail size={20} />,   label: 'Email',   value: 'hello@rentgo.id' },
            { icon: <MapPin size={20} />, label: 'Alamat',  value: 'Jl. Danau Ranau Sawojajar, Kota Malang' },
          ].map((c) => (
            <div key={c.label} className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 text-center hover:border-[#4ade80]/25 transition-all">
              <div className="w-12 h-12 bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#4ade80]">
                {c.icon}
              </div>
              <p className="text-xs text-white/40 mb-1">{c.label}</p>
              <p className="text-sm font-semibold text-white">{c.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="mx-4 md:mx-8 lg:mx-16 mb-16 bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-3xl px-8 py-12 text-center relative overflow-hidden">
        <div className="absolute top-[-80px] right-[-40px] w-[250px] h-[250px] rounded-full bg-[#4ade80] opacity-[0.05] pointer-events-none" />
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white relative z-10">Siap Mulai Perjalanan?</h2>
        <p className="text-white/40 text-sm mb-6 max-w-md mx-auto relative z-10">Bergabung dengan ribuan pelanggan puas yang sudah mempercayai RentGo.</p>
        <div className="flex items-center justify-center gap-3 flex-wrap relative z-10">
          <Link href="/vehicles" className="bg-[#4ade80] text-[#080f1a] font-bold px-6 py-3 rounded-xl hover:bg-[#22c55e] transition-colors text-sm inline-flex items-center gap-2">
            Lihat Kendaraan <ChevronRight size={16} />
          </Link>
          <Link href="/register" className="border border-white/20 text-white/70 font-semibold px-6 py-3 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-sm">
            Daftar Gratis
          </Link>
        </div>
      </section>

    </div>
  )
}