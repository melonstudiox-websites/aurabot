import { FONTS, WRAPPERS, ROLE_COLORS } from '../config.js';

export function generateRoleName(tier, options = {}) {
  const font = options.font || FONTS[Math.floor(Math.random() * FONTS.length)];
  const wrapper = options.wrapper || WRAPPERS[Math.floor(Math.random() * WRAPPERS.length)];
  const emoji = options.emoji || ""; 

  return `${wrapper[0]} ${emoji} ${font} ${tier.toUpperCase()} ${emoji} ${wrapper[1]}`.trim();
}

export function generateRoleColor(tier) {
  return ROLE_COLORS[tier] || 0x99AAB5;
}

