"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */
type Vehicle = {
  id: string; make: string; model: string; year: number; color: string;
  origin: string; selling_price: number; status: string; condition: string;
  mileage: number; engine_cc: number; transmission: string; fuel_type: string;
  featured: boolean; description: string; images: any[];
};
type Setting = { key: string; value: string; };

/* ══════════════════════════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,600&family=Barlow+Condensed:wght@300;400;500;600;700&family=Barlow:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --black:#060606; --black2:#0d0d0d; --black3:#141414;
    --grey:#2a2a2a; --silver:#888; --light:#c0c0c0; --white:#f2f2f2;
    --gold:#c9a84c; --gold2:#e8c96b;
    --border:rgba(255,255,255,0.07); --border2:rgba(255,255,255,0.13);
    --fd:'Cormorant Garamond',Georgia,serif;
    --fb:'Barlow',sans-serif; --fc:'Barlow Condensed',sans-serif;
  }
  html { scroll-behavior: smooth; }
body { background:var(--black); color:var(--white); font-family:var(--fb); font-weight:300; overflow-x:hidden; }
section { position: relative; }  ::selection { background:var(--gold); color:var(--black); }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-thumb { background:var(--gold); }
  ::-webkit-scrollbar-track { background:var(--black); }
  a { text-decoration:none; color:inherit; }

  /* Grain */
  body::before {
    content:''; position:fixed; inset:0; z-index:9999; pointer-events:none;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    opacity:0.022;
  }

  /* Loader */
  #chi-loader { position:fixed; inset:0; z-index:9000; background:var(--black); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:28px; transition:opacity 0.9s ease, visibility 0.9s ease; }
  #chi-loader.gone { opacity:0; visibility:hidden; pointer-events:none; }
  .loader-bar-bg { width:180px; height:1px; background:rgba(255,255,255,0.08); }
  .loader-bar-fill { height:1px; background:var(--gold); transition:width 0.06s linear; }
  .loader-pct { font-family:var(--fc); font-size:10px; letter-spacing:0.35em; color:var(--silver); }

  /* Cursor */
  .cur-dot { position:fixed; width:6px; height:6px; border-radius:50%; background:white; pointer-events:none; z-index:8999; transform:translate(-50%,-50%); mix-blend-mode:difference; }
  .cur-ring { position:fixed; width:38px; height:38px; border-radius:50%; border:1px solid rgba(255,255,255,0.5); pointer-events:none; z-index:8998; transform:translate(-50%,-50%); mix-blend-mode:difference; transition:width .35s,height .35s; }
  body.hov .cur-ring { width:64px; height:64px; opacity:0.4; }

  /* Reveal */
  .reveal { opacity:0; transform:translateY(32px); transition:opacity 0.8s ease, transform 0.8s ease; }
  .reveal.in { opacity:1; transform:translateY(0); }
  .reveal-l { opacity:0; transform:translateX(-32px); transition:opacity 0.8s ease, transform 0.8s ease; }
  .reveal-l.in { opacity:1; transform:translateX(0); }
  .reveal-r { opacity:0; transform:translateX(32px); transition:opacity 0.8s ease, transform 0.8s ease; }
  .reveal-r.in { opacity:1; transform:translateX(0); }
  .d1{transition-delay:0.1s!important;} .d2{transition-delay:0.2s!important;}
  .d3{transition-delay:0.3s!important;} .d4{transition-delay:0.4s!important;}

  /* Hero line */
  .hline { overflow:hidden; }
  .hline span { display:block; transform:translateY(110%); transition:transform 1.1s cubic-bezier(.2,.8,.3,1); }
  .hline.in span { transform:translateY(0); }

  /* Ticker */
  @keyframes ticker { from{transform:translateX(0);} to{transform:translateX(-50%);} }
  .ticker-anim { animation:ticker 32s linear infinite; }

  /* Scroll line */
  @keyframes scrollLine { 0%{transform:scaleY(1);opacity:1;} 100%{transform:scaleY(0.2);opacity:0;} }
  .scroll-line-anim { animation:scrollLine 2s ease-in-out infinite; transform-origin:top; }

  /* Float */
  @keyframes floatY { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-9px);} }
  .float-anim { animation:floatY 4s ease-in-out infinite; }

  /* Glow pulse */
  @keyframes parPulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.1);} }

  /* Btn */
  .btn-gold { display:inline-flex; align-items:center; gap:10px; font-family:var(--fc); font-size:11px; font-weight:600; letter-spacing:0.22em; text-transform:uppercase; color:var(--black); background:var(--gold); padding:16px 36px; border:1px solid var(--gold); cursor:pointer; transition:background 0.35s,color 0.35s,transform 0.3s; }
  .btn-gold:hover { background:transparent; color:var(--gold); transform:translateY(-2px); }
  .btn-ghost { display:inline-flex; align-items:center; gap:10px; font-family:var(--fc); font-size:11px; font-weight:500; letter-spacing:0.22em; text-transform:uppercase; color:rgba(255,255,255,0.65); border-bottom:1px solid rgba(255,255,255,0.3); padding-bottom:2px; cursor:pointer; transition:color 0.3s,border-color 0.3s; background:none; border-top:none; border-left:none; border-right:none; }
  .btn-ghost:hover { color:white; border-bottom-color:white; }

  /* Vehicle row */
  .vrow { position:relative; }
  .vrow::after { content:''; position:absolute; bottom:0; left:0; width:0; height:1px; background:var(--gold); transition:width 0.55s cubic-bezier(.4,0,.2,1); }
  .vrow:hover::after { width:100%; }
  .vrow { border-bottom: 1px solid rgba(255,255,255,0.1) !important; }
  .vrow:hover { background:rgba(255,255,255,0.04); padding-left:14px!important; transition:padding 0.35s ease,background 0.35s ease; }
  /* Car card */
  .car-card { transition:transform 0.45s cubic-bezier(.2,.8,.3,1),box-shadow 0.45s ease; }
  .car-card:hover { transform:translateY(-10px); box-shadow:0 40px 90px rgba(0,0,0,0.7); }

  /* Brand cell */
  .brand-cell { position:relative; overflow:hidden; }
  .brand-cell::before { content:''; position:absolute; inset:0; background:var(--gold); transform:scaleY(0); transform-origin:bottom; transition:transform 0.42s cubic-bezier(.4,0,.2,1); z-index:0; }
  .brand-cell:hover::before { transform:scaleY(1); }
  .brand-cell > * { position:relative; z-index:1; }
  .brand-cell:hover .bc-name { color:var(--black); }
  .brand-cell:hover .bc-sub { color:rgba(0,0,0,0.55); }

  /* Nav */
  .nav-link { position:relative; }
  .nav-link::after { content:''; position:absolute; bottom:-3px; left:0; width:0; height:1px; background:var(--gold); transition:width 0.35s; }
  .nav-link:hover::after { width:100%; }

  /* Form */
  .form-input,.form-select,.form-textarea { width:100%; background:rgba(255,255,255,0.03); border:1px solid var(--border2); color:white; font-family:var(--fb); font-size:14px; font-weight:300; padding:14px 18px; outline:none; transition:border-color 0.3s,background 0.3s; appearance:none; }
  .form-input:focus,.form-select:focus,.form-textarea:focus { border-color:var(--gold); background:rgba(201,168,76,0.03); }
  .form-input::placeholder,.form-textarea::placeholder { color:var(--grey); }

  /* Vehicle panel */
  .v-panel { position:fixed; right:-100%; top:0; bottom:0; width:min(520px,100vw); background:var(--black2); border-left:1px solid var(--border2); z-index:400; overflow-y:auto; transition:right 0.55s cubic-bezier(.4,0,.2,1); }
  .v-panel.open { right:0; }
  .v-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:399; opacity:0; pointer-events:none; transition:opacity 0.4s; }
  .v-overlay.open { opacity:1; pointer-events:all; }

  /* Sec tag */
  .sec-tag::before { content:''; display:inline-block; width:36px; height:1px; background:var(--gold); vertical-align:middle; margin-right:14px; } .sec-tag { opacity: 1 !important; }

  @media(max-width:1024px) { .hide-md{display:none!important;} .grid-2-auto{grid-template-columns:1fr!important;} .hero-right-stats{display:none!important;} }
  @media(max-width:768px) { .hide-sm{display:none!important;} .nav-links-desk{display:none!important;} .show-ham{display:flex!important;} .grid-4-sm2{grid-template-columns:repeat(2,1fr)!important;} .t-card{min-width:100%!important;} .footer-grid{grid-template-columns:1fr!important;} .ed-row{flex-direction:column!important;} }
