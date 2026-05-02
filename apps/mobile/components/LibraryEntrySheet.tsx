import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';
import { Colors, Typography, Spacing, Radius, posterUrl } from '@flick/ui';
import TagInput from './TagInput';
import RatingPicker from './RatingPicker';

export type LibraryStatus = 'planned' | 'watching' | 'watched' | 'paused' | 'dropped';

const STATUS_MAP: Record<LibraryStatus, { label: string, color: string }> = {
  planned: { label: 'Planned', color: Colors.library.planned },
  watching: { label: 'Watching', color: Colors.library.watching },
  watched: { label: 'Watched', color: Colors.library.watched },
  paused: { label: 'Paused', color: Colors.library.paused },
  dropped: { label: 'Dropped', color: Colors.library.dropped },
};

interface LibraryEntrySheetProps {
  film: { id: string, tmdb_id: number, title: string, poster_path?: string | null };
  onClose: () => void;
  onSaved: () => void;
}

export default function LibraryEntrySheet({ film, onClose, onSaved }: LibraryEntrySheetProps) {
  const { session } = useAuthStore();
  
  const [status, setStatus] = useState<LibraryStatus>('planned');
  const [rating, setRating] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [personalNote, setPersonalNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load existing entry if available
    if (!session?.user.id) return;

    supabase
      .from('user_film_entries')
      .select('status, rating, personal_note, custom_tags')
      .eq('user_id', session.user.id)
      .eq('film_id', film.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setStatus(data.status as LibraryStatus);
          setRating(data.rating);
          setTags(data.custom_tags || []);
          setPersonalNote(data.personal_note || '');
        }
        setLoading(false);
      });
  }, [film.id, session?.user.id]);

  const handleSave = async () => {
    if (!session?.user?.id) return;
    setSaving(true);
    try {
      const payload = {
        user_id: session.user.id,
        film_id: film.id,
        status,
        rating,
        custom_tags: tags,
        personal_note: personalNote,
        updated_at: new Date().toISOString(),
      };

      await supabase
        .from('user_film_entries')
        .upsert(payload, { onConflict: 'user_id,film_id' });
        
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!session?.user?.id) return;
    setSaving(true);
    try {
      await supabase
        .from('user_film_entries')
        .delete()
        .eq('user_id', session.user.id)
        .eq('film_id', film.id);
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const posterImg = film.poster_path ? posterUrl(film.poster_path, 'w154') : null;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.overlay}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      
      <View style={styles.sheet}>
        <View style={styles.header}>
          {posterImg ? (
            <Image source={{ uri: posterImg }} style={styles.poster} contentFit="cover" />
          ) : (
            <View style={[styles.poster, { backgroundColor: Colors.background.elevated }]} />
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.title} numberOfLines={2}>{film.title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{top:10,right:10,bottom:10,left:10}}>
              <Text style={styles.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.brand.primary} style={{ marginVertical: 40 }} />
        ) : (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.statusGrid}>
              {(Object.keys(STATUS_MAP) as LibraryStatus[]).map(key => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.statusChip,
                    status === key && { borderColor: STATUS_MAP[key].color, backgroundColor: `${STATUS_MAP[key].color}15` }
                  ]}
                  onPress={() => setStatus(key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.statusText, status === key && { color: STATUS_MAP[key].color, fontFamily: Typography.family.bodyBold }]}>
                    {STATUS_MAP[key].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {(status === 'watched' || status === 'watching') && (
              <View style={styles.section}>
                <RatingPicker rating={rating} onRatingChange={setRating} />
              </View>
            )}

            <View style={styles.section}>
              <TagInput tags={tags} onChange={setTags} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Private Note</Text>
              <TextInput
                style={styles.noteInput}
                multiline
                numberOfLines={3}
                placeholder="Write a private note..."
                placeholderTextColor={Colors.text.tertiary}
                value={personalNote}
                onChangeText={setPersonalNote}
              />
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.removeBtn} onPress={handleRemove} disabled={saving}>
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Entry</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: Colors.background.base,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing[6],
    paddingBottom: 40,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    gap: Spacing[4],
    marginBottom: Spacing[6],
  },
  poster: {
    width: 60,
    height: 90,
    borderRadius: Radius.md,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: Typography.size.lg,
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  closeBtn: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.text.tertiary,
    marginLeft: Spacing[2],
  },
  content: {
    gap: Spacing[1],
  },
  section: {
    marginVertical: Spacing[2],
  },
  sectionTitle: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.text.primary,
    marginBottom: Spacing[2],
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  statusChip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.background.overlay,
    backgroundColor: Colors.background.surface,
  },
  statusText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
  },
  noteInput: {
    backgroundColor: Colors.background.surface,
    borderWidth: 1,
    borderColor: Colors.background.overlay,
    borderRadius: Radius.md,
    padding: Spacing[3],
    color: Colors.text.primary,
    fontFamily: Typography.family.body,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginTop: Spacing[6],
  },
  saveBtn: {
    flex: 2,
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.full,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: Colors.text.inverse,
    fontFamily: Typography.family.bodyBold,
    fontSize: Typography.size.base,
  },
  removeBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,100,100,0.1)',
    borderRadius: Radius.full,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,100,100,0.3)',
  },
  removeBtnText: {
    color: '#ff6666',
    fontFamily: Typography.family.bodySemibold,
    fontSize: Typography.size.base,
  },
});
