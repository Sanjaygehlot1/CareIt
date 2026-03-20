
interface SkProps {
    className?: string;
    style?: React.CSSProperties;
}


export const Sk = ({ className = '', style }: SkProps) => (
    <div className={`skeleton ${className}`} style={style} />
);


export const SkCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div
        className={`rounded-2xl ${className}`}
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
    >
        {children}
    </div>
);


export const SkLine = ({ w = 'w-full', h = 'h-4', className = '' }: { w?: string; h?: string; className?: string }) => (
    <Sk className={`${w} ${h} ${className}`} />
);


export const SkCircle = ({ size = 40 }: { size?: number }) => (
    <div className="skeleton flex-shrink-0" style={{ width: size, height: size, borderRadius: '50%' }} />
);

export const SkStat = ({ className = '' }: SkProps) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
        <Sk className="w-12 h-2.5" />
        <Sk className="w-20 h-7" />
    </div>
);


export const SkHeader = ({ hasAction = false }: { hasAction?: boolean }) => (
    <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
            <SkCircle size={36} />
            <div className="flex flex-col gap-1.5">
                <Sk className="w-28 h-4" />
                <Sk className="w-16 h-3" />
            </div>
        </div>
        {hasAction && <Sk className="w-20 h-7 rounded-xl" />}
    </div>
);
