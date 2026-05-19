import React from 'react';
import { motion } from 'motion/react';

export const AuthLayout: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px] bg-white rounded-[24px] shadow-sm p-8 flex flex-col gap-8"
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-light text-[#1a1a1a] tracking-tight">{title}</h1>
          <div className="h-[1px] w-12 bg-[#1a1a1a] opacity-10" />
        </div>
        {children}
      </motion.div>
      
      <p className="mt-12 text-[#9e9e9e] text-xs font-mono tracking-widest uppercase">
        Nexus Auth &copy; 2026
      </p>
    </div>
  );
};
