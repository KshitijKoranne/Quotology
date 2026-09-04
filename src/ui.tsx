import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Modal, Pressable, StyleSheet, Text, View, ViewStyle, Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { C, F, R, T, TIGHT, pal } from './theme';
import { Quote, tagsText } from './quotes';
import { useStore } from './store';

// react-native-view-shot is not part of the Expo SDK, so it is absent in Expo
// Go. Load it only when a share action runs, and say so plainly if it is not
// there — the rest of the app must still work in Expo Go.
function loadCapture(): null | ((ref: any, opts: any) => Promise<string>) {
  try {
    return require('react-native-view-shot').captureRef;
  } catch {
    return null;
  }
}

export const Rule = ({ w = 2, color = C.ink, style }: { w?: number; color?: string; style?: ViewStyle }) => (
  <View style={[{ height: w, backgroundColor: color }, style]} />
);

/** The 1b poster: a black-or-colour field with the quote set as the image.
 *  `height` fixes the canvas for an export; on screen it grows with the text
 *  and the surrounding ScrollView takes over. */
export function Poster({
  q, index, width, height, scale = 1, boost = 1,
}: { q: Quote; index: number; width?: number; height?: number; scale?: number; boost?: number }) {
  const c = pal(index);
  const chars = q.content.length;
  // On a fixed canvas the type has to fit the box, not a character bucket.
  const fitted = height && width
    ? Math.sqrt(((width - 44 * scale) * (height * 0.6)) / Math.max(chars, 1)) * 0.78
    : (chars > 130 ? 26 : chars > 70 ? 34 : 44) * scale;
  const size = Math.max(15 * scale, Math.min(fitted, 52 * scale)) * boost;
  const pad = 22 * scale;
  return (
    <View style={{ width, height, backgroundColor: c.bg, padding: pad, paddingVertical: 26 * scale, flexGrow: scale === 1 ? 1 : undefined }}>
      <Text style={{ fontFamily: F.semi, fontSize: 11 * scale, letterSpacing: 2.2 * scale, textTransform: 'uppercase', color: c.fg }}>
        {q.ref || q.tags[0] || 'Quote'}
      </Text>
      <Rule w={2 * scale} color={c.fg} style={{ marginTop: 14 * scale, marginBottom: 22 * scale }} />
      <Text
        style={{
          fontFamily: F.extra, fontSize: size, lineHeight: size * 1.02,
          letterSpacing: -size * 0.045, textTransform: 'uppercase', color: c.fg, ...TIGHT,
        }}>
        {q.content}
      </Text>
      <View style={{ flexGrow: 1, minHeight: 40 * scale }} />
      <Rule w={2 * scale} color={c.fg} style={{ marginTop: 22 * scale, marginBottom: 14 * scale }} />
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 * scale }}>
        <Text style={{ flex: 1, fontFamily: F.extra, fontSize: 19 * scale, textTransform: 'uppercase', letterSpacing: -0.19 * scale, color: c.fg }}>
          {q.author}
        </Text>
        <Text style={{ fontFamily: F.brand, fontSize: 17 * scale, color: c.fg, textAlign: 'right' }}>
          Quotology
        </Text>
      </View>
    </View>
  );
}

export function Toast() {
  const { toast } = useStore();
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: toast ? 1 : 0, duration: 220, useNativeDriver: true }).start();
  }, [toast]);
  if (!toast) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 118, alignItems: 'center', zIndex: 90,
        opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      }}>
      <Text style={{ backgroundColor: C.black, color: '#fff', fontFamily: F.semi, fontSize: 13, letterSpacing: 0.5, paddingVertical: 11, paddingHorizontal: 18, borderRadius: R.toast, overflow: 'hidden' }}>
        {toast}
      </Text>
    </Animated.View>
  );
}

const ACTIONS = [
  { glyph: '⧉', label: 'Copy text', key: 'copy' },
  { glyph: '▤', label: 'Save poster to photos', key: 'save' },
  { glyph: '↗', label: 'Share…', key: 'share' },
];

/** Fixed canvases, so a shared image never arrives letterboxed. */
const SHAPES = [
  { key: 'square', label: 'Square', w: 1080, h: 1080 },
  { key: 'post', label: 'Post', w: 1080, h: 1350 },
  { key: 'story', label: 'Story', w: 1080, h: 1920 },
];

