"use client";

import { Wifi, WifiOff, Users } from "lucide-react";
import styles from "./StatusBar.module.css";

type StatusBarProps = {
  wordCount: {
    words: number;
    characters: number;
  };
  isConnected: boolean;
  activeUsers: number;
};

export function StatusBar({ wordCount, isConnected, activeUsers }: StatusBarProps) {
  return (
    <div className={styles.statusBar}>
      <div className={styles.wordCount}>
        {wordCount.words} words · {wordCount.characters} characters
      </div>
      <div className={styles.connectionStatus}>
        <div className={styles.statusGroup}>
          <span className={styles.statusIcon}>
            {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
          </span>
          <span className={styles.statusText}>
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
        <div className={styles.statusGroup}>
          <span className={styles.statusIcon}>
            <Users size={14} />
          </span>
          <span className={styles.statusText}>
            {activeUsers} active
          </span>
        </div>
      </div>
    </div>
  );
}