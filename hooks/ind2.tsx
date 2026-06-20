import { useConnection } from '@/hooks/useConnection';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function StartScreen() {
  const router = useRouter();
  const { isConnectionActive, connect } = useConnection();

  const [modalVisible, setModalVisible] = useState(false);
  const [phone, setPhone] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [errors, setErrors] = useState<{ phone?: string; tenantName?: string }>({});

  // Navigate to Assistant screen when connection is active
  useEffect(() => {
    if (isConnectionActive) {
      router.navigate('../assistant');
    }
  }, [isConnectionActive, router]);

  function validate() {
    const newErrors: { phone?: string; tenantName?: string } = {};
    if (!tenantName.trim()) newErrors.tenantName = 'Name is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\+?[0-9]{7,15}$/.test(phone.trim()))
      newErrors.phone = 'Enter a valid phone number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    setModalVisible(false);
    connect({ phone: phone.trim(), tenantName: tenantName.trim() });
  }

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require('../../assets/images/start-logo.png')}
      />
      <Text style={styles.text}>Call Your Real-Estate Sales Consultant</Text>

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.button}
        activeOpacity={0.7}
        disabled={isConnectionActive}
      >
        {isConnectionActive ? (
          <ActivityIndicator size="small" color="#ffffff" style={styles.activityIndicator} />
        ) : undefined}
        <Text style={styles.buttonText}>
          {isConnectionActive ? 'Connecting...' : 'Start Voice Assistant'}
        </Text>
      </TouchableOpacity>

      {/* User Info Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Before we connect</Text>
            <Text style={styles.modalSubtitle}>
              We'll share this with your consultant.
            </Text>

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.tenantName ? styles.inputError : null]}
              placeholder="John Doe"
              placeholderTextColor="#888"
              value={tenantName}
              onChangeText={(t) => {
                setTenantName(t);
                if (errors.tenantName) setErrors((e) => ({ ...e, tenantName: undefined }));
              }}
              autoCapitalize="words"
            />
            {errors.tenantName ? (
              <Text style={styles.errorText}>{errors.tenantName}</Text>
            ) : null}

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, errors.phone ? styles.inputError : null]}
              placeholder="+20 100 000 0000"
              placeholderTextColor="#888"
              value={phone}
              onChangeText={(t) => {
                setPhone(t);
                if (errors.phone) setErrors((e) => ({ ...e, phone: undefined }));
              }}
              keyboardType="phone-pad"
            />
            {errors.phone ? (
              <Text style={styles.errorText}>{errors.phone}</Text>
            ) : null}

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8}>
              <Text style={styles.submitButtonText}>Connect</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 59,
    height: 56,
    marginBottom: 16,
  },
  text: {
    color: '#ffffff',
    marginBottom: 24,
  },
  activityIndicator: {
    marginEnd: 8,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#002CF2',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  buttonText: {
    color: '#ffffff',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalCard: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 40,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalSubtitle: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 24,
  },
  label: {
    color: '#cccccc',
    fontSize: 13,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#2a2a40',
    color: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#3a3a55',
  },
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#002CF2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 28,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: 14,
  },
  cancelText: {
    color: '#888',
    fontSize: 14,
  },
});