export function ShareSheet() {
  const { sheet, openSheet, say, cards } = useStore();
  const [busy, setBusy] = useState(false);
  const [shapeKey, setShapeKey] = useState('post');
  const shape = SHAPES.find((x) => x.key === shapeKey) || SHAPES[1];
  const shot = useRef<View>(null);
  const q = sheet;
  const index = q ? Math.max(0, cards.findIndex((c) => c.id === q.id)) : 0;
  const c = pal(index);
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slide, { toValue: q ? 1 : 0, duration: 320, useNativeDriver: true }).start();
  }, [q]);

  async function run(key: string) {
    if (!q || busy) return;
    setBusy(true);
    try {
      if (key === 'copy') {
        await Clipboard.setStringAsync(`“${q.content}”\n— ${q.author}`);
        openSheet(null); say('Quote copied');
      } else {
        const captureRef = loadCapture();
        if (!captureRef) {
          openSheet(null);
          say('Poster needs a development build');
          return;
        }
        const uri = await captureRef(shot, { format: 'png', quality: 1, result: 'tmpfile' });
        if (key === 'save') {
          // Write-only: the app never reads the library, and asking for read
          // access needs a permission this app must not ship.
          const perm = await MediaLibrary.requestPermissionsAsync(true);
          if (!perm.granted) { openSheet(null); say('Photo access denied'); return; }
          await MediaLibrary.saveToLibraryAsync(uri);
          openSheet(null); say('Poster saved to photos');
        } else {
          openSheet(null);
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share quote' });
          } else say('Sharing unavailable');
        }
      }
    } catch (e: any) {
      openSheet(null);
      say(String(e?.message || 'Could not finish that').slice(0, 90));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Off-screen render used only as the capture source for the share card. */}
      {q ? (
        <View style={{ position: 'absolute', left: -2000, top: 0 }} collapsable={false}>
          <View ref={shot} collapsable={false}>
            <Poster q={q} index={index} width={shape.w} height={shape.h} scale={2.6} />
          </View>
        </View>
      ) : null}

      <Modal visible={!!q} transparent animationType="none" onRequestClose={() => openSheet(null)}>
        <Pressable style={s.backdrop} onPress={() => openSheet(null)}>
          <Animated.View
            style={[s.sheet, { transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [500, 0] }) }] }]}>
            <Pressable onPress={() => {}}>
              <View style={{ width: 44, height: 4, backgroundColor: 'rgba(32,30,29,0.2)', borderRadius: 100, alignSelf: 'center' }} />
              {q ? (
                <View style={{ backgroundColor: c.bg, padding: 22, gap: 14, marginTop: 16 }}>
                  <Text style={{ fontFamily: F.semi, fontSize: 18, lineHeight: 23, color: c.fg }}>“{q.content}”</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <Text style={{ fontFamily: F.extra, fontSize: 14, color: c.fg }}>{q.author}</Text>
                    <Text style={{ fontFamily: F.semi, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: c.fg, opacity: 0.75 }}>Quotology</Text>
                  </View>
                </View>
              ) : null}
              <View style={{ flexDirection: 'row', marginTop: 16, borderWidth: 2, borderColor: C.ink }}>
                {SHAPES.map((x, i) => {
                  const on = x.key === shapeKey;
                  return (
                    <Pressable key={x.key} onPress={() => setShapeKey(x.key)}
                      accessibilityRole="button" accessibilityLabel={`Export as ${x.label}`}
                      style={{ flex: 1, minHeight: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: on ? C.ink : '#fff', borderRightWidth: i < SHAPES.length - 1 ? 1 : 0, borderRightColor: 'rgba(32,30,29,0.2)' }}>
                      <Text style={{ fontFamily: F.semi, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: on ? '#fff' : C.ink }}>{x.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={{ marginTop: 16 }}>
                {ACTIONS.map((a) => (
                  <Pressable key={a.key} onPress={() => run(a.key)} style={s.action}
                    accessibilityRole="button" accessibilityLabel={a.label}>
                    <Text accessible={false} style={{ width: 22, textAlign: 'center', fontSize: 15, color: C.accent }}>{a.glyph}</Text>
                    <Text style={{ flex: 1, fontFamily: F.semi, fontSize: 16, color: C.ink }}>{a.label}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable onPress={() => openSheet(null)} style={s.cancel}>
                <Text style={[T.action, { color: C.ink, fontSize: 13, letterSpacing: 1.04 }]}>Cancel</Text>
              </Pressable>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(20,19,18,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderRadius: R.sheet, paddingHorizontal: 18, paddingTop: 18, paddingBottom: Platform.OS === 'ios' ? 34 : 26 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 15, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(32,30,29,0.12)' },
  cancel: { marginTop: 16, borderWidth: 2, borderColor: C.ink, paddingVertical: 14, alignItems: 'center', borderRadius: R.card },
});