`;

function injectStyles() {
  if (document.getElementById("chi-site-styles")) return;
  const s = document.createElement("style");
  s.id = "chi-site-styles"; s.textContent = STYLES;
  document.head.appendChild(s);
}

/* ══════════════════════════════════════════════════════════════
   STATIC DATA
══════════════════════════════════════════════════════════════ */
const BRANDS = [
  { name: "Toyota", origin: "Japan" }, { name: "Lexus", origin: "Japan" },
  { name: "BMW", origin: "Germany" }, { name: "Mercedes-Benz", origin: "Germany" },
  { name: "Porsche", origin: "Germany" }, { name: "Audi", origin: "Germany" },
  { name: "Land Rover", origin: "UK" }, { name: "Volvo", origin: "Sweden" },
  { name: "Nissan", origin: "Japan" }, { name: "Honda", origin: "Japan" },
  { name: "Volkswagen", origin: "Germany" }, { name: "Bentley", origin: "UK" },
  { name: "Jaguar", origin: "UK" }, { name: "Subaru", origin: "Japan" },
  { name: "Mitsubishi", origin: "Japan" }, { name: "Ford", origin: "USA" },
  { name: "Mustang", origin: "USA" }, { name: "Corolla", origin: "Japan" },
];

const TESTIMONIALS = [
  { name: "Rafiqul Islam", role: "Managing Director — Dhaka", initial: "R", quote: "Car House Imports delivered exactly what they promised — a brand-new Land Cruiser, fully cleared and at my door. The process was transparent and the team was extraordinarily professional." },
  { name: "Sonia Akter", role: "Chief Executive, ABC Group", initial: "S", quote: "I commissioned a custom BMW X5 from Germany and they sourced it within 10 weeks. Customs was handled entirely by their team. The documentation was immaculate." },
  { name: "Karim Enterprises", role: "Corporate Fleet Client — Chittagong", initial: "K", quote: "We have purchased four vehicles across two years. Fleet procurement has never been simpler — they handle everything from sourcing to delivery with genuine care." },
  { name: "Ahmed Nawaz", role: "Entrepreneur — Sylhet", initial: "A", quote: "The pricing transparency is extraordinary. A full cost breakdown provided before I committed. No surprises at delivery. Refreshingly honest business." },
];

const PROCESS = [
  { n: "01", title: "Source & Select", body: "We search certified auctions across Japan — USS, TAA, JU — and authorised dealers across Germany, UK and USA to find your exact vehicle at the best price." },
  { n: "02", title: "Purchase & Pre-Shipment Inspection", body: "Once approved, we purchase the vehicle and commission a comprehensive pre-shipment inspection. Full auction sheet and condition photographs provided." },
  { n: "03", title: "Marine Freight to Bangladesh", body: "The vehicle is containerised or loaded RoRo, fully insured, and shipped to Chittagong or Mongla port. We track every movement in real time." },
  { n: "04", title: "Customs Clearance — Full Service", body: "Our C&F agents manage complete NBR customs documentation: customs duty, supplementary duty, VAT and advance income tax. Zero involvement required from you." },
  { n: "05", title: "Delivery & Registration Assistance", body: "Vehicle prepared at our showroom with full PDI. We assist with BRTA registration documentation and deliver your car with a complete handover service." },
];

const TICKER = ["Toyota", "BMW", "Mercedes-Benz", "Lexus", "Porsche", "Audi", "Land Rover", "Volvo", "Bentley", "Jaguar", "Subaru", "Volkswagen"];

const fmt = (n: number) => "৳ " + Number(n || 0).toLocaleString("en-BD");

/* ══════════════════════════════════════════════════════════════
   LOGO
══════════════════════════════════════════════════════════════ */
const Logo = ({ h = 40 }: { h?: number }) => (
  <svg height={h} viewBox="0 0 260 72" fill="none">
    <rect x="1" y="1" width="70" height="70" rx="2" stroke="white" strokeWidth="1.5" fill="none" />
    <text x="13" y="55" fontFamily="Barlow Condensed,sans-serif" fontWeight="600" fontSize="50" fill="white">H</text>
    <line x1="71" y1="16" x2="90" y2="16" stroke="#c9a84c" strokeWidth="1.5" />
    <line x1="71" y1="56" x2="90" y2="56" stroke="#c9a84c" strokeWidth="1.5" />
    <rect x="90" y="10" width="168" height="52" rx="2" stroke="white" strokeWidth="1.5" fill="none" />
    <text x="103" y="39" fontFamily="Barlow Condensed,sans-serif" fontWeight="700" fontSize="21" fill="white" letterSpacing="3">CAR HOUSE</text>
    <text x="117" y="55" fontFamily="Barlow Condensed,sans-serif" fontWeight="400" fontSize="10.5" fill="#c9a84c" letterSpacing="5">IMPORTS LTD.</text>
  </svg>
);

/* ══════════════════════════════════════════════════════════════
   STATUS BADGE
══════════════════════════════════════════════════════════════ */
const StatusBadge = ({ s }: { s: string }) => {
  const map: Record<string, { label: string; bg: string; color: string; border: string }> = {
    Available: { label: "Available", bg: "rgba(201,168,76,0.15)", color: "#c9a84c", border: "rgba(201,168,76,0.35)" },
    Reserved: { label: "Reserved", bg: "rgba(255,255,255,0.07)", color: "#c0c0c0", border: "rgba(255,255,255,0.15)" },
    "In Transit": { label: "In Transit", bg: "rgba(93,173,226,0.1)", color: "#5dade2", border: "rgba(93,173,226,0.25)" },
  };
  const b = map[s] || map["Available"];
  return <span style={{ fontFamily: "var(--fc)", fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", padding: "5px 11px", display: "inline-block", background: b.bg, color: b.color, border: `1px solid ${b.border}` }}>{b.label}</span>;
};

/* ══════════════════════════════════════════════════════════════
   VEHICLE DETAIL PANEL
══════════════════════════════════════════════════════════════ */
const VehiclePanel = ({ vehicle, onClose, onEnquire }: { vehicle: Vehicle | null; onClose: () => void; onEnquire: (v: Vehicle) => void }) => {
  if (!vehicle) return null;
  const originFlags: Record<string, string> = { Japan: "🇯🇵", Germany: "🇩🇪", "United Kingdom": "🇬🇧", UK: "🇬🇧", Sweden: "🇸🇪", USA: "🇺🇸" };
  return (
    <>
      <div className={`v-overlay ${vehicle ? "open" : ""}`} onClick={onClose} />
      <div className={`v-panel ${vehicle ? "open" : ""}`}>
        <div style={{ padding: "40px 48px 60px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
            <StatusBadge s={vehicle.status} />
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--silver)", fontSize: 24, cursor: "pointer" }}>×</button>
          </div>
          <p style={{ fontFamily: "var(--fc)", fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10 }}>{originFlags[vehicle.origin] || ""} {vehicle.origin}</p>
          <h2 style={{ fontFamily: "var(--fd)", fontSize: 42, fontWeight: 300, color: "white", lineHeight: 1.05, marginBottom: 8 }}>{vehicle.make}<br /><em style={{ fontStyle: "italic", color: "var(--gold)" }}>{vehicle.model}</em></h2>
          <p style={{ fontFamily: "var(--fc)", fontSize: 12, color: "var(--silver)", letterSpacing: "0.1em", marginBottom: 32 }}>{vehicle.year} · {vehicle.condition}</p>
          <div style={{ height: 1, background: "var(--border)", marginBottom: 32 }} />
          {vehicle.description && <p style={{ fontFamily: "var(--fd)", fontSize: 18, fontWeight: 300, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: 36 }}>{vehicle.description}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 32px", marginBottom: 36 }}>
            {([["Engine", vehicle.engine_cc + "cc"], ["Gearbox", vehicle.transmission], ["Fuel", vehicle.fuel_type], ["Mileage", vehicle.mileage + " km"], ["Colour", vehicle.color], ["ID", vehicle.id]] as [string, string | number][]).map(([k, v]) => (
              <div key={k} style={{ padding: "10px 14px", background: "var(--black3)", border: "1px solid var(--border)" }}>
                <p style={{ fontFamily: "var(--fc)", fontSize: 9, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--silver)", marginBottom: 4 }}>{k}</p>
                <p style={{ fontFamily: "var(--fd)", fontSize: 18, fontWeight: 300, color: "white" }}>{v}</p>
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: "var(--border)", marginBottom: 32 }} />
          <p style={{ fontFamily: "var(--fd)", fontSize: 38, fontWeight: 300, color: "var(--gold)", marginBottom: 28 }}>{fmt(vehicle.selling_price)}</p>
          <button className="btn-gold" onClick={() => onEnquire(vehicle)} style={{ width: "100%", justifyContent: "center", border: "none" }}>
            Enquire About This Vehicle
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </>
  );
};

/* ══════════════════════════════════════════════════════════════
   NAV
══════════════════════════════════════════════════════════════ */
const Nav = ({ onEnquire }: { onEnquire: () => void }) => {
  const [solid, setSolid] = useState(false);
  const [drawer, setDrawer] = useState(false);
  useEffect(() => {
    const h = () => setSolid(window.scrollY > 70);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [["Collection", "#fleet"], ["Brands", "#brands"], ["Import Process", "#process"], ["Order", "#order"], ["Clients", "#testimonials"]];
  return (
    <>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 60px", height: solid ? 64 : 80, background: solid ? "rgba(6,6,6,0.96)" : "transparent", backdropFilter: solid ? "blur(20px)" : "none", borderBottom: solid ? "1px solid var(--border)" : "1px solid transparent", transition: "all 0.45s ease" }}>
        <a href="#hero"><Logo h={38} /></a>
        <div className="nav-links-desk" style={{ display: "flex", alignItems: "center", gap: 40 }}>
          {links.map(([label, href]) => (
            <a key={label} href={href} className="nav-link" style={{ fontFamily: "var(--fc)", fontSize: 12, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", transition: "color 0.3s" }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = "white"}
              onMouseLeave={e => (e.target as HTMLElement).style.color = "rgba(255,255,255,0.7)"}
            >{label}</a>
          ))}
          <button className="btn-gold" onClick={onEnquire} style={{ border: "none", padding: "11px 26px" }}>Enquire Now</button>
        </div>
        <button className="show-ham" style={{ display: "none", flexDirection: "column", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 4 }} onClick={() => setDrawer(true)}>
          <span style={{ display: "block", width: 22, height: 1, background: "white" }} /><span style={{ display: "block", width: 22, height: 1, background: "white" }} /><span style={{ display: "block", width: 22, height: 1, background: "white" }} />
        </button>
      </nav>
      <div style={{ position: "fixed", top: 0, right: drawer ? 0 : "-100%", bottom: 0, width: 280, background: "var(--black2)", borderLeft: "1px solid var(--border)", zIndex: 500, padding: "100px 40px 40px", transition: "right 0.45s cubic-bezier(.4,0,.2,1)" }}>
        <button onClick={() => setDrawer(false)} style={{ position: "absolute", top: 24, right: 24, background: "none", border: "none", color: "white", fontSize: 24, cursor: "pointer" }}>×</button>
        {links.map(([label, href]) => (
          <a key={label} href={href} onClick={() => setDrawer(false)} style={{ display: "block", fontFamily: "var(--fc)", fontSize: 16, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: "white", padding: "16px 0", borderBottom: "1px solid var(--border)" }}>{label}</a>
        ))}
      </div>
      {drawer && <div onClick={() => setDrawer(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 499 }} />}
    </>
  );
};

/* ══════════════════════════════════════════════════════════════
   THREE.JS HERO
══════════════════════════════════════════════════════════════ */
function useHeroScene(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    if (!canvasRef.current || !window.THREE) return;
    const THREE = window.THREE;
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0.5, 7);
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const kl = new THREE.DirectionalLight(0xffffff, 2.0); kl.position.set(6, 6, 4); scene.add(kl);
    const kl2 = new THREE.DirectionalLight(0xc9a84c, 1.5); kl2.position.set(-4, 2, 3); scene.add(kl2); const fl = new THREE.DirectionalLight(0xffffff, 0.3); fl.position.set(-4, -2, 3); scene.add(fl);
    const rl = new THREE.PointLight(0xc9a84c, 2, 12); rl.position.set(-3, 1, 2); scene.add(rl);
    const carGroup = new THREE.Group(); scene.add(carGroup);
    const bMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.9, roughness: 0.15 }); const body = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.72, 1.5, 6, 2, 3), bMat); carGroup.add(body);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 1.28, 4, 2, 3), new THREE.MeshStandardMaterial({ color: 0x080808, metalness: 0.9, roughness: 0.1 }));
    cabin.position.set(-0.1, 0.65, 0); carGroup.add(cabin);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xc9a84c, metalness: 1, roughness: 0.0, emissive: 0xc9a84c, emissiveIntensity: 0.3 });
    const trim = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.025, 0.025), trimMat);
    trim.position.set(0, 0.37, 0.76); carGroup.add(trim);
    const trim2 = trim.clone(); trim2.position.z = -0.76; carGroup.add(trim2);
    const wGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.22, 32);
    const wMat = new THREE.MeshStandardMaterial({ color: 0x080808, metalness: 0.6, roughness: 0.4 });
    const rGeo = new THREE.TorusGeometry(0.38, 0.05, 8, 24);
    const rMat = new THREE.MeshStandardMaterial({ color: 0xc9a84c, metalness: 1, roughness: 0.05, emissive: 0xc9a84c, emissiveIntensity: 0.15 });
    const sGeo = new THREE.BoxGeometry(0.64, 0.04, 0.04);
    const sMat = new THREE.MeshStandardMaterial({ color: 0xc9a84c, metalness: 1, roughness: 0.1 });
    [[-1.15, -0.42, 0.82], [1.15, -0.42, 0.82], [-1.15, -0.42, -0.82], [1.15, -0.42, -0.82]].forEach((pos: number[]) => {
      const wg = new THREE.Group();
      wg.add(Object.assign(new THREE.Mesh(wGeo, wMat), { rotation: { x: Math.PI / 2 } }));
      wg.add(new THREE.Mesh(rGeo, rMat));
      for (let s = 0; s < 5; s++) { const sp = new THREE.Mesh(sGeo, sMat); sp.rotation.z = (s / 5) * Math.PI; wg.add(sp); }
      wg.position.set(pos[0], pos[1], pos[2]); carGroup.add(wg);
    });
    const pCount = 1000; const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * 28;
    const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xc9a84c, size: 0.035, transparent: true, opacity: 0.35 }));
    scene.add(particles);
    const sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(2.8, 1), new THREE.MeshBasicMaterial({ color: 0xc9a84c, wireframe: true, transparent: true, opacity: 0.04 }));
    scene.add(sphere);
    let mx = 0, my = 0, scrollY = 0, tRY = 0, tRX = 0, cRY = 0, cRX = 0, t = 0;
    const onMouse = (e: MouseEvent) => { mx = (e.clientX / window.innerWidth - 0.5) * 2; my = -(e.clientY / window.innerHeight - 0.5) * 2; };
    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener("mousemove", onMouse); window.addEventListener("scroll", onScroll);
    let aid: number;
    const animate = () => {
      aid = requestAnimationFrame(animate); t += 0.008;
      carGroup.position.y = Math.sin(t * 0.7) * 0.1;
      tRY = mx * 0.5; tRX = my * 0.12;
      cRY += (tRY - cRY) * 0.04; cRX += (tRX - cRX) * 0.04;
      carGroup.rotation.y = cRY; carGroup.rotation.x = cRX;
      const prog = Math.min(scrollY / window.innerHeight, 1);
      carGroup.position.x = prog * 3.5; carGroup.position.z = -prog * 2;
      renderer.domElement.style.opacity = String(1 - prog * 2);
      particles.rotation.y = t * 0.025; sphere.rotation.y = t * 0.05; sphere.rotation.x = t * 0.03;
      renderer.render(scene, camera);
    };
    animate();
    const onResize = () => { renderer.setSize(canvas.clientWidth, canvas.clientHeight); camera.aspect = canvas.clientWidth / canvas.clientHeight; camera.updateProjectionMatrix(); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(aid); window.removeEventListener("mousemove", onMouse); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); renderer.dispose(); };
  }, []);
}

/* ══════════════════════════════════════════════════════════════
   MINI 3D SCENE
══════════════════════════════════════════════════════════════ */
function useMiniScene(canvasRef: React.RefObject<HTMLCanvasElement | null>, config: { shape?: string; color?: number; speed?: number } = {}) {
  useEffect(() => {
    if (!canvasRef.current || !window.THREE) return;
    const THREE = window.THREE;
    const { shape = "torus", color = 0xc9a84c, speed = 1 } = config;
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(1.5);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100); camera.position.z = 4;
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const pl = new THREE.PointLight(color, 3, 12); pl.position.set(2, 2, 2); scene.add(pl);
    const geoMap: Record<string, any> = {
      torus: new THREE.TorusKnotGeometry(1.1, 0.32, 128, 32),
      icosa: new THREE.IcosahedronGeometry(1.4, 0),
      octa: new THREE.OctahedronGeometry(1.6, 0),
      box: new THREE.BoxGeometry(1.8, 1.8, 1.8, 3, 3, 3),
    };
    const geo = geoMap[shape] || geoMap.torus;
    const mat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.98, roughness: 0.05 });
    const mesh = new THREE.Mesh(geo, mat); scene.add(mesh);
    const wMat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.12 });
    const wire = new THREE.Mesh(geo, wMat); scene.add(wire);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.018, 8, 80), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.25 }));
    scene.add(ring);
    const resize = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    resize(); window.addEventListener("resize", resize);
    let mx2 = 0; const onMouse = (e: MouseEvent) => { mx2 = (e.clientX / window.innerWidth - 0.5); };
    window.addEventListener("mousemove", onMouse);
    let t = 0, aid: number;
    const animate = () => {
      aid = requestAnimationFrame(animate); t += 0.008 * speed;
      mesh.rotation.x = t * 0.4; mesh.rotation.y = t * 0.55;
      wire.rotation.x = mesh.rotation.x; wire.rotation.y = mesh.rotation.y;
      ring.rotation.x = t * 0.1; ring.rotation.z = t * 0.14;
      pl.position.x = Math.sin(t) * 3; pl.position.y = Math.cos(t * 0.7) * 2;
      camera.position.x += (mx2 * 0.5 - camera.position.x) * 0.03;
      renderer.render(scene, camera);
    };
    animate();
    return () => { cancelAnimationFrame(aid); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMouse); renderer.dispose(); };
  }, []);
}

/* ══════════════════════════════════════════════════════════════
   COUNTER HOOK
══════════════════════════════════════════════════════════════ */
function useCounter(target: number, active: boolean, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => { start = Math.min(start + step, target); setVal(start); if (start >= target) clearInterval(timer); }, 16);
    return () => clearInterval(timer);
  }, [active, target]);
  return val;
}

/* ══════════════════════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════════════════════ */
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -20px 0px" });

    const scan = () => {
      document.querySelectorAll(".reveal:not(.in),.reveal-l:not(.in),.reveal-r:not(.in)").forEach(el => {
        obs.observe(el);
      });
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      obs.disconnect();
      mo.disconnect();
    };
  }, []);
}


/* ══════════════════════════════════════════════════════════════
   LOADER
══════════════════════════════════════════════════════════════ */
const Loader = ({ onDone }: { onDone: () => void }) => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    let p = 0;
    const t = setInterval(() => { p += Math.random() * 16 + 5; if (p >= 100) { p = 100; clearInterval(t); setTimeout(onDone, 350); } setPct(Math.floor(p)); }, 90);
  }, []);
  return (
    <div id="chi-loader">
      <Logo h={52} />
      <div>
        <div className="loader-bar-bg"><div className="loader-bar-fill" style={{ width: pct + "%" }} /></div>
        <p className="loader-pct" style={{ marginTop: 10, textAlign: "center" }}>{pct}%</p>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   CURSOR
══════════════════════════════════════════════════════════════ */
const Cursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0, aid: number;
    const move = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener("mousemove", move);
    const animate = () => {
      aid = requestAnimationFrame(animate);
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      if (dotRef.current) { dotRef.current.style.left = mx + "px"; dotRef.current.style.top = my + "px"; }
      if (ringRef.current) { ringRef.current.style.left = rx + "px"; ringRef.current.style.top = ry + "px"; }
    };
    animate();
    const hov = () => document.body.classList.add("hov");
    const unhov = () => document.body.classList.remove("hov");
    const attach = () => document.querySelectorAll("a,button,.car-card,.vrow,.brand-cell").forEach(el => { el.addEventListener("mouseenter", hov); el.addEventListener("mouseleave", unhov); });
    attach(); const ti = setInterval(attach, 2000);
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(aid); clearInterval(ti); };
  }, []);
  return (<><div ref={dotRef} className="cur-dot" /><div ref={ringRef} className="cur-ring" /></>);
};

/* ══════════════════════════════════════════════════════════════
   HERO SECTION
══════════════════════════════════════════════════════════════ */
const Hero = ({ settings, onViewCollection }: { settings: Record<string, string>; onViewCollection: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  useHeroScene(canvasRef);
  useEffect(() => {
    setTimeout(() => setReady(true), 100);
    document.querySelectorAll(".hline").forEach((el, i) => { setTimeout(() => el.classList.add("in"), 600 + i * 160); });
  }, []);
  const heroTitle = settings.hero_title || "Where Luxury Meets the Open Road";
  const words = heroTitle.split(" ");
  const lines = [words.slice(0, 2).join(" "), words.slice(2, 4).join(" "), words.slice(4).join(" ")];

  return (
    <section id="hero" style={{ position: "relative", height: "100vh", minHeight: 700, display: "flex", alignItems: "center", overflow: "hidden", background: "radial-gradient(ellipse at 70% 50%, #0f0c08 0%, #060606 60%)" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: 0, left: "18%", bottom: 0, width: 1, background: "linear-gradient(180deg,transparent,rgba(201,168,76,0.15) 30%,rgba(201,168,76,0.15) 70%,transparent)" }} />
        <div style={{ position: "absolute", top: 0, right: "28%", bottom: 0, width: 1, background: "linear-gradient(180deg,transparent,rgba(255,255,255,0.04) 30%,rgba(255,255,255,0.04) 70%,transparent)" }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: "55%", height: "100%", background: "linear-gradient(135deg,transparent 40%,rgba(201,168,76,0.03) 100%)", clipPath: "polygon(20% 0,100% 0,100% 100%,0 100%)" }} />
      </div>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1, transition: "opacity 0.3s" }} />
      {<video autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 1 }}>
        <source src="/hero.mp4" type="video/mp4" />
      </video>}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(6,6,6,0.88) 40%,rgba(6,6,6,0.15) 100%)", zIndex: 2 }} />
      <div style={{ position: "relative", zIndex: 3, padding: "0 60px", maxWidth: 1400, margin: "0 auto", width: "100%" }}>
        <div style={{ opacity: ready ? 1 : 0, transform: ready ? "translateY(0)" : "translateY(20px)", transition: "all 0.9s ease 0.3s", display: "flex", alignItems: "center", gap: 16, fontFamily: "var(--fc)", fontSize: 10, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 28 }}>
          <span style={{ width: 48, height: 1, background: "var(--gold)", display: "inline-block" }} />
          Bangladesh's Finest Import House
        </div>
        <h1 style={{ fontFamily: "var(--fd)", fontSize: "clamp(66px,9vw,128px)", fontWeight: 300, lineHeight: 0.91, color: "white", marginBottom: 40 }}>
          {lines.map((line, i) => (
            <span key={i} className="hline" style={{ display: "block", transitionDelay: `${i * 0.15}s` }}>
              <span>{i === 1 ? <><em style={{ fontStyle: "italic", color: "var(--gold)" }}>{line.split(" ")[0]}</em> {line.split(" ").slice(1).join(" ")}</> : line}</span>
            </span>
          ))}
        </h1>
        <p style={{ fontFamily: "var(--fb)", fontSize: 15, fontWeight: 300, color: "rgba(255,255,255,0.5)", maxWidth: 430, lineHeight: 1.9, marginBottom: 52, opacity: ready ? 1 : 0, transform: ready ? "translateY(0)" : "translateY(20px)", transition: "all 0.9s ease 1s" }}>
          {settings.hero_subtitle || "We import the world's most coveted automobiles — directly sourced from Japan, Germany, UK and the USA — customs-cleared and delivered to your door in Bangladesh."}
        </p>
        <div style={{ display: "flex", gap: 24, alignItems: "center", opacity: ready ? 1 : 0, transform: ready ? "translateY(0)" : "translateY(20px)", transition: "all 0.9s ease 1.15s" }}>
          <button className="btn-gold" onClick={onViewCollection} style={{ border: "none" }}>
            Explore Collection
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
          <a href="#process" className="btn-ghost">How We Import</a>
        </div>
      </div>
      <div className="hero-right-stats" style={{ position: "absolute", right: 60, top: "50%", transform: "translateY(-50%)", zIndex: 3, display: "flex", flexDirection: "column", gap: 1, opacity: ready ? 1 : 0, transition: "opacity 1s ease 1.4s" }}>
        {[["500+", "Cars Imported"], ["8", "Years Active"], ["15+", "Luxury Brands"]].map(([n, l]) => (
          <div key={l} style={{ padding: "26px 34px", border: "1px solid var(--border2)", background: "rgba(6,6,6,0.65)", backdropFilter: "blur(12px)", textAlign: "center" }}>
            <span style={{ fontFamily: "var(--fd)", fontSize: 46, fontWeight: 300, color: "white", display: "block", lineHeight: 1 }}>{n}</span>
            <span style={{ fontFamily: "var(--fc)", fontSize: 9, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--silver)", marginTop: 8, display: "block" }}>{l}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", bottom: 44, left: 60, zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: ready ? 1 : 0, transition: "opacity 1s ease 1.6s" }}>
        <div className="scroll-line-anim" style={{ width: 1, height: 70, background: "linear-gradient(180deg,var(--gold),transparent)" }} />
        <span style={{ fontFamily: "var(--fc)", fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--silver)", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>Scroll</span>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   TICKER
══════════════════════════════════════════════════════════════ */
const Ticker = () => (
  <div style={{ height: 52, background: "var(--gold)", overflow: "hidden", display: "flex", alignItems: "center" }}>
    <div className="ticker-anim" style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
      {[...TICKER, ...TICKER].map((t, i) => (
        <span key={i} style={{ fontFamily: "var(--fc)", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--black)", padding: "0 44px", display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(0,0,0,0.3)", display: "inline-block" }} />
          {t}
        </span>
      ))}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   FLEET — LIVE FROM SUPABASE
══════════════════════════════════════════════════════════════ */
const Fleet = ({ vehicles, onSelect }: { vehicles: Vehicle[]; onSelect: (v: Vehicle) => void }) => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const originFlags: Record<string, string> = { Japan: "🇯🇵", Germany: "🇩🇪", "United Kingdom": "🇬🇧", UK: "🇬🇧", Sweden: "🇸🇪", USA: "🇺🇸" };
  const shown = vehicles.filter(v => (filter === "all" || v.status.toLowerCase() === filter) && `${v.make} ${v.model}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <section id="fleet" style={{ padding: "120px 0", background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.08)" }}>        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 60, gap: 24, flexWrap: "wrap" }}>
        <div className="reveal">
          <p className="sec-tag" style={{ fontFamily: "var(--fc)", fontSize: 10, fontWeight: 700, letterSpacing: "0.38em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 20 }}>Current Collection</p>
          <h2 style={{ fontFamily: "var(--fd)", fontSize: "clamp(40px,5vw,70px)", fontWeight: 300, color: "white", lineHeight: 1.05 }}>Available <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Vehicles</em></h2>
        </div>
        <div className="reveal d2" style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border2)", padding: "8px 14px", marginRight: 8 }}>
            <span style={{ color: "var(--silver)", fontSize: 13 }}>⌕</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ background: "none", border: "none", color: "white", outline: "none", fontSize: 13, fontFamily: "var(--fb)", width: 120 }} />
          </div>
          {[["all", "All"], ["available", "Available"], ["reserved", "Reserved"], ["in transit", "In Transit"]].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} style={{ padding: "8px 16px", fontFamily: "var(--fc)", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s", background: filter === key ? "var(--gold)" : "transparent", color: filter === key ? "var(--black)" : "var(--silver)", border: filter === key ? "1px solid var(--gold)" : "1px solid var(--border2)" }}>{label}</button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {shown.length === 0 && <p style={{ textAlign: "center", color: "var(--silver)", padding: "60px 0" }}>No vehicles found.</p>}
        {shown.map((v, i) => (
          <div key={v.id} className="vrow reveal" style={{ display: "grid", gridTemplateColumns: "52px 1fr 120px 100px 100px 180px 110px", alignItems: "center", gap: "0 36px", padding: "26px 0 26px 16px", borderBottom: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", background: "rgba(255,255,255,0.01)", transitionDelay: `${i * 0.04}s` }} onClick={() => onSelect(v)}>
            <span style={{ fontFamily: "var(--fc)", fontSize: 11, color: "var(--grey)" }}>{"0" + (i + 1)}</span>
            <div>
              <p style={{ fontFamily: "var(--fd)", fontSize: 26, fontWeight: 300, color: "white", lineHeight: 1.1, marginBottom: 5 }}>{v.make} {v.model}</p>
              <p style={{ fontFamily: "var(--fc)", fontSize: 10, color: "var(--silver)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{v.year} · {v.condition} · {v.color}</p>
            </div>
            <p className="hide-sm" style={{ fontFamily: "var(--fc)", fontSize: 12, color: "var(--silver)" }}>{originFlags[v.origin] || ""} {v.origin}</p>
            <div className="hide-sm" style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "var(--fc)", fontSize: 13, fontWeight: 600, color: "var(--light)" }}>{v.engine_cc}cc</p>
              <p style={{ fontFamily: "var(--fc)", fontSize: 9, color: "var(--grey)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 2 }}>Engine</p>
            </div>
            <div className="hide-sm" style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "var(--fc)", fontSize: 13, fontWeight: 600, color: "var(--light)" }}>{v.mileage} km</p>
              <p style={{ fontFamily: "var(--fc)", fontSize: 9, color: "var(--grey)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 2 }}>Mileage</p>
            </div>
            <p style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 300, color: "var(--gold)", textAlign: "right" }}>{fmt(v.selling_price)}</p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}><StatusBadge s={v.status} /></div>
          </div>
        ))}
      </div>
    </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   FEATURED CARDS — LIVE FROM SUPABASE
══════════════════════════════════════════════════════════════ */
const FeaturedCards = ({ vehicles, onSelect }: { vehicles: Vehicle[]; onSelect: (v: Vehicle) => void }) => {
  const [idx, setIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const CARD_W = 392;
  const featured = vehicles.filter(v => v.featured && v.status !== "Sold").slice(0, 6);
  const shapes = ["torus", "icosa", "octa", "box", "torus", "icosa"];
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const originFlags: Record<string, string> = { Japan: "��🇵", Germany: "🇩🇪", "United Kingdom": "🇬🇧", UK: "🇬🇧", Sweden: "🇸🇪", USA: "🇺🇸" };

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${idx * CARD_W}px)`;
      trackRef.current.style.transition = "transform 0.55s cubic-bezier(.4,0,.2,1)";
    }
  }, [idx]);

  if (featured.length === 0) return null;

  return (
    <section style={{ padding: "120px 0 100px", background: "var(--black2)", overflow: "hidden" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "flex-end", marginBottom: 60 }} className="grid-2-auto">
          <div className="reveal-l">
            <p className="sec-tag" style={{ fontFamily: "var(--fc)", fontSize: 10, fontWeight: 700, letterSpacing: "0.38em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 20 }}>Featured Imports</p>
            <h2 style={{ fontFamily: "var(--fd)", fontSize: "clamp(40px,5vw,68px)", fontWeight: 300, color: "white", lineHeight: 1.05 }}>Handpicked for<br />the <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Exceptional</em></h2>
          </div>
          <div className="reveal-r" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
            <p style={{ fontSize: 14, color: "var(--silver)", lineHeight: 1.8, maxWidth: 340, textAlign: "right" }}>Drag or use arrows to explore our featured collection. Each vehicle is sourced directly and ready for delivery.</p>
            <div style={{ display: "flex", gap: 6 }}>
              {["←", "→"].map((arrow, i) => (
                <button key={arrow} onClick={() => setIdx(i === 0 ? Math.max(0, idx - 1) : Math.min(featured.length - 2, idx + 1))}
                  style={{ width: 46, height: 46, border: "1px solid var(--border2)", background: "transparent", color: "white", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--gold)"; (e.currentTarget as HTMLElement).style.color = "var(--black)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "white"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; }}
                >{arrow}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ paddingLeft: 60, overflow: "hidden" }}>
        <div ref={trackRef} style={{ display: "flex", gap: 20, width: "max-content" }}>
          {featured.map((v, i) => (
            <div key={v.id} className="car-card reveal" style={{ width: CARD_W - 20, flexShrink: 0, background: "var(--black3)", border: "1px solid var(--border)", overflow: "hidden", cursor: "pointer", transitionDelay: `${i * 0.08}s` }} onClick={() => onSelect(v)}>
              <div style={{ height: 260, background: "linear-gradient(135deg,#0a0a0a,#181818)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                <svg style={{ opacity: 0.12, position: "absolute" }} width="300" height="140" viewBox="0 0 300 140" fill="none">
                  <path d="M30 100 L50 60 Q68 40 95 36 L150 32 L220 36 Q248 44 262 66 L278 100 L282 106 L282 116 L30 116 L30 106Z" stroke="white" strokeWidth="2" fill="none" />
                  <circle cx="82" cy="120" r="14" stroke="white" strokeWidth="2" fill="none" />
                  <circle cx="225" cy="120" r="14" stroke="white" strokeWidth="2" fill="none" />
                </svg>
                <div style={{ position: "absolute", top: 16, right: 16, zIndex: 2 }}><StatusBadge s={v.status} /></div>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 50%,rgba(0,0,0,0.5) 100%)" }} />
              </div>
              <div style={{ padding: 28 }}>
                <p style={{ fontSize: 20, marginBottom: 10 }}>{originFlags[v.origin] || "🌍"}</p>
                <p style={{ fontFamily: "var(--fd)", fontSize: 30, fontWeight: 300, color: "white", lineHeight: 1.1, marginBottom: 4 }}>{v.make} {v.model}</p>
                <p style={{ fontFamily: "var(--fc)", fontSize: 11, color: "var(--silver)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>{v.year} · {v.origin} · {v.condition}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, borderTop: "1px solid var(--border)", paddingTop: 18, marginBottom: 20 }}>
                  {[["Engine", v.engine_cc + "cc"], ["Gearbox", v.transmission.split(" ")[0]], ["Mileage", v.mileage + " km"]].map(([k, val]) => (
                    <div key={k}>
                      <p style={{ fontFamily: "var(--fc)", fontSize: 9, color: "var(--grey)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 3 }}>{k}</p>
                      <p style={{ fontFamily: "var(--fc)", fontSize: 12, fontWeight: 600, color: "var(--light)" }}>{val}</p>
                    </div>
                  ))}
                </div>
                <p style={{ fontFamily: "var(--fd)", fontSize: 30, fontWeight: 300, color: "var(--gold)" }}>{fmt(v.selling_price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   PARALLAX QUOTE
══════════════════════════════════════════════════════════════ */
const ParallaxQuote = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useMiniScene(canvasRef, { shape: "icosa", color: 0xc9a84c, speed: 0.6 });
  return (
    <section style={{ position: "relative", height: "65vh", minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "var(--black3)" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%,rgba(201,168,76,0.06) 0%,transparent 65%)", animation: "parPulse 6s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "var(--border)" }} />
      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "var(--border)" }} />
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }} />
      <div className="reveal" style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 60px" }}>
        <blockquote style={{ fontFamily: "var(--fd)", fontSize: "clamp(28px,4.5vw,58px)", fontStyle: "italic", fontWeight: 300, color: "white", lineHeight: 1.3, maxWidth: 900 }}>
          "Perfection is not a destination.<br />It is the standard we set <em style={{ color: "var(--gold)" }}>at the start.</em>"
        </blockquote>
        <cite style={{ display: "block", marginTop: 28, fontFamily: "var(--fc)", fontSize: 11, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--gold)", fontStyle: "normal" }}>— Car House Imports Ltd.</cite>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   PROCESS
══════════════════════════════════════════════════════════════ */
const Process = () => {
  const [active, setActive] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useMiniScene(canvasRef, { shape: "box", color: 0xc9a84c, speed: 0.5 });
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(+(e.target as HTMLElement).dataset.step! || 0); });
    }, { threshold: 0.5 });
    document.querySelectorAll(".p-step-site").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return (
    <section id="process" style={{ padding: "120px 0", background: "var(--black)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "100px", alignItems: "start" }} className="grid-2-auto">
          <div style={{ position: "sticky", top: 120 }}>
            <div className="reveal-l">
              <p className="sec-tag" style={{ fontFamily: "var(--fc)", fontSize: 10, fontWeight: 700, letterSpacing: "0.38em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 22 }}>Our Process</p>
              <h2 style={{ fontFamily: "var(--fd)", fontSize: "clamp(40px,5vw,68px)", fontWeight: 300, color: "white", lineHeight: 1.05, marginBottom: 20 }}>From <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Source</em><br />to Your<br />Possession</h2>
              <p style={{ fontSize: 15, color: "var(--silver)", lineHeight: 1.85, maxWidth: 380 }}>Every import follows our rigorous five-step process — complete transparency from first contact to final delivery.</p>
            </div>
            <div className="reveal-l d3" style={{ marginTop: 48, border: "1px solid var(--border)", overflow: "hidden", height: 320, position: "relative" }}>
              <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
              <div style={{ position: "absolute", bottom: 24, left: 28, fontFamily: "var(--fd)", fontSize: 60, fontWeight: 300, color: "rgba(255,255,255,0.05)", pointerEvents: "none" }}>Import</div>
            </div>
          </div>
          <div style={{ paddingTop: 20 }}>
            {PROCESS.map((s, i) => (
              <div key={i} data-step={i} className="p-step-site reveal" style={{ display: "flex", gap: 32, padding: "40px 0", borderBottom: "1px solid var(--border)", borderTop: i === 0 ? "1px solid var(--border)" : "none", opacity: active === i ? 1 : 0.35, transition: "opacity 0.4s", transitionDelay: `${i * 0.08}s` }}>
                <div style={{ fontFamily: "var(--fd)", fontSize: 60, fontWeight: 300, color: active === i ? "var(--gold)" : "rgba(201,168,76,0.15)", lineHeight: 1, flexShrink: 0, width: 56, transition: "color 0.4s" }}>{s.n}</div>
                <div>
                  <p style={{ fontFamily: "var(--fc)", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "white", marginBottom: 12, marginTop: 12 }}>{s.title}</p>
                  <p style={{ fontSize: 14, color: "var(--silver)", lineHeight: 1.8 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   BRANDS
══════════════════════════════════════════════════════════════ */
const Brands = () => (
  <section id="brands" style={{ padding: "100px 0", background: "var(--black2)" }}>
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 60px" }}>
      <div className="reveal" style={{ textAlign: "center", marginBottom: 72 }}>
        <p style={{ fontFamily: "var(--fc)", fontSize: 10, fontWeight: 700, letterSpacing: "0.38em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ width: 36, height: 1, background: "var(--gold)", display: "inline-block" }} />Our Portfolio<span style={{ width: 36, height: 1, background: "var(--gold)", display: "inline-block" }} />
        </p>
        <h2 style={{ fontFamily: "var(--fd)", fontSize: "clamp(40px,5vw,68px)", fontWeight: 300, color: "white" }}>Brands We <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Import</em></h2>
      </div>
      <div className="grid-4-sm2" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "1px solid var(--border)", borderLeft: "1px solid var(--border)" }}>
        {BRANDS.map((b, i) => (
          <div key={b.name} className={`brand-cell reveal d${(i % 4) + 1}`} style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "40px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "default", transition: "background 0.35s" }}>
            <p className="bc-name" style={{ fontFamily: "var(--fc)", fontSize: 15, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--light)", transition: "color 0.35s" }}>{b.name}</p>
            <p className="bc-sub" style={{ fontFamily: "var(--fc)", fontSize: 10, color: "var(--grey)", letterSpacing: "0.15em", textTransform: "uppercase", transition: "color 0.35s" }}>{b.origin}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════
   STATS
══════════════════════════════════════════════════════════════ */
const Stats = ({ vehicles }: { vehicles: Vehicle[] }) => {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(e => { if (e[0].isIntersecting) setActive(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const c500 = useCounter(500, active);
  const c8 = useCounter(8, active);
  const c200 = useCounter(200, active);
  const c15 = useCounter(15, active);
  const stats = [[c500 + "+", "Vehicles Imported"], [c8, "Years of Excellence"], [c200 + "+", "Satisfied Clients"], [c15 + "+", "Premium Brands"]];
  return (
    <section ref={ref} style={{ background: "var(--gold)", padding: 0 }}>
      <div className="grid-4-sm2" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", maxWidth: 1400, margin: "0 auto" }}>
        {stats.map(([n, l], i) => (
          <div key={l} style={{ padding: "72px 48px", borderRight: i < 3 ? "1px solid rgba(0,0,0,0.12)" : "none", textAlign: "center" }}>
            <span style={{ fontFamily: "var(--fd)", fontSize: 80, fontWeight: 300, color: "var(--black)", lineHeight: 1, display: "block" }}>{n}</span>
            <span style={{ fontFamily: "var(--fc)", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(0,0,0,0.5)", marginTop: 12, display: "block" }}>{l}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   EDITORIAL
══════════════════════════════════════════════════════════════ */
const EditorialScene = ({ shape, canvasRef }: { shape: string; canvasRef: React.RefObject<HTMLCanvasElement | null> }) => {
  useMiniScene(canvasRef, { shape, color: 0xc9a84c, speed: 0.8 });
  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
};

const Editorial = () => {
  const c1 = useRef<HTMLCanvasElement>(null);
  const c2 = useRef<HTMLCanvasElement>(null);
  const c3 = useRef<HTMLCanvasElement>(null);
  const sections = [
    { num: "01", title: "Japan's Finest, Delivered", em: "Delivered", body: "We partner with certified Japanese auto auctions — USS, TAA, and JU — to source the freshest, lowest-mileage vehicles directly from the world's most reliable automotive market. Every car undergoes pre-shipment inspection and full auction sheet verification.", cta: "Order From Japan", shape: "torus", ref: c1 },
    { num: "02", title: "European Precision Engineering", em: "Precision Engineering", body: "Germany, the UK, and broader Europe are home to the world's most prestigious marques. We work with authorised dealers to bring BMW, Mercedes-Benz, Porsche, Audi and Land Rover directly to Bangladesh with full manufacturer documentation.", cta: "Order From Europe", shape: "icosa", ref: c2, flip: true },
    { num: "03", title: "Complete Customs Management", em: "Customs Management", body: "We manage the entire NBR customs process — customs duty, supplementary duty, VAT and advance income tax payment, port release — with complete cost transparency before you commit.", cta: "View Import Process", href: "#process", shape: "octa", ref: c3 },
  ];
  return (
    <section id="editorial" style={{ background: "var(--black2)" }}>
      {sections.map((s, i) => (
        <div key={i} className="ed-row" style={{ display: "flex", minHeight: 560, flexDirection: s.flip ? "row-reverse" : "row" }}>
          <div style={{ flex: 1, background: "var(--black3)", position: "relative", minHeight: 400, overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <EditorialScene shape={s.shape} canvasRef={s.ref as any} />
            </div>
            {[[24, 24, "left", "top"], [24, 24, "right", "bottom"]].map((_, ci) => (
              <div key={ci} style={{ position: "absolute", [ci === 0 ? "top" : "bottom"]: 24, [ci === 0 ? "left" : "right"]: 24, width: 48, height: 1, background: "var(--gold)", opacity: 0.4 }} />
            ))}
          </div>
          <div style={{ flex: 1, padding: "80px 80px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div className="reveal" style={{ fontFamily: "var(--fd)", fontSize: 120, fontWeight: 300, color: "rgba(255,255,255,0.03)", lineHeight: 1, marginBottom: -40, marginLeft: -8 }}>{s.num}</div>
            <h3 className="reveal d1" style={{ fontFamily: "var(--fd)", fontSize: "clamp(32px,3.5vw,52px)", fontWeight: 300, color: "white", marginBottom: 24, lineHeight: 1.15 }}>
              {s.title.replace(s.em, "")}<em style={{ fontStyle: "italic", color: "var(--gold)" }}>{s.em}</em>
            </h3>
            <p className="reveal d2" style={{ fontSize: 15, color: "var(--silver)", lineHeight: 1.85, marginBottom: 36, maxWidth: 480 }}>{s.body}</p>
            <a href={s.href || "#order"} className="btn-ghost reveal d3">{s.cta}</a>
          </div>
        </div>
      ))}
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   ORDER FORM — SAVES TO SUPABASE
══════════════════════════════════════════════════════════════ */
const Order = ({ vehicles }: { vehicles: Vehicle[] }) => {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", make: "", model: "", year_range: "", budget: "", origin_preference: "", requirements: "" });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("custom_orders").insert([{ ...form, status: "pending" }]);
    setSent(true); setTimeout(() => setSent(false), 6000);
  };
  return (
    <section id="order" style={{ padding: "120px 0", background: "var(--black3)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }} className="grid-2-auto">
          <div className="reveal-l" style={{ paddingRight: 80, borderRight: "1px solid var(--border)" }}>
            <p className="sec-tag" style={{ fontFamily: "var(--fc)", fontSize: 10, fontWeight: 700, letterSpacing: "0.38em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 22 }}>Bespoke Service</p>
            <h2 style={{ fontFamily: "var(--fd)", fontSize: "clamp(40px,5vw,68px)", fontWeight: 300, color: "white", lineHeight: 1.05, marginBottom: 20 }}>Order Your<br />Dream <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Car</em></h2>
            <p style={{ fontSize: 15, color: "var(--silver)", lineHeight: 1.85, maxWidth: 400, marginBottom: 48 }}>Tell us your exact specification — make, model, year, colour — and we will source it from any market in the world.</p>
            {[["Any Make, Any Model", "From hyper-rare to everyday luxury — if it exists, we can find it."],
            ["Any Origin Country", "Japan, Germany, USA, UK, UAE — we import from all major markets."],
            ["Full Price Transparency", "Complete cost breakdown provided before you commit."],
            ["8–14 Week Delivery", "Typical timeline from order confirmation to delivery."]].map(([t, d]) => (
              <div key={t} style={{ display: "flex", gap: 20, padding: "22px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: 36, height: 36, border: "1px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="14" height="14" fill="none" stroke="var(--gold)" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <div>
                  <p style={{ fontFamily: "var(--fc)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "white", marginBottom: 5 }}>{t}</p>
                  <p style={{ fontSize: 13, color: "var(--silver)", lineHeight: 1.65 }}>{d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="reveal-r" style={{ paddingLeft: 80 }}>
            <p style={{ fontFamily: "var(--fd)", fontSize: 32, fontWeight: 300, color: "white", marginBottom: 36, lineHeight: 1.2 }}>Place a<br /><em style={{ fontStyle: "italic", color: "var(--gold)" }}>Custom Order</em></p>
            <form onSubmit={submit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                {[["Full Name", "name", "text", "Your name"], ["Phone", "phone", "tel", "+880 1XXX-XXXXXX"]].map(([l, k, t, p]) => (
                  <div key={k}><label style={{ display: "block", fontFamily: "var(--fc)", fontSize: 10, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--silver)", marginBottom: 8 }}>{l}</label>
                    <input required type={t} className="form-input" placeholder={p} value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} /></div>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}><label style={{ display: "block", fontFamily: "var(--fc)", fontSize: 10, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--silver)", marginBottom: 8 }}>Email</label>
                <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                {[["Make / Brand", "make", "e.g. BMW"], ["Model", "model", "e.g. X5"]].map(([l, k, p]) => (
                  <div key={k}><label style={{ display: "block", fontFamily: "var(--fc)", fontSize: 10, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--silver)", marginBottom: 8 }}>{l}</label>
                    <input className="form-input" placeholder={p} value={(form as any)[k]} onChange={e => setForm(pr => ({ ...pr, [k]: e.target.value }))} /></div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                {[["Year Range", "year_range", "e.g. 2023–2024"], ["Budget (BDT)", "budget", "e.g. 1.5 Crore"]].map(([l, k, p]) => (
                  <div key={k}><label style={{ display: "block", fontFamily: "var(--fc)", fontSize: 10, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--silver)", marginBottom: 8 }}>{l}</label>
                    <input className="form-input" placeholder={p} value={(form as any)[k]} onChange={e => setForm(pr => ({ ...pr, [k]: e.target.value }))} /></div>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}><label style={{ display: "block", fontFamily: "var(--fc)", fontSize: 10, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--silver)", marginBottom: 8 }}>Origin Preference</label>
                <select className="form-select" value={form.origin_preference} onChange={e => setForm(p => ({ ...p, origin_preference: e.target.value }))}>
                  <option>Any Origin</option><option>Japan</option><option>Germany</option><option>United Kingdom</option><option>United States</option><option>No Preference</option>
                </select></div>
              <div style={{ marginBottom: 24 }}><label style={{ display: "block", fontFamily: "var(--fc)", fontSize: 10, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--silver)", marginBottom: 8 }}>Special Requirements</label>
                <textarea className="form-textarea" rows={4} placeholder="Colour, spec level, features, financing…" value={form.requirements} onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))} style={{ resize: "vertical" }} /></div>
              <button type="submit" className="btn-gold" style={{ width: "100%", justifyContent: "center", border: "none" }}>Submit Custom Order Request</button>
              {sent && <div style={{ marginTop: 16, padding: 16, border: "1px solid rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.06)", fontFamily: "var(--fc)", fontSize: 11, letterSpacing: "0.15em", color: "var(--gold)" }}>✓ Request received. Our team will contact you within 24 hours.</div>}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   ENQUIRY FORM — SAVES TO SUPABASE
══════════════════════════════════════════════════════════════ */
const EnquiryModal = ({ vehicle, onClose }: { vehicle: Vehicle | null; onClose: () => void }) => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("enquiries").insert([{ ...form, vehicle_id: vehicle?.id || null, type: vehicle ? "vehicle" : "general", status: "new" }]);
    setSent(true); setTimeout(() => { setSent(false); onClose(); }, 3000);
  };
  if (!vehicle) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
      <div style={{ background: "var(--black2)", border: "1px solid var(--border2)", width: "100%", maxWidth: 520, padding: 40, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "var(--silver)", fontSize: 22, cursor: "pointer" }}>×</button>
        <p style={{ fontFamily: "var(--fc)", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>Enquire About</p>
        <p style={{ fontFamily: "var(--fd)", fontSize: 28, fontWeight: 300, color: "white", marginBottom: 28 }}>{vehicle.make} {vehicle.model} ({vehicle.year})</p>
        {sent ? (
          <div style={{ padding: 24, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)", textAlign: "center", fontFamily: "var(--fc)", fontSize: 12, letterSpacing: "0.15em", color: "var(--gold)" }}>
            ✓ Enquiry sent. Our team will contact you within 24 hours.
          </div>
        ) : (
          <form onSubmit={submit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              {[["Full Name", "name", "text", "Your name"], ["Phone", "phone", "tel", "+880 1XXX-XXXXXX"]].map(([l, k, t, p]) => (
                <div key={k}><label style={{ display: "block", fontFamily: "var(--fc)", fontSize: 10, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--silver)", marginBottom: 6 }}>{l}</label>
                  <input required type={t} className="form-input" placeholder={p} value={(form as any)[k]} onChange={e => setForm(pr => ({ ...pr, [k]: e.target.value }))} /></div>
              ))}
            </div>
            <div style={{ marginBottom: 14 }}><label style={{ display: "block", fontFamily: "var(--fc)", fontSize: 10, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--silver)", marginBottom: 6 }}>Email</label>
              <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
            <div style={{ marginBottom: 20 }}><label style={{ display: "block", fontFamily: "var(--fc)", fontSize: 10, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--silver)", marginBottom: 6 }}>Message</label>
              <textarea className="form-textarea" rows={3} placeholder="Any specific questions or requirements?" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} style={{ resize: "none" }} /></div>
            <button type="submit" className="btn-gold" style={{ width: "100%", justifyContent: "center", border: "none" }}>Send Enquiry</button>
          </form>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   TESTIMONIALS
══════════════════════════════════════════════════════════════ */
const Testimonials = () => {
  const [idx, setIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const isMob = typeof window !== "undefined" && window.innerWidth <= 768;
  useEffect(() => {
    if (trackRef.current) { trackRef.current.style.transform = `translateX(-${idx * (isMob ? 100 : 50)}%)`; trackRef.current.style.transition = "transform 0.65s cubic-bezier(.4,0,.2,1)"; }
  }, [idx, isMob]);
  useEffect(() => { const t = setInterval(() => setIdx(p => p >= TESTIMONIALS.length - (isMob ? 1 : 2) ? 0 : p + 1), 6000); return () => clearInterval(t); }, []);
  return (
    <section id="testimonials" style={{ padding: "120px 0", background: "var(--black)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 72, flexWrap: "wrap", gap: 24 }}>
          <div className="reveal-l">
            <p className="sec-tag" style={{ fontFamily: "var(--fc)", fontSize: 10, fontWeight: 700, letterSpacing: "0.38em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 20 }}>Client Testimonials</p>
            <h2 style={{ fontFamily: "var(--fd)", fontSize: "clamp(40px,5vw,68px)", fontWeight: 300, color: "white", lineHeight: 1.05 }}>Trusted by<br />Bangladesh's <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Elite</em></h2>
          </div>
          <div className="reveal-r" style={{ display: "flex", gap: 8 }}>
            {["←", "→"].map((arrow, i) => (
              <button key={arrow} onClick={() => setIdx(i === 0 ? Math.max(0, idx - 1) : Math.min(TESTIMONIALS.length - (isMob ? 1 : 2), idx + 1))}
                style={{ width: 48, height: 48, border: "1px solid var(--border2)", background: "transparent", color: "white", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--gold)"; (e.currentTarget as HTMLElement).style.color = "var(--black)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "white"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; }}
              >{arrow}</button>
            ))}
          </div>
        </div>
        <div style={{ overflow: "hidden" }}>
          <div ref={trackRef} style={{ display: "flex", gap: 1 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="t-card" style={{ minWidth: "50%", padding: "60px", background: "var(--black2)", border: "1px solid var(--border)", flexShrink: 0, position: "relative" }}>
                <div style={{ fontFamily: "var(--fd)", fontSize: 140, fontWeight: 300, color: "rgba(201,168,76,0.07)", position: "absolute", top: 16, left: 40, lineHeight: 1 }}>"</div>
                <p style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,0.8)", lineHeight: 1.75, marginBottom: 40, position: "relative" }}>{t.quote}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#2a2a2a,#3d3d3d)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--fd)", fontSize: 22, color: "var(--gold)", border: "1px solid var(--border2)", flexShrink: 0 }}>{t.initial}</div>
                  <div>
                    <p style={{ fontFamily: "var(--fc)", fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "white" }}>{t.name}</p>
                    <p style={{ fontSize: 13, color: "var(--silver)", marginTop: 3 }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   CONTACT SECTION — SAVES TO SUPABASE
══════════════════════════════════════════════════════════════ */
const Contact = ({ settings }: { settings: Record<string, string> }) => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "", type: "general" });
  const [sent, setSent] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("enquiries").insert([{ ...form, status: "new" }]);
    setSent(true); setTimeout(() => setSent(false), 5000);
  };
  return (
    <section id="contact" style={{ padding: "120px 0", background: "var(--black2)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }} className="grid-2-auto">
          <form onSubmit={submit} className="reveal-l">
            <p className="sec-tag" style={{ fontFamily: "var(--fc)", fontSize: 10, fontWeight: 700, letterSpacing: "0.38em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 22 }}>Get In Touch</p>
            <h2 style={{ fontFamily: "var(--fd)", fontSize: "clamp(40px,5vw,68px)", fontWeight: 300, color: "white", lineHeight: 1.05, marginBottom: 40 }}>Start Your <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Journey</em></h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {[["Full Name", "name", "text", "Your name"], ["Phone", "phone", "tel", "+880 1XXX-XXXXXX"]].map(([l, k, t, p]) => (
                <div key={k}><label style={{ display: "block", fontFamily: "var(--fc)", fontSize: 10, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--silver)", marginBottom: 8 }}>{l}</label>
                  <input required type={t} className="form-input" placeholder={p} value={(form as any)[k]} onChange={e => setForm(pr => ({ ...pr, [k]: e.target.value }))} /></div>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}><label style={{ display: "block", fontFamily: "var(--fc)", fontSize: 10, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--silver)", marginBottom: 8 }}>Email</label>
              <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
            <div style={{ marginBottom: 16 }}><label style={{ display: "block", fontFamily: "var(--fc)", fontSize: 10, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--silver)", marginBottom: 8 }}>I'm Interested In</label>
              <select className="form-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option value="general">General Enquiry</option>
                <option value="vehicle">A Specific Vehicle</option>
                <option value="custom">Custom Import Order</option>
                <option value="fleet">Corporate / Fleet Purchase</option>
              </select></div>
            <div style={{ marginBottom: 24 }}><label style={{ display: "block", fontFamily: "var(--fc)", fontSize: 10, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--silver)", marginBottom: 8 }}>Message</label>
              <textarea className="form-textarea" rows={4} placeholder="Tell us about your requirements…" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} style={{ resize: "vertical" }} /></div>
            <button type="submit" className="btn-gold" style={{ width: "100%", justifyContent: "center", border: "none" }}>Send Enquiry</button>
            {sent && <div style={{ marginTop: 12, padding: 14, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", fontFamily: "var(--fc)", fontSize: 11, letterSpacing: "0.15em", color: "var(--gold)" }}>✓ Thank you! We'll contact you within 24 hours.</div>}
          </form>
          <div className="reveal-r">
            {[
              ["Visit Our Showroom", settings.showroom_address || "Car House Imports Ltd., Dhaka, Bangladesh", "Sat–Thu: 9AM–8PM · Fri: 2PM–8PM"],
              ["Call Us", settings.phone || "+880 1800-000000", null],
              ["Email", settings.email || "info@carhouse.com.bd", null],
              ["Business Hours", settings.business_hours || "Sat–Thu: 9AM–8PM, Fri: 2PM–8PM", null],
            ].map(([label, value, sub]) => (
              <div key={label as string} style={{ marginBottom: 36, paddingBottom: 36, borderBottom: "1px solid var(--border)" }}>
                <p style={{ fontFamily: "var(--fc)", fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10 }}>{label as string}</p>
                <p style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 300, color: "white", lineHeight: 1.5 }}>{value as string}</p>
                {sub && <p style={{ fontSize: 13, color: "var(--silver)", marginTop: 4 }}>{sub as string}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════════ */
const Footer = ({ settings }: { settings: Record<string, string> }) => (
  <footer style={{ background: "var(--black3)", borderTop: "1px solid var(--border)" }}>
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 60px" }}>
      <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 60, padding: "80px 0" }}>
        <div>
          <Logo h={40} />
          <p style={{ fontSize: 13, color: "var(--silver)", lineHeight: 1.85, maxWidth: 280, marginTop: 20 }}>Bangladesh's premier importer of luxury and performance automobiles. Sourced directly from Japan, Germany, UK & USA since 2016.</p>
        </div>
        {[["Collection", ["Available Vehicles", "Featured Imports", "Custom Orders", "All Brands"]], ["Company", ["About Us", "Import Process", "Client Stories", "Contact"]], ["Legal", ["Privacy Policy", "Terms of Service", "Trade License"]]].map(([title, items]) => (
          <div key={title as string}>
            <p style={{ fontFamily: "var(--fc)", fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 22 }}>{title as string}</p>
            <ul style={{ listStyle: "none" }}>
              {(items as string[]).map(item => (
                <li key={item} style={{ marginBottom: 12 }}>
                  <a href="#" style={{ fontSize: 13, color: "var(--silver)", transition: "color 0.3s" }}
                    onMouseEnter={e => (e.target as HTMLElement).style.color = "white"}
                    onMouseLeave={e => (e.target as HTMLElement).style.color = "var(--silver)"}
                  >{item}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ padding: "24px 0", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontFamily: "var(--fc)", fontSize: 10, letterSpacing: "0.2em", color: "var(--grey)", textTransform: "uppercase" }}>© 2025 Car House Imports Ltd. All Rights Reserved.</p>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Trade License"].map(l => (
            <a key={l} href="#" style={{ fontFamily: "var(--fc)", fontSize: 10, letterSpacing: "0.12em", color: "var(--grey)", textTransform: "uppercase", transition: "color 0.3s" }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = "var(--silver)"}
              onMouseLeave={e => (e.target as HTMLElement).style.color = "var(--grey)"}
            >{l}</a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

/* ══════════════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════════════ */
declare global { interface Window { THREE: any; } }

export default function CarhouseWebsite() {
  const [loading, setLoading] = useState(true);
  const [threeLoaded, setThreeLoaded] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [enquiryVehicle, setEnquiryVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    injectStyles();
    // Load Three.js
    if (window.THREE) { setThreeLoaded(true); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    s.onload = () => setThreeLoaded(true);
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    // Load data from Supabase
    Promise.all([
      supabase.from("vehicles").select("*").neq("status", "Sold").order("created_at", { ascending: false }),
      supabase.from("site_settings").select("*"),
    ]).then(([v, s]) => {
      setVehicles(v.data || []);
      const map: Record<string, string> = {};
      (s.data || []).forEach((r: any) => { map[r.key] = r.value; });
      setSettings(map);
    });
  }, []);

  useReveal();

  const handleEnquire = (v: Vehicle) => { setSelectedVehicle(null); setEnquiryVehicle(v); };
  const handleViewCollection = () => document.getElementById("fleet")?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      {loading && <Loader onDone={() => setLoading(false)} />}
      <div style={{ opacity: loading ? 0 : 1, transition: "opacity 0.6s ease" }}>
        <Cursor />
        <Nav onEnquire={() => document.getElementById("order")?.scrollIntoView({ behavior: "smooth" })} />
        <Hero settings={settings} onViewCollection={handleViewCollection} />
        <Ticker />
        <Fleet vehicles={vehicles} onSelect={setSelectedVehicle} />
        {threeLoaded && <FeaturedCards vehicles={vehicles} onSelect={setSelectedVehicle} />}
        {threeLoaded && <ParallaxQuote />}
        <Process />
        <Brands />
        <Stats vehicles={vehicles} />
        {threeLoaded && <Editorial />}
        <Testimonials />
        <Order vehicles={vehicles} />
        <Contact settings={settings} />
        <Footer settings={settings} />
        <VehiclePanel vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} onEnquire={handleEnquire} />
        <EnquiryModal vehicle={enquiryVehicle} onClose={() => setEnquiryVehicle(null)} />
      </div>
    </>
  );
}
