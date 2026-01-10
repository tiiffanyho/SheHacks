import React from 'react';
import '../styles/MemoriesJar.css';

interface MemoriesJarProps {
  isLoading?: boolean;
  size?: 'small' | 'large';
}

export default function MemoriesJar({ isLoading = false, size = 'small' }: MemoriesJarProps) {
  return (
    <div className={`jar-container ${size} ${isLoading ? 'loading' : ''}`}>
      <img src="/logo.png" alt="Memories Jar" className="jar-image" />
    </div>
  );
}
