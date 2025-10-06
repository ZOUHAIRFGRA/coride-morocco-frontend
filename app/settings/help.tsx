import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type HelpSection = 'getting-started' | 'rides' | 'account' | 'safety' | 'payment' | 'faq';

const HelpCenter = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useAppTheme();
  const [activeSection, setActiveSection] = useState<HelpSection>('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const TabButton = ({ 
    title, 
    isActive, 
    onPress,
    icon 
  }: { 
    title: string; 
    isActive: boolean; 
    onPress: () => void;
    icon: string;
  }) => (
    <TouchableOpacity
      style={{
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
        borderBottomWidth: isActive ? 2 : 1,
        borderBottomColor: isActive ? colors.primary.dark : colors.border.secondary
      }}
      onPress={onPress}
    >
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={isActive ? colors.primary.dark : colors.text.tertiary} 
      />
      <Text style={{
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '500',
        marginTop: 4,
        color: isActive ? colors.primary.dark : colors.text.secondary
      }}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={{
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginBottom: 16,
      marginTop: 24
    }}>{title}</Text>
  );

  const HelpItem = ({ 
    icon, 
    title, 
    description, 
    onPress 
  }: { 
    icon: string; 
    title: string; 
    description: string; 
    onPress?: () => void; 
  }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        marginBottom: 12,
        backgroundColor: colors.surface.primary,
        borderRadius: 12
      }}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary.oceanBlue100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 4
      }}>
        <Ionicons name={icon as any} size={20} color={colors.primary.oceanBlue700} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: colors.text.primary,
          marginBottom: 4
        }}>{title}</Text>
        <Text style={{
          color: colors.text.secondary,
          fontSize: 14,
          lineHeight: 20
        }}>{description}</Text>
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} style={{ marginTop: 4 }} />
      )}
    </TouchableOpacity>
  );

  const FAQItem = ({ 
    question, 
    answer, 
    index 
  }: { 
    question: string; 
    answer: string; 
    index: number; 
  }) => (
    <TouchableOpacity
      style={{
        marginBottom: 12,
        backgroundColor: colors.background.secondary,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border.secondary
      }}
      onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16
      }}>
        <Text style={{
          flex: 1,
          color: colors.text.primary,
          fontWeight: '500',
          paddingRight: 12
        }}>{question}</Text>
        <Ionicons 
          name={expandedFaq === index ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={colors.text.secondary} 
        />
      </View>
      {expandedFaq === index && (
        <View style={{
          paddingHorizontal: 16,
          paddingBottom: 16,
          borderTopWidth: 1,
          borderTopColor: colors.border.primary
        }}>
          <Text style={{
            color: colors.text.secondary,
            fontSize: 14,
            lineHeight: 22,
            paddingTop: 12
          }}>{answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const contactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose how you\'d like to reach us:',
      [
        { text: 'Email', onPress: () => Alert.alert('Email', 'support@coridemorocco.com') },
        { text: 'Phone', onPress: () => Alert.alert('Phone', '+212 5XX XXX XXX') },
        { text: 'WhatsApp', onPress: () => Alert.alert('WhatsApp', 'Coming soon!') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderGettingStarted = () => (
    <View>
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 16
      }}>Getting Started with CoRide</Text>
      <Text style={{
        color: colors.text.secondary,
        marginBottom: 24,
        fontSize: 16,
        lineHeight: 22
      }}>
        Welcome to CoRide Morocco! Here's everything you need to know to start riding safely.
      </Text>

      <HelpItem
        icon="person-add"
        title="Create Your Profile"
        description="Set up your profile with a photo, bio, and preferences to help other users get to know you."
        onPress={() => router.push('/profile/profile')}
      />

      <HelpItem
        icon="shield-checkmark"
        title="Verify Your Identity"
        description="Upload your ID and driver license for verification. This helps keep our community safe."
        onPress={() => router.push('/settings/verification')}
      />

      <HelpItem
        icon="location"
        title="Add Your Locations"
        description="Save frequently visited places like home and work for quick ride setup."
        onPress={() => router.push('/settings/locations')}
      />

      <HelpItem
        icon="car"
        title="Book Your First Ride"
        description="Search for available rides or post your own ride offer to start connecting with other users."
        onPress={() => router.push('/rides')}
      />

      <View style={{
        marginTop: 24,
        padding: 16,
        backgroundColor: isDarkMode ? colors.background.secondary : '#EFF6FF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.border.primary : '#BFDBFE'
      }}>
        <Text style={{
          color: colors.primary.dark,
          fontWeight: '600',
          marginBottom: 8,
          fontSize: 16
        }}>💡 Pro Tips</Text>
        <Text style={{
          color: colors.text.secondary,
          fontSize: 14,
          lineHeight: 20
        }}>
          • Complete your profile to increase trust{'\n'}
          • Upload a clear profile photo{'\n'}
          • Verify your documents early{'\n'}
          • Be responsive to messages{'\n'}
          • Always confirm ride details
        </Text>
      </View>
    </View>
  );

  const renderRides = () => (
    <View>
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 16
      }}>Rides & Booking</Text>

      <HelpItem
        icon="search"
        title="Finding Rides"
        description="Use the search feature to find rides by entering your pickup and destination locations."
      />

      <HelpItem
        icon="add-circle"
        title="Posting Rides"
        description="Create your own ride offers when you're driving and want to share with passengers."
      />

      <HelpItem
        icon="time"
        title="Ride Timing"
        description="Book rides in advance or find last-minute options. Most riders plan 2-24 hours ahead."
      />

      <HelpItem
        icon="people"
        title="Passenger Limits"
        description="Each ride shows available seats. Respect the driver's passenger limit and preferences."
      />

      <SectionTitle title="Ride Etiquette" />
      <View className="space-y-2">
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>• Be punctual - arrive on time</Text>
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>• Communicate clearly with your ride partner</Text>
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>• Respect vehicle rules (smoking, food, pets)</Text>
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>• Keep the vehicle clean</Text>
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>• Rate your experience honestly</Text>
      </View>

      <View style={{
        marginTop: 24,
        padding: 16,
        backgroundColor: isDarkMode ? colors.background.secondary : '#FFFBEB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.border.primary : '#FED7AA'
      }}>
        <Text className="text-amber-800 font-semibold mb-2">⚠️ Important</Text>
        <Text className="text-amber-700 text-sm">
          Always confirm ride details (time, location, price) before meeting. 
          If something doesn't feel right, trust your instincts and contact support.
        </Text>
      </View>
    </View>
  );

  const renderAccount = () => (
    <View>
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 16
      }}>Account & Profile</Text>

      <HelpItem
        icon="create"
        title="Editing Profile"
        description="Update your personal information, photo, and bio anytime from the profile section."
        onPress={() => router.push('/profile/profile')}
      />

      <HelpItem
        icon="settings"
        title="Ride Preferences"
        description="Set your music, conversation, and other ride preferences to match with compatible users."
        onPress={() => router.push('/settings/ride-preferences')}
      />

      <HelpItem
        icon="notifications"
        title="Notification Settings"
        description="Control what notifications you receive for rides, messages, and app updates."
      />

      <HelpItem
        icon="lock-closed"
        title="Privacy Settings"
        description="Manage your privacy settings and control what information other users can see."
      />

      <SectionTitle title="Account Issues" />
      
      <HelpItem
        icon="key"
        title="Forgotten Password"
        description="Reset your password using the 'Forgot Password' link on the login screen."
      />

      <HelpItem
        icon="phone-portrait"
        title="Phone Number Changes"
        description="Contact support to update your phone number as it's used for verification."
        onPress={contactSupport}
      />

      <HelpItem
        icon="trash"
        title="Delete Account"
        description="Account deletion is permanent. Contact support if you need to delete your account."
        onPress={contactSupport}
      />
    </View>
  );

  const renderSafety = () => (
    <View>
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 16
      }}>Safety & Security</Text>

      <HelpItem
        icon="shield"
        title="Identity Verification"
        description="All users must verify their identity with official documents to ensure community safety."
      />

      <HelpItem
        icon="star"
        title="Rating System"
        description="Rate your experiences to help maintain high community standards and trust."
      />

      <HelpItem
        icon="chatbubble"
        title="In-App Messaging"
        description="Use the built-in messaging system to communicate safely without sharing personal numbers."
      />

      <HelpItem
        icon="warning"
        title="Report Issues"
        description="Report any safety concerns, inappropriate behavior, or policy violations immediately."
      />

      <SectionTitle title="Safety Guidelines" />
      <View className="space-y-3">
        <View className="flex-row items-start">
          <Text className="text-green-600 mr-2">✓</Text>
          <Text style={{
            flex: 1,
            color: colors.text.secondary,
            fontSize: 14
          }}>Meet in public, well-lit locations</Text>
        </View>
        <View className="flex-row items-start">
          <Text className="text-green-600 mr-2">✓</Text>
          <Text style={{
            flex: 1,
            color: colors.text.secondary,
            fontSize: 14
          }}>Share trip details with a trusted contact</Text>
        </View>
        <View className="flex-row items-start">
          <Text className="text-green-600 mr-2">✓</Text>
          <Text style={{
            flex: 1,
            color: colors.text.secondary,
            fontSize: 14
          }}>Verify driver and vehicle details</Text>
        </View>
        <View className="flex-row items-start">
          <Text className="text-green-600 mr-2">✓</Text>
          <Text style={{
            flex: 1,
            color: colors.text.secondary,
            fontSize: 14
          }}>Trust your instincts - cancel if uncomfortable</Text>
        </View>
        <View className="flex-row items-start">
          <Text className="text-green-600 mr-2">✓</Text>
          <Text style={{
            flex: 1,
            color: colors.text.secondary,
            fontSize: 14
          }}>Always wear your seatbelt</Text>
        </View>
      </View>

      <View style={{
        marginTop: 24,
        padding: 16,
        backgroundColor: isDarkMode ? colors.background.secondary : '#FEF2F2',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.border.primary : '#FECACA'
      }}>
        <Text className="text-red-800 font-semibold mb-2">🚨 Emergency</Text>
        <Text className="text-red-700 text-sm mb-2">
          In case of emergency, contact local authorities:
        </Text>
        <Text className="text-red-700 text-sm font-medium">
          • Police: 19{'\n'}
          • Medical Emergency (SAMU): 15{'\n'}
          • Fire Department: 15
        </Text>
      </View>
    </View>
  );

  const renderPayment = () => (
    <View>
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 16
      }}>Payment & Pricing</Text>

      <HelpItem
        icon="cash"
        title="Payment Methods"
        description="CoRide Morocco currently supports cash payments between users. Digital payments coming soon!"
      />

      <HelpItem
        icon="calculator"
        title="Fare Calculation"
        description="Fares are agreed upon between drivers and passengers based on distance, fuel costs, and demand."
      />

      <HelpItem
        icon="receipt"
        title="Payment Process"
        description="Payment is typically made directly to the driver at the end of the trip in cash."
      />

      <HelpItem
        icon="trending-up"
        title="Fair Pricing"
        description="We encourage fair pricing based on actual costs. Report unreasonable pricing to our team."
      />

      <SectionTitle title="Payment Guidelines" />
      <View className="space-y-2">
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>• Agree on price before starting the trip</Text>
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>• Bring exact change when possible</Text>
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>• Payment covers your share of fuel and vehicle costs</Text>
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>• Tips are optional but appreciated</Text>
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>• Report payment disputes to support</Text>
      </View>

      <View style={{
        marginTop: 24,
        padding: 16,
        backgroundColor: isDarkMode ? colors.background.secondary : '#F0FDF4',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.border.primary : '#BBF7D0'
      }}>
        <Text className="text-green-800 font-semibold mb-2">💳 Coming Soon</Text>
        <Text className="text-green-700 text-sm">
          We're working on integrated digital payments including mobile money, 
          bank cards, and other secure payment methods for your convenience.
        </Text>
      </View>
    </View>
  );

  const renderFAQ = () => {
    const faqs = [
      {
        question: "How do I verify my account?",
        answer: "Go to Settings > Document Verification and upload clear photos of your national ID or passport. For drivers, also upload your driver's license. Verification typically takes 24-48 hours."
      },
      {
        question: "What if my ride gets cancelled?",
        answer: "If a ride is cancelled, both parties should communicate the reason. Frequent cancellations may affect your rating. Contact support if you experience issues with cancellations."
      },
      {
        question: "How do I change my phone number?",
        answer: "Contact our support team to update your phone number as it's used for account verification and security."
      },
      {
        question: "Can I bring pets on rides?",
        answer: "Pet policies depend on individual drivers. Check the ride details or ask the driver beforehand. Set your pet preferences in your profile."
      },
      {
        question: "What happens if I lose something in a ride?",
        answer: "Contact the driver through the app messaging system first. If unsuccessful, contact our support team who can help facilitate the return of lost items."
      },
      {
        question: "How do ratings work?",
        answer: "Both drivers and passengers can rate each other after a completed trip (1-5 stars). Ratings help maintain community quality and are visible to other users."
      },
      {
        question: "Is smoking allowed in rides?",
        answer: "Smoking policies vary by driver. Check ride preferences or ask the driver directly. Many drivers prefer non-smoking rides for everyone's comfort."
      },
      {
        question: "What if I feel unsafe during a ride?",
        answer: "Your safety is our priority. If you feel unsafe, ask to be let out in a safe location. Contact local authorities if needed (Police: 19). Report the incident to our support team immediately."
      },
      {
        question: "Can I edit a ride request after posting?",
        answer: "You can modify some details like pickup time or passenger count, but major changes may require creating a new ride request to ensure all parties are informed."
      },
      {
        question: "How far in advance can I book rides?",
        answer: "You can book rides up to one week in advance. For regular commutes, consider creating recurring ride arrangements with trusted drivers."
      }
    ];

    return (
      <View>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: colors.text.primary,
          marginBottom: 16
        }}>Frequently Asked Questions</Text>
        <Text style={{
          color: colors.text.secondary,
          marginBottom: 24,
          fontSize: 16,
          lineHeight: 22
        }}>
          Quick answers to common questions about using CoRide Morocco.
        </Text>

        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            index={index}
          />
        ))}

        <View style={{
          marginTop: 24,
          padding: 16,
          backgroundColor: isDarkMode ? colors.background.secondary : '#EFF6FF',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: isDarkMode ? colors.border.primary : '#BFDBFE'
        }}>
          <Text style={{
            color: colors.primary.dark,
            fontWeight: '600',
            marginBottom: 8,
            fontSize: 16
          }}>Still need help?</Text>
          <Text style={{
            color: colors.text.secondary,
            fontSize: 14,
            marginBottom: 12
          }}>
            Can't find the answer you're looking for? Our support team is here to help!
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.primary.oceanBlue600,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8
            }}
            onPress={contactSupport}
          >
            <Text style={{
              color: '#FFFFFF',
              fontWeight: '500',
              textAlign: 'center'
            }}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    const filteredContent = () => {
      switch (activeSection) {
        case 'getting-started':
          return renderGettingStarted();
        case 'rides':
          return renderRides();
        case 'account':
          return renderAccount();
        case 'safety':
          return renderSafety();
        case 'payment':
          return renderPayment();
        case 'faq':
          return renderFAQ();
        default:
          return renderGettingStarted();
      }
    };

    return filteredContent();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.background.secondary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.primary
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.dark} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: colors.text.primary
        }}>Help Center</Text>
        <TouchableOpacity onPress={contactSupport}>
          <Ionicons name="headset" size={24} color={colors.primary.dark} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.background.tertiary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.primary
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.background.secondary,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: colors.border.secondary
        }}>
          <Ionicons name="search" size={20} color={colors.text.tertiary} />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 8,
              color: colors.text.primary,
              fontSize: 16
            }}
            placeholder="Search help topics..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.text.tertiary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: colors.background.secondary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.primary
      }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            <TabButton
              title="Getting Started"
              icon="rocket"
              isActive={activeSection === 'getting-started'}
              onPress={() => setActiveSection('getting-started')}
            />
            <TabButton
              title="Rides"
              icon="car"
              isActive={activeSection === 'rides'}
              onPress={() => setActiveSection('rides')}
            />
            <TabButton
              title="Account"
              icon="person"
              isActive={activeSection === 'account'}
              onPress={() => setActiveSection('account')}
            />
            <TabButton
              title="Safety"
              icon="shield"
              isActive={activeSection === 'safety'}
              onPress={() => setActiveSection('safety')}
            />
            <TabButton
              title="Payment"
              icon="card"
              isActive={activeSection === 'payment'}
              onPress={() => setActiveSection('payment')}
            />
            <TabButton
              title="FAQ"
              icon="help-circle"
              isActive={activeSection === 'faq'}
              onPress={() => setActiveSection('faq')}
            />
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={{
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: colors.background.primary
      }}>
        {renderContent()}
        
        {/* Contact Section */}
        <View style={{
          marginTop: 32,
          paddingTop: 24,
          borderTopWidth: 1,
          borderTopColor: colors.border.secondary
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text.primary,
            marginBottom: 12
          }}>Need More Help?</Text>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              backgroundColor: colors.primary.oceanBlue50,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border.secondary
            }}
            onPress={contactSupport}
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: isDarkMode ? colors.background.tertiary : '#DBEAFE',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12
            }}>
              <Ionicons name="headset" size={24} color={COLORS.primary.oceanBlue700} />
            </View>
            <View className="flex-1">
              <Text style={{
                color: colors.primary.dark,
                fontWeight: '600',
                fontSize: 16
              }}>Contact Support</Text>
              <Text style={{
                color: colors.text.secondary,
                fontSize: 14
              }}>Get personalized help from our team</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.primary.oceanBlue700} />
          </TouchableOpacity>
        </View>
        
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpCenter;