import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type LegalSection = 'terms' | 'privacy' | 'safety' | 'data';

const LegalPage = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useAppTheme();
  const [activeSection, setActiveSection] = useState<LegalSection>('terms');

  const TabButton = ({ 
    title, 
    isActive, 
    onPress 
  }: { 
    title: string; 
    isActive: boolean; 
    onPress: () => void; 
  }) => (
    <TouchableOpacity
      style={{
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: isActive ? 2 : 1,
        borderBottomColor: isActive ? colors.primary.dark : colors.border.secondary
      }}
      onPress={onPress}
    >
      <Text style={{
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
        color: isActive ? colors.primary.dark : colors.text.secondary
      }}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={{
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginBottom: 12,
      marginTop: 24
    }}>{title}</Text>
  );

  const Paragraph = ({ children }: { children: React.ReactNode }) => (
    <Text style={{
      color: colors.text.secondary,
      fontSize: 14,
      lineHeight: 22,
      marginBottom: 16
    }}>{children}</Text>
  );

  const BulletPoint = ({ children }: { children: React.ReactNode }) => (
    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
      <Text style={{ color: colors.text.tertiary, marginRight: 8 }}>•</Text>
      <Text style={{
        flex: 1,
        color: colors.text.secondary,
        fontSize: 14,
        lineHeight: 20
      }}>{children}</Text>
    </View>
  );

  const SubTitle = ({ children }: { children: React.ReactNode }) => (
    <Text style={{
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 8,
      marginTop: 16
    }}>{children}</Text>
  );

  const renderTermsOfService = () => (
    <View>
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 16
      }}>Terms of Service</Text>
      <Paragraph>
        <Text className="font-semibold">Effective Date:</Text> October 5, 2025
      </Paragraph>
      <Paragraph>
        Welcome to CoRide Morocco. By using our ridesharing platform, you agree to these terms and conditions. 
        Please read them carefully before using our services.
      </Paragraph>

      <SectionTitle title="1. Service Description" />
      <Paragraph>
        CoRide Morocco is a ridesharing platform that connects drivers and passengers in Morocco. 
        We provide the technology platform but do not provide transportation services directly.
      </Paragraph>

      <SectionTitle title="2. User Eligibility" />
      <Paragraph>To use CoRide Morocco, you must:</Paragraph>
      <BulletPoint>Be at least 18 years old</BulletPoint>
      <BulletPoint>Hold a valid Moroccan ID or residence permit</BulletPoint>
      <BulletPoint>For drivers: possess a valid Moroccan driver's license</BulletPoint>
      <BulletPoint>Provide accurate and complete registration information</BulletPoint>

      <SectionTitle title="3. Account Security" />
      <Paragraph>
        You are responsible for maintaining the confidentiality of your account credentials. 
        Notify us immediately if you suspect unauthorized access to your account.
      </Paragraph>

      <SectionTitle title="4. Driver Requirements" />
      <Paragraph>All drivers must:</Paragraph>
      <BulletPoint>Complete identity verification with valid documents</BulletPoint>
      <BulletPoint>Upload clear photos of their driver's license</BulletPoint>
      <BulletPoint>Maintain valid vehicle insurance as required by Moroccan law</BulletPoint>
      <BulletPoint>Follow all traffic laws and safety regulations</BulletPoint>

      <SectionTitle title="5. Passenger Rights and Responsibilities" />
      <Paragraph>Passengers have the right to:</Paragraph>
      <BulletPoint>Safe and respectful treatment</BulletPoint>
      <BulletPoint>Cancel rides according to our cancellation policy</BulletPoint>
      <BulletPoint>Rate and review drivers</BulletPoint>
      <Paragraph>Passengers must:</Paragraph>
      <BulletPoint>Treat drivers with respect</BulletPoint>
      <BulletPoint>Follow community guidelines</BulletPoint>
      <BulletPoint>Pay agreed-upon fares</BulletPoint>

      <SectionTitle title="6. Prohibited Uses" />
      <Paragraph>You may not use CoRide Morocco for:</Paragraph>
      <BulletPoint>Illegal activities or transporting illegal goods</BulletPoint>
      <BulletPoint>Commercial delivery services</BulletPoint>
      <BulletPoint>Harassment or discrimination</BulletPoint>
      <BulletPoint>Creating fake accounts or profiles</BulletPoint>

      <SectionTitle title="7. Payment and Fees" />
      <Paragraph>
        Ride fares are agreed upon between drivers and passengers. CoRide Morocco may charge 
        service fees as disclosed in the app. All payments are processed securely.
      </Paragraph>

      <SectionTitle title="8. Limitation of Liability" />
      <Paragraph>
        CoRide Morocco is a technology platform. We are not liable for actions of drivers or passengers, 
        accidents, or disputes between users. Users participate at their own risk.
      </Paragraph>

      <SectionTitle title="9. Moroccan Law Compliance" />
      <Paragraph>
        This service operates in accordance with Moroccan transportation and digital commerce laws. 
        Any disputes will be resolved under Moroccan jurisdiction.
      </Paragraph>

      <SectionTitle title="10. Contact Information" />
      <Paragraph>
        For questions about these terms, contact us at:
        {'\n'}Email: legal@coridemorocco.com
        {'\n'}Address: Casablanca, Morocco
      </Paragraph>
    </View>
  );

  const renderPrivacyPolicy = () => (
    <View>
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 16
      }}>Privacy Policy</Text>
      <Paragraph>
        <Text className="font-semibold">Effective Date:</Text> October 5, 2025
      </Paragraph>
      <Paragraph>
        At CoRide Morocco, we are committed to protecting your privacy and personal data in accordance 
        with Moroccan data protection laws and international best practices.
      </Paragraph>

      <SectionTitle title="1. Information We Collect" />
      <Paragraph>We collect the following types of information:</Paragraph>
      
      <SubTitle>Account Information:</SubTitle>
      <BulletPoint>Full name and phone number</BulletPoint>
      <BulletPoint>Email address (optional)</BulletPoint>
      <BulletPoint>Profile photo (optional)</BulletPoint>
      <BulletPoint>Preferred language</BulletPoint>

      <SubTitle>Verification Documents:</SubTitle>
      <BulletPoint>National ID, passport, or residence permit</BulletPoint>
      <BulletPoint>Driver's license (for drivers only)</BulletPoint>
      <BulletPoint>These documents are used ONLY for identity verification</BulletPoint>

      <SubTitle>Location Data:</SubTitle>
      <BulletPoint>Current location (only when using the app)</BulletPoint>
      <BulletPoint>Pickup and destination addresses</BulletPoint>
      <BulletPoint>Saved locations (home, work, etc.)</BulletPoint>

      <SectionTitle title="2. How We Use Your Information" />
      <Paragraph>Your information is used to:</Paragraph>
      <BulletPoint>Verify your identity and ensure platform safety</BulletPoint>
      <BulletPoint>Connect drivers and passengers</BulletPoint>
      <BulletPoint>Process ride bookings and payments</BulletPoint>
      <BulletPoint>Provide customer support</BulletPoint>
      <BulletPoint>Improve our services</BulletPoint>
      <BulletPoint>Comply with legal requirements</BulletPoint>

      <SectionTitle title="3. Data Sharing and Protection" />
      <Paragraph>
        <Text className="font-semibold text-red-600">WE DO NOT SELL OR SHARE YOUR PERSONAL DATA WITH THIRD PARTIES FOR MARKETING PURPOSES.</Text>
      </Paragraph>
      
      <Paragraph>We only share your information:</Paragraph>
      <BulletPoint>With other users as necessary for ride coordination (name, photo, location)</BulletPoint>
      <BulletPoint>With payment processors for secure transactions</BulletPoint>
      <BulletPoint>When required by Moroccan law or authorities</BulletPoint>
      <BulletPoint>To protect the safety and security of our platform</BulletPoint>

      <SectionTitle title="4. Document Verification Policy" />
      <Paragraph>
        <Text className="font-semibold">Your ID documents are used EXCLUSIVELY for verification purposes:</Text>
      </Paragraph>
      <BulletPoint>Documents are processed by automated verification systems</BulletPoint>
      <BulletPoint>Human reviewers only verify unclear or flagged documents</BulletPoint>
      <BulletPoint>Documents are encrypted and stored securely</BulletPoint>
      <BulletPoint>We retain documents only as long as legally required</BulletPoint>
      <BulletPoint>Documents are NEVER shared with other users or third parties</BulletPoint>

      <SectionTitle title="5. Data Retention" />
      <BulletPoint>Account data: Retained while your account is active</BulletPoint>
      <BulletPoint>Verification documents: Retained for 3 years after account deletion (legal requirement)</BulletPoint>
      <BulletPoint>Trip history: Retained for 1 year for support and safety purposes</BulletPoint>
      <BulletPoint>You can request data deletion subject to legal requirements</BulletPoint>

      <SectionTitle title="6. Your Rights" />
      <Paragraph>Under Moroccan law, you have the right to:</Paragraph>
      <BulletPoint>Access your personal data</BulletPoint>
      <BulletPoint>Correct inaccurate information</BulletPoint>
      <BulletPoint>Delete your account and data</BulletPoint>
      <BulletPoint>Port your data to another service</BulletPoint>
      <BulletPoint>Object to certain data processing</BulletPoint>

      <SectionTitle title="7. Security Measures" />
      <Paragraph>We protect your data with:</Paragraph>
      <BulletPoint>End-to-end encryption for sensitive data</BulletPoint>
      <BulletPoint>Secure servers in compliance with international standards</BulletPoint>
      <BulletPoint>Regular security audits and updates</BulletPoint>
      <BulletPoint>Limited employee access on a need-to-know basis</BulletPoint>

      <SectionTitle title="8. Contact for Privacy Concerns" />
      <Paragraph>
        For privacy-related questions or to exercise your rights:
        {'\n'}Email: privacy@coridemorocco.com
        {'\n'}Data Protection Officer: dpo@coridemorocco.com
      </Paragraph>
    </View>
  );

  const renderSafetyGuidelines = () => (
    <View>
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 16
      }}>Safety Guidelines</Text>
      <Paragraph>
        Your safety is our top priority. CoRide Morocco is committed to providing a secure 
        ridesharing experience for all users in Morocco.
      </Paragraph>

      <SectionTitle title="🚗 For Drivers" />
      
      <SubTitle>Vehicle Safety:</SubTitle>
      <BulletPoint>Ensure your vehicle is in good working condition</BulletPoint>
      <BulletPoint>Maintain valid insurance as required by Moroccan law</BulletPoint>
      <BulletPoint>Keep your vehicle clean and well-maintained</BulletPoint>
      <BulletPoint>Check tires, brakes, and lights regularly</BulletPoint>

      <SubTitle>Driver Conduct:</SubTitle>
      <BulletPoint>Always verify passenger identity before starting the trip</BulletPoint>
      <BulletPoint>Follow GPS navigation and agreed routes</BulletPoint>
      <BulletPoint>Maintain professional and respectful behavior</BulletPoint>
      <BulletPoint>Do not use mobile phone while driving</BulletPoint>
      <BulletPoint>Never drive under the influence of alcohol or drugs</BulletPoint>

      <SubTitle>Emergency Procedures:</SubTitle>
      <BulletPoint>Know emergency contact numbers (Police: 19, SAMU: 15)</BulletPoint>
      <BulletPoint>Keep first aid kit in your vehicle</BulletPoint>
      <BulletPoint>Report any incidents immediately through the app</BulletPoint>

      <SectionTitle title="👥 For Passengers" />
      
      <SubTitle>Before the Ride:</SubTitle>
      <BulletPoint>Verify driver details and vehicle information</BulletPoint>
      <BulletPoint>Share your trip details with a trusted contact</BulletPoint>
      <BulletPoint>Check driver ratings and reviews</BulletPoint>
      <BulletPoint>Wait in a safe, well-lit location</BulletPoint>

      <SubTitle>During the Ride:</SubTitle>
      <BulletPoint>Always wear your seatbelt</BulletPoint>
      <BulletPoint>Sit in the back seat when possible</BulletPoint>
      <BulletPoint>Monitor your route on the app</BulletPoint>
      <BulletPoint>Trust your instincts - if something feels wrong, speak up</BulletPoint>

      <SubTitle>After the Ride:</SubTitle>
      <BulletPoint>Check for personal belongings before exiting</BulletPoint>
      <BulletPoint>Rate your driver honestly</BulletPoint>
      <BulletPoint>Report any issues through the app</BulletPoint>

      <SectionTitle title="🛡️ Platform Safety Features" />
      <BulletPoint>Identity verification for all users</BulletPoint>
      <BulletPoint>Driver license verification</BulletPoint>
      <BulletPoint>Real-time trip tracking</BulletPoint>
      <BulletPoint>In-app emergency button</BulletPoint>
      <BulletPoint>Rating and review system</BulletPoint>
      <BulletPoint>24/7 support team</BulletPoint>

      <SectionTitle title="⚠️ Report Safety Concerns" />
      <Paragraph>
        If you experience or witness unsafe behavior:
      </Paragraph>
      <BulletPoint>Use the in-app report feature immediately</BulletPoint>
      <BulletPoint>Contact our safety team: safety@coridemorocco.com</BulletPoint>
      <BulletPoint>For emergencies, call Moroccan authorities (Police: 19)</BulletPoint>
      <BulletPoint>Provide trip details and incident description</BulletPoint>

      <SectionTitle title="🚨 Zero Tolerance Policy" />
      <Paragraph>CoRide Morocco has zero tolerance for:</Paragraph>
      <BulletPoint>Violence or threats of violence</BulletPoint>
      <BulletPoint>Sexual harassment or inappropriate behavior</BulletPoint>
      <BulletPoint>Discrimination based on race, religion, gender, or nationality</BulletPoint>
      <BulletPoint>Drug or alcohol use during rides</BulletPoint>
      <BulletPoint>Reckless or dangerous driving</BulletPoint>

      <Paragraph>
        <Text className="font-semibold text-red-600">
          Violations of our safety guidelines may result in immediate account suspension or permanent ban.
        </Text>
      </Paragraph>
    </View>
  );

  const renderDataUsage = () => (
    <View>
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 16
      }}>Data Usage & Protection</Text>
      <Paragraph>
        Transparency about how we collect, use, and protect your data is fundamental to our service.
      </Paragraph>

      <SectionTitle title="📱 App Permissions" />
      <SubTitle>Location Services:</SubTitle>
      <BulletPoint>Used only when the app is active</BulletPoint>
      <BulletPoint>Required for ride matching and navigation</BulletPoint>
      <BulletPoint>You can disable location when not using the app</BulletPoint>
      <BulletPoint>Location history is not permanently stored</BulletPoint>

      <SubTitle>Camera Access:</SubTitle>
      <BulletPoint>Used only for document verification and profile photos</BulletPoint>
      <BulletPoint>Photos are processed locally when possible</BulletPoint>
      <BulletPoint>No access to your existing photo gallery</BulletPoint>

      <Text style={{
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 8,
        marginTop: 16
      }}>Phone Access:</Text>
      <BulletPoint>Used only for account verification via SMS</BulletPoint>
      <BulletPoint>Emergency calling features</BulletPoint>
      <BulletPoint>No access to your call history or contacts</BulletPoint>

      <SectionTitle title="🔐 Data Encryption" />
      <BulletPoint>All personal data is encrypted in transit and at rest</BulletPoint>
      <BulletPoint>Payment information is processed through secure, PCI-compliant systems</BulletPoint>
      <BulletPoint>Identity documents are encrypted with advanced security protocols</BulletPoint>
      <BulletPoint>Communication between users is encrypted</BulletPoint>

      <SectionTitle title="🏛️ Legal Compliance" />
      <Paragraph>CoRide Morocco complies with:</Paragraph>
      <BulletPoint>Moroccan Data Protection Law (Law 09-08)</BulletPoint>
      <BulletPoint>GDPR requirements for international users</BulletPoint>
      <BulletPoint>Moroccan Transportation Regulations</BulletPoint>
      <BulletPoint>Anti-Money Laundering (AML) requirements</BulletPoint>

      <SectionTitle title="🌍 International Data Transfers" />
      <Paragraph>
        Your data is primarily stored in Morocco. When international transfers are necessary:
      </Paragraph>
      <BulletPoint>Transfers are limited to essential service providers</BulletPoint>
      <BulletPoint>Adequate protection measures are in place</BulletPoint>
      <BulletPoint>You will be notified of any significant changes</BulletPoint>

      <SectionTitle title="👤 Identity Verification Process" />
      <Paragraph>
        <Text className="font-semibold">Our verification process is designed to protect all users:</Text>
      </Paragraph>
      
      <Text style={{
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 8
      }}>Document Processing:</Text>
      <BulletPoint>Automated systems check document authenticity</BulletPoint>
      <BulletPoint>Human review only for unclear or flagged documents</BulletPoint>
      <BulletPoint>Documents are compared against official databases when possible</BulletPoint>
      <BulletPoint>Verification typically completes within 24-48 hours</BulletPoint>

      <Text style={{
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 8,
        marginTop: 16
      }}>Data Minimization:</Text>
      <BulletPoint>We collect only the minimum data necessary for verification</BulletPoint>
      <BulletPoint>Document images are cropped to remove irrelevant information</BulletPoint>
      <BulletPoint>Verification data is separated from your profile information</BulletPoint>

      <SectionTitle title="📊 Analytics and Improvement" />
      <Paragraph>We use anonymized data to:</Paragraph>
      <BulletPoint>Improve ride matching algorithms</BulletPoint>
      <BulletPoint>Enhance safety features</BulletPoint>
      <BulletPoint>Optimize app performance</BulletPoint>
      <BulletPoint>Understand usage patterns</BulletPoint>

      <Text className="text-base font-semibold text-red-600 mt-4 mb-2">
        This analytics data cannot be linked back to individual users.
      </Text>

      <SectionTitle title="🗑️ Data Deletion" />
      <Paragraph>When you delete your account:</Paragraph>
      <BulletPoint>Profile information is deleted immediately</BulletPoint>
      <BulletPoint>Trip history is anonymized after 30 days</BulletPoint>
      <BulletPoint>Verification documents are retained for legal compliance (3 years)</BulletPoint>
      <BulletPoint>You can request expedited deletion in certain circumstances</BulletPoint>

      <SectionTitle title="📞 Data Protection Contact" />
      <Paragraph>
        Questions about data usage or to exercise your rights:
        {'\n'}Email: dataprotection@coridemorocco.com
        {'\n'}Phone: +212 5XX XXX XXX
        {'\n'}Response time: Within 72 hours
      </Paragraph>
    </View>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'terms':
        return renderTermsOfService();
      case 'privacy':
        return renderPrivacyPolicy();
      case 'safety':
        return renderSafetyGuidelines();
      case 'data':
        return renderDataUsage();
      default:
        return renderTermsOfService();
    }
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
        }}>Legal Information</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Navigation */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: colors.background.secondary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.primary
      }}>
        <TabButton
          title="Terms"
          isActive={activeSection === 'terms'}
          onPress={() => setActiveSection('terms')}
        />
        <TabButton
          title="Privacy"
          isActive={activeSection === 'privacy'}
          onPress={() => setActiveSection('privacy')}
        />
        <TabButton
          title="Safety"
          isActive={activeSection === 'safety'}
          onPress={() => setActiveSection('safety')}
        />
        <TabButton
          title="Data Usage"
          isActive={activeSection === 'data'}
          onPress={() => setActiveSection('data')}
        />
      </View>

      {/* Content */}
      <ScrollView style={{
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: colors.background.primary
      }}>
        {renderContent()}
        
        {/* Last Updated */}
        <View style={{
          marginTop: 32,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: colors.border.secondary
        }}>
          <Text style={{
            fontSize: 12,
            color: colors.text.tertiary,
            textAlign: 'center'
          }}>
            Last updated: October 5, 2025
            {'\n'}CoRide Morocco - Connecting Morocco, One Ride at a Time
          </Text>
        </View>
        
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default LegalPage;