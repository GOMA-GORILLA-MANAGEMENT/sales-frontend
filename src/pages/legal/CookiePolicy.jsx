import React from "react";
import LegalPage from "./LegalPage";

const CookiePolicy = () => {
  return (
    <LegalPage title="Cookie Policy">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            1. What Are Cookies
          </h2>
          <p>
            Cookies are small text files that are placed on your computer or
            mobile device when you visit a website. They are widely used to make
            websites work more efficiently, as well as to provide information to
            the owners of the site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            2. How We Use Cookies
          </h2>
          <p>We use cookies for several purposes, including:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>To enable certain functions of the Service</li>
            <li>To provide analytics</li>
            <li>To store your preferences</li>
            <li>
              To enable advertisements delivery, including behavioral
              advertising
            </li>
            <li>To prevent fraudulent activity</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            3. Types of Cookies We Use
          </h2>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Essential Cookies
              </h3>
              <p>
                These cookies are necessary for the website to function and
                cannot be switched off in our systems.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Performance Cookies
              </h3>
              <p>
                These cookies allow us to count visits and traffic sources so we
                can measure and improve the performance of our site.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Functional Cookies
              </h3>
              <p>
                These cookies enable the website to provide enhanced
                functionality and personalization.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Targeting Cookies
              </h3>
              <p>
                These cookies may be set through our site by our advertising
                partners to build a profile of your interests.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            4. Third-Party Cookies
          </h2>
          <p>
            We also use various third-party cookies to report usage statistics
            of the Service, deliver advertisements, and so on. These cookies may
            be used when you share information using a social media sharing
            button or "like" button on our website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            5. Managing Cookies
          </h2>
          <p>
            You can control and/or delete cookies as you wish. You can delete
            all cookies that are already on your computer and you can set most
            browsers to prevent them from being placed.
          </p>
          <p className="mt-4">
            For more information about cookies, including how to see what
            cookies have been set and how to manage and delete them, visit{" "}
            <a
              href="https://www.aboutcookies.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF6F00] hover:underline"
            >
              www.aboutcookies.org
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            6. Changes to This Cookie Policy
          </h2>
          <p>
            We may update our Cookie Policy from time to time. We will notify
            you of any changes by posting the new Cookie Policy on this page and
            updating the "Last updated" date at the top of this policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            7. Contact Us
          </h2>
          <p>
            If you have any questions about this Cookie Policy, please contact
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

export default CookiePolicy;
