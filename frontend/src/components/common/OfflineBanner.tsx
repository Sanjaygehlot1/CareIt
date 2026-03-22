import { WifiOff } from 'lucide-react';
import { getAuth } from '../../context/authContext';

const OfflineBanner = () => {
  const { isOffline } = getAuth();

  if (!isOffline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 py-2 text-xs font-semibold"
      style={{
        background: '#fef3c7',
        color: '#92400e',
        borderBottom: '1px solid #fde68a',
      }}
    >
      <WifiOff size={13} />
      You're offline — data may be outdated
    </div>
  );
};

export default OfflineBanner;
