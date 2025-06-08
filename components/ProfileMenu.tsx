// components/ProfileMenu.tsx
import React, { useState } from 'react';
import { View, Modal, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import { User, LogOut, Home } from 'lucide-react-native';
import { router } from 'expo-router';
import { auth } from '@/utils/firebaseConfig';
import Text from '@/components/typography/Text';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useRouter } from 'expo-router';

export default function ProfileMenu() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setVisible(false);
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const goToDashboard = () => {
    setVisible(false);
    router.push('/family');
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setVisible(true)}>
        <User size={28} color={Colors.gray[700]} />
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.menu}>
            <Pressable style={styles.item} onPress={handleSignOut}>
              <LogOut size={20} color={Colors.gray[700]} />
              <Text style={styles.label}>Sign Out</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menu: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  label: {
    marginLeft: Spacing.sm,
  },
});
