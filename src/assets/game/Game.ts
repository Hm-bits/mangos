import Phaser from 'phaser';
import { GameConfig } from './Config';

export const StartGame = (parent: string) => {
  return new Phaser.Game({ ...GameConfig, parent });
};