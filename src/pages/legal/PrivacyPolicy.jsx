import React from "react";
import LegalPage from "./LegalPage";

const PrivacyPolicy = () => {
  return (
    <LegalPage title="Privacy Policy">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            1. Introduction
          </h2>
          <p>
            Welcome to SALES (the "Service"). We respect your privacy and are
            committed to protecting your personal data. This Privacy Policy will
            inform you how we handle your personal data when you visit our
            website or use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            2. Information We Collect
          </h2>
          <p>We may collect and process the following data about you:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>
              Personal identification information (name, email address, phone
              number, etc.)
            </li>
            <li>Business information (company name, job title, etc.)</li>
            <li>Technical data (IP address, browser type, location, etc.)</li>
            <li>Usage data (how you use our website and services)</li>
            <li>Marketing and communication preferences</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            3. How We Use Your Information
          </h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Provide and maintain our services</li>
            <li>Improve our website and services</li>
            <li>Communicate with you</li>
            <li>Process transactions</li>
            <li>Send you marketing communications (where you have opted in)</li>
            <li>Prevent fraud and enhance security</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            4. Data Security
          </h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your personal data against unauthorized access, alteration,
            disclosure, or destruction. However, no internet transmission or
            electronic storage is completely secure, so we cannot guarantee
            absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            5. Your Rights
          </h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Access your personal data</li>
            <li>Request correction of your personal data</li>
            <li>Request erasure of your personal data</li>
            <li>Object to processing of your personal data</li>
            <li>Request restriction of processing</li>
            <li>Request data portability</li>
            <li>Withdraw consent</li>
          </ul>
          <p className="mt-4">
            To exercise any of these rights, please contact us using the
            information in the "Contact Us" section below.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            6. Changes to This Privacy Policy
          </h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            7. Contact Us
          </h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at:
          </p>
          <address className="not-italic mt-2">
            <p>Email: privacy@SALES.com</p>
            <p>Address: KG 7 Ave, Kigali, Rwanda</p>
          </address>
        </section>
      </div>
    </LegalPage>
  );
};

export default PrivacyPolicy;
