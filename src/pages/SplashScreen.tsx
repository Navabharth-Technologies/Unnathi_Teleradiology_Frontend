import { useNavigate } from 'react-router-dom';
import videoSrc from '../assets/loading_video.mp4';
import { motion } from 'framer-motion';

export default function SplashScreen() {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
    >
      <video
        src={videoSrc}
        autoPlay
        muted
        playsInline
        onEnded={() => navigate('/login', { replace: true })}
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
}
