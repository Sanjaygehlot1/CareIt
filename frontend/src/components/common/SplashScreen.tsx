import React from 'react';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-[100]">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-orange-500 mb-6"
        >
          <Zap size={32} color="white" />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <span className="text-2xl font-bold text-foreground">
            Care<span className="text-orange-500">It</span>
          </span>
        </motion.div>
        
       
        <div className="mt-8 w-40 h-[2px] bg-muted overflow-hidden rounded-full">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5, 
              ease: "easeInOut" 
            }}
            className="w-full h-full bg-orange-500"
          />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
