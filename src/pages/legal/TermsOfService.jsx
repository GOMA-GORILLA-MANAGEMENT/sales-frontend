import React from "react";
import LegalPage from "./LegalPage";

const TermsOfService = () => {
  return (
    <LegalPage title="Terms of Service">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using the SALES platform ("Service"), you agree to
            be bound by these Terms of Service ("Terms"). If you disagree with
            any part of the terms, you may not access the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            2. Description of Service
          </h2>
          <p>
            SALES provides a factory management solution that helps businesses
            manage their operations, inventory, and production processes through
            our web-based platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            3. User Accounts
          </h2>
          <p>
            When you create an account with us, you must provide accurate and
            complete information. You are responsible for:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Maintaining the security of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>
              Ensuring that your use of the Service complies with all applicable
              laws
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            4. Subscription and Payment
          </h2>
          <p>
            Our Service is offered on a subscription basis. By subscribing, you
            agree to:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Pay all applicable fees for the selected subscription plan</li>
            <li>Provide accurate billing information</li>
            <li>Keep your payment information current</li>
            <li>
              Authorize us to charge your payment method for the subscription
              fees
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            5. Intellectual Property
          </h2>
          <p>
            The Service and its original content, features, and functionality
            are and will remain the exclusive property of SALES and its
            licensors. The Service is protected by copyright, trademark, and
            other laws of both Rwanda and foreign countries.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            6. User Content
          </h2>
          <p>
            You retain ownership of any content you submit, post, or display on
            or through the Service. By making any content available through the
            Service, you grant us a worldwide, non-exclusive, royalty-free
            license to use, copy, modify, and display such content for the
            purpose of providing the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            7. Termination
          </h2>
          <p>
            We may terminate or suspend your account and bar access to the
            Service immediately, without prior notice or liability, under our
            sole discretion, for any reason whatsoever and without limitation,
            including but not limited to a breach of the Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            8. Limitation of Liability
          </h2>
          <p>
            In no event shall SALES, nor its directors, employees, partners,
            agents, suppliers, or affiliates, be liable for any indirect,
            incidental, special, consequential or punitive damages, including
            without limitation, loss of profits, data, use, goodwill, or other
            intangible losses, resulting from your access to or use of or
            inability to access or use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            9. Governing Law
          </h2>
          <p>
            These Terms shall be governed and construed in accordance with the
            laws of Rwanda, without regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            10. Changes to Terms
          </h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. We will provide at least 30 days' notice
            prior to any new terms taking effect.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            11. Contact Us
          </h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <address className="not-italic mt-2">
            <p>Email: legal@SALES.com</p>
            <p>Address: KG 7 Ave, Kigali, Rwanda</p>
          </address>
        </section>
      </div>
    </LegalPage>
  );
};

export default TermsOfService;
