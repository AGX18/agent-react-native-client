import { useConnection } from '@/hooks/useConnection';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';

export default function StartScreen() {
  const router = useRouter();
  const { isConnectionActive, connect } = useConnection();
  const [tenantName, setTenantName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const canConnect = useMemo(() => {
    return tenantName.trim().length > 0 && phoneNumber.trim().length > 0;
  }, [tenantName, phoneNumber]);

  // Navigate to Assistant screen when we have the connection details.
  useEffect(() => {
    if (isConnectionActive) {
      router.navigate('../assistant');
    }
  }, [isConnectionActive, router]);

  let connectText: string;

  if (isConnectionActive) {
    connectText = 'Connecting';
  } else {
    connectText = 'Start Voice Assistant';
  }

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require('../../assets/images/start-logo.png')}
      />
      <Text style={styles.text}>Chat live with your voice AI agent</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={tenantName}
          onChangeText={setTenantName}
          placeholder="Tenant name"
          placeholderTextColor="#8f8f8f"
          autoCapitalize="words"
          editable={!isConnectionActive}
        />
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Phone number"
          placeholderTextColor="#8f8f8f"
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          editable={!isConnectionActive}
        />
      </View>

      <TouchableOpacity
        onPress={() => {
          connect({
            tenantName: tenantName.trim(),
            phoneNumber: phoneNumber.trim(),
          });
        }}
        style={[styles.button, !canConnect ? styles.disabledButton : undefined]}
        activeOpacity={0.7}
        disabled={isConnectionActive || !canConnect}
      >
        {isConnectionActive ? (
          <ActivityIndicator
            size="small"
            color="#ffffff"
            style={styles.activityIndicator}
          />
        ) : undefined}

        <Text style={styles.buttonText}>{connectText}</Text>
      </TouchableOpacity>
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
  form: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    backgroundColor: '#101010',
    color: '#ffffff',
    paddingHorizontal: 14,
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
    minWidth: 200, // Ensure button has a minimum width when loading
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
  },
});
