import Link from 'next/link'
import { Car, Phone, Mail, MapPin } from 'lucide-react'

const Instagram = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
)
const Twitter = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
)
const Facebook = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)

export default function Footer() {
  return (
    <footer className="bg-[#050c14] border-t border-white/[0.06] text-white mt-10">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#4ade80]/15 border border-[#4ade80]/25 rounded-xl flex items-center justify-center">
                <Car size={18} className="text-[#4ade80]" />
              </div>
              <span className="text-xl font-bold text-white">Rent<span className="text-[#4ade80]">Go</span></span>
            </div>
            <p className="text-white/35 text-sm leading-relaxed mb-4">
              Platform sewa kendaraan online terpercaya. Mudah, cepat, dan aman untuk semua kebutuhan perjalananmu.
            </p>
            <div className="flex gap-3">
              {[<Instagram />, <Twitter />, <Facebook />].map((icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-white/5 border border-white/10 hover:bg-[#4ade80]/15 hover:border-[#4ade80]/25 rounded-lg flex items-center justify-center transition-colors text-white/50 hover:text-[#4ade80]">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Layanan */}
          <div>
            <h4 className="font-semibold text-white mb-4">Layanan</h4>
            <ul className="space-y-2 text-sm text-white/35">
              {['Sewa Mobil', 'Sewa Motor', 'Antar Jemput'].map((l) => (
                <li key={l}><a href="#" className="hover:text-[#4ade80] transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Perusahaan */}
          <div>
            <h4 className="font-semibold text-white mb-4">Perusahaan</h4>
            <ul className="space-y-2 text-sm text-white/35">
              <li><Link href="/about" className="hover:text-[#4ade80] transition-colors">Tentang Kami</Link></li>
              <li><Link href="/vehicles" className="hover:text-[#4ade80] transition-colors">Kendaraan</Link></li>
              <li><a href="#" className="hover:text-[#4ade80] transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-[#4ade80] transition-colors">Kebijakan Privasi</a></li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="font-semibold text-white mb-4">Hubungi Kami</h4>
            <ul className="space-y-3 text-sm text-white/35">
              <li className="flex items-center gap-2"><Phone size={14} className="text-[#4ade80] flex-shrink-0" />+62 881-0269-30456</li>
              <li className="flex items-center gap-2"><Mail size={14} className="text-[#4ade80] flex-shrink-0" />hello@rentgo.id</li>
              <li className="flex items-start gap-2"><MapPin size={14} className="text-[#4ade80] flex-shrink-0 mt-0.5" />Jl. Danau Ranau Sawojajar, Kota Malang</li>
            </ul>
            <div className="mt-4 p-3 bg-white/[0.04] border border-white/10 rounded-xl">
              <p className="text-xs text-white/30 mb-1">Jam Operasional</p>
              <p className="text-sm font-medium text-white">Senin – Minggu</p>
              <p className="text-sm text-[#4ade80]">06.00 – 22.00 WIB</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/25">
          <p>© 2026 RentGo. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#4ade80] transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-[#4ade80] transition-colors">Privasi</a>
            <a href="#" className="hover:text-[#4ade80] transition-colors">Cookie</a>
          </div>
        </div>
      </div>
    </footer>
  )
}