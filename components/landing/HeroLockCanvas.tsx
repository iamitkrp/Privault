export default function HeroLockCanvas() {
    return (
        <div className="absolute inset-0 w-full h-full bg-[#010203] overflow-hidden" style={{ zIndex: 0 }}>
            <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }} />
        </div>
    );
}
