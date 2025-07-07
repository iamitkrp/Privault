'use client';
import { useEffect,useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountDeletedView(){
  const router=useRouter();
  const[countdown,setCountdown]=useState(6);
  useEffect(()=>{const i=setInterval(()=>setCountdown(c=>c-1),1000);const t=setTimeout(()=>router.push('/'),6000);return()=>{clearInterval(i);clearTimeout(t);};},[router]);
  const[mouse,setMouse]=useState({x:0,y:0});
  useEffect(()=>{const h=(e:MouseEvent)=>setMouse({x:(e.clientX-window.innerWidth/2)/60,y:(e.clientY-window.innerHeight/2)/60});window.addEventListener('mousemove',h);return()=>window.removeEventListener('mousemove',h);},[]);
  return(<div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 overflow-hidden relative">
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-500/15 to-yellow-400/10 rounded-3xl rotate-45 transition-transform duration-300 ease-out" style={{transform:`translate(${mouse.x*0.5}px,${mouse.y*0.5}px) rotate(45deg)`}}/>
    <div className="absolute top-1/3 -right-20 w-64 h-64 bg-gradient-to-tl from-yellow-400/12 to-orange-400/8 rounded-full -rotate-12 transition-transform duration-300 ease-out" style={{transform:`translate(${mouse.x*0.8}px,${mouse.y*0.8}px) rotate(-12deg)`}}/>
    <div className="absolute bottom-0 left-0 w-96 h-72 bg-gradient-to-tl from-orange-500/8 via-yellow-500/5 to-transparent skew-x-12 rounded-tl-[100px] transition-transform duration-300 ease-out" style={{transform:`translate(${mouse.x*0.2}px,${mouse.y*0.2}px) skewX(12deg)`}}/>
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-yellow-500/10 to-orange-500/15 rounded-3xl -rotate-45 transition-transform duration-300 ease-out" style={{transform:`translate(${mouse.x*-0.5}px,${mouse.y*-0.5}px) rotate(-45deg)`}}/>
  </div>
  <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div className="text-left">
        <div className="w-20 h-20 bg-gradient-to-r from-orange-600 to-yellow-500 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </div>
        <h1 className="text-4xl lg:text-5xl font-light text-gray-900 mb-6 leading-tight">Account <span className="block font-medium bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">Deleted</span></h1>
        <p className="text-xl text-gray-600 font-neuemontreal-medium mb-6 leading-relaxed">Your profile, vault, and all associated data have been permanently erased from Privault.</p>
        <p className="text-gray-500 font-light leading-relaxed mb-8">You will be redirected to the homepage automatically in {countdown} seconds.</p>
        <button onClick={()=>router.push('/')} className="inline-flex items-center px-8 py-4 rounded-2xl text-white font-medium bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-700 hover:to-yellow-600 transition-colors">Go to Home Page</button>
      </div>
      <div className="hidden lg:block">
        <div className="relative w-full h-80 rounded-3xl flex items-center justify-center shadow-inner overflow-hidden bg-gradient-to-br from-orange-400/30 to-yellow-300/20">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-400/40 to-yellow-300/20 animate-ping" />
          <svg className="relative w-32 h-32 text-orange-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</div>);
} 