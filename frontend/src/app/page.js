'use client';
import { useRef, useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import ValueTechLogo from '@/components/ValueTechLogo';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home(props) {
  // Next.js 15 props are promises, we don't use them but this prevents enumeration errors
  const containerRef = useRef(null);
  const heroRef = useRef(null);

  useGSAP(() => {
    // 1. Initial Loader sequence
    const tl = gsap.timeline();
    tl.to(".loader-overlay", {
      height: 0,
      duration: 1.5,
      ease: "expo.inOut",
      delay: 0.2
    })
      .from(".nav-item", {
        y: -20,
        opacity: 0,
        stagger: 0.1,
        ease: "power3.out"
      }, "-=0.5")
      .from(".hero-char", {
        y: 150,
        opacity: 0,
        rotateX: -90,
        stagger: 0.05,
        duration: 1.2,
        ease: "back.out(1.7)",
        transformOrigin: "50% 50% -50"
      }, "-=0.5")
      .from(".hero-sub", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power2.out"
      }, "-=0.8");

    // 2. Scroll-triggered Massive Typography
    gsap.to(".massive-text", {
      xPercent: -50,
      ease: "none",
      scrollTrigger: {
        trigger: ".massive-text-container",
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      }
    });

    // 3. Magnetic Hover Effect for Cards
    const cards = gsap.utils.toArray(".magnetic-card");
    cards.forEach(card => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(card, {
          x: x * 0.2,
          y: y * 0.2,
          rotationY: x * 0.05,
          rotationX: -y * 0.05,
          duration: 0.5,
          ease: "power2.out"
        });
      });

      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          x: 0,
          y: 0,
          rotationY: 0,
          rotationX: 0,
          duration: 1,
          ease: "elastic.out(1, 0.3)"
        });
      });
    });

    // 4. Floating Orbs Parallax
    gsap.to(".parallax-bg-container > div", {
      y: (i, target) => -150 * parseFloat(target.dataset.speed || 1),
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  }, { scope: containerRef });

  // Split text for animation
  const titleText = "VISITOR PASS".split("");
  const subtitleText = "MANAGEMENT SYSTEM".split("");

  return (
    <main ref={containerRef} className="relative min-h-[150vh] flex flex-col bg-[#050505] theme-coffee:bg-[#fbfbfd] text-white theme-coffee:text-[#1d1d1f] overflow-hidden perspective-[1000px]">

      {/* Premium Loader Overlay */}
      <div className="loader-overlay fixed inset-0 z-[100] bg-white theme-coffee:bg-black flex items-center justify-center origin-top">
        <div className="text-black theme-coffee:text-white font-black text-2xl tracking-[0.5em] uppercase animate-pulse">Initializing Protocol</div>
      </div>

      {/* Glass Navbar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-12 py-12 backdrop-blur-md border-b border-white/5 theme-coffee:border-black/5">
        <div className="nav-item"><ValueTechLogo className="h-[180px] w-auto" /></div>
        <div className="flex gap-8 items-center nav-item">
          <Link href="/login" className="btn-primary px-8 py-3 rounded-full text-xs uppercase tracking-widest font-bold group">
            Employee Portal <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </nav>

      {/* Main Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center pt-40">
        <div className="text-center w-full px-4">
          <div className="overflow-hidden mb-2">
            <h1 className="text-[10vw] md:text-[8vw] font-black leading-none tracking-tighter uppercase flex justify-center text-white theme-coffee:text-black">
              {titleText.map((char, i) => (
                <span key={i} className="hero-char inline-block">{char === " " ? "\u00A0" : char}</span>
              ))}
            </h1>
          </div>
          <div className="overflow-hidden mb-12">
            <h1 className="text-[6vw] md:text-[5vw] font-black leading-none tracking-tighter uppercase flex justify-center text-gray-400 theme-coffee:text-gray-600">
              {subtitleText.map((char, i) => (
                <span key={i} className="hero-char inline-block">{char === " " ? "\u00A0" : char}</span>
              ))}
            </h1>
          </div>
          <p className="hero-sub text-xl md:text-2xl text-gray-400 theme-coffee:text-gray-500 font-light max-w-2xl mx-auto leading-relaxed px-6">
            The next generation of visitor management. <br /><span className="font-bold text-white theme-coffee:text-black">Seamless. Secure. Cinematic.</span>
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 hero-sub">
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Scroll to Initiate</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent theme-coffee:from-black"></div>
        </div>
      </section>

      {/* Interactive Flow Section */}
      <section className="relative z-10 py-32 px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/check-in" className="group">
            <div className="magnetic-card p-10 rounded-[2.5rem] h-full bg-white/5 theme-coffee:bg-white border border-white/10 theme-coffee:border-black/10 backdrop-blur-xl transition-colors duration-500 hover:bg-white/10 theme-coffee:hover:bg-gray-50 hover:border-white/30">
              <div className="w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center mb-10 shadow-[0_10px_30px_rgba(255,255,255,0.1)] theme-coffee:bg-black theme-coffee:text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              </div>
              <h3 className="text-4xl font-black mb-4 tracking-tighter">NEW VISITOR</h3>
              <p className="text-gray-400 theme-coffee:text-gray-500 font-light text-sm leading-relaxed">Initiate a secure check-in sequence and register your arrival using our advanced neural scanners.</p>
            </div>
          </Link>

          <Link href="/returning" className="group">
            <div className="magnetic-card p-10 rounded-[2.5rem] h-full bg-white/5 theme-coffee:bg-white border border-white/10 theme-coffee:border-black/10 backdrop-blur-xl transition-colors duration-500 hover:bg-white/10 theme-coffee:hover:bg-gray-50 hover:border-white/30">
              <div className="w-16 h-16 border border-white/20 theme-coffee:border-black/20 text-white theme-coffee:text-black rounded-2xl flex items-center justify-center mb-10 shadow-[0_10px_30px_rgba(255,255,255,0.05)]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              </div>
              <h3 className="text-4xl font-black mb-4 tracking-tighter">RETURNING</h3>
              <p className="text-gray-400 theme-coffee:text-gray-500 font-light text-sm leading-relaxed">Fast-track entry using your registered biometric or mobile identity token.</p>
            </div>
          </Link>

          <Link href="/appointment" className="group">
            <div className="magnetic-card p-10 rounded-[2.5rem] h-full bg-white/5 theme-coffee:bg-white border border-white/10 theme-coffee:border-black/10 backdrop-blur-xl transition-colors duration-500 hover:bg-white/10 theme-coffee:hover:bg-gray-50 hover:border-white/30">
              <div className="w-16 h-16 bg-gray-800 text-gray-200 theme-coffee:bg-gray-200 theme-coffee:text-gray-800 rounded-2xl flex items-center justify-center mb-10 shadow-[0_10px_30px_rgba(255,255,255,0.05)]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="text-4xl font-black mb-4 tracking-tighter">PRE-BOOK</h3>
              <p className="text-gray-400 theme-coffee:text-gray-500 font-light text-sm leading-relaxed">Schedule your visit in advance for a frictionless, zero-wait arrival experience.</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Massive Scroll Typography */}
      <section className="massive-text-container relative z-10 py-32 overflow-hidden border-t border-white/5 theme-coffee:border-black/5 mt-20">
        <div className="massive-text whitespace-nowrap text-[15vw] font-black tracking-tighter text-transparent opacity-10" style={{ WebkitTextStroke: '2px currentColor' }}>
          SECURE PROTOCOL • DIGITAL GATE PASS • REAL-TIME ANALYTICS • ZERO FRICTION •
        </div>
      </section>

    </main>
  );
}
