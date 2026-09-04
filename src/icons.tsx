import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

type P = { size?: number; color?: string };
const S = ({ size = 22, children }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">{children}</Svg>
);
const stroke = (color: string) => ({
  stroke: color, strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
});

export const IconHome = ({ size, color = '#fff' }: P) => (
  <S size={size}><Path d="M3 10.5 12 3l9 7.5" {...stroke(color)} /><Path d="M5 9.6V21h14V9.6" {...stroke(color)} /></S>
);
export const IconSearch = ({ size, color = '#fff' }: P) => (
  <S size={size}><Circle cx="11" cy="11" r="7" {...stroke(color)} /><Path d="m16.5 16.5 4 4" {...stroke(color)} /></S>
);
export const IconLibrary = ({ size, color = '#fff' }: P) => (
  <S size={size}>
    <Path d="M3 8V6.5A1.5 1.5 0 0 1 4.5 5h4l2 2.5H19a1.5 1.5 0 0 1 1.5 1.5" {...stroke(color)} />
    <Path d="M3 8h17.5a1 1 0 0 1 1 1.1l-1 8.4A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5Z" {...stroke(color)} />
    <Path d="M9.5 13.5h5" {...stroke(color)} />
  </S>
);
export const IconSettings = ({ size, color = '#fff' }: P) => (
  <S size={size}>
    <Path d="M4 7h16" {...stroke(color)} /><Path d="M4 12h16" {...stroke(color)} /><Path d="M4 17h16" {...stroke(color)} />
    <Circle cx="9" cy="7" r="2" fill="#141312" {...stroke(color)} />
    <Circle cx="15" cy="12" r="2" fill="#141312" {...stroke(color)} />
    <Circle cx="8" cy="17" r="2" fill="#141312" {...stroke(color)} />
  </S>
);
export const IconBookmark = ({ size = 18, color = '#fff', filled = false }: P & { filled?: boolean }) => (
  <S size={size}><Path d="M19 21l-7-4.6L5 21V5.5A1.5 1.5 0 0 1 6.5 4h11A1.5 1.5 0 0 1 19 5.5Z" fill={filled ? color : 'none'} {...stroke(color)} /></S>
);
export const IconMore = ({ size = 18, color = '#fff' }: P) => (
  <S size={size}>
    <Circle cx="12" cy="5.5" r="1.6" fill={color} />
    <Circle cx="12" cy="12" r="1.6" fill={color} />
    <Circle cx="12" cy="18.5" r="1.6" fill={color} />
  </S>
);
